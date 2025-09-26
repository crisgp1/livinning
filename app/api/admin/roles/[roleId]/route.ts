import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import RoleModel, { IRole } from '@/lib/infrastructure/database/models/RoleModel';
import UserRoleAssignmentModel from '@/lib/infrastructure/database/models/UserRoleAssignmentModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

interface RouteParams {
  params: { roleId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view role details
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view role details');
    }

    await connectDB();

    const role = await RoleModel.findById(params.roleId).lean();
    if (!role) {
      return ApiResponse.notFound('Role not found');
    }

    // Get role usage statistics
    const assignmentCount = await UserRoleAssignmentModel.countDocuments({
      roleId: params.roleId,
      isActive: true
    });

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'role',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed role details: ${role.displayName} (${role.name})`
      },
      {
        resourceId: params.roleId,
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      role,
      statistics: {
        assignmentCount,
        permissionCount: role.permissions.length
      }
    });

  } catch (error) {
    console.error('Error fetching role details:', error);
    return ApiResponse.error('Failed to fetch role details');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to update roles
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to update roles');
    }

    const body = await request.json();
    const updateData: Partial<IRole> = body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    await connectDB();

    const existingRole = await RoleModel.findById(params.roleId);
    if (!existingRole) {
      return ApiResponse.notFound('Role not found');
    }

    // Store previous values for audit
    const previousValues = {
      name: existingRole.name,
      displayName: existingRole.displayName,
      description: existingRole.description,
      department: existingRole.department,
      permissions: existingRole.permissions,
      isActive: existingRole.isActive
    };

    // If name is being changed, check for conflicts
    if (updateData.name && updateData.name !== existingRole.name) {
      const nameConflict = await RoleModel.findOne({
        name: updateData.name,
        _id: { $ne: params.roleId }
      });
      if (nameConflict) {
        return ApiResponse.badRequest('Role with this name already exists');
      }
    }

    // Update metadata
    updateData.metadata = {
      ...existingRole.metadata,
      updatedBy: userId
    };

    const updatedRole = await RoleModel.findByIdAndUpdate(
      params.roleId,
      updateData,
      { new: true, runValidators: true }
    );

    // Log the action
    await AuditLogModel.createDataChange(
      'role',
      params.roleId,
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      previousValues,
      updateData,
      `Updated role: ${updatedRole?.displayName} (${updatedRole?.name})`
    ).save();

    return ApiResponse.success({
      role: updatedRole,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Error updating role:', error);
    return ApiResponse.error('Failed to update role');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to delete roles
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to delete roles');
    }

    await connectDB();

    const role = await RoleModel.findById(params.roleId);
    if (!role) {
      return ApiResponse.notFound('Role not found');
    }

    // Check if role is in use
    const assignmentsCount = await UserRoleAssignmentModel.countDocuments({
      roleId: params.roleId,
      isActive: true
    });

    if (assignmentsCount > 0) {
      return ApiResponse.badRequest(
        `Cannot delete role. It is currently assigned to ${assignmentsCount} user(s). Please reassign users first.`
      );
    }

    // Soft delete by deactivating the role
    role.isActive = false;
    role.metadata.updatedBy = userId;
    await role.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'delete',
      'role',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Deactivated role: ${role.displayName} (${role.name})`,
        previousValues: { isActive: true },
        newValues: { isActive: false }
      },
      {
        resourceId: params.roleId,
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      message: 'Role deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return ApiResponse.error('Failed to delete role');
  }
}
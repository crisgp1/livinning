import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import DepartmentModel, { ISubdepartment } from '@/lib/infrastructure/database/models/DepartmentModel';
import UserRoleAssignmentModel from '@/lib/infrastructure/database/models/UserRoleAssignmentModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

interface RouteParams {
  params: { departmentId: string; subdepartmentId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view subdepartment details
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view subdepartment details');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    const subdepartment = department.subdepartments.find(
      sub => sub._id?.toString() === params.subdepartmentId
    );
    if (!subdepartment) {
      return ApiResponse.notFound('Subdepartment not found');
    }

    // Get subdepartment statistics
    const employeeCount = await UserRoleAssignmentModel.countDocuments({
      departmentId: params.departmentId,
      subdepartmentId: params.subdepartmentId,
      isActive: true,
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveUntil: { $exists: false } },
        { effectiveUntil: { $gte: new Date() } }
      ]
    });

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'subdepartment',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed subdepartment details: ${subdepartment.displayName} in ${department.displayName}`
      },
      {
        resourceId: params.subdepartmentId,
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      subdepartment,
      department: {
        id: department._id,
        name: department.name,
        displayName: department.displayName,
        code: department.code
      },
      statistics: {
        employeeCount,
        permissionCount: subdepartment.permissions.length
      }
    });

  } catch (error) {
    console.error('Error fetching subdepartment details:', error);
    return ApiResponse.error('Failed to fetch subdepartment details');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to update subdepartments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to update subdepartments');
    }

    const body = await request.json();
    const updateData: Partial<ISubdepartment> = body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    const subdepartmentIndex = department.subdepartments.findIndex(
      sub => sub._id?.toString() === params.subdepartmentId
    );
    if (subdepartmentIndex === -1) {
      return ApiResponse.notFound('Subdepartment not found');
    }

    const existingSubdepartment = department.subdepartments[subdepartmentIndex];

    // Store previous values for audit
    const previousValues = {
      displayName: existingSubdepartment.displayName,
      description: existingSubdepartment.description,
      manager: existingSubdepartment.manager,
      isActive: existingSubdepartment.isActive,
      permissions: existingSubdepartment.permissions
    };

    // If name is being changed, check for conflicts within the department
    if (updateData.name && updateData.name !== existingSubdepartment.name) {
      const nameConflict = department.subdepartments.find(
        sub => sub.name === updateData.name && sub._id?.toString() !== params.subdepartmentId
      );
      if (nameConflict) {
        return ApiResponse.badRequest('Subdepartment with this name already exists in the department');
      }
    }

    // Update the subdepartment
    Object.assign(department.subdepartments[subdepartmentIndex], updateData);
    department.subdepartments[subdepartmentIndex].metadata = {
      ...existingSubdepartment.metadata,
      updatedBy: userId,
      updatedAt: new Date()
    };

    await department.save();

    const updatedSubdepartment = department.subdepartments[subdepartmentIndex];

    // Log the action
    await AuditLogModel.createDataChange(
      'subdepartment',
      params.subdepartmentId,
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      previousValues,
      updateData,
      `Updated subdepartment: ${updatedSubdepartment.displayName} in ${department.displayName}`
    ).save();

    return ApiResponse.success({
      subdepartment: updatedSubdepartment,
      message: 'Subdepartment updated successfully'
    });

  } catch (error) {
    console.error('Error updating subdepartment:', error);
    return ApiResponse.error('Failed to update subdepartment');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to delete subdepartments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to delete subdepartments');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    const subdepartment = department.subdepartments.find(
      sub => sub._id?.toString() === params.subdepartmentId
    );
    if (!subdepartment) {
      return ApiResponse.notFound('Subdepartment not found');
    }

    // Check if subdepartment has active employees
    const activeEmployees = await UserRoleAssignmentModel.countDocuments({
      subdepartmentId: params.subdepartmentId,
      isActive: true
    });

    if (activeEmployees > 0) {
      return ApiResponse.badRequest(
        `Cannot delete subdepartment. It has ${activeEmployees} active employee(s). Please reassign employees first.`
      );
    }

    // Remove the subdepartment
    department.removeSubdepartment(params.subdepartmentId);
    await department.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'delete',
      'subdepartment',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Deleted subdepartment: ${subdepartment.displayName} from ${department.displayName}`,
        previousValues: {
          name: subdepartment.name,
          displayName: subdepartment.displayName,
          departmentName: department.displayName
        }
      },
      {
        resourceId: params.subdepartmentId,
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      message: 'Subdepartment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subdepartment:', error);
    return ApiResponse.error('Failed to delete subdepartment');
  }
}
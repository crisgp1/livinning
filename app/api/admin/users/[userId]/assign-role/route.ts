import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import RoleModel from '@/lib/infrastructure/database/models/RoleModel';
import UserRoleAssignmentModel, { IUserRoleAssignment } from '@/lib/infrastructure/database/models/UserRoleAssignmentModel';
import DepartmentModel from '@/lib/infrastructure/database/models/DepartmentModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

interface RouteParams {
  params: { userId: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to assign roles
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const currentUserRole = currentUser.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(currentUserRole)) {
      return ApiResponse.forbidden('Insufficient permissions to assign roles');
    }

    const body = await request.json();
    const {
      roleId,
      departmentId,
      subdepartmentId,
      scope = 'department',
      effectiveFrom = new Date(),
      effectiveUntil,
      assignmentReason,
      budgetLimit,
      territoryId
    } = body;

    // Validate required fields
    if (!roleId || !assignmentReason) {
      return ApiResponse.badRequest('Missing required fields: roleId, assignmentReason');
    }

    await connectDB();

    // Get target user from Clerk
    const targetUser = await clerkClient.users.getUser(params.userId);
    if (!targetUser) {
      return ApiResponse.notFound('User not found');
    }

    // Verify role exists
    const role = await RoleModel.findById(roleId);
    if (!role || !role.isActive) {
      return ApiResponse.badRequest('Invalid or inactive role');
    }

    // Verify department exists if provided
    let department = null;
    if (departmentId) {
      department = await DepartmentModel.findById(departmentId);
      if (!department || !department.isActive) {
        return ApiResponse.badRequest('Invalid or inactive department');
      }
    }

    // Check for existing active assignment for the same role
    const existingAssignment = await UserRoleAssignmentModel.findOne({
      clerkUserId: params.userId,
      roleId,
      isActive: true,
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveUntil: { $exists: false } },
        { effectiveUntil: { $gte: new Date() } }
      ]
    });

    if (existingAssignment) {
      return ApiResponse.badRequest('User already has an active assignment for this role');
    }

    // Create role assignment
    const roleAssignment = new UserRoleAssignmentModel({
      userId: params.userId,
      clerkUserId: params.userId,
      roleId,
      departmentId: departmentId || undefined,
      subdepartmentId: subdepartmentId || undefined,
      assignedBy: currentUserId,
      isActive: true,
      effectiveFrom: new Date(effectiveFrom),
      effectiveUntil: effectiveUntil ? new Date(effectiveUntil) : undefined,
      scope,
      permissions: role.permissions,
      restrictions: [],
      metadata: {
        assignmentReason,
        organizationId: targetUser.organizationMemberships[0]?.organization.id,
        territoryId,
        budgetLimit,
        customAttributes: {}
      },
      auditLog: []
    });

    await roleAssignment.save();

    // Update user metadata in Clerk
    const currentMetadata = targetUser.publicMetadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      role: role.name,
      department: department?.name || currentMetadata.department,
      lastRoleAssignment: new Date().toISOString()
    };

    await clerkClient.users.updateUserMetadata(params.userId, {
      publicMetadata: updatedMetadata
    });

    // Log the action
    await AuditLogModel.createUserAction(
      'assign',
      'user_role',
      currentUserId,
      `${currentUser.firstName} ${currentUser.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Assigned role ${role.displayName} to user ${targetUser.firstName} ${targetUser.lastName}`,
        affectedUsers: [params.userId],
        newValues: {
          roleId,
          roleName: role.name,
          roleDisplayName: role.displayName,
          departmentId,
          departmentName: department?.displayName,
          scope,
          effectiveFrom,
          effectiveUntil
        }
      },
      {
        resourceId: roleAssignment._id?.toString(),
        severity: 'medium',
        metadata: { organizationId: targetUser.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      assignment: roleAssignment,
      message: `Role ${role.displayName} assigned successfully to ${targetUser.firstName} ${targetUser.lastName}`
    }, 201);

  } catch (error) {
    console.error('Error assigning role:', error);
    return ApiResponse.error('Failed to assign role');
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view role assignments
    const currentUser = await clerkClient.users.getUser(currentUserId);
    const currentUserRole = currentUser.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(currentUserRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view role assignments');
    }

    await connectDB();

    // Get all role assignments for the user
    const assignments = await UserRoleAssignmentModel.find({
      clerkUserId: params.userId
    })
    .sort({ createdAt: -1 })
    .lean();

    // Get role and department details for each assignment
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [role, department] = await Promise.all([
          RoleModel.findById(assignment.roleId).lean(),
          assignment.departmentId ? DepartmentModel.findById(assignment.departmentId).lean() : null
        ]);

        return {
          ...assignment,
          role,
          department
        };
      })
    );

    // Get current active assignments
    const activeAssignments = enrichedAssignments.filter(assignment =>
      assignment.isActive &&
      new Date() >= assignment.effectiveFrom &&
      (!assignment.effectiveUntil || new Date() <= assignment.effectiveUntil)
    );

    return ApiResponse.success({
      assignments: enrichedAssignments,
      activeAssignments,
      summary: {
        total: assignments.length,
        active: activeAssignments.length,
        inactive: assignments.length - activeAssignments.length
      }
    });

  } catch (error) {
    console.error('Error fetching role assignments:', error);
    return ApiResponse.error('Failed to fetch role assignments');
  }
}
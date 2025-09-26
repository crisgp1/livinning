import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import DepartmentModel, { IDepartment } from '@/lib/infrastructure/database/models/DepartmentModel';
import UserRoleAssignmentModel from '@/lib/infrastructure/database/models/UserRoleAssignmentModel';
import TaskModel from '@/lib/infrastructure/database/models/TaskModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

interface RouteParams {
  params: { departmentId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view department details
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view department details');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId).lean();
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    let departmentWithStats = department;

    if (includeStats) {
      // Get detailed statistics
      const [employeeCount, activeTasks, completedTasks, recentTasks] = await Promise.all([
        UserRoleAssignmentModel.countDocuments({
          departmentId: params.departmentId,
          isActive: true,
          effectiveFrom: { $lte: new Date() },
          $or: [
            { effectiveUntil: { $exists: false } },
            { effectiveUntil: { $gte: new Date() } }
          ]
        }),
        TaskModel.countDocuments({
          departmentId: params.departmentId,
          status: { $in: ['open', 'in_progress', 'pending_review'] }
        }),
        TaskModel.countDocuments({
          departmentId: params.departmentId,
          status: 'completed',
          updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }),
        TaskModel.find({
          departmentId: params.departmentId
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title status priority createdAt dueDate')
        .lean()
      ]);

      // Calculate average response time from tasks
      const taskMetrics = await TaskModel.aggregate([
        { $match: { departmentId: params.departmentId, 'metrics.timeToFirstResponse': { $exists: true } } },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$metrics.timeToFirstResponse' },
            avgCompletionTime: { $avg: '$metrics.timeToCompletion' }
          }
        }
      ]);

      const averageResponseTime = taskMetrics[0]?.avgResponseTime || 0;
      const averageCompletionTime = taskMetrics[0]?.avgCompletionTime || 0;

      departmentWithStats = {
        ...department,
        metrics: {
          ...department.metrics,
          activeEmployees: employeeCount,
          completedTasks: completedTasks,
          pendingTasks: activeTasks,
          averageResponseTime: Math.round(averageResponseTime),
          averageCompletionTime: Math.round(averageCompletionTime)
        },
        statistics: {
          employeeCount,
          activeTasks,
          completedTasksLast30Days: completedTasks,
          recentTasks,
          taskCompletionRate: activeTasks + completedTasks > 0
            ? Math.round((completedTasks / (activeTasks + completedTasks)) * 100)
            : 0
        }
      };
    }

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'department',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed department details: ${department.displayName} (${department.code})`
      },
      {
        resourceId: params.departmentId,
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      department: departmentWithStats
    });

  } catch (error) {
    console.error('Error fetching department details:', error);
    return ApiResponse.error('Failed to fetch department details');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to update departments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to update departments');
    }

    const body = await request.json();
    const updateData: Partial<IDepartment> = body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.name; // Don't allow name changes to maintain referential integrity

    await connectDB();

    const existingDepartment = await DepartmentModel.findById(params.departmentId);
    if (!existingDepartment) {
      return ApiResponse.notFound('Department not found');
    }

    // Store previous values for audit
    const previousValues = {
      displayName: existingDepartment.displayName,
      description: existingDepartment.description,
      code: existingDepartment.code,
      manager: existingDepartment.manager,
      isActive: existingDepartment.isActive,
      permissions: existingDepartment.permissions,
      budgetLimit: existingDepartment.budgetLimit,
      settings: existingDepartment.settings
    };

    // If code is being changed, check for conflicts
    if (updateData.code && updateData.code !== existingDepartment.code) {
      const codeConflict = await DepartmentModel.findOne({
        code: updateData.code,
        _id: { $ne: params.departmentId }
      });
      if (codeConflict) {
        return ApiResponse.badRequest('Department with this code already exists');
      }
    }

    // Update metadata
    updateData.metadata = {
      ...existingDepartment.metadata,
      updatedBy: userId
    };

    const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
      params.departmentId,
      updateData,
      { new: true, runValidators: true }
    );

    // Log the action
    await AuditLogModel.createDataChange(
      'department',
      params.departmentId,
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      previousValues,
      updateData,
      `Updated department: ${updatedDepartment?.displayName} (${updatedDepartment?.code})`
    ).save();

    return ApiResponse.success({
      department: updatedDepartment,
      message: 'Department updated successfully'
    });

  } catch (error) {
    console.error('Error updating department:', error);
    return ApiResponse.error('Failed to update department');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to delete departments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to delete departments');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    // Check if department has active employees
    const activeEmployees = await UserRoleAssignmentModel.countDocuments({
      departmentId: params.departmentId,
      isActive: true
    });

    if (activeEmployees > 0) {
      return ApiResponse.badRequest(
        `Cannot delete department. It has ${activeEmployees} active employee(s). Please reassign employees first.`
      );
    }

    // Check if department has active tasks
    const activeTasks = await TaskModel.countDocuments({
      departmentId: params.departmentId,
      status: { $in: ['open', 'in_progress', 'pending_review'] }
    });

    if (activeTasks > 0) {
      return ApiResponse.badRequest(
        `Cannot delete department. It has ${activeTasks} active task(s). Please complete or reassign tasks first.`
      );
    }

    // Soft delete by deactivating the department
    department.isActive = false;
    department.metadata.updatedBy = userId;
    await department.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'delete',
      'department',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Deactivated department: ${department.displayName} (${department.code})`,
        previousValues: { isActive: true },
        newValues: { isActive: false }
      },
      {
        resourceId: params.departmentId,
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      message: 'Department deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    return ApiResponse.error('Failed to delete department');
  }
}
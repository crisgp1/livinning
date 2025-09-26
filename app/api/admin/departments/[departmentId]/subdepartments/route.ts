import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import DepartmentModel, { ISubdepartment } from '@/lib/infrastructure/database/models/DepartmentModel';
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

    // Check if user has permission to view subdepartments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view subdepartments');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    let subdepartments = department.subdepartments;

    // Filter by active status if specified
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      subdepartments = subdepartments.filter(sub => sub.isActive === activeFilter);
    }

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'subdepartments',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed subdepartments for department: ${department.displayName}`,
        newValues: { departmentId: params.departmentId, count: subdepartments.length }
      },
      {
        resourceId: params.departmentId,
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      subdepartments,
      department: {
        id: department._id,
        name: department.name,
        displayName: department.displayName,
        code: department.code
      },
      summary: {
        total: department.subdepartments.length,
        active: department.subdepartments.filter(s => s.isActive).length,
        filtered: subdepartments.length
      }
    });

  } catch (error) {
    console.error('Error fetching subdepartments:', error);
    return ApiResponse.error('Failed to fetch subdepartments');
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to create subdepartments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to create subdepartments');
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      manager,
      permissions = []
    }: Partial<ISubdepartment> = body;

    if (!name || !displayName || !description) {
      return ApiResponse.badRequest('Missing required fields: name, displayName, description');
    }

    await connectDB();

    const department = await DepartmentModel.findById(params.departmentId);
    if (!department) {
      return ApiResponse.notFound('Department not found');
    }

    // Check if subdepartment with same name already exists in this department
    const existingSubdepartment = department.subdepartments.find(sub => sub.name === name);
    if (existingSubdepartment) {
      return ApiResponse.badRequest('Subdepartment with this name already exists in the department');
    }

    // Create new subdepartment
    const newSubdepartment: ISubdepartment = {
      name,
      displayName,
      description,
      manager,
      isActive: true,
      permissions,
      metadata: {
        createdBy: userId,
        createdAt: new Date()
      }
    };

    department.addSubdepartment(newSubdepartment);
    await department.save();

    // Get the created subdepartment with its ID
    const createdSubdepartment = department.subdepartments[department.subdepartments.length - 1];

    // Log the action
    await AuditLogModel.createUserAction(
      'create',
      'subdepartment',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Created new subdepartment: ${displayName} in ${department.displayName}`,
        newValues: {
          subdepartmentId: createdSubdepartment._id,
          name,
          displayName,
          departmentName: department.displayName,
          permissions: permissions.length
        }
      },
      {
        resourceId: createdSubdepartment._id?.toString(),
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      subdepartment: createdSubdepartment,
      message: 'Subdepartment created successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating subdepartment:', error);
    return ApiResponse.error('Failed to create subdepartment');
  }
}
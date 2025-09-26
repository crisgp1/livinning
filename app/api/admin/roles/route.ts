import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import RoleModel, { IRole } from '@/lib/infrastructure/database/models/RoleModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view roles
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view roles');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};
    if (department) query.department = department;
    if (isActive !== null) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      RoleModel.find(query)
        .sort({ hierarchy: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RoleModel.countDocuments(query)
    ]);

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'roles',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed roles list with filters: ${JSON.stringify(query)}`,
        newValues: { total, page, limit }
      },
      {
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      roles,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: roles.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return ApiResponse.error('Failed to fetch roles');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to create roles
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to create roles');
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      department,
      level = 'custom',
      hierarchy = 50,
      permissions = []
    }: Partial<IRole> = body;

    // Validate required fields
    if (!name || !displayName || !description || !department) {
      return ApiResponse.badRequest('Missing required fields: name, displayName, description, department');
    }

    // Validate role name format
    if (!/^[a-z_]+$/.test(name)) {
      return ApiResponse.badRequest('Role name must contain only lowercase letters and underscores');
    }

    await connectDB();

    // Check if role with same name already exists
    const existingRole = await RoleModel.findOne({ name });
    if (existingRole) {
      return ApiResponse.badRequest('Role with this name already exists');
    }

    // Create new role
    const newRole = new RoleModel({
      name,
      displayName,
      description,
      department,
      level,
      hierarchy,
      permissions,
      isActive: true,
      metadata: {
        createdBy: userId,
        organizationId: user.organizationMemberships[0]?.organization.id
      }
    });

    await newRole.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'create',
      'role',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Created new role: ${displayName} (${name})`,
        newValues: {
          roleId: newRole._id,
          name,
          displayName,
          department,
          permissions: permissions.length
        }
      },
      {
        resourceId: newRole._id?.toString(),
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      role: newRole,
      message: 'Role created successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating role:', error);
    return ApiResponse.error('Failed to create role');
  }
}
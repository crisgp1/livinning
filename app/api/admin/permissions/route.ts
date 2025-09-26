import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import PermissionModel, { IPermission } from '@/lib/infrastructure/database/models/PermissionModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

// Default system permissions for different categories
const DEFAULT_PERMISSIONS: Omit<IPermission, '_id' | 'createdAt' | 'updatedAt' | 'metadata'>[] = [
  // User Management
  { name: 'user:create', displayName: 'Create Users', description: 'Create new user accounts', category: 'user_management', resource: 'user', action: 'create', scope: 'organization', isSystem: true },
  { name: 'user:read', displayName: 'View Users', description: 'View user profiles and information', category: 'user_management', resource: 'user', action: 'read', scope: 'organization', isSystem: true },
  { name: 'user:update', displayName: 'Update Users', description: 'Update user profiles and information', category: 'user_management', resource: 'user', action: 'update', scope: 'organization', isSystem: true },
  { name: 'user:delete', displayName: 'Delete Users', description: 'Delete user accounts', category: 'user_management', resource: 'user', action: 'delete', scope: 'organization', isSystem: true },

  // Role Management
  { name: 'role:create', displayName: 'Create Roles', description: 'Create new roles', category: 'role_management', resource: 'role', action: 'create', scope: 'organization', isSystem: true },
  { name: 'role:read', displayName: 'View Roles', description: 'View roles and permissions', category: 'role_management', resource: 'role', action: 'read', scope: 'organization', isSystem: true },
  { name: 'role:update', displayName: 'Update Roles', description: 'Update role permissions', category: 'role_management', resource: 'role', action: 'update', scope: 'organization', isSystem: true },
  { name: 'role:delete', displayName: 'Delete Roles', description: 'Delete roles', category: 'role_management', resource: 'role', action: 'delete', scope: 'organization', isSystem: true },
  { name: 'role:assign', displayName: 'Assign Roles', description: 'Assign roles to users', category: 'role_management', resource: 'role', action: 'assign', scope: 'organization', isSystem: true },

  // Department Management
  { name: 'department:create', displayName: 'Create Departments', description: 'Create new departments', category: 'department_management', resource: 'department', action: 'create', scope: 'organization', isSystem: true },
  { name: 'department:read', displayName: 'View Departments', description: 'View department information', category: 'department_management', resource: 'department', action: 'read', scope: 'organization', isSystem: true },
  { name: 'department:update', displayName: 'Update Departments', description: 'Update department settings', category: 'department_management', resource: 'department', action: 'update', scope: 'organization', isSystem: true },
  { name: 'department:delete', displayName: 'Delete Departments', description: 'Delete departments', category: 'department_management', resource: 'department', action: 'delete', scope: 'organization', isSystem: true },
  { name: 'department:manage', displayName: 'Manage Departments', description: 'Full department management access', category: 'department_management', resource: 'department', action: 'manage', scope: 'organization', isSystem: true },

  // Property Management
  { name: 'property:create', displayName: 'Create Properties', description: 'Add new properties to listings', category: 'property_management', resource: 'property', action: 'create', scope: 'department', isSystem: true },
  { name: 'property:read', displayName: 'View Properties', description: 'View property listings and details', category: 'property_management', resource: 'property', action: 'read', scope: 'department', isSystem: true },
  { name: 'property:update', displayName: 'Update Properties', description: 'Edit property information', category: 'property_management', resource: 'property', action: 'update', scope: 'department', isSystem: true },
  { name: 'property:delete', displayName: 'Delete Properties', description: 'Remove properties from listings', category: 'property_management', resource: 'property', action: 'delete', scope: 'department', isSystem: true },
  { name: 'property:manage', displayName: 'Manage Properties', description: 'Full property management access', category: 'property_management', resource: 'property', action: 'manage', scope: 'department', isSystem: true },

  // Financial Management
  { name: 'finance:read', displayName: 'View Financial Data', description: 'View financial reports and data', category: 'financial_management', resource: 'finance', action: 'read', scope: 'department', isSystem: true },
  { name: 'finance:update', displayName: 'Update Financial Data', description: 'Update financial records', category: 'financial_management', resource: 'finance', action: 'update', scope: 'department', isSystem: true },
  { name: 'commission:read', displayName: 'View Commissions', description: 'View commission reports', category: 'financial_management', resource: 'commission', action: 'read', scope: 'department', isSystem: true },
  { name: 'commission:manage', displayName: 'Manage Commissions', description: 'Calculate and manage commissions', category: 'financial_management', resource: 'commission', action: 'manage', scope: 'department', isSystem: true },
  { name: 'payment:read', displayName: 'View Payments', description: 'View payment records', category: 'financial_management', resource: 'payment', action: 'read', scope: 'department', isSystem: true },
  { name: 'payment:execute', displayName: 'Process Payments', description: 'Execute payment transactions', category: 'financial_management', resource: 'payment', action: 'execute', scope: 'department', isSystem: true },

  // Marketing Management
  { name: 'marketing:create', displayName: 'Create Marketing Campaigns', description: 'Create marketing campaigns', category: 'marketing_management', resource: 'marketing', action: 'create', scope: 'department', isSystem: true },
  { name: 'marketing:read', displayName: 'View Marketing Data', description: 'View marketing analytics and campaigns', category: 'marketing_management', resource: 'marketing', action: 'read', scope: 'department', isSystem: true },
  { name: 'marketing:update', displayName: 'Update Marketing Campaigns', description: 'Edit marketing campaigns', category: 'marketing_management', resource: 'marketing', action: 'update', scope: 'department', isSystem: true },
  { name: 'listing:manage', displayName: 'Manage Listings', description: 'Optimize and manage property listings', category: 'marketing_management', resource: 'listing', action: 'manage', scope: 'department', isSystem: true },

  // Legal Management
  { name: 'legal:read', displayName: 'View Legal Documents', description: 'Access legal documents and contracts', category: 'legal_management', resource: 'legal', action: 'read', scope: 'department', isSystem: true },
  { name: 'legal:create', displayName: 'Create Legal Documents', description: 'Create contracts and legal documents', category: 'legal_management', resource: 'legal', action: 'create', scope: 'department', isSystem: true },
  { name: 'contract:manage', displayName: 'Manage Contracts', description: 'Full contract management access', category: 'legal_management', resource: 'contract', action: 'manage', scope: 'department', isSystem: true },
  { name: 'compliance:read', displayName: 'View Compliance', description: 'View compliance reports and status', category: 'legal_management', resource: 'compliance', action: 'read', scope: 'department', isSystem: true },

  // Operations Management
  { name: 'operations:read', displayName: 'View Operations', description: 'View operational data and reports', category: 'operations_management', resource: 'operations', action: 'read', scope: 'department', isSystem: true },
  { name: 'maintenance:manage', displayName: 'Manage Maintenance', description: 'Schedule and manage maintenance requests', category: 'operations_management', resource: 'maintenance', action: 'manage', scope: 'department', isSystem: true },
  { name: 'inspection:manage', displayName: 'Manage Inspections', description: 'Schedule and manage property inspections', category: 'operations_management', resource: 'inspection', action: 'manage', scope: 'department', isSystem: true },
  { name: 'vendor:manage', displayName: 'Manage Vendors', description: 'Manage vendor relationships', category: 'operations_management', resource: 'vendor', action: 'manage', scope: 'department', isSystem: true },

  // Customer Service
  { name: 'support:read', displayName: 'View Support Tickets', description: 'View customer support tickets', category: 'customer_service', resource: 'support', action: 'read', scope: 'department', isSystem: true },
  { name: 'support:create', displayName: 'Create Support Tickets', description: 'Create new support tickets', category: 'customer_service', resource: 'support', action: 'create', scope: 'department', isSystem: true },
  { name: 'support:update', displayName: 'Update Support Tickets', description: 'Update and respond to support tickets', category: 'customer_service', resource: 'support', action: 'update', scope: 'department', isSystem: true },
  { name: 'client:manage', displayName: 'Manage Client Communication', description: 'Manage client communication hub', category: 'customer_service', resource: 'client', action: 'manage', scope: 'department', isSystem: true },

  // Reporting
  { name: 'report:read', displayName: 'View Reports', description: 'View system reports and analytics', category: 'reporting', resource: 'report', action: 'read', scope: 'department', isSystem: true },
  { name: 'report:create', displayName: 'Create Reports', description: 'Generate custom reports', category: 'reporting', resource: 'report', action: 'create', scope: 'department', isSystem: true },
  { name: 'analytics:read', displayName: 'View Analytics', description: 'Access analytics dashboards', category: 'reporting', resource: 'analytics', action: 'read', scope: 'department', isSystem: true },

  // System Administration
  { name: 'system:read', displayName: 'View System Settings', description: 'View system configuration', category: 'system_administration', resource: 'system', action: 'read', scope: 'system', isSystem: true },
  { name: 'system:update', displayName: 'Update System Settings', description: 'Modify system configuration', category: 'system_administration', resource: 'system', action: 'update', scope: 'system', isSystem: true },
  { name: 'audit:read', displayName: 'View Audit Logs', description: 'Access system audit logs', category: 'system_administration', resource: 'audit', action: 'read', scope: 'system', isSystem: true }
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view permissions
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view permissions');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const scope = searchParams.get('scope');
    const isSystem = searchParams.get('isSystem');

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (scope) query.scope = scope;
    if (isSystem !== null) query.isSystem = isSystem === 'true';

    const permissions = await PermissionModel.find(query)
      .sort({ category: 1, resource: 1, action: 1 })
      .lean();

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    // Get available categories
    const categories = await PermissionModel.distinct('category');

    return ApiResponse.success({
      permissions,
      groupedPermissions,
      categories,
      total: permissions.length
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return ApiResponse.error('Failed to fetch permissions');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to create permissions
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to create permissions');
    }

    const body = await request.json();
    const {
      action,
      initializeDefaults = false
    } = body;

    await connectDB();

    if (action === 'initialize' && initializeDefaults) {
      // Initialize default system permissions
      const existingPermissions = await PermissionModel.find({}, 'name');
      const existingNames = new Set(existingPermissions.map(p => p.name));

      const newPermissions = DEFAULT_PERMISSIONS.filter(
        permission => !existingNames.has(permission.name)
      ).map(permission => ({
        ...permission,
        metadata: {
          createdBy: userId,
          organizationId: user.organizationMemberships[0]?.organization.id
        }
      }));

      if (newPermissions.length > 0) {
        await PermissionModel.insertMany(newPermissions);

        // Log the action
        await AuditLogModel.createUserAction(
          'initialize',
          'permissions',
          userId,
          `${user.firstName} ${user.lastName}`,
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
          {
            description: `Initialized ${newPermissions.length} default system permissions`,
            newValues: {
              permissionsCreated: newPermissions.length,
              categories: [...new Set(newPermissions.map(p => p.category))]
            }
          },
          {
            severity: 'medium',
            metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
          }
        ).save();

        return ApiResponse.success({
          message: `Initialized ${newPermissions.length} default permissions`,
          created: newPermissions.length,
          skipped: DEFAULT_PERMISSIONS.length - newPermissions.length
        }, 201);
      } else {
        return ApiResponse.success({
          message: 'All default permissions already exist',
          created: 0,
          skipped: DEFAULT_PERMISSIONS.length
        });
      }
    }

    // Create custom permission
    const {
      name,
      displayName,
      description,
      category,
      resource,
      action: permissionAction,
      scope = 'department'
    }: Partial<IPermission> = body;

    if (!name || !displayName || !description || !category || !resource || !permissionAction) {
      return ApiResponse.badRequest('Missing required fields: name, displayName, description, category, resource, action');
    }

    // Validate permission name format
    if (!/^[a-z_:]+$/.test(name)) {
      return ApiResponse.badRequest('Permission name must contain only lowercase letters, underscores, and colons');
    }

    // Check if permission already exists
    const existingPermission = await PermissionModel.findOne({ name });
    if (existingPermission) {
      return ApiResponse.badRequest('Permission with this name already exists');
    }

    const newPermission = new PermissionModel({
      name,
      displayName,
      description,
      category,
      resource,
      action: permissionAction,
      scope,
      isSystem: false,
      metadata: {
        createdBy: userId,
        organizationId: user.organizationMemberships[0]?.organization.id
      }
    });

    await newPermission.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'create',
      'permission',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Created new permission: ${displayName} (${name})`,
        newValues: {
          permissionId: newPermission._id,
          name,
          displayName,
          category,
          resource,
          action: permissionAction,
          scope
        }
      },
      {
        resourceId: newPermission._id?.toString(),
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      permission: newPermission,
      message: 'Permission created successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating permission:', error);
    return ApiResponse.error('Failed to create permission');
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/infrastructure/database/connection';
import DepartmentModel, { IDepartment } from '@/lib/infrastructure/database/models/DepartmentModel';
import RoleModel from '@/lib/infrastructure/database/models/RoleModel';
import UserRoleAssignmentModel from '@/lib/infrastructure/database/models/UserRoleAssignmentModel';
import AuditLogModel from '@/lib/infrastructure/database/models/AuditLogModel';
import { ApiResponse } from '@/lib/utils/api-response';

// Default department configurations
const DEFAULT_DEPARTMENTS: Omit<IDepartment, '_id' | 'createdAt' | 'updatedAt' | 'metadata'>[] = [
  {
    name: 'finance',
    displayName: 'Finance Department',
    description: 'Manages financial operations, budgets, commissions, payments, and financial reporting for the real estate company.',
    code: 'FIN',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'accounting',
        displayName: 'Accounting',
        description: 'General accounting and bookkeeping operations',
        isActive: true,
        permissions: ['finance:read', 'finance:update', 'report:read'],
        metadata: {}
      },
      {
        name: 'commission_tracking',
        displayName: 'Commission Tracking',
        description: 'Manages and tracks sales commissions',
        isActive: true,
        permissions: ['commission:read', 'commission:manage', 'finance:read'],
        metadata: {}
      },
      {
        name: 'payment_processing',
        displayName: 'Payment Processing',
        description: 'Handles payment transactions and processing',
        isActive: true,
        permissions: ['payment:read', 'payment:execute', 'finance:update'],
        metadata: {}
      },
      {
        name: 'budget_management',
        displayName: 'Budget Management',
        description: 'Manages departmental budgets and financial planning',
        isActive: true,
        permissions: ['finance:read', 'finance:update', 'report:create'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['finance:read', 'finance:update', 'commission:read', 'commission:manage', 'payment:read', 'payment:execute', 'report:read', 'report:create'],
    settings: {
      autoAssignment: false,
      requireApproval: true,
      escalationRules: [
        { timeLimit: 24, escalateTo: 'department_manager' },
        { timeLimit: 72, escalateTo: 'helpdesk' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  },
  {
    name: 'sales',
    displayName: 'Sales Department',
    description: 'Handles lead management, property assignments, sales tracking, and performance monitoring.',
    code: 'SALES',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'lead_management',
        displayName: 'Lead Management',
        description: 'Manages incoming leads and lead qualification',
        isActive: true,
        permissions: ['client:manage', 'property:read', 'report:read'],
        metadata: {}
      },
      {
        name: 'sales_tracking',
        displayName: 'Sales Tracking',
        description: 'Tracks sales performance and pipeline',
        isActive: true,
        permissions: ['property:read', 'property:update', 'report:read', 'analytics:read'],
        metadata: {}
      },
      {
        name: 'territory_management',
        displayName: 'Territory Management',
        description: 'Manages sales territories and assignments',
        isActive: true,
        permissions: ['property:read', 'user:read', 'report:read'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['property:read', 'property:update', 'client:manage', 'report:read', 'analytics:read'],
    settings: {
      autoAssignment: true,
      requireApproval: false,
      escalationRules: [
        { timeLimit: 4, escalateTo: 'sales_manager' },
        { timeLimit: 24, escalateTo: 'department_manager' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  },
  {
    name: 'marketing',
    displayName: 'Marketing Department',
    description: 'Manages marketing campaigns, listings optimization, social media, and market analysis.',
    code: 'MKT',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'campaign_management',
        displayName: 'Campaign Management',
        description: 'Creates and manages marketing campaigns',
        isActive: true,
        permissions: ['marketing:create', 'marketing:read', 'marketing:update', 'analytics:read'],
        metadata: {}
      },
      {
        name: 'listing_optimization',
        displayName: 'Listing Optimization',
        description: 'Optimizes property listings for better visibility',
        isActive: true,
        permissions: ['listing:manage', 'property:read', 'property:update', 'analytics:read'],
        metadata: {}
      },
      {
        name: 'social_media',
        displayName: 'Social Media Management',
        description: 'Manages social media presence and campaigns',
        isActive: true,
        permissions: ['marketing:create', 'marketing:update', 'analytics:read'],
        metadata: {}
      },
      {
        name: 'market_analysis',
        displayName: 'Market Analysis',
        description: 'Conducts market research and analysis',
        isActive: true,
        permissions: ['analytics:read', 'report:create', 'property:read'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['marketing:create', 'marketing:read', 'marketing:update', 'listing:manage', 'property:read', 'property:update', 'analytics:read', 'report:create'],
    settings: {
      autoAssignment: false,
      requireApproval: true,
      escalationRules: [
        { timeLimit: 48, escalateTo: 'marketing_manager' },
        { timeLimit: 120, escalateTo: 'department_manager' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  },
  {
    name: 'legal',
    displayName: 'Legal Department',
    description: 'Handles contracts, legal documentation, compliance, and legal case management.',
    code: 'LEGAL',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'contract_management',
        displayName: 'Contract Management',
        description: 'Manages property and service contracts',
        isActive: true,
        permissions: ['contract:manage', 'legal:read', 'legal:create'],
        metadata: {}
      },
      {
        name: 'compliance',
        displayName: 'Compliance',
        description: 'Ensures regulatory compliance',
        isActive: true,
        permissions: ['compliance:read', 'legal:read', 'report:read'],
        metadata: {}
      },
      {
        name: 'documentation',
        displayName: 'Legal Documentation',
        description: 'Manages legal documents and templates',
        isActive: true,
        permissions: ['legal:create', 'legal:read', 'legal:update'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['legal:read', 'legal:create', 'contract:manage', 'compliance:read', 'report:read'],
    settings: {
      autoAssignment: false,
      requireApproval: true,
      escalationRules: [
        { timeLimit: 24, escalateTo: 'legal_manager' },
        { timeLimit: 72, escalateTo: 'department_manager' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  },
  {
    name: 'operations',
    displayName: 'Operations Department',
    description: 'Manages maintenance, inspections, vendor relationships, and facility management.',
    code: 'OPS',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'maintenance',
        displayName: 'Maintenance',
        description: 'Handles property maintenance requests and scheduling',
        isActive: true,
        permissions: ['maintenance:manage', 'vendor:manage', 'operations:read'],
        metadata: {}
      },
      {
        name: 'inspections',
        displayName: 'Inspections',
        description: 'Manages property inspections and scheduling',
        isActive: true,
        permissions: ['inspection:manage', 'property:read', 'operations:read'],
        metadata: {}
      },
      {
        name: 'vendor_management',
        displayName: 'Vendor Management',
        description: 'Manages vendor relationships and contracts',
        isActive: true,
        permissions: ['vendor:manage', 'contract:manage', 'operations:read'],
        metadata: {}
      },
      {
        name: 'facility_management',
        displayName: 'Facility Management',
        description: 'Manages company facilities and resources',
        isActive: true,
        permissions: ['operations:read', 'maintenance:manage', 'vendor:manage'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['operations:read', 'maintenance:manage', 'inspection:manage', 'vendor:manage', 'property:read'],
    settings: {
      autoAssignment: true,
      requireApproval: false,
      escalationRules: [
        { timeLimit: 8, escalateTo: 'operations_manager' },
        { timeLimit: 24, escalateTo: 'department_manager' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  },
  {
    name: 'customer_service',
    displayName: 'Customer Service Department',
    description: 'Handles customer support tickets, client communication, and satisfaction management.',
    code: 'CS',
    manager: 'system',
    isActive: true,
    subdepartments: [
      {
        name: 'support_tickets',
        displayName: 'Support Tickets',
        description: 'Manages customer support ticket system',
        isActive: true,
        permissions: ['support:read', 'support:create', 'support:update', 'client:manage'],
        metadata: {}
      },
      {
        name: 'client_communication',
        displayName: 'Client Communication',
        description: 'Manages client communication hub',
        isActive: true,
        permissions: ['client:manage', 'support:create', 'support:update'],
        metadata: {}
      },
      {
        name: 'satisfaction_surveys',
        displayName: 'Satisfaction Surveys',
        description: 'Conducts and manages customer satisfaction surveys',
        isActive: true,
        permissions: ['client:manage', 'analytics:read', 'report:create'],
        metadata: {}
      }
    ],
    roles: [],
    permissions: ['support:read', 'support:create', 'support:update', 'client:manage', 'analytics:read', 'report:create'],
    settings: {
      autoAssignment: true,
      requireApproval: false,
      escalationRules: [
        { timeLimit: 2, escalateTo: 'cs_supervisor' },
        { timeLimit: 8, escalateTo: 'department_manager' }
      ]
    },
    metrics: { activeEmployees: 0, completedTasks: 0, pendingTasks: 0, averageResponseTime: 0 }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to view departments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin', 'helpdesk'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to view departments');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    // Build query
    const query: any = {};
    if (isActive !== null) query.isActive = isActive === 'true';

    let departments = await DepartmentModel.find(query)
      .sort({ name: 1 })
      .lean();

    // Optionally include enhanced metrics
    if (includeMetrics) {
      departments = await Promise.all(
        departments.map(async (dept) => {
          // Get actual employee count from role assignments
          const activeEmployees = await UserRoleAssignmentModel.countDocuments({
            departmentId: dept._id,
            isActive: true,
            effectiveFrom: { $lte: new Date() },
            $or: [
              { effectiveUntil: { $exists: false } },
              { effectiveUntil: { $gte: new Date() } }
            ]
          });

          return {
            ...dept,
            metrics: {
              ...dept.metrics,
              activeEmployees
            }
          };
        })
      );
    }

    // Log the action
    await AuditLogModel.createUserAction(
      'view',
      'departments',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Viewed departments list`,
        newValues: { total: departments.length, includeMetrics }
      },
      {
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      departments,
      summary: {
        total: departments.length,
        active: departments.filter(d => d.isActive).length,
        inactive: departments.filter(d => !d.isActive).length
      }
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return ApiResponse.error('Failed to fetch departments');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has permission to create departments
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    if (!['superadmin'].includes(userRole)) {
      return ApiResponse.forbidden('Insufficient permissions to create departments');
    }

    const body = await request.json();
    const { action, initializeDefaults = false } = body;

    await connectDB();

    if (action === 'initialize' && initializeDefaults) {
      // Initialize default departments
      const existingDepartments = await DepartmentModel.find({}, 'name');
      const existingNames = new Set(existingDepartments.map(d => d.name));

      const newDepartments = DEFAULT_DEPARTMENTS.filter(
        dept => !existingNames.has(dept.name)
      ).map(dept => ({
        ...dept,
        metadata: {
          createdBy: userId,
          organizationId: user.organizationMemberships[0]?.organization.id
        }
      }));

      if (newDepartments.length > 0) {
        await DepartmentModel.insertMany(newDepartments);

        // Log the action
        await AuditLogModel.createUserAction(
          'initialize',
          'departments',
          userId,
          `${user.firstName} ${user.lastName}`,
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
          {
            description: `Initialized ${newDepartments.length} default departments`,
            newValues: {
              departmentsCreated: newDepartments.length,
              departments: newDepartments.map(d => ({ name: d.name, code: d.code }))
            }
          },
          {
            severity: 'medium',
            metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
          }
        ).save();

        return ApiResponse.success({
          message: `Initialized ${newDepartments.length} default departments`,
          created: newDepartments.length,
          skipped: DEFAULT_DEPARTMENTS.length - newDepartments.length,
          departments: newDepartments.map(d => ({ name: d.name, displayName: d.displayName, code: d.code }))
        }, 201);
      } else {
        return ApiResponse.success({
          message: 'All default departments already exist',
          created: 0,
          skipped: DEFAULT_DEPARTMENTS.length
        });
      }
    }

    // Create custom department
    const {
      name,
      displayName,
      description,
      code,
      manager,
      permissions = [],
      budgetLimit,
      subdepartments = []
    }: Partial<IDepartment> = body;

    if (!name || !displayName || !description || !code || !manager) {
      return ApiResponse.badRequest('Missing required fields: name, displayName, description, code, manager');
    }

    // Validate department code format
    if (!/^[A-Z]{2,5}$/.test(code)) {
      return ApiResponse.badRequest('Department code must be 2-5 uppercase letters');
    }

    // Check for existing department with same name or code
    const existingDepartment = await DepartmentModel.findOne({
      $or: [{ name }, { code }]
    });
    if (existingDepartment) {
      return ApiResponse.badRequest('Department with this name or code already exists');
    }

    const newDepartment = new DepartmentModel({
      name,
      displayName,
      description,
      code,
      manager,
      isActive: true,
      subdepartments,
      roles: [],
      permissions,
      budgetLimit,
      settings: {
        autoAssignment: false,
        requireApproval: true,
        escalationRules: [
          { timeLimit: 24, escalateTo: 'department_manager' }
        ]
      },
      metrics: {
        activeEmployees: 0,
        completedTasks: 0,
        pendingTasks: 0,
        averageResponseTime: 0
      },
      metadata: {
        createdBy: userId,
        organizationId: user.organizationMemberships[0]?.organization.id
      }
    });

    await newDepartment.save();

    // Log the action
    await AuditLogModel.createUserAction(
      'create',
      'department',
      userId,
      `${user.firstName} ${user.lastName}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown',
      {
        description: `Created new department: ${displayName} (${code})`,
        newValues: {
          departmentId: newDepartment._id,
          name,
          displayName,
          code,
          manager,
          subdepartments: subdepartments.length,
          permissions: permissions.length
        }
      },
      {
        resourceId: newDepartment._id?.toString(),
        severity: 'medium',
        metadata: { organizationId: user.organizationMemberships[0]?.organization.id }
      }
    ).save();

    return ApiResponse.success({
      department: newDepartment,
      message: 'Department created successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating department:', error);
    return ApiResponse.error('Failed to create department');
  }
}
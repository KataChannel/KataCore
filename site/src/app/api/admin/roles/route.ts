// API Route for Role Management with Module Permissions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';
import { SYSTEM_ROLES, ALL_MODULE_PERMISSIONS } from '@/lib/auth/modules-permissions';

// Middleware to check authentication
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', ''); 
  if (!token) {
    throw new Error('Token not found');
  }

  const decoded = await authService.verifyToken(token);
  const user = await authService.getUserById(decoded.userId);
 
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

// GET - List all roles with their permissions
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request); 
    console.log('Authenticated user:', user);
    
    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canReadRoles = userRole?.permissions.some(
      (p: any) => p.action === 'read' && p.resource === 'roles'
    );
    console.log('User role:', userRole);
    console.log('Can read roles:', canReadRoles);
    if (!canReadRoles && (!userRole || userRole.level < 8)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view roles' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Higher limit for roles
    const search = searchParams.get('search') || '';
    const moduleFilter = searchParams.get('module') || '';

    const skip = (page - 1) * limit;

    // Build where clause for database roles
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get database roles
    const [dbRoles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.role.count({ where }),
    ]);

    // Enhance with system role information
    const enhancedRoles = dbRoles.map((dbRole) => {
      const systemRole = SYSTEM_ROLES.find(
        (sr) =>
          sr.name.toLowerCase().replace(/ /g, '_') ===
            dbRole.name.toLowerCase().replace(/ /g, '_') ||
          sr.id === dbRole.name.toLowerCase().replace(/ /g, '_')
      );

      const dbPermissions = dbRole.permissions ? JSON.parse(dbRole.permissions as string) : [];

      return {
        id: dbRole.id,
        name: dbRole.name,
        description: dbRole.description,
        permissions: dbPermissions,
        userCount: dbRole._count.users,
        isActive: true, // Database roles are considered active
        createdAt: dbRole.createdAt,
        updatedAt: dbRole.updatedAt,

        // System role information
        systemRole: systemRole
          ? {
              id: systemRole.id,
              name: systemRole.name,
              description: systemRole.description,
              level: systemRole.level,
              modules: systemRole.modules,
              permissions: systemRole.permissions,
            }
          : null,

        // Computed fields
        level: systemRole?.level || 1,
        modules: systemRole?.modules || [],
        isSystemRole: !!systemRole,
      };
    });

    // Filter by module if specified
    const filteredRoles = moduleFilter
      ? enhancedRoles.filter((role) => role.modules.includes(moduleFilter))
      : enhancedRoles;

    // Add system roles that don't exist in database yet
    const missingSystemRoles = SYSTEM_ROLES.filter(
      (systemRole) =>
        !dbRoles.some(
          (dbRole) =>
            dbRole.name.toLowerCase().replace(/ /g, '_') === systemRole.id ||
            dbRole.name.toLowerCase().replace(/ /g, '_') ===
              systemRole.name.toLowerCase().replace(/ /g, '_')
        )
    ).map((systemRole) => ({
      id: systemRole.id,
      name: systemRole.name,
      description: systemRole.description,
      permissions: systemRole.permissions.map(
        (p:any) => `${p.action}:${p.resource}${p.scope ? `:${p.scope}` : ''}`
      ),
      userCount: 0,
      isActive: true,
      createdAt: null,
      updatedAt: null,
      systemRole: {
        id: systemRole.id,
        name: systemRole.name,
        description: systemRole.description,
        level: systemRole.level,
        modules: systemRole.modules,
        permissions: systemRole.permissions,
      },
      level: systemRole.level,
      modules: systemRole.modules,
      isSystemRole: true,
      inDatabase: false,
    }));

    const allRoles = [...filteredRoles, ...missingSystemRoles];

    // Sort by level (highest first) then by name
    allRoles.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      roles: allRoles,
      systemRoles: SYSTEM_ROLES,
      availablePermissions: Object.entries(ALL_MODULE_PERMISSIONS).map(([key, permission]:any) => ({
        id: key,
        name: key
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l:any) => l.toUpperCase()),
        action: permission.action,
        resource: permission.resource,
        description: permission.description || `${permission.action} ${permission.resource}`,
        module: getModuleFromResource(permission.resource),
      })),
      modules: Array.from(new Set(SYSTEM_ROLES.flatMap((role) => role.modules))),
      pagination: {
        page,
        limit,
        total: allRoles.length,
        totalPages: Math.ceil(allRoles.length / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canCreateRoles = userRole?.permissions.some(
      (p:any) => p.action === 'create' && p.resource === 'roles'
    );

    if (!canCreateRoles && (!userRole || userRole.level < 9)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      permissions = [],
      modules = [],
      level = 1,
      isSystemRole = false,
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Prevent creating roles with higher level than current user
    if (userRole && level > userRole.level) {
      return NextResponse.json(
        { error: 'Cannot create role with higher level than your own' },
        { status: 403 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 });
    }

    // Validate permissions
    const validPermissions = permissions.filter((perm: string) => {
      const [action, resource] = perm.split(':');
      return (
        action &&
        resource &&
        Object.values(ALL_MODULE_PERMISSIONS).some(
          (p) => p.action === action && p.resource === resource
        )
      );
    });

    // Create role in database
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: JSON.stringify(validPermissions),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // If it's a system role, we might want to update our system roles
    const systemRole = isSystemRole
      ? {
          id: name.toLowerCase().replace(/ /g, '_'),
          name,
          description,
          level,
          modules,
          permissions: validPermissions.map((perm: string) => {
            const [action, resource, scope] = perm.split(':');
            return {
              action,
              resource,
              scope: scope || 'all',
              description: `${action} ${resource}`,
            };
          }),
        }
      : null;

    return NextResponse.json(
      {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        permissions: validPermissions,
        userCount: newRole._count.users,
        isActive: true,
        createdAt: newRole.createdAt,
        systemRole,
        level,
        modules,
        isSystemRole,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create role' }, { status: 500 });
  }
}

// PUT - Update role
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canUpdateRoles = userRole?.permissions.some(
      (p:any) => p.action === 'update' && p.resource === 'roles'
    );

    if (!canUpdateRoles && (!userRole || userRole.level < 8)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roleId, name, description, permissions = [], modules = [], level } = body;

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if we can modify this role
    const existingSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        existingRole.name.toLowerCase().replace(/ /g, '_')
    );

    if (
      existingSystemRole &&
      userRole &&
      existingSystemRole.level >= userRole.level &&
      userRole.level < 10
    ) {
      return NextResponse.json(
        { error: 'Cannot modify role with equal or higher level' },
        { status: 403 }
      );
    }

    // Prevent creating roles with higher level than current user
    if (userRole && level && level > userRole.level) {
      return NextResponse.json(
        { error: 'Cannot set role level higher than your own' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (name && name !== existingRole.name) {
      // Check if new name conflicts
      const conflictingRole = await prisma.role.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          id: {
            not: roleId,
          },
        },
      });

      if (conflictingRole) {
        return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 });
      }

      updateData.name = name;
    }

    if (description) updateData.description = description;

    if (permissions.length > 0) {
      // Validate permissions
      const validPermissions = permissions.filter((perm: string) => {
        const [action, resource] = perm.split(':');
        return (
          action &&
          resource &&
          Object.values(ALL_MODULE_PERMISSIONS).some(
            (p) => p.action === action && p.resource === resource
          )
        );
      });

      updateData.permissions = JSON.stringify(validPermissions);
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const systemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        updatedRole.name.toLowerCase().replace(/ /g, '_')
    );

    return NextResponse.json({
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      permissions: updatedRole.permissions ? JSON.parse(updatedRole.permissions as string) : [],
      userCount: updatedRole._count.users,
      isActive: true,
      updatedAt: updatedRole.updatedAt,
      systemRole: systemRole
        ? {
            id: systemRole.id,
            name: systemRole.name,
            description: systemRole.description,
            level: systemRole.level,
            modules: systemRole.modules,
            permissions: systemRole.permissions,
          }
        : null,
      level: level || systemRole?.level || 1,
      modules: modules || systemRole?.modules || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update role' }, { status: 500 });
  }
}

// DELETE - Delete role
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canDeleteRoles = userRole?.permissions.some(
      (p:any) => p.action === 'delete' && p.resource === 'roles'
    );

    if (!canDeleteRoles && (!userRole || userRole.level < 9)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete roles' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role has users
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that has assigned users' },
        { status: 400 }
      );
    }

    // Check if we can delete this role
    const existingSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        existingRole.name.toLowerCase().replace(/ /g, '_')
    );

    if (
      existingSystemRole &&
      userRole &&
      existingSystemRole.level >= userRole.level &&
      userRole.level < 10
    ) {
      return NextResponse.json(
        { error: 'Cannot delete role with equal or higher level' },
        { status: 403 }
      );
    }

    // Prevent deleting critical system roles
    const criticalRoles = ['super_admin', 'admin', 'hr_manager', 'employee'];
    if (criticalRoles.includes(existingRole.name.toLowerCase().replace(/ /g, '_'))) {
      return NextResponse.json({ error: 'Cannot delete critical system role' }, { status: 400 });
    }

    // Delete role
    await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json({
      message: 'Role deleted successfully',
      roleId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete role' }, { status: 500 });
  }
}

// Helper function to determine module from resource
function getModuleFromResource(resource: string): string {
  const resourceModuleMap: Record<string, string> = {
    // Sales
    order: 'sales',
    pipeline: 'sales',
    revenue: 'sales',
    sales_reports: 'sales',
    sales_analytics: 'sales',
    quote: 'sales',
    sales_team: 'sales',

    // CRM
    customer: 'crm',
    lead: 'crm',
    contact: 'crm',
    campaign: 'crm',
    crm_analytics: 'crm',
    crm_reports: 'crm',

    // Inventory
    product: 'inventory',
    stock: 'inventory',
    warehouse: 'inventory',
    purchase_order: 'inventory',
    supplier: 'inventory',
    inventory_reports: 'inventory',
    stock_alerts: 'inventory',

    // Finance
    invoice: 'finance',
    payment: 'finance',
    account: 'finance',
    journal_entry: 'finance',
    financial_reports: 'finance',
    cash_flow: 'finance',
    profit_loss: 'finance',
    balance_sheet: 'finance',
    tax: 'finance',
    tax_reports: 'finance',
    budget: 'finance',

    // HRM
    employee: 'hrm',
    payroll: 'hrm',
    attendance: 'hrm',
    leave: 'hrm',
    performance: 'hrm',
    hr_reports: 'hrm',

    // Projects
    project: 'projects',
    task: 'projects',
    team: 'projects',
    time_entry: 'projects',
    project_reports: 'projects',
    resource_planning: 'projects',

    // Manufacturing
    production_plan: 'manufacturing',
    work_order: 'manufacturing',
    bom: 'manufacturing',
    quality_control: 'manufacturing',
    manufacturing_reports: 'manufacturing',
    efficiency_reports: 'manufacturing',

    // Marketing
    marketing_campaign: 'marketing',
    content: 'marketing',
    social_media: 'marketing',
    email_campaign: 'marketing',
    marketing_analytics: 'marketing',
    marketing_reports: 'marketing',

    // Support
    ticket: 'support',
    knowledge_base: 'support',
    customer_communication: 'support',
    support_reports: 'support',
    sla_reports: 'support',

    // Analytics
    dashboard: 'analytics',
    report: 'analytics',
    data: 'analytics',
    business_intelligence: 'analytics',

    // E-commerce
    catalog: 'ecommerce',
    online_order: 'ecommerce',
    website: 'ecommerce',
    seo: 'ecommerce',
    ecommerce_analytics: 'ecommerce',
    conversion_reports: 'ecommerce',

    // System
    users: 'system',
    roles: 'system',
    settings: 'system',
    audit: 'system',
    notifications: 'system',
    integrations: 'system',
  };

  return resourceModuleMap[resource] || 'system';
}

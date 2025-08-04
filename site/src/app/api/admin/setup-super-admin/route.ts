import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SYSTEM_ROLES, ALL_MODULE_PERMISSIONS } from '@/lib/auth/modules-permissions';

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  email: 'admin@taza.com',
  username: 'superadmin',
  password: 'TazaAdmin@2024!',
  displayName: 'Super Administrator',
  phone: '+84-xxx-xxx-xxx',
};

// Complete permission set for Super Administrator
const SUPER_ADMIN_PERMISSIONS = [
  // System-wide permissions
  'system:admin',
  'system:manage',
  'system:configure',
  'system:audit',
  'system:backup',
  'system:restore',

  // User and role management
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  'manage:user',
  'admin:user',

  'create:role',
  'read:role',
  'update:role',
  'delete:role',
  'manage:role',
  'admin:role',

  // Permission management
  'read:permissions',
  'manage:permissions',
  'admin:permissions',

  // Module admin permissions
  'admin:sales',
  'admin:crm',
  'admin:inventory',
  'admin:finance',
  'admin:hrm',
  'admin:projects',
  'admin:manufacturing',
  'admin:marketing',
  'admin:support',
  'admin:analytics',
  'admin:ecommerce',

  // Universal permissions (covers all future resources)
  'create:*',
  'read:*',
  'update:*',
  'delete:*',
  'manage:*',
  'admin:*',
  'approve:*',
  'export:*',
  'import:*',
  'audit:*',
  'configure:*',
];

// All available modules
const ALL_MODULES = [
  'admin',
  'sales',
  'crm',
  'inventory',
  'finance',
  'hrm',
  'projects',
  'manufacturing',
  'marketing',
  'support',
  'analytics',
  'ecommerce',
];

// Additional system roles to create
const DEFAULT_SYSTEM_ROLES = [
  {
    name: 'Administrator',
    description: 'System Administrator with high-level access',
    level: 9,
    modules: ALL_MODULES,
    permissions: [
      'read:*',
      'create:*',
      'update:*',
      'manage:user',
      'read:role',
      'admin:sales',
      'admin:crm',
      'admin:inventory',
      'admin:hrm',
      'admin:projects',
      'admin:analytics',
    ],
  },
  {
    name: 'Manager',
    description: 'Department Manager with module access',
    level: 7,
    modules: ['sales', 'crm', 'hrm', 'analytics'],
    permissions: [
      'read:*',
      'create:employee',
      'update:employee',
      'read:customer',
      'create:customer',
      'update:customer',
      'read:sales',
      'create:sales',
      'update:sales',
      'read:analytics',
    ],
  },
  {
    name: 'Employee',
    description: 'Standard employee with limited access',
    level: 3,
    modules: ['hrm'],
    permissions: [
      'read:employee',
      'update:employee', // own only
      'read:attendance',
      'create:attendance',
      'read:leave_request',
      'create:leave_request',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to basic information',
    level: 1,
    modules: ['analytics'],
    permissions: [
      'read:dashboard',
      'read:analytics',
    ],
  },
];

// POST - Setup Super Administrator and system
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up Super Administrator and system roles...');

    // Check if Super Admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: SUPER_ADMIN_CONFIG.email },
          { username: SUPER_ADMIN_CONFIG.username },
        ],
      },
      include: { role: true },
    });

    if (existingSuperAdmin && existingSuperAdmin.role?.name === 'Super Administrator') {
      return NextResponse.json({
        success: false,
        message: 'Super Administrator already exists',
        data: {
          user: {
            id: existingSuperAdmin.id,
            email: existingSuperAdmin.email,
            displayName: existingSuperAdmin.displayName,
            role: existingSuperAdmin.role?.name,
          },
        },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      console.log('📝 Creating Super Administrator role...');
      
      // 1. Create Super Administrator Role
      const superAdminRole = await tx.role.upsert({
        where: { name: 'Super Administrator' },
        update: {
          description: 'Super Administrator with complete system access and control',
          permissions: JSON.stringify({
            permissions: SUPER_ADMIN_PERMISSIONS,
            modules: ALL_MODULES,
            level: 1,
            isSystemRole: true,
            scope: 'all',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }),
        },
        create: {
          name: 'Super Administrator',
          description: 'Super Administrator with complete system access and control',
          permissions: JSON.stringify({
            permissions: SUPER_ADMIN_PERMISSIONS,
            modules: ALL_MODULES,
            level: 1,
            isSystemRole: true,
            scope: 'all',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }),
        },
      });

      console.log('✅ Super Administrator role created/updated');

      // 2. Hash password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, 12);

      // 3. Create or update Super Admin user
      console.log('👤 Creating Super Admin user...');
      let superAdmin;
      
      if (existingSuperAdmin) {
        // Update existing user to Super Admin
        superAdmin = await tx.user.update({
          where: { id: existingSuperAdmin.id },
          data: {
            roleId: superAdminRole.id,
            password: hashedPassword,
            isActive: true,
            isVerified: true,
          },
          include: { role: true },
        });
      } else {
        // Create new Super Admin user
        superAdmin = await tx.user.create({
          data: {
            email: SUPER_ADMIN_CONFIG.email,
            username: SUPER_ADMIN_CONFIG.username,
            password: hashedPassword,
            displayName: SUPER_ADMIN_CONFIG.displayName,
            phone: SUPER_ADMIN_CONFIG.phone,
            roleId: superAdminRole.id,
            isActive: true,
            isVerified: true,
            avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff&size=128',
          },
          include: { role: true },
        });
      }

      console.log('✅ Super Admin user created/updated successfully');

      // 4. Create additional system roles
      console.log('🛡️ Creating additional system roles...');
      const createdRoles = [];
      
      for (const roleData of DEFAULT_SYSTEM_ROLES) {
        const role = await tx.role.upsert({
          where: { name: roleData.name },
          update: {
            description: roleData.description,
            permissions: JSON.stringify({
              permissions: roleData.permissions,
              modules: roleData.modules,
              level: roleData.level,
              isSystemRole: true,
              scope: 'all',
              lastUpdated: new Date().toISOString(),
            }),
          },
          create: {
            name: roleData.name,
            description: roleData.description,
            permissions: JSON.stringify({
              permissions: roleData.permissions,
              modules: roleData.modules,
              level: roleData.level,
              isSystemRole: true,
              scope: 'all',
              createdAt: new Date().toISOString(),
            }),
          },
        });
        
        createdRoles.push(role);
        console.log(`✅ ${roleData.name} role created/updated`);
      }

      // 5. Try to create employee record if possible
      console.log('👨‍💼 Attempting to create employee record...');
      let employeeCreated = false;
      
      try {
        // Check if required tables exist
        const departments = await tx.department.findMany({ take: 1 });
        const positions = await tx.position.findMany({ take: 1 });

        if (departments.length > 0 && positions.length > 0) {
          await tx.employee.upsert({
            where: { userId: superAdmin.id },
            update: {
              employeeId: 'ADMIN001',
              departmentId: departments[0].id,
              positionId: positions[0].id,
              startDate: new Date(),
              status: 'ACTIVE',
            },
            create: {
              userId: superAdmin.id,
              employeeId: 'ADMIN001',
              departmentId: departments[0].id,
              positionId: positions[0].id,
              startDate: new Date(),
              status: 'ACTIVE',
            },
          });
          employeeCreated = true;
          console.log('✅ Employee record created/updated');
        } else {
          console.log('ℹ️ Department/Position tables not found, skipping employee record');
        }
      } catch (error) {
        console.log('ℹ️ Employee tables not available, skipping employee record creation');
      }

      return {
        superAdmin,
        superAdminRole,
        createdRoles,
        employeeCreated,
      };
    });

    console.log('🎉 Super Administrator Setup Complete!');

    return NextResponse.json({
      success: true,
      message: 'Super Administrator and system roles setup completed successfully',
      data: {
        superAdmin: {
          id: result.superAdmin.id,
          email: result.superAdmin.email,
          displayName: result.superAdmin.displayName,
          role: result.superAdmin.role?.name,
          permissions: SUPER_ADMIN_PERMISSIONS.length,
          modules: ALL_MODULES.length,
        },
        rolesCreated: result.createdRoles.length + 1, // +1 for Super Admin role
        employeeCreated: result.employeeCreated,
        loginCredentials: {
          email: SUPER_ADMIN_CONFIG.email,
          username: SUPER_ADMIN_CONFIG.username,
          password: SUPER_ADMIN_CONFIG.password,
          note: 'Please change the password after first login',
        },
        accessUrls: {
          adminDashboard: '/admin',
          permissionsManagement: '/admin/permissions',
          userManagement: '/admin/permissions',
        },
        securityReminders: [
          'Change the default password after first login',
          'Enable two-factor authentication if available',
          'Regularly review user permissions and access logs',
          'Never share Super Admin credentials',
          'Create individual admin accounts for team members',
        ],
      },
    });

  } catch (error: any) {
    console.error('❌ Super Admin setup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to setup Super Administrator',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Check Super Admin status
export async function GET(request: NextRequest) {
  try {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'Super Administrator' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    const superAdminUsers = await prisma.user.findMany({
      where: { role: { name: 'Super Administrator' } },
      select: {
        id: true,
        email: true,
        displayName: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    const systemRoles = await prisma.role.findMany({
      where: { 
        name: { 
          in: ['Super Administrator', 'Administrator', 'Manager', 'Employee', 'Viewer'] 
        } 
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { users: true },
        },
      },
    });

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        superAdminExists: !!superAdminRole,
        superAdminRole,
        superAdminUsers,
        systemRoles,
        systemStats: {
          totalUsers,
          activeUsers,
          totalRoles: systemRoles.length,
        },
        isConfigured: !!superAdminRole && superAdminUsers.length > 0,
      },
    });

  } catch (error: any) {
    console.error('Failed to check Super Admin status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check Super Admin status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update Super Admin configuration
export async function PUT(request: NextRequest) {
  try {
    const { action, userId, data } = await request.json();

    switch (action) {
      case 'update-profile':
        return await updateSuperAdminProfile(userId, data);
      case 'change-password':
        return await changeSuperAdminPassword(userId, data);
      case 'grant-super-admin':
        return await grantSuperAdminRole(userId);
      case 'revoke-super-admin':
        return await revokeSuperAdminRole(userId);
      case 'update-system-settings':
        return await updateSystemSettings(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Super Admin update failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update Super Admin configuration',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function updateSuperAdminProfile(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName,
      phone: data.phone,
      avatar: data.avatar,
    },
    include: { role: true },
  });

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
}

async function changeSuperAdminPassword(userId: string, data: any) {
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({
    success: true,
    message: 'Password changed successfully',
  });
}

async function grantSuperAdminRole(userId: string) {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Administrator' },
  });

  if (!superAdminRole) {
    throw new Error('Super Administrator role not found');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { roleId: superAdminRole.id },
    include: { role: true },
  });

  return NextResponse.json({
    success: true,
    message: 'Super Administrator role granted successfully',
    data: { user },
  });
}

async function revokeSuperAdminRole(userId: string) {
  // Get a default role (e.g., Manager or Employee)
  const defaultRole = await prisma.role.findFirst({
    where: { name: { in: ['Manager', 'Employee'] } },
  });

  if (!defaultRole) {
    throw new Error('No default role found to assign');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { roleId: defaultRole.id },
    include: { role: true },
  });

  return NextResponse.json({
    success: true,
    message: 'Super Administrator role revoked successfully',
    data: { user },
  });
}

async function updateSystemSettings(data: any) {
  // This can be extended to update system-wide settings
  // For now, we'll just return success
  return NextResponse.json({
    success: true,
    message: 'System settings updated successfully',
    data,
  });
}

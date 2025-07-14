// API Route for Super Administrator Management
import { NextRequest, NextResponse } from 'next/server';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables explicitly
config({ path: join(process.cwd(), '.env') });
config({ path: join(process.cwd(), '../shared/.env') });

import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';
import { SYSTEM_ROLES, ALL_MODULE_PERMISSIONS } from '@/lib/auth/modules-permissions';
import bcrypt from 'bcryptjs';

// Middleware to check if user is Super Admin
async function authenticateSuperAdmin(request: NextRequest) {
  try {
    console.log('[AUTH] Starting super admin authentication...');
    console.log('[AUTH] Environment check - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('[AUTH] Environment check - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const authHeader = request.headers.get('Authorization');
    console.log('[AUTH] Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'Not found');
    
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('[AUTH] No token found');
      throw new Error('Token not found');
    }

    console.log('[AUTH] Token extracted, length:', token.length);
    console.log('[AUTH] Attempting to verify token...');
    
    let decoded: any;
    try {
      decoded = await authService.verifyToken(token);
      console.log('[AUTH] Token verified successfully, userId:', decoded.userId);
    } catch (verifyError: any) {
      console.log('[AUTH] Token verification failed:', verifyError.message);
      console.log('[AUTH] Full verification error:', verifyError);
      throw verifyError;
    }
    
    console.log('[AUTH] Getting user by ID...');
    const user = await authService.getUserById(decoded.userId);
    console.log('[AUTH] User found:', user ? `${user.email} (${user.role?.name})` : 'Not found');

    if (!user || !user.role) {
      console.log('[AUTH] User or role not found');
      throw new Error('User not found');
    }

    // Check if user is Super Administrator
    const isSuperAdmin =
      user.role.name === 'Super Administrator' || user.role.name === 'super_administrator';

    if (!isSuperAdmin) {
      throw new Error('Access denied: Super Administrator role required');
    }

    return user;
  } catch (error: any) {
    console.log('[AUTH] Authentication failed with error:', error.message);
    throw new Error(`Authentication failed: ${error?.message || 'Unknown error'}`);
  }
}

// POST - Create Super Administrator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userData } = body;

    if (action === 'create-super-admin') {
      // For initial setup, allow creation without authentication
      // In production, this should be restricted or removed after initial setup
      return await createSuperAdmin(userData);
    }

    // For other actions, require Super Admin authentication
    const user = await authenticateSuperAdmin(request);

    switch (action) {
      case 'create-admin':
        return await createAdministrator(userData);
      case 'grant-super-admin':
        return await grantSuperAdminRole(userData.userId);
      case 'revoke-super-admin':
        return await revokeSuperAdminRole(userData.userId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Super Admin API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: error?.message?.includes('Access denied') ? 403 : 500 }
    );
  }
}

// GET - Get Super Admin information and system status
export async function GET(request: NextRequest) {
  try {
    // Check if this is the initial setup (no Super Admin exists)
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
    });

    // If no Super Admin exists, return basic system info without authentication
    if (!existingSuperAdmin) {
      const stats = await getSystemStats();
      return NextResponse.json({
        success: true,
        data: {
          superAdmins: [],
          systemStats: stats,
          currentUser: null,
          needsInitialization: true,
        },
      });
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // If no token, redirect to login
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required', redirectTo: '/login' },
        { status: 401 }
      );
    }

    // If Super Admin exists, require authentication
    const user = await authenticateSuperAdmin(request);

    // Get all Super Admins
    const superAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    // Get system statistics
    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      data: {
        superAdmins: superAdmins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          isActive: admin.isActive,
          lastLoginAt: admin.lastSeen || null,
          createdAt: admin.createdAt,
          role: admin.role,
          employee: admin.employee,
        })),
        systemStats: stats,
        currentUser: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      },
    });
  } catch (error: any) {
    console.error('Super Admin GET Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: error?.message?.includes('Access denied') ? 403 : 500 }
    );
  }
}

// Create Super Administrator with all permissions
async function createSuperAdmin(userData?: any) {
  const defaultData = {
    email: 'admin@taza.com',
    password: 'TazaAdmin@2024!',
    displayName: 'Super Administrator',
    username: 'superadmin',
  };

  const data = { ...defaultData, ...userData };

  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Super Administrator Role with all permissions
      const allPermissions = [
        // System administration
        { action: 'admin', resource: 'system' },
        { action: 'manage', resource: 'system' },
        { action: 'configure', resource: 'system' },
        { action: 'backup', resource: 'system' },

        // User and role management
        { action: 'create', resource: 'users' },
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' },
        { action: 'delete', resource: 'users' },
        { action: 'manage', resource: 'users' },
        { action: 'admin', resource: 'users' },

        { action: 'create', resource: 'roles' },
        { action: 'read', resource: 'roles' },
        { action: 'update', resource: 'roles' },
        { action: 'delete', resource: 'roles' },
        { action: 'manage', resource: 'roles' },
        { action: 'admin', resource: 'roles' },

        // All module permissions
        ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
          { action: 'create', resource: permission.resource },
          { action: 'read', resource: permission.resource },
          { action: 'update', resource: permission.resource },
          { action: 'delete', resource: permission.resource },
          { action: 'manage', resource: permission.resource },
          { action: 'admin', resource: permission.resource },
        ]),

        // Global permissions
        { action: 'create', resource: '*' },
        { action: 'read', resource: '*' },
        { action: 'update', resource: '*' },
        { action: 'delete', resource: '*' },
        { action: 'manage', resource: '*' },
        { action: 'admin', resource: '*' },
      ];

      const superAdminRole = await tx.role.upsert({
        where: { name: 'Super Administrator' },
        update: {
          description: 'Super Administrator with full system access',
          permissions: JSON.stringify(allPermissions),
        },
        create: {
          name: 'Super Administrator',
          description: 'Super Administrator with full system access',
          permissions: JSON.stringify(allPermissions),
        },
      });

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // 3. Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });

      let user;
      if (existingUser) {
        // Update existing user to Super Admin
        user = await tx.user.update({
          where: { email: data.email },
          data: {
            password: hashedPassword,
            displayName: data.displayName,
            username: data.username,
            roleId: superAdminRole.id,
            isActive: true,
            isVerified: true,
          },
        });
      } else {
        // Create new Super Admin user
        user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            displayName: data.displayName,
            username: data.username,
            roleId: superAdminRole.id,
            isActive: true,
            isVerified: true,
          },
        });
      }

      // 4. Try to create or update employee record (optional)
      let employee = null;
      try {
        // Check if we have required department and position
        const defaultDepartment = await tx.department.findFirst({
          where: { name: { in: ['Administration', 'IT', 'Management'] } },
        });

        const defaultPosition = await tx.position.findFirst({
          where: { title: { in: ['Administrator', 'System Admin', 'Manager'] } },
        });

        if (defaultDepartment && defaultPosition) {
          employee = await tx.employee.upsert({
            where: { userId: user.id },
            update: {
              firstName: data.displayName.split(' ')[0] || 'Super',
              lastName: data.displayName.split(' ').slice(1).join(' ') || 'Admin',
              fullName: data.displayName,
              status: 'ACTIVE',
            },
            create: {
              employeeId: `EMP-SA-${Date.now()}`,
              firstName: data.displayName.split(' ')[0] || 'Super',
              lastName: data.displayName.split(' ').slice(1).join(' ') || 'Admin',
              fullName: data.displayName,
              phone: data.phone || null,
              userId: user.id,
              departmentId: defaultDepartment.id,
              positionId: defaultPosition.id,
              status: 'ACTIVE',
              hireDate: new Date(),
            },
          });
        }
      } catch (empError) {
        console.warn(
          'Could not create employee record (departments/positions may not exist):',
          empError
        );
      }

      return { user, role: superAdminRole, employee };
    });

    console.log('✅ Super Administrator created successfully:', {
      userId: result.user.id,
      email: result.user.email,
      roleId: result.role.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Super Administrator created successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          username: result.user.username,
        },
        role: {
          id: result.role.id,
          name: result.role.name,
        },
        employee: result.employee
          ? {
              id: result.employee.id,
              employeeId: result.employee.employeeId,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating Super Administrator:', error);
    throw new Error(`Failed to create Super Administrator: ${error?.message || 'Unknown error'}`);
  }
}

// Create regular Administrator
async function createAdministrator(userData: any) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Get or create Administrator role
      const adminRole = await tx.role.upsert({
        where: { name: 'Administrator' },
        update: {},
        create: {
          id: 'administrator',
          name: 'Administrator',
          description: 'System Administrator with elevated privileges',
          permissions: JSON.stringify([
            { action: 'manage', resource: 'system' },
            { action: 'read', resource: 'users' },
            { action: 'update', resource: 'users' },
            { action: 'manage', resource: 'users' },
            ...Object.values(ALL_MODULE_PERMISSIONS).flatMap((permission) => [
              { action: 'read', resource: permission.resource },
              { action: 'create', resource: permission.resource },
              { action: 'update', resource: permission.resource },
              { action: 'delete', resource: permission.resource },
              { action: 'manage', resource: permission.resource },
            ]),
          ]),
        },
      });

      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          username: userData.username,
          roleId: adminRole.id,
          isActive: true,
          isVerified: true,
        },
      });

      const employee = await tx.employee.create({
        data: {
          employeeId: `EMP-ADM-${Date.now()}`,
          firstName: userData.firstName || userData.displayName.split(' ')[0],
          lastName: userData.lastName || userData.displayName.split(' ').slice(1).join(' '),
          fullName: userData.displayName,
          phone: userData.phone || null,
          userId: user.id,
          status: 'ACTIVE',
          hireDate: new Date(),
          // Add required fields with default values
          departmentId: 'default-dept', // This should be set to an actual department ID
          positionId: 'default-pos', // This should be set to an actual position ID
        },
      });

      return { user, role: adminRole, employee };
    });

    return NextResponse.json({
      success: true,
      message: 'Administrator created successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating Administrator:', error);
    throw new Error(`Failed to create Administrator: ${error?.message || 'Unknown error'}`);
  }
}

// Grant Super Admin role to existing user
async function grantSuperAdminRole(userId: string) {
  try {
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
  } catch (error: any) {
    console.error('Error granting Super Admin role:', error);
    throw new Error(`Failed to grant Super Admin role: ${error?.message || 'Unknown error'}`);
  }
}

// Revoke Super Admin role from user
async function revokeSuperAdminRole(userId: string) {
  try {
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
  } catch (error: any) {
    console.error('Error revoking Super Admin role:', error);
    throw new Error(`Failed to revoke Super Admin role: ${error?.message || 'Unknown error'}`);
  }
}

// Get system statistics
async function getSystemStats() {
  try {
    const [totalUsers, activeUsers, totalRoles, totalEmployees, recentLogins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.role.count(),
      prisma.employee.count(),
      prisma.user.count({
        where: {
          lastSeen: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalRoles,
      totalEmployees,
      recentLogins,
      systemHealth: 'operational',
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRoles: 0,
      totalEmployees: 0,
      recentLogins: 0,
      systemHealth: 'error',
    };
  }
}

// PUT - Update Super Admin settings
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateSuperAdmin(request);
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-profile':
        return await updateSuperAdminProfile(user.id, data);
      case 'change-password':
        return await changeSuperAdminPassword(user.id, data);
      case 'update-settings':
        return await updateSystemSettings(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Super Admin PUT Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: error?.message?.includes('Access denied') ? 403 : 500 }
    );
  }
}

async function updateSuperAdminProfile(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName,
      phone: data.phone,
      avatar: data.avatar,
    },
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

async function updateSystemSettings(data: any) {
  // Implementation for system settings update
  // This could involve updating various system configurations

  return NextResponse.json({
    success: true,
    message: 'System settings updated successfully',
    data,
  });
}

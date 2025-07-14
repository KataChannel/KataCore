// API Route for Super Administrator Management
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/authService';
import { SYSTEM_ROLES, MODULES_PERMISSIONS } from '@/lib/auth/modules-permissions';
import bcrypt from 'bcryptjs';

// Middleware to check if user is Super Admin
async function authenticateSuperAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token not found');
    }

    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user || !user.role) {
      throw new Error('User not found');
    }

    // Check if user is Super Administrator
    const isSuperAdmin = user.role.name === 'Super Administrator' || 
                        user.role.name === 'super_administrator';

    if (!isSuperAdmin) {
      throw new Error('Access denied: Super Administrator role required');
    }

    return user;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
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
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Super Admin API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

// GET - Get Super Admin information and system status
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateSuperAdmin(request);

    // Get all Super Admins
    const superAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['Super Administrator', 'super_administrator']
          }
        }
      },
      include: {
        role: true,
        employee: {
          include: {
            department: true,
            position: true
          }
        }
      }
    });

    // Get system statistics
    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      data: {
        superAdmins: superAdmins.map(admin => ({
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt,
          createdAt: admin.createdAt,
          role: admin.role,
          employee: admin.employee
        })),
        systemStats: stats,
        currentUser: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        }
      }
    });

  } catch (error) {
    console.error('Super Admin GET Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

// Create Super Administrator with all permissions
async function createSuperAdmin(userData?: any) {
  const defaultData = {
    email: 'admin@taza.com',
    password: 'TazaAdmin@2024!',
    displayName: 'Super Administrator',
    username: 'superadmin'
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
        ...Object.keys(MODULES_PERMISSIONS).flatMap(module => [
          { action: 'create', resource: module },
          { action: 'read', resource: module },
          { action: 'update', resource: module },
          { action: 'delete', resource: module },
          { action: 'manage', resource: module },
          { action: 'admin', resource: module },
          { action: 'export', resource: module },
          { action: 'import', resource: module }
        ]),
        
        // Global permissions
        { action: 'create', resource: '*' },
        { action: 'read', resource: '*' },
        { action: 'update', resource: '*' },
        { action: 'delete', resource: '*' },
        { action: 'manage', resource: '*' },
        { action: 'admin', resource: '*' }
      ];

      const superAdminRole = await tx.role.upsert({
        where: { name: 'Super Administrator' },
        update: {
          description: 'Super Administrator with full system access',
          permissions: JSON.stringify(allPermissions),
          isSystemRole: true,
          level: 10
        },
        create: {
          id: 'super_administrator',
          name: 'Super Administrator',
          description: 'Super Administrator with full system access',
          permissions: JSON.stringify(allPermissions),
          isSystemRole: true,
          level: 10
        }
      });

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // 3. Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email: data.email }
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
            isVerified: true
          }
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
            isVerified: true
          }
        });
      }

      // 4. Create or update employee record
      const employee = await tx.employee.upsert({
        where: { userId: user.id },
        update: {
          firstName: data.displayName.split(' ')[0] || 'Super',
          lastName: data.displayName.split(' ').slice(1).join(' ') || 'Admin',
          email: data.email,
          isActive: true
        },
        create: {
          employeeCode: `EMP-SA-${Date.now()}`,
          firstName: data.displayName.split(' ')[0] || 'Super',
          lastName: data.displayName.split(' ').slice(1).join(' ') || 'Admin',
          email: data.email,
          phone: data.phone || null,
          userId: user.id,
          isActive: true,
          hireDate: new Date()
        }
      });

      return { user, role: superAdminRole, employee };
    });

    console.log('✅ Super Administrator created successfully:', {
      userId: result.user.id,
      email: result.user.email,
      roleId: result.role.id
    });

    return NextResponse.json({
      success: true,
      message: 'Super Administrator created successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          username: result.user.username
        },
        role: {
          id: result.role.id,
          name: result.role.name,
          level: result.role.level
        },
        employee: {
          id: result.employee.id,
          employeeCode: result.employee.employeeCode
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating Super Administrator:', error);
    throw new Error(`Failed to create Super Administrator: ${error.message}`);
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
            ...Object.keys(MODULES_PERMISSIONS).flatMap(module => [
              { action: 'read', resource: module },
              { action: 'create', resource: module },
              { action: 'update', resource: module },
              { action: 'delete', resource: module },
              { action: 'manage', resource: module }
            ])
          ]),
          isSystemRole: true,
          level: 8
        }
      });

      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          username: userData.username,
          roleId: adminRole.id,
          isActive: true,
          isVerified: true
        }
      });

      const employee = await tx.employee.create({
        data: {
          employeeCode: `EMP-ADM-${Date.now()}`,
          firstName: userData.firstName || userData.displayName.split(' ')[0],
          lastName: userData.lastName || userData.displayName.split(' ').slice(1).join(' '),
          email: userData.email,
          phone: userData.phone || null,
          userId: user.id,
          isActive: true,
          hireDate: new Date()
        }
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
          displayName: result.user.displayName
        }
      }
    });

  } catch (error) {
    console.error('Error creating Administrator:', error);
    throw new Error(`Failed to create Administrator: ${error.message}`);
  }
}

// Grant Super Admin role to existing user
async function grantSuperAdminRole(userId: string) {
  try {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'Super Administrator' }
    });

    if (!superAdminRole) {
      throw new Error('Super Administrator role not found');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId: superAdminRole.id },
      include: { role: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Super Administrator role granted successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error granting Super Admin role:', error);
    throw new Error(`Failed to grant Super Admin role: ${error.message}`);
  }
}

// Revoke Super Admin role from user
async function revokeSuperAdminRole(userId: string) {
  try {
    // Get a default role (e.g., Manager or Employee)
    const defaultRole = await prisma.role.findFirst({
      where: { name: { in: ['Manager', 'Employee'] } }
    });

    if (!defaultRole) {
      throw new Error('No default role found to assign');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId: defaultRole.id },
      include: { role: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Super Administrator role revoked successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Error revoking Super Admin role:', error);
    throw new Error(`Failed to revoke Super Admin role: ${error.message}`);
  }
}

// Get system statistics
async function getSystemStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      totalEmployees,
      recentLogins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.role.count(),
      prisma.employee.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalRoles,
      totalEmployees,
      recentLogins,
      systemHealth: 'operational'
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRoles: 0,
      totalEmployees: 0,
      recentLogins: 0,
      systemHealth: 'error'
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
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Super Admin PUT Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

async function updateSuperAdminProfile(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName,
      phone: data.phone,
      avatar: data.avatar
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}

async function changeSuperAdminPassword(userId: string, data: any) {
  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return NextResponse.json({
    success: true,
    message: 'Password changed successfully'
  });
}

async function updateSystemSettings(data: any) {
  // Implementation for system settings update
  // This could involve updating various system configurations
  
  return NextResponse.json({
    success: true,
    message: 'System settings updated successfully',
    data
  });
}

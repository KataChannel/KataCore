import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting Super Admin GET request...');
    
    const existingSuperAdmin = await prisma.users.findFirst({
      where: {
        roles: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
    });

    console.log('Existing Super Admin found:', !!existingSuperAdmin);

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

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('Auth token present:', !!token);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required', redirectTo: '/login' },
        { status: 401 }
      );
    }

    const user = await authenticateSuperAdmin(request);

    const superAdmins = await prisma.users.findMany({
      where: {
        roles: {
          name: {
            in: ['Super Administrator', 'super_administrator'],
          },
        },
      },
      include: {
        roles: true,
        employees: {
          include: {
            departments: true,
            positions: true,
          },
        },
      },
    });

    const stats = await getSystemStats();

    return NextResponse.json({
      success: true,
      data: {
        superAdmins: superAdmins.map((admin: any) => ({
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          isActive: admin.isActive,
          lastLoginAt: admin.lastSeen || null,
          createdAt: admin.createdAt,
          role: admin.roles,
          employee: admin.employees,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userData } = body;

    if (action === 'create-super-admin') {
      return await createSuperAdmin(userData);
    }

    const user = await authenticateSuperAdmin(request);

    switch (action) {
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

async function authenticateSuperAdmin(request: NextRequest) {
  try {
    console.log('[AUTH] Starting super admin authentication...');
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token not found');
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user || !user.role) {
      throw new Error('User not found');
    }

    const isSuperAdmin = user.role.name === 'Super Administrator' || user.role.name === 'super_administrator';

    if (!isSuperAdmin) {
      throw new Error('Access denied: Super Administrator role required');
    }

    return user;
  } catch (error: any) {
    console.log('[AUTH] Authentication failed:', error.message);
    throw new Error(`Authentication failed: ${error?.message || 'Unknown error'}`);
  }
}

async function createSuperAdmin(userData?: any) {
  const defaultData = {
    email: 'admin@taza.com',
    password: 'TazaAdmin@2024!',
    displayName: 'Super Administrator',
    username: 'superadmin',
  };

  const data = { ...defaultData, ...userData };

  try {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const superAdminRole = await prisma.roles.upsert({
      where: { name: 'Super Administrator' },
      update: {
        description: 'Super Administrator with full system access',
        updatedAt: new Date(),
      },
      create: {
        id: 'super_administrator_role',
        name: 'Super Administrator',
        description: 'Super Administrator with full system access',
        permissions: JSON.stringify([
          { action: 'admin', resource: '*' },
          { action: 'manage', resource: '*' },
          { action: 'create', resource: '*' },
          { action: 'read', resource: '*' },
          { action: 'update', resource: '*' },
          { action: 'delete', resource: '*' },
        ]),
        updatedAt: new Date(),
      },
    });

    const user = await prisma.users.upsert({
      where: { email: data.email },
      update: {
        password: hashedPassword,
        displayName: data.displayName,
        username: data.username,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        updatedAt: new Date(),
      },
      create: {
        id: `super_admin_${Date.now()}`,
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName,
        username: data.username,
        roleId: superAdminRole.id,
        isActive: true,
        isVerified: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Super Administrator created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          username: user.username,
        },
        role: {
          id: superAdminRole.id,
          name: superAdminRole.name,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating Super Administrator:', error);
    throw new Error(`Failed to create Super Administrator: ${error?.message || 'Unknown error'}`);
  }
}

async function grantSuperAdminRole(userId: string) {
  try {
    const superAdminRole = await prisma.roles.findUnique({
      where: { name: 'Super Administrator' },
    });

    if (!superAdminRole) {
      throw new Error('Super Administrator role not found');
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: { roleId: superAdminRole.id },
      include: { roles: true },
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

async function revokeSuperAdminRole(userId: string) {
  try {
    const defaultRole = await prisma.roles.findFirst({
      where: { name: { in: ['Manager', 'Employee'] } },
    });

    if (!defaultRole) {
      throw new Error('No default role found to assign');
    }

    const user = await prisma.users.update({
      where: { id: userId },
      data: { roleId: defaultRole.id },
      include: { roles: true },
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

async function getSystemStats() {
  try {
    const [totalUsers, activeUsers, totalRoles] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { isActive: true } }),
      prisma.roles.count(),
    ]);

    let totalEmployees = 0;
    let recentLogins = 0;

    try {
      totalEmployees = await prisma.employees.count();
    } catch (e) {
      console.log('Employee table not available');
    }

    try {
      recentLogins = await prisma.users.count({
        where: {
          lastSeen: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
    } catch (e) {
      console.log('lastSeen field not available');
    }

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

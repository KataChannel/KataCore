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

// POST endpoint removed - super admin modification functionality disabled
// Use the permission management system instead

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

// Super admin role modification functions removed
// These functions are no longer needed as user role management
// should be handled through the permission management system

async function getSystemStats() {
  try {
    const [totalUsers, activeUsers, totalRoles] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { isActive: true } }),
      prisma.roles.count(),
    ]);

    let recentLogins = 0;

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
      recentLogins,
      systemHealth: 'operational',
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRoles: 0,
      recentLogins: 0,
      systemHealth: 'error',
    };
  }
}

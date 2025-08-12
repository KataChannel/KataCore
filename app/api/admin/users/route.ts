// API Route for User Management with Enhanced Permissions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';
import { SYSTEM_ROLES } from '@/lib/auth/modules-permissions';
import bcrypt from 'bcryptjs';

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

// Middleware to check admin permissions with enhanced validation
async function checkAdminPermissions(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user || !user.role) {
      throw new Error('User not found or has no role assigned');
    }

    // Check if user has admin permissions or is super admin
    const isSuperAdmin = (user.role && (
      user.role.name === 'Super Administrator' || 
      user.role.name === 'SUPER_ADMIN' || 
      user.role.name === 'super_admin' ||
      (user.role.level && user.role.level >= 10)
    )) || user.roleId === 'super_admin';
    
    // Get permissions array from user object or role permissions with enhanced validation
    let userPermissions: string[] = [];
    if (Array.isArray(user.permissions)) {
      userPermissions = user.permissions;
    } else if (user.role && user.role.permissions) {
      try {
        // Role permissions handling with better error checking
        if (Array.isArray(user.role.permissions)) {
          userPermissions = user.role.permissions.map((p: any) => {
            if (typeof p === 'string') return p;
            if (typeof p === 'object' && p.action && p.resource) {
              return `${p.action}:${p.resource}`;
            }
            return '';
          }).filter(p => p.length > 0);
        } else if (typeof user.role.permissions === 'string') {
          // Try to parse JSON permissions
          try {
            const parsed = JSON.parse(user.role.permissions);
            if (Array.isArray(parsed)) {
              userPermissions = parsed.map((p: any) => {
                if (typeof p === 'string') return p;
                if (typeof p === 'object' && p.action && p.resource) {
                  return `${p.action}:${p.resource}`;
                }
                return '';
              }).filter(p => p.length > 0);
            }
          } catch (parseError) {
            console.warn('Failed to parse role permissions JSON:', parseError);
            userPermissions = [];
          }
        } else if (typeof user.role.permissions === 'object' && user.role.permissions !== null) {
          // Handle object-based permissions
          if ('permissions' in user.role.permissions && Array.isArray((user.role.permissions as any).permissions)) {
            userPermissions = (user.role.permissions as any).permissions;
          }
        }
      } catch (error) {
        console.error('Error getting role permissions:', error);
        userPermissions = [];
      }
    }
    
    const hasAdminPermission = userPermissions.includes('admin:system') || 
                              userPermissions.includes('read:permissions') ||
                              userPermissions.includes('system:admin') ||
                              userPermissions.includes('admin:*') ||
                              userPermissions.includes('read:user') ||
                              userPermissions.includes('manage:user') ||
                              userPermissions.includes('manage:*') ||
                              userPermissions.includes('create:*') ||
                              userPermissions.includes('admin:users') ||
                              userPermissions.includes('read:users');

    if (!isSuperAdmin && !hasAdminPermission) {
      console.log('Permission check failed:', { 
        isSuperAdmin, 
        hasAdminPermission, 
        userPermissions, 
        roleName: user.role?.name, 
        roleLevel: user.role?.level,
        roleId: user.roleId 
      });
      throw new Error('Insufficient permissions to access user management');
    }

    return user;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Enhanced permission checking
async function checkUserManagementPermissions(user: any, action: string) {
  const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
  
  if (!userRole) {
    throw new Error('User role not found');
  }

  // Super Administrator has all permissions
  if (userRole.level >= 10) {
    return true;
  }

  // Check specific permission
  const hasPermission = userRole.permissions.some(
    (p:any) => (p.action === action || p.action === 'manage') && (p.resource === 'users' || p.resource === '*')
  );

  if (!hasPermission && userRole.level < 8) {
    throw new Error(`Insufficient permissions for ${action} users`);
  }

  return true;
}

// GET - List all users with their roles and permissions
export async function GET(request: NextRequest) {
  try {
    // Check permissions
    await checkAdminPermissions(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const roleFilter = url.searchParams.get('role') || '';
    const statusFilter = url.searchParams.get('status') || '';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleFilter) {
      where.roleId = roleFilter;
    }

    if (statusFilter === 'active') {
      where.isActive = true;
    } else if (statusFilter === 'inactive') {
      where.isActive = false;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        include: {
          roles: {
            select: {
              id: true,
              name: true,
              description: true,
              permissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);

    // Transform users data
    const transformedUsers = users.map((user) => {
      let roleLevel = 1;
      let rolePermissions: string[] = [];

      try {
        if (user.roles && user.roles.permissions) {
          const permissionsData = JSON.parse(user.roles.permissions as string);
          roleLevel = permissionsData.level || 1;
          rolePermissions = Array.isArray(permissionsData.permissions) 
            ? permissionsData.permissions 
            : permissionsData;
        }
      } catch (error) {
        console.error('Error parsing role permissions:', error);
      }

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLoginAt: user.lastSeen,
        createdAt: user.createdAt,
        role: {
          id: user.roles?.id || 'unknown',
          name: user.roles?.name || 'No Role',
          level: roleLevel,
          permissions: rolePermissions,
        },
      };
    });

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

// POST - Create new user with role assignment
export async function POST(request: NextRequest) {
  try {
    // Check permissions using the same method as other admin endpoints
    await checkAdminPermissions(request);
    
    // Also get the authenticated user for additional checks
    const user = await authenticate(request);

    const body = await request.json();
    const {
      email,
      phone,
      username,
      password,
      displayName,
      roleId,
      isActive = true,
      modules = [],
      employeeData = null,
    } = body;

    // Validate required fields with enhanced checking
    if (!email && !phone && !username) {
      return NextResponse.json(
        { error: 'At least one of email, phone, or username is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    // Check for existing user with same email/phone/username
    const existingUserCheck = await prisma.users.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          username ? { username } : {},
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    if (existingUserCheck) {
      const conflictField = existingUserCheck.email === email ? 'email' : 
                           existingUserCheck.phone === phone ? 'phone' : 'username';
      return NextResponse.json(
        { error: `User with this ${conflictField} already exists` },
        { status: 409 }
      );
    }

    // Validate role exists and user has permission to assign it
    const role = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Check if role is appropriate for current user's level
    const currentUserRole = user.role;
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_')
    );
    if (targetSystemRole && currentUserRole && targetSystemRole.level > currentUserRole.level) {
      return NextResponse.json(
        { error: 'Cannot assign role with higher level than your own' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [email ? { email } : {}, phone ? { phone } : {}, username ? { username } : {}],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email, phone, or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.users.create({
      data: {
        email,
        phone,
        username,
        password: hashedPassword,
        displayName,
        roleId,
        isActive,
        isVerified: true, // Auto-verify admin-created users
        updatedAt: new Date(),
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    });

    // Get system role information
    // Find system role for additional info
    const systemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_')
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          username: newUser.username,
          displayName: newUser.displayName,
          avatar: newUser.avatar,
          isActive: newUser.isActive,
          isVerified: newUser.isVerified,
          role: {
            id: newUser.roles.id,
            name: newUser.roles.name,
            description: newUser.roles.description,
            permissions: newUser.roles.permissions
              ? JSON.parse(newUser.roles.permissions as string)
              : [],
          },
          systemRole: systemRole || null,
          createdAt: newUser.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

// Note: PUT and DELETE for individual users are handled by /api/admin/users/[userId]/route.ts

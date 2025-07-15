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

// Middleware to check admin permissions
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
      throw new Error('User not found');
    }

    // Check if user has admin permissions or is super admin
    const isSuperAdmin = user.role.name === 'Super Administrator';
    
    // Get permissions array from user object or role permissions
    let userPermissions: string[] = [];
    if (Array.isArray(user.permissions)) {
      userPermissions = user.permissions;
    } else if (user.role && user.role.permissions) {
      try {
        // If permissions is stored as JSON string, parse it
        const rolePermissions = typeof user.role.permissions === 'string' 
          ? JSON.parse(user.role.permissions) 
          : user.role.permissions;
        
        if (typeof rolePermissions === 'object' && Array.isArray(rolePermissions.permissions)) {
          userPermissions = rolePermissions.permissions;
        } else if (Array.isArray(rolePermissions)) {
          userPermissions = rolePermissions;
        }
      } catch (error) {
        console.error('Error parsing role permissions:', error);
        userPermissions = [];
      }
    }
    
    const hasAdminPermission = userPermissions.includes('admin:system') || 
                              userPermissions.includes('read:permissions') ||
                              userPermissions.includes('system:admin') ||
                              userPermissions.includes('admin:*') ||
                              userPermissions.includes('read:user') ||
                              userPermissions.includes('manage:user');

    if (!isSuperAdmin && !hasAdminPermission) {
      throw new Error('Insufficient permissions');
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
    (p) => (p.action === action || p.action === 'manage') && (p.resource === 'users' || p.resource === '*')
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
      prisma.user.findMany({
        where,
        include: {
          role: {
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
      prisma.user.count({ where }),
    ]);

    // Transform users data
    const transformedUsers = users.map((user) => {
      let roleLevel = 1;
      let rolePermissions: string[] = [];

      try {
        if (user.role && user.role.permissions) {
          const permissionsData = JSON.parse(user.role.permissions as string);
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
          id: user.role?.id || 'unknown',
          name: user.role?.name || 'No Role',
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
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canCreateUsers = userRole?.permissions.some(
      (p) => p.action === 'create' && p.resource === 'users'
    );

    if (!canCreateUsers && (!userRole || userRole.level < 8)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create users' },
        { status: 403 }
      );
    }

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

    // Validate required fields
    if (!email && !phone && !username) {
      return NextResponse.json(
        { error: 'At least one of email, phone, or username is required' },
        { status: 400 }
      );
    }

    if (!password || !displayName || !roleId) {
      return NextResponse.json(
        { error: 'Password, display name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Check if role is appropriate for current user's level
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_')
    );
    if (targetSystemRole && userRole && targetSystemRole.level > userRole.level) {
      return NextResponse.json(
        { error: 'Cannot assign role with higher level than your own' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
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
    const newUser = await prisma.user.create({
      data: {
        email,
        phone,
        username,
        password: hashedPassword,
        displayName,
        roleId,
        isActive,
        isVerified: true, // Auto-verify admin-created users
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    });

    // Create employee record if provided
    let employee = null;
    if (employeeData) {
      try {
        employee = await prisma.employee.create({
          data: {
            ...employeeData,
            userId: newUser.id,
          },
          include: {
            department: true,
            position: true,
          },
        });
      } catch (error) {
        console.warn('Failed to create employee record:', error);
      }
    }

    // Get system role information
    const systemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_')
    );

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        isActive: newUser.isActive,
        isVerified: newUser.isVerified,
        role: {
          id: newUser.role.id,
          name: newUser.role.name,
          description: newUser.role.description,
          permissions: newUser.role.permissions
            ? JSON.parse(newUser.role.permissions as string)
            : [],
        },
        systemRole: systemRole || null,
        employee,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canUpdateUsers = userRole?.permissions.some(
      (p) => p.action === 'update' && p.resource === 'users'
    );

    if (!canUpdateUsers && (!userRole || userRole.level < 8)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      email,
      phone,
      username,
      displayName,
      roleId,
      isActive,
      password,
      employeeData,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent editing higher-level users unless super admin
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        targetUser.role?.name.toLowerCase().replace(/ /g, '_')
    );
    if (
      targetSystemRole &&
      userRole &&
      targetSystemRole.level >= userRole.level &&
      user.id !== targetUser.id &&
      userRole.level < 10
    ) {
      return NextResponse.json(
        { error: 'Cannot edit user with equal or higher permission level' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle role change
    if (roleId && roleId !== targetUser.roleId) {
      const newRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (!newRole) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
      }

      const newSystemRole = SYSTEM_ROLES.find(
        (sr) =>
          sr.name.toLowerCase().replace(/ /g, '_') === newRole.name.toLowerCase().replace(/ /g, '_')
      );
      if (newSystemRole && userRole && newSystemRole.level > userRole.level) {
        return NextResponse.json(
          { error: 'Cannot assign role with higher level than your own' },
          { status: 403 }
        );
      }

      updateData.roleId = roleId;
    }

    // Handle password change
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    // Update employee data if provided
    if (employeeData && updatedUser.employee) {
      await prisma.employee.update({
        where: { id: updatedUser.employee.id },
        data: employeeData,
      });
    }

    // Get system role information
    const systemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        updatedUser.role?.name.toLowerCase().replace(/ /g, '_')
    );

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified,
      role: {
        id: updatedUser.role?.id,
        name: updatedUser.role?.name,
        description: updatedUser.role?.description,
        permissions: updatedUser.role?.permissions
          ? JSON.parse(updatedUser.role.permissions as string)
          : [],
      },
      systemRole: systemRole || null,
      employee: updatedUser.employee,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user (or deactivate)
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find((role) => role.id === user.roleId);
    const canDeleteUsers = userRole?.permissions.some(
      (p) => p.action === 'delete' && p.resource === 'users'
    );

    if (!canDeleteUsers && (!userRole || userRole.level < 9)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete users' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hardDelete = searchParams.get('hardDelete') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting self
    if (targetUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Prevent deleting higher-level users
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        targetUser.role?.name.toLowerCase().replace(/ /g, '_')
    );
    if (targetSystemRole && userRole && targetSystemRole.level >= userRole.level) {
      return NextResponse.json(
        { error: 'Cannot delete user with equal or higher permission level' },
        { status: 403 }
      );
    }

    if (hardDelete) {
      // Hard delete - remove from database
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        message: 'User permanently deleted',
        userId,
      });
    } else {
      // Soft delete - deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: 'User deactivated',
        userId,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}

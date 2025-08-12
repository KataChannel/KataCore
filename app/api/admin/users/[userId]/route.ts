// API Route for Individual User Management
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

// GET - Get specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check permissions
    await checkAdminPermissions(request);

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user with role information
    const user = await prisma.users.findUnique({
      where: { id: userId },
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform user data
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

    const transformedUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLoginAt: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: user.roles?.id || 'unknown',
        name: user.roles?.name || 'No Role',
        description: user.roles?.description || '',
        level: roleLevel,
        permissions: rolePermissions,
      },
    };

    return NextResponse.json({
      success: true,
      user: transformedUser,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

// PUT - Update specific user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check permissions
    const currentUser = await checkAdminPermissions(request);
    
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      email,
      phone,
      username,
      displayName,
      roleId,
      isActive,
      password,
    } = body;

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current user's role for permission checks
    const currentUserRole = SYSTEM_ROLES.find((role) => role.id === currentUser.roleId);
    
    // Prevent editing higher-level users unless super admin
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        targetUser.roles?.name.toLowerCase().replace(/ /g, '_')
    );
    
    if (
      targetSystemRole &&
      currentUserRole &&
      targetSystemRole.level >= currentUserRole.level &&
      currentUser.id !== targetUser.id &&
      currentUserRole.level < 10
    ) {
      return NextResponse.json(
        { error: 'Cannot edit user with equal or higher permission level' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (email !== undefined) {
      // Validate email format
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      
      // Check for existing email
      if (email && email !== targetUser.email) {
        const existingUser = await prisma.users.findFirst({
          where: { email, id: { not: userId } }
        });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }
      }
      updateData.email = email;
    }

    if (phone !== undefined) {
      // Validate phone format
      if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone format' },
          { status: 400 }
        );
      }
      
      // Check for existing phone
      if (phone && phone !== targetUser.phone) {
        const existingUser = await prisma.users.findFirst({
          where: { phone, id: { not: userId } }
        });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Phone number already exists' },
            { status: 409 }
          );
        }
      }
      updateData.phone = phone;
    }

    if (username !== undefined) {
      // Check for existing username
      if (username && username !== targetUser.username) {
        const existingUser = await prisma.users.findFirst({
          where: { username, id: { not: userId } }
        });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Username already exists' },
            { status: 409 }
          );
        }
      }
      updateData.username = username;
    }

    if (displayName !== undefined) {
      if (!displayName || displayName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Display name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.displayName = displayName;
    }

    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle role change
    if (roleId && roleId !== targetUser.roleId) {
      const newRole = await prisma.roles.findUnique({ where: { id: roleId } });
      if (!newRole) {
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
      }

      const newSystemRole = SYSTEM_ROLES.find(
        (sr) =>
          sr.name.toLowerCase().replace(/ /g, '_') === newRole.name.toLowerCase().replace(/ /g, '_')
      );
      
      if (newSystemRole && currentUserRole && newSystemRole.level > currentUserRole.level) {
        return NextResponse.json(
          { error: 'Cannot assign role with higher level than your own' },
          { status: 403 }
        );
      }

      updateData.roleId = roleId;
    }

    // Handle password change
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
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
    const systemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        updatedUser.roles?.name.toLowerCase().replace(/ /g, '_')
    );

    // Transform user data
    let roleLevel = 1;
    let rolePermissions: string[] = [];

    try {
      if (updatedUser.roles && updatedUser.roles.permissions) {
        const permissionsData = JSON.parse(updatedUser.roles.permissions as string);
        roleLevel = permissionsData.level || 1;
        rolePermissions = Array.isArray(permissionsData.permissions) 
          ? permissionsData.permissions 
          : permissionsData;
      }
    } catch (error) {
      console.error('Error parsing role permissions:', error);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        isVerified: updatedUser.isVerified,
        role: {
          id: updatedUser.roles?.id,
          name: updatedUser.roles?.name,
          description: updatedUser.roles?.description,
          level: roleLevel,
          permissions: rolePermissions,
        },
        systemRole: systemRole || null,
        updatedAt: updatedUser.updatedAt,
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

// DELETE - Delete specific user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check permissions
    const currentUser = await checkAdminPermissions(request);

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hardDelete') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting self
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get current user's role for permission checks
    const currentUserRole = SYSTEM_ROLES.find((role) => role.id === currentUser.roleId);
    
    // Check if current user can delete users
    const canDeleteUsers = currentUserRole?.permissions.some(
      (p: any) => p.action === 'delete' && p.resource === 'users'
    );

    if (!canDeleteUsers && (!currentUserRole || currentUserRole.level < 9)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete users' },
        { status: 403 }
      );
    }

    // Prevent deleting higher-level users
    const targetSystemRole = SYSTEM_ROLES.find(
      (sr) =>
        sr.name.toLowerCase().replace(/ /g, '_') ===
        targetUser.roles?.name.toLowerCase().replace(/ /g, '_')
    );
    
    if (targetSystemRole && currentUserRole && targetSystemRole.level >= currentUserRole.level) {
      return NextResponse.json(
        { error: 'Cannot delete user with equal or higher permission level' },
        { status: 403 }
      );
    }

    if (hardDelete) {
      // Hard delete - remove from database
      await prisma.users.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        success: true,
        message: 'User permanently deleted',
        userId,
      });
    } else {
      // Soft delete - deactivate user
      await prisma.users.update({
        where: { id: userId },
        data: { 
          isActive: false,
          updatedAt: new Date()
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User deactivated',
        userId,
      });
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

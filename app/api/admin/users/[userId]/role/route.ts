import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';

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

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    if (!user.role) {
      throw new Error('User has no role assigned');
    }

    // Check if user has admin permissions or is super admin
    const isSuperAdmin = user.role.name === 'Super Administrator' || 
                        user.roleId === 'super_admin' ||
                        (user.role.level && user.role.level >= 10);
    
    // Check permissions from multiple sources
    let hasAdminPermission = false;
    
    // Check user-level permissions
    if (Array.isArray(user.permissions)) {
      hasAdminPermission = user.permissions.some(p => 
        p === 'admin:system' || 
        p === 'manage:users' || 
        p === 'admin:*' ||
        p === 'manage:*'
      );
    }
    
    // Check role-level permissions
    if (!hasAdminPermission && user.role.permissions) {
      try {
        let rolePermissions = [];
        if (Array.isArray(user.role.permissions)) {
          rolePermissions = user.role.permissions;
        } else if (typeof user.role.permissions === 'string') {
          rolePermissions = JSON.parse(user.role.permissions);
        }
        
        hasAdminPermission = rolePermissions.some((p: any) => {
          if (typeof p === 'string') {
            return p === 'admin:system' || p === 'manage:users' || p === 'admin:*' || p === 'manage:*';
          } else if (typeof p === 'object' && p.action && p.resource) {
            return (p.action === 'admin' && p.resource === 'system') ||
                   (p.action === 'manage' && p.resource === 'users') ||
                   (p.action === 'admin' && p.resource === '*') ||
                   (p.action === 'manage' && p.resource === '*');
          }
          return false;
        });
      } catch (parseError) {
        console.error('Error parsing role permissions:', parseError);
      }
    }

    if (!isSuperAdmin && !hasAdminPermission) {
      throw new Error('Insufficient permissions to manage user roles');
    }

    return user;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// PUT - Update user role
export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Check permissions
    const currentUser = await checkAdminPermissions(request);
    const { userId } = params;

    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
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

    // Check if new role exists
    const newRole = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!newRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent non-super admins from granting super admin role
    if (newRole.name === 'Super Administrator' && currentUser.role?.name !== 'Super Administrator') {
      return NextResponse.json(
        { error: 'Only Super Administrators can grant Super Administrator role' },
        { status: 403 }
      );
    }

    // Prevent users from changing their own role (except super admins)
    if (userId === currentUser.id && currentUser.role?.name !== 'Super Administrator') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    // Update user role
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { roleId },
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

    // Parse role level for response
    let roleLevel = 1;
    try {
      if (updatedUser.roles && updatedUser.roles.permissions) {
        const permissionsData = JSON.parse(updatedUser.roles.permissions as string);
        roleLevel = permissionsData.level || 1;
      }
    } catch (error) {
      console.error('Error parsing role permissions:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        roles: {
          id: updatedUser.roles?.id || 'unknown',
          name: updatedUser.roles?.name || 'No Role',
          level: roleLevel,
        },
      },
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

// DELETE - Deactivate user
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Check permissions
    const currentUser = await checkAdminPermissions(request);
    const { userId } = params;

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

    // Prevent users from deactivating themselves
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 403 }
      );
    }

    // Prevent non-super admins from deactivating super admins
    if (targetUser.roles?.name === 'Super Administrator' && currentUser.role?.name !== 'Super Administrator') {
      return NextResponse.json(
        { error: 'Only Super Administrators can deactivate other Super Administrators' },
        { status: 403 }
      );
    }

    // Deactivate user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { isActive: false },
      include: { roles: true },
    });

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate user' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

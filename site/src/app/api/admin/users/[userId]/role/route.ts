import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth/unified-auth.service';

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
    const isSuperAdmin = user.role.name === 'Super Administrator' || user.role.level >= 10;
    const hasAdminPermission = user.permissions?.includes('admin:system') || 
                              user.permissions?.includes('manage:users');

    if (!isSuperAdmin && !hasAdminPermission) {
      throw new Error('Insufficient permissions');
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
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if new role exists
    const newRole = await prisma.role.findUnique({
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
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
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

    // Parse role level for response
    let roleLevel = 1;
    try {
      if (updatedUser.role && updatedUser.role.permissions) {
        const permissionsData = JSON.parse(updatedUser.role.permissions as string);
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
        role: {
          id: updatedUser.role?.id || 'unknown',
          name: updatedUser.role?.name || 'No Role',
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
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
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
    if (targetUser.role?.name === 'Super Administrator' && currentUser.role?.name !== 'Super Administrator') {
      return NextResponse.json(
        { error: 'Only Super Administrators can deactivate other Super Administrators' },
        { status: 403 }
      );
    }

    // Deactivate user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      include: { role: true },
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

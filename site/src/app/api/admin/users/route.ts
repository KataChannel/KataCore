// API Route for User Management with Module Permissions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import authService from '@/lib/auth/authService';
import { SYSTEM_ROLES } from '@/lib/auth/modules-permissions';
import bcrypt from 'bcryptjs';

// Middleware to check authentication
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Token not found');
  }

  const decoded = authService.verifyToken(token);
  const user = await authService.getUserById(decoded.userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

// GET - List all users with their roles and permissions
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions - need to be admin or have user management permission
    const userRole = SYSTEM_ROLES.find(role => role.id === user.roleId);
    const canManageUsers = userRole?.permissions.some(
      p => (p.action === 'read' && p.resource === 'users') || 
          (p.action === 'manage' && p.resource === 'users')
    );

    if (!canManageUsers && userRole?.level < 8) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view users' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';
    const moduleFilter = searchParams.get('module') || '';

    const skip = (page - 1) * limit;

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

    // Get users with their roles
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
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
              position: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Enhance users with system role information
    const enhancedUsers = users.map(user => {
      const systemRole = SYSTEM_ROLES.find(role => role.id === user.role?.name?.toLowerCase().replace(/ /g, '_'));
      
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        role: {
          id: user.role?.id,
          name: user.role?.name,
          description: user.role?.description,
          permissions: user.role?.permissions ? JSON.parse(user.role.permissions as string) : [],
        },
        systemRole: systemRole ? {
          id: systemRole.id,
          name: systemRole.name,
          description: systemRole.description,
          level: systemRole.level,
          modules: systemRole.modules,
          permissions: systemRole.permissions,
        } : null,
        employee: user.employee ? {
          id: user.employee.id,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          department: user.employee.department,
          position: user.employee.position,
        } : null,
      };
    });

    // Filter by module access if specified
    const filteredUsers = moduleFilter 
      ? enhancedUsers.filter(user => 
          user.systemRole?.modules.includes(moduleFilter)
        )
      : enhancedUsers;

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user with role assignment
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find(role => role.id === user.roleId);
    const canCreateUsers = userRole?.permissions.some(
      p => p.action === 'create' && p.resource === 'users'
    );

    if (!canCreateUsers && userRole?.level < 8) {
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
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if role is appropriate for current user's level
    const targetSystemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_'));
    if (targetSystemRole && userRole && targetSystemRole.level > userRole.level) {
      return NextResponse.json(
        { error: 'Cannot assign role with higher level than your own' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          username ? { username } : {},
        ],
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
    const systemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === role.name.toLowerCase().replace(/ /g, '_'));

    return NextResponse.json({
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
        permissions: newUser.role.permissions ? JSON.parse(newUser.role.permissions as string) : [],
      },
      systemRole: systemRole || null,
      employee,
      createdAt: newUser.createdAt,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find(role => role.id === user.roleId);
    const canUpdateUsers = userRole?.permissions.some(
      p => p.action === 'update' && p.resource === 'users'
    );

    if (!canUpdateUsers && userRole?.level < 8) {
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
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Prevent editing higher-level users unless super admin
    const targetSystemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === targetUser.role?.name.toLowerCase().replace(/ /g, '_'));
    if (targetSystemRole && userRole && targetSystemRole.level >= userRole.level && user.id !== targetUser.id && userRole.level < 10) {
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
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
      }

      const newSystemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === newRole.name.toLowerCase().replace(/ /g, '_'));
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
    const systemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === updatedUser.role?.name.toLowerCase().replace(/ /g, '_'));

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
        permissions: updatedUser.role?.permissions ? JSON.parse(updatedUser.role.permissions as string) : [],
      },
      systemRole: systemRole || null,
      employee: updatedUser.employee,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (or deactivate)
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticate(request);

    // Check permissions
    const userRole = SYSTEM_ROLES.find(role => role.id === user.roleId);
    const canDeleteUsers = userRole?.permissions.some(
      p => p.action === 'delete' && p.resource === 'users'
    );

    if (!canDeleteUsers && userRole?.level < 9) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete users' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hardDelete = searchParams.get('hardDelete') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Prevent deleting self
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Prevent deleting higher-level users
    const targetSystemRole = SYSTEM_ROLES.find(sr => sr.name.toLowerCase().replace(/ /g, '_') === targetUser.role?.name.toLowerCase().replace(/ /g, '_'));
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
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

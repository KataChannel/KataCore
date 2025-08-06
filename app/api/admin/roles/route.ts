// Enhanced Roles API Route with Authentication and Permissions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all roles with their permissions
export async function GET(request: NextRequest) {
  try {
    console.log('Roles API GET called');
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get database roles
    const [dbRoles, total] = await Promise.all([
      prisma.roles.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.roles.count({ where }),
    ]);

    // Transform roles for response
    const roles = dbRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions ? JSON.parse(role.permissions as string) : [],
      userCount: role._count.users,
      level: role.level || 1,
      modules: role.modules ? JSON.parse(role.modules as string) : [],
      isSystemRole: role.isSystemRole || false,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      roles: roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Roles API error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to fetch roles',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, level, modules } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json({
        success: false,
        error: 'Name and description are required'
      }, { status: 400 });
    }

    // Create new role
    const newRole = await prisma.roles.create({
      data: {
        name,
        description,
        permissions: JSON.stringify(permissions || []),
        level: level || 1,
        modules: JSON.stringify(modules || []),
        isSystemRole: false,
        updatedAt: new Date(), // Add explicit updatedAt
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        permissions: JSON.parse(newRole.permissions as string),
        level: newRole.level,
        modules: JSON.parse(newRole.modules as string),
        isSystemRole: newRole.isSystemRole,
        createdAt: newRole.createdAt,
        updatedAt: newRole.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Create role error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create role'
    }, { status: 500 });
  }
}

// PUT - Update existing role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, permissions, level, modules } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Role ID is required'
      }, { status: 400 });
    }

    // Update role
    const updatedRole = await prisma.roles.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(permissions && { permissions: JSON.stringify(permissions) }),
        ...(level !== undefined && { level }),
        ...(modules && { modules: JSON.stringify(modules) }),
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: JSON.parse(updatedRole.permissions as string),
        level: updatedRole.level,
        modules: JSON.parse(updatedRole.modules as string),
        isSystemRole: updatedRole.isSystemRole,
        createdAt: updatedRole.createdAt,
        updatedAt: updatedRole.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Update role error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update role'
    }, { status: 500 });
  }
}

// DELETE - Delete role
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Role ID is required'
      }, { status: 400 });
    }

    // Check if role has users
    const roleWithUsers = await prisma.roles.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!roleWithUsers) {
      return NextResponse.json({
        success: false,
        error: 'Role not found'
      }, { status: 404 });
    }

    if (roleWithUsers._count.users > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete role. ${roleWithUsers._count.users} users are assigned to this role.`
      }, { status: 400 });
    }

    // Delete role
    await prisma.roles.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete role error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete role'
    }, { status: 500 });
  }
}

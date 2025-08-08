// Simple Roles API Route - Basic CRUD Operations
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  level: z.number().int().min(1).max(10).default(1),
  modules: z.array(z.string()).default([]),
});

const UpdateRoleSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  level: z.number().int().min(1).max(10).optional(),
  modules: z.array(z.string()).optional(),
});

// Types for better type safety
interface RoleCreateInput {
  name: string;
  description?: string;
  permissions?: string[];
  level?: number;
  modules?: string[];
}

interface RoleUpdateInput {
  id: string;
  name?: string;
  description?: string;
  permissions?: string[];
  level?: number;
  modules?: string[];
}

// GET - List all roles (simplified)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SIMPLE ROLES] Fetching roles...');
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
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

    // Get roles from database
    const [roles, total] = await Promise.all([
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

    // Transform roles for simple response
    const transformedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      level: role.level || 1,
      userCount: role._count.users,
      permissions: role.permissions ? JSON.parse(role.permissions as string) : [],
      modules: role.modules ? JSON.parse(role.modules as string) : [],
      isSystemRole: role.isSystemRole || false,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    console.log(`✅ [SIMPLE ROLES] Found ${roles.length} roles`);

    return NextResponse.json({
      success: true,
      data: {
        roles: transformedRoles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: `Retrieved ${roles.length} roles successfully`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('❌ [SIMPLE ROLES] GET Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to fetch roles',
      data: null,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// POST - Create new role (simplified)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [SIMPLE ROLES] Creating new role...');
    
    const body = await request.json();
    
    // Validate using Zod schema
    const validation = CreateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
        data: null,
      }, { status: 400 });
    }

    const { name, description, permissions, level, modules } = validation.data;

    // Check if role already exists
    const existingRole = await prisma.roles.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingRole) {
      return NextResponse.json({
        success: false,
        error: `Role with name '${name}' already exists`,
        data: null,
      }, { status: 409 });
    }

    // Create new role
    const newRole = await prisma.roles.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        permissions: JSON.stringify(permissions),
        level: level,
        modules: JSON.stringify(modules),
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ [SIMPLE ROLES] Created role: ${newRole.name}`);

    return NextResponse.json({
      success: true,
      data: {
        role: {
          id: newRole.id,
          name: newRole.name,
          description: newRole.description,
          level: newRole.level,
          permissions: JSON.parse(newRole.permissions as string),
          modules: JSON.parse(newRole.modules as string),
          isSystemRole: newRole.isSystemRole,
          createdAt: newRole.createdAt,
          updatedAt: newRole.updatedAt,
        },
      },
      message: `Role '${newRole.name}' created successfully`,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ [SIMPLE ROLES] POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create role',
      data: null,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// PUT - Update existing role (simplified)
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ [SIMPLE ROLES] Updating role...');
    
    const body = await request.json();
    
    // Validate using Zod schema
    const validation = UpdateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
        data: null,
      }, { status: 400 });
    }

    const { id, name, description, permissions, level, modules } = validation.data;

    // Check if role exists
    const existingRole = await prisma.roles.findUnique({
      where: { id: id },
    });

    if (!existingRole) {
      return NextResponse.json({
        success: false,
        error: 'Role not found',
        data: null,
      }, { status: 404 });
    }

    // Check if updating name and it conflicts with existing role
    if (name && name !== existingRole.name) {
      const conflictingRole = await prisma.roles.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        },
      });

      if (conflictingRole) {
        return NextResponse.json({
          success: false,
          error: `Role with name '${name}' already exists`,
          data: null,
        }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);
    if (level !== undefined) updateData.level = level;
    if (modules !== undefined) updateData.modules = JSON.stringify(modules);

    // Update role
    const updatedRole = await prisma.roles.update({
      where: { id: id },
      data: updateData,
    });

    console.log(`✅ [SIMPLE ROLES] Updated role: ${updatedRole.name}`);

    return NextResponse.json({
      success: true,
      data: {
        role: {
          id: updatedRole.id,
          name: updatedRole.name,
          description: updatedRole.description,
          level: updatedRole.level,
          permissions: JSON.parse(updatedRole.permissions as string),
          modules: JSON.parse(updatedRole.modules as string),
          isSystemRole: updatedRole.isSystemRole,
          createdAt: updatedRole.createdAt,
          updatedAt: updatedRole.updatedAt,
        },
      },
      message: `Role '${updatedRole.name}' updated successfully`,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ [SIMPLE ROLES] PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update role',
      data: null,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// DELETE - Delete role (simplified)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ [SIMPLE ROLES] Deleting role...');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Role ID is required',
        data: null,
      }, { status: 400 });
    }

    // Check if role exists
    const existingRole = await prisma.roles.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json({
        success: false,
        error: 'Role not found',
        data: null,
      }, { status: 404 });
    }

    // Check if role is a system role
    if (existingRole.isSystemRole) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete system roles',
        data: null,
      }, { status: 403 });
    }

    // Check if role has users assigned
    if (existingRole._count.users > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete role. ${existingRole._count.users} user(s) are assigned to this role`,
        data: null,
      }, { status: 409 });
    }

    // Delete role
    await prisma.roles.delete({
      where: { id: id },
    });

    console.log(`✅ [SIMPLE ROLES] Deleted role: ${existingRole.name}`);

    return NextResponse.json({
      success: true,
      data: {
        deletedRole: {
          id: existingRole.id,
          name: existingRole.name,
        },
      },
      message: `Role '${existingRole.name}' deleted successfully`,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ [SIMPLE ROLES] DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete role',
      data: null,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthMiddleware, withAuth } from '@/lib/auth/auth-middleware';

// ============================================================================
// ROUTE HANDLERS WITH ENHANCED MIDDLEWARE
// ============================================================================

// GET - List all departments with enhanced permission checking
async function handleGET(request: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          _count: {
            select: {
              employees: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.department.count({ where }),
    ]);

    return NextResponse.json({
      data: departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new department with enhanced validation
async function handlePOST(request: NextRequest, user: any) {
  try {
    const body = await request.json();
    const { name, code, description, managerId } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Required fields: name, code' },
        { status: 400 }
      );
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department already exists with this name or code' },
        { status: 400 }
      );
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        managerId,
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    // Log the action
    AuthMiddleware.logAuthEvent('department_created', user.id, request, {
      departmentId: department.id,
      departmentName: name,
    });

    return NextResponse.json({ data: department }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// EXPORT PROTECTED ROUTES
// ============================================================================
export const GET = withAuth(handleGET, {
  requiredPermission: 'read:departments',
  rateLimit: 'general',
});

export const POST = withAuth(handlePOST, {
  requiredPermission: 'create:departments',
  requireManager: true,
  rateLimit: 'general',
});

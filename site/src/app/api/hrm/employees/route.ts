import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthMiddleware, withAuth } from '@/lib/auth/auth-middleware';
import { authService } from '@/lib/auth/unified-auth.service';

// ============================================================================
// ROUTE HANDLERS WITH ENHANCED MIDDLEWARE
// ============================================================================

// GET - List all employees with enhanced permission checking
async function handleGET(request: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { displayName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = { id: department };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              phone: true,
              avatar: true,
              isActive: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new employee with enhanced validation
async function handlePOST(request: NextRequest, user: any) {
  try {
    const body = await request.json();
    const { userId, employeeId, position, departmentId, salary, startDate, status } = body;

    // Validate required fields
    if (!userId || !employeeId || !position || !departmentId) {
      return NextResponse.json(
        { error: 'Required fields: userId, employeeId, position, departmentId' },
        { status: 400 }
      );
    }

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ userId }, { employeeId }],
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee already exists with this user or employee ID' },
        { status: 400 }
      );
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId,
        employeeId,
        position,
        departmentId,
        salary: salary ? parseFloat(salary) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: status || 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            avatar: true,
            isActive: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log the action
    AuthMiddleware.logAuthEvent('employee_created', user.id, request, {
      employeeId: employee.id,
      targetUserId: userId,
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// EXPORT PROTECTED ROUTES
// ============================================================================
export const GET = withAuth(handleGET, {
  requiredPermission: 'read:employees',
  rateLimit: 'general',
});

export const POST = withAuth(handlePOST, {
  requiredPermission: 'create:employees',
  requireManager: true,
  rateLimit: 'general',
});

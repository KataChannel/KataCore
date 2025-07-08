import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';
import authService from '../../../../lib/auth/authService';

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

// GET - List all departments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    // Check permissions
    if (!user.role.permissions.includes('READ_DEPARTMENTS')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

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
          manager: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          employees: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
          _count: {
            select: {
              employees: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({ where }),
    ]);

    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    // Check permissions
    if (!user.role.permissions.includes('CREATE_DEPARTMENTS')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      code,
      description,
      managerId,
      parentId,
      budget,
      location,
      phone,
      email,
    } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if department code already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code },
        ],
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department name or code already exists' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        managerId,
        parentId,
        budget: budget ? parseFloat(budget) : null,
        location,
        phone,
        email,
      },
      include: {
        manager: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create department' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';
import authService from '@/lib/auth/authService';

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

// GET - List all employees
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    // Check permissions
    if (!user.role.permissions.includes('READ_EMPLOYEES')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (department) {
      where.departmentId = department;
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
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
              code: true,
            },
          },
          position: {
            select: {
              id: true,
              title: true,
              level: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    // Check permissions
    if (!user.role.permissions.includes('CREATE_EMPLOYEES')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      departmentId,
      positionId,
      hireDate,
      salary,
      contractType,
      status,
      dateOfBirth,
      gender,
      nationality,
      idNumber,
      address,
      emergencyContact,
      notes,
    } = body;

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !email || !departmentId || !positionId) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    // Create user account first
    const newUser = await authService.register({
      email,
      phone,
      displayName: `${firstName} ${lastName}`,
      provider: 'email',
    });

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        userId: newUser.id,
        departmentId,
        positionId,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
        contractType: contractType || 'FULL_TIME',
        status: status || 'ACTIVE',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        nationality,
        idNumber,
        address,
        emergencyContact,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
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
            code: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}

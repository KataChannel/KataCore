import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hr/employees - Lấy danh sách nhân viên
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const departmentId = searchParams.get('departmentId') || 'all';

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (departmentId && departmentId !== 'all') {
      where.position = {
        departmentId: departmentId,
      };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              email: true,
              phone: true,
            },
          },
          position: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
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
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách nhân viên' },
      { status: 500 }
    );
  }
}

// POST /api/hr/employees - Tạo nhân viên mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      positionId,
      salary,
      hireDate,
      contractType,
      userId,
    } = body;

    // Validate required fields
    if (!employeeId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if employeeId already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Mã nhân viên đã tồn tại' },
        { status: 409 }
      );
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        positionId,
        salary: salary ? parseFloat(salary) : null,
        hireDate: hireDate ? new Date(hireDate) : null,
        contractType: contractType || 'FULL_TIME',
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            email: true,
            phone: true,
          },
        },
        position: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Tạo nhân viên thành công',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo nhân viên mới' },
      { status: 500 }
    );
  }
}

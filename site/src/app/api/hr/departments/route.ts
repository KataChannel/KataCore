import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';

// GET /api/hr/departments - Lấy danh sách phòng ban
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        _count: {
          select: {
            employees: true,
            positions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.department.count({ where });

    return NextResponse.json({
      data: departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách phòng ban' },
      { status: 500 }
    );
  }
}

// POST /api/hr/departments - Tạo phòng ban mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      code,
      budget,
      location,
      phone,
      email,
      isActive = true,
      managerId,
      parentId
    } = body;

    // Kiểm tra tên và mã phòng ban đã tồn tại
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Tên hoặc mã phòng ban đã tồn tại' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        code,
        budget,
        location,
        phone,
        email,
        isActive,
        ...(managerId && { managerId }),
        ...(parentId && { parentId })
      },
      include: {
        manager: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            employees: true,
            positions: true
          }
        }
      }
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Không thể tạo phòng ban mới' },
      { status: 500 }
    );
  }
}

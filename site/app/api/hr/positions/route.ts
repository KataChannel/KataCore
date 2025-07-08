import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';

// GET /api/hr/positions - Lấy danh sách chức vụ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }
    
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    const positions = await prisma.position.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: [
        { department: { name: 'asc' } },
        { level: 'desc' },
        { title: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.position.count({ where });

    return NextResponse.json({
      data: positions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách chức vụ' },
      { status: 500 }
    );
  }
}

// POST /api/hr/positions - Tạo chức vụ mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      level,
      minSalary,
      maxSalary,
      requirements,
      isActive = true,
      departmentId
    } = body;

    // Kiểm tra chức vụ đã tồn tại trong phòng ban
    const existingPosition = await prisma.position.findFirst({
      where: {
        title,
        departmentId
      }
    });

    if (existingPosition) {
      return NextResponse.json(
        { error: 'Chức vụ đã tồn tại trong phòng ban này' },
        { status: 400 }
      );
    }

    const position = await prisma.position.create({
      data: {
        title,
        description,
        level,
        minSalary,
        maxSalary,
        requirements,
        isActive,
        departmentId
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { error: 'Không thể tạo chức vụ mới' },
      { status: 500 }
    );
  }
}

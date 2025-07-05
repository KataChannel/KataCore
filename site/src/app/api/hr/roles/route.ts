import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

// GET /api/hr/roles - Lấy danh sách vai trò
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.role.count();

    return NextResponse.json({
      data: roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách vai trò' },
      { status: 500 }
    );
  }
}

// POST /api/hr/roles - Tạo vai trò mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    // Kiểm tra vai trò đã tồn tại
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Vai trò đã tồn tại' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Không thể tạo vai trò mới' },
      { status: 500 }
    );
  }
}

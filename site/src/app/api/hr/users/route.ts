import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma';

// GET /api/hr/users - Lấy danh sách người dùng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      isActive: true
    };
    
    if (role && role !== 'all') {
      where.role = {
        name: role
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        avatar: true,
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        displayName: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách người dùng' },
      { status: 500 }
    );
  }
}

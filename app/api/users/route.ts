// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    const where = search ? {
      OR: [
        { displayName: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
        { username: { contains: search, mode: 'insensitive' as any } },
      ]
    } : {};

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Loại bỏ password khỏi response
        select: {
          id: true,
          email: true,
          username: true,
          phone: true,
          displayName: true,
          avatar: true,
          bio: true,
          status: true,
          isVerified: true,
          isActive: true,
          lastSeen: true,
          createdAt: true,
          updatedAt: true,
          googleId: true,
          facebookId: true,
          appleId: true,
          roleId: true,
          roles: true,
          user_settings: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy dữ liệu users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Tạo mới user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Loại bỏ các field không cho phép create trực tiếp
    const { id, createdAt, updatedAt, ...createData } = body;
    
    const newUser = await prisma.users.create({
      data: createData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        displayName: true,
        avatar: true,
        bio: true,
        status: true,
        isVerified: true,
        isActive: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        roles: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo user' },
      { status: 500 }
    );
  }
}

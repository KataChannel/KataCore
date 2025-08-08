import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const allMenuItems = await prisma.menu_items.findMany({
      orderBy: [
        { parentId: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    return NextResponse.json(allMenuItems);

  } catch (error) {
    console.error('Error fetching all menu items:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

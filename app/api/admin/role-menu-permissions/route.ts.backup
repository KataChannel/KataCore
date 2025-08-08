import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy permissions của role cho các menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId là bắt buộc' },
        { status: 400 }
      );
    }

    const roleMenuItems = await prisma.role_menu_items.findMany({
      where: { roleId },
      include: {
        menuItem: {
          include: {
            parent: true,
            children: true,
          },
        },
        role: true,
      },
      orderBy: {
        menuItem: {
          sortOrder: 'asc',
        },
      },
    });

    return NextResponse.json(roleMenuItems);

  } catch (error) {
    console.error('Error fetching role menu permissions:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// POST - Tạo hoặc cập nhật permission của role cho menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId, menuItemId, canView, canAccess } = body;

    if (!roleId || !menuItemId) {
      return NextResponse.json(
        { error: 'roleId và menuItemId là bắt buộc' },
        { status: 400 }
      );
    }

    const roleMenuItem = await prisma.role_menu_items.upsert({
      where: {
        roleId_menuItemId: {
          roleId,
          menuItemId,
        },
      },
      update: {
        canView: canView ?? true,
        canAccess: canAccess ?? true,
      },
      create: {
        roleId,
        menuItemId,
        canView: canView ?? true,
        canAccess: canAccess ?? true,
      },
    });

    return NextResponse.json(roleMenuItem);

  } catch (error) {
    console.error('Error creating/updating role menu permission:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật hàng loạt permissions cho một role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId, permissions } = body;

    if (!roleId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'roleId và permissions array là bắt buộc' },
        { status: 400 }
      );
    }

    // Xóa tất cả permissions hiện tại của role
    await prisma.role_menu_items.deleteMany({
      where: { roleId },
    });

    // Tạo permissions mới
    const newPermissions = await prisma.role_menu_items.createMany({
      data: permissions.map((perm: any) => ({
        roleId,
        menuItemId: perm.menuItemId,
        canView: perm.canView ?? true,
        canAccess: perm.canAccess ?? true,
      })),
    });

    return NextResponse.json(newPermissions);

  } catch (error) {
    console.error('Error bulk updating role menu permissions:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa permission cụ thể
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const menuItemId = searchParams.get('menuItemId');

    if (!roleId || !menuItemId) {
      return NextResponse.json(
        { error: 'roleId và menuItemId là bắt buộc' },
        { status: 400 }
      );
    }

    await prisma.role_menu_items.delete({
      where: {
        roleId_menuItemId: {
          roleId,
          menuItemId,
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting role menu permission:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

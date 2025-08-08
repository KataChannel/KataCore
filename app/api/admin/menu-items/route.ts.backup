import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy danh sách menu items dựa trên role của user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    if (!userId && !roleId) {
      return NextResponse.json(
        { error: 'userId hoặc roleId là bắt buộc' },
        { status: 400 }
      );
    }

    let userRoleId = roleId;

    // Nếu có userId, lấy roleId từ user
    if (userId && !roleId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Không tìm thấy user' },
          { status: 404 }
        );
      }

      userRoleId = user.roleId;
    }

    // Lấy menu items mà role được phép truy cập
    const roleMenuItems = await prisma.role_menu_items.findMany({
      where: {
        roleId: userRoleId!,
        canView: true,
      },
      include: {
        menuItem: {
          include: {
            children: {
              include: {
                role_menu_items: {
                  where: {
                    roleId: userRoleId!,
                    canView: true,
                  },
                },
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: {
        menuItem: {
          sortOrder: 'asc',
        },
      },
    });

    // Chỉ lấy parent menu items (không có parentId)
    const parentMenuItems = roleMenuItems
      .filter(rm => !rm.menuItem.parentId)
      .map(rm => {
        const menuItem = rm.menuItem;
        
        // Filter children dựa trên permissions
        const accessibleChildren = menuItem.children.filter(child => 
          child.role_menu_items.length > 0
        );

        return {
          id: menuItem.id,
          title: menuItem.title,
          titleVi: menuItem.titleVi,
          path: menuItem.path,
          icon: menuItem.icon,
          permission: menuItem.permission,
          sortOrder: menuItem.sortOrder,
          isActive: menuItem.isActive,
          canAccess: rm.canAccess,
          children: accessibleChildren.map(child => ({
            id: child.id,
            title: child.title,
            titleVi: child.titleVi,
            path: child.path,
            icon: child.icon,
            permission: child.permission,
            sortOrder: child.sortOrder,
            isActive: child.isActive,
            canAccess: child.role_menu_items[0]?.canAccess || false,
          })),
        };
      });

    return NextResponse.json(parentMenuItems);

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// POST - Tạo menu item mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      titleVi,
      path,
      icon,
      permission,
      parentId,
      sortOrder = 0,
      isActive = true,
    } = body;

    if (!title || !path || !icon) {
      return NextResponse.json(
        { error: 'title, path và icon là bắt buộc' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menu_items.create({
      data: {
        title,
        titleVi,
        path,
        icon,
        permission,
        parentId,
        sortOrder,
        isActive,
      },
    });

    return NextResponse.json(menuItem);

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật menu item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id là bắt buộc' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menu_items.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(menuItem);

  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id là bắt buộc' },
        { status: 400 }
      );
    }

    // Xóa role_menu_items trước
    await prisma.role_menu_items.deleteMany({
      where: { menuItemId: id },
    });

    // Xóa menu item
    await prisma.menu_items.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

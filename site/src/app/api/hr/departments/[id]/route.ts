import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma';

// GET /api/hr/departments/[id] - Lấy thông tin chi tiết phòng ban
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const department = await prisma.department.findUnique({
      where: { id },
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
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            position: {
              select: {
                title: true
              }
            }
          }
        },
        positions: {
          select: {
            id: true,
            title: true,
            level: true,
            _count: {
              select: {
                employees: true
              }
            }
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

    if (!department) {
      return NextResponse.json(
        { error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Không thể tải thông tin phòng ban' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/departments/[id] - Cập nhật phòng ban
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      code,
      budget,
      location,
      phone,
      email,
      isActive,
      managerId,
      parentId
    } = body;

    // Kiểm tra phòng ban tồn tại
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      );
    }

    // Kiểm tra trùng tên/mã với phòng ban khác
    const duplicateDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ],
        NOT: { id }
      }
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        { error: 'Tên hoặc mã phòng ban đã tồn tại' },
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
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

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật phòng ban' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/departments/[id] - Xóa phòng ban
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kiểm tra phòng ban tồn tại
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: true,
        positions: true,
        children: true
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      );
    }

    // Kiểm tra có nhân viên hay không
    if (department.employees.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng ban còn nhân viên' },
        { status: 400 }
      );
    }

    // Kiểm tra có chức vụ hay không
    if (department.positions.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng ban còn chức vụ' },
        { status: 400 }
      );
    }

    // Kiểm tra có phòng ban con hay không
    if (department.children.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng ban còn phòng ban con' },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Xóa phòng ban thành công' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Không thể xóa phòng ban' },
      { status: 500 }
    );
  }
}

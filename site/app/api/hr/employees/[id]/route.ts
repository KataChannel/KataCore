import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma';

// GET /api/hr/employees/[id] - Lấy thông tin nhân viên
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            displayName: true,
            avatar: true,
            email: true,
            phone: true
          }
        },
        position: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Nhân viên không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin nhân viên' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/employees/[id] - Cập nhật nhân viên
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      fullName, 
      email, 
      phone, 
      positionId, 
      salary, 
      hireDate, 
      status, 
      contractType 
    } = body;

    // Kiểm tra nhân viên có tồn tại không
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Nhân viên không tồn tại' },
        { status: 404 }
      );
    }

    // Cập nhật thông tin user nếu có
    if (existingEmployee.userId && (email || phone)) {
      await prisma.user.update({
        where: { id: existingEmployee.userId },
        data: {
          ...(email && { email }),
          ...(phone && { phone }),
          displayName: fullName || `${firstName} ${lastName}`
        }
      });
    }

    // Cập nhật thông tin nhân viên
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(positionId && { positionId }),
        ...(salary && { salary: parseFloat(salary) }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(status && { status }),
        ...(contractType && { contractType })
      },
      include: {
        user: {
          select: {
            displayName: true,
            avatar: true,
            email: true,
            phone: true
          }
        },
        position: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployee
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật nhân viên' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/employees/[id] - Xóa nhân viên
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kiểm tra nhân viên có tồn tại không
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Nhân viên không tồn tại' },
        { status: 404 }
      );
    }

    // Xóa nhân viên và user liên quan (nếu có)
    await prisma.$transaction(async (tx: any) => {
      await tx.employee.delete({
        where: { id }
      });

      if (existingEmployee.userId) {
        await tx.user.delete({
          where: { id: existingEmployee.userId }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa nhân viên thành công'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa nhân viên' },
      { status: 500 }
    );
  }
}

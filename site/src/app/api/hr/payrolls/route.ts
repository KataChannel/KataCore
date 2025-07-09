import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma';

// GET /api/hr/payrolls - Lấy danh sách bảng lương
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
    }
    
    if (period) {
      where.period = period;
    }

    // Filter by payment status
    if (status === 'paid') {
      where.paidAt = { not: null };
    } else if (status === 'unpaid') {
      where.paidAt = null;
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatar: true
                }
              },
              position: {
                include: {
                  department: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { period: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.payroll.count({ where })
    ]);

    // Transform data for frontend
    const transformedPayrolls = payrolls.map((payroll: any) => ({
      id: payroll.id,
      period: payroll.period,
      basicSalary: payroll.basicSalary,
      overtime: payroll.overtime,
      bonus: payroll.bonus,
      deductions: payroll.deductions,
      netSalary: payroll.netSalary,
      paidAt: payroll.paidAt?.toISOString(),
      notes: payroll.notes,
      status: payroll.paidAt ? 'PAID' : 'UNPAID',
      employee: {
        id: payroll.employee.id,
        fullName: payroll.employee.fullName,
        employeeId: payroll.employee.employeeId,
        position: {
          title: payroll.employee.position.title,
          department: {
            name: payroll.employee.position.department.name
          }
        },
        user: payroll.employee.user
      },
      createdAt: payroll.createdAt.toISOString(),
      updatedAt: payroll.updatedAt.toISOString()
    }));

    // Calculate summary statistics
    const summary = await prisma.payroll.aggregate({
      where,
      _sum: {
        basicSalary: true,
        overtime: true,
        bonus: true,
        deductions: true,
        netSalary: true
      },
      _count: {
        id: true
      }
    });

    const paidCount = await prisma.payroll.count({
      where: { ...where, paidAt: { not: null } }
    });

    return NextResponse.json({
      success: true,
      data: transformedPayrolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalRecords: summary._count.id,
        totalBasicSalary: summary._sum.basicSalary || 0,
        totalOvertime: summary._sum.overtime || 0,
        totalBonus: summary._sum.bonus || 0,
        totalDeductions: summary._sum.deductions || 0,
        totalNetSalary: summary._sum.netSalary || 0,
        paidRecords: paidCount,
        unpaidRecords: (summary._count.id || 0) - paidCount
      }
    });

  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách bảng lương' },
      { status: 500 }
    );
  }
}

// POST /api/hr/payrolls - Tạo bảng lương
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, period, basicSalary, overtime, bonus, deductions, notes } = body;

    if (!employeeId || !period || !basicSalary) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra employee có tồn tại không
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Nhân viên không tồn tại' },
        { status: 404 }
      );
    }

    // Kiểm tra đã có bảng lương cho kỳ này chưa
    const existingPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_period: {
          employeeId,
          period
        }
      }
    });

    if (existingPayroll) {
      return NextResponse.json(
        { success: false, error: 'Đã có bảng lương cho kỳ này' },
        { status: 409 }
      );
    }

    // Tính toán lương thực nhận
    const netSalary = basicSalary + (overtime || 0) + (bonus || 0) - (deductions || 0);

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        userId: employee.userId,
        period,
        basicSalary,
        overtime: overtime || 0,
        bonus: bonus || 0,
        deductions: deductions || 0,
        netSalary,
        notes
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                displayName: true,
                avatar: true
              }
            },
            position: {
              include: {
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Tạo bảng lương thành công'
    });

  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo bảng lương' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/payrolls - Cập nhật bảng lương
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, basicSalary, overtime, bonus, deductions, notes, paidAt } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bảng lương' },
        { status: 400 }
      );
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id }
    });

    if (!existingPayroll) {
      return NextResponse.json(
        { success: false, error: 'Bảng lương không tồn tại' },
        { status: 404 }
      );
    }

    // Tính toán lại lương thực nhận
    const netSalary = (basicSalary || existingPayroll.basicSalary) + 
                     (overtime || existingPayroll.overtime) + 
                     (bonus || existingPayroll.bonus) - 
                     (deductions || existingPayroll.deductions);

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        basicSalary: basicSalary || existingPayroll.basicSalary,
        overtime: overtime || existingPayroll.overtime,
        bonus: bonus || existingPayroll.bonus,
        deductions: deductions || existingPayroll.deductions,
        netSalary,
        notes: notes !== undefined ? notes : existingPayroll.notes,
        paidAt: paidAt !== undefined ? (paidAt ? new Date(paidAt) : null) : existingPayroll.paidAt
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                displayName: true,
                avatar: true
              }
            },
            position: {
              include: {
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Cập nhật bảng lương thành công'
    });

  } catch (error) {
    console.error('Error updating payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật bảng lương' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/payrolls - Xóa bảng lương
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bảng lương' },
        { status: 400 }
      );
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id }
    });

    if (!existingPayroll) {
      return NextResponse.json(
        { success: false, error: 'Bảng lương không tồn tại' },
        { status: 404 }
      );
    }

    // Không cho phép xóa bảng lương đã thanh toán
    if (existingPayroll.paidAt) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa bảng lương đã thanh toán' },
        { status: 400 }
      );
    }

    await prisma.payroll.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa bảng lương thành công'
    });

  } catch (error) {
    console.error('Error deleting payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa bảng lương' },
      { status: 500 }
    );
  }
}

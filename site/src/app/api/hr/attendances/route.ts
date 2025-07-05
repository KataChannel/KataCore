import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

// GET /api/hr/attendances - Lấy danh sách chấm công
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
    }

    if (date) {
      where.date = {
        gte: new Date(date + 'T00:00:00.000Z'),
        lte: new Date(date + 'T23:59:59.999Z')
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
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
        orderBy: {
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.attendance.count({ where })
    ]);

    // Transform data for frontend
    const transformedAttendances = attendances.map((attendance: any) => ({
      id: attendance.id,
      date: attendance.date.toISOString().split('T')[0],
      timeIn: attendance.timeIn?.toISOString(),
      timeOut: attendance.timeOut?.toISOString(),
      breakStart: attendance.breakStart?.toISOString(),
      breakEnd: attendance.breakEnd?.toISOString(),
      totalHours: attendance.totalHours,
      overtime: attendance.overtime,
      status: attendance.status,
      notes: attendance.notes,
      employee: {
        id: attendance.employee.id,
        fullName: attendance.employee.fullName,
        employeeId: attendance.employee.employeeId,
        position: {
          title: attendance.employee.position.title,
          department: {
            name: attendance.employee.position.department.name
          }
        },
        user: attendance.employee.user
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedAttendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching attendances:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách chấm công' },
      { status: 500 }
    );
  }
}

// POST /api/hr/attendances - Tạo bản ghi chấm công
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, timeIn, timeOut, breakStart, breakEnd, status, notes } = body;

    if (!employeeId || !date) {
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

    // Kiểm tra đã có bản ghi chấm công cho ngày này chưa
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date)
        }
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Đã có bản ghi chấm công cho ngày này' },
        { status: 409 }
      );
    }

    // Tính toán tổng giờ làm và giờ tăng ca
    let totalHours = 0;
    let overtime = 0;

    if (timeIn && timeOut) {
      const timeInDate = new Date(`${date}T${timeIn}`);
      const timeOutDate = new Date(`${date}T${timeOut}`);
      
      let workingHours = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);
      
      // Trừ thời gian nghỉ trưa
      if (breakStart && breakEnd) {
        const breakStartDate = new Date(`${date}T${breakStart}`);
        const breakEndDate = new Date(`${date}T${breakEnd}`);
        const breakHours = (breakEndDate.getTime() - breakStartDate.getTime()) / (1000 * 60 * 60);
        workingHours -= breakHours;
      }
      
      totalHours = Math.max(0, workingHours);
      overtime = Math.max(0, totalHours - 8); // Giờ tăng ca = tổng giờ làm - 8h
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        userId: employee.userId,
        date: new Date(date),
        timeIn: timeIn ? new Date(`${date}T${timeIn}`) : null,
        timeOut: timeOut ? new Date(`${date}T${timeOut}`) : null,
        breakStart: breakStart ? new Date(`${date}T${breakStart}`) : null,
        breakEnd: breakEnd ? new Date(`${date}T${breakEnd}`) : null,
        totalHours,
        overtime,
        status: status || 'PRESENT',
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
      data: attendance,
      message: 'Tạo bản ghi chấm công thành công'
    });

  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo bản ghi chấm công' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/attendances - Cập nhật bản ghi chấm công
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, timeIn, timeOut, breakStart, breakEnd, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bản ghi' },
        { status: 400 }
      );
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Bản ghi chấm công không tồn tại' },
        { status: 404 }
      );
    }

    // Tính toán lại tổng giờ làm và giờ tăng ca
    let totalHours = 0;
    let overtime = 0;

    if (timeIn && timeOut) {
      const date = existingAttendance.date.toISOString().split('T')[0];
      const timeInDate = new Date(`${date}T${timeIn}`);
      const timeOutDate = new Date(`${date}T${timeOut}`);
      
      let workingHours = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60);
      
      // Trừ thời gian nghỉ trưa
      if (breakStart && breakEnd) {
        const breakStartDate = new Date(`${date}T${breakStart}`);
        const breakEndDate = new Date(`${date}T${breakEnd}`);
        const breakHours = (breakEndDate.getTime() - breakStartDate.getTime()) / (1000 * 60 * 60);
        workingHours -= breakHours;
      }
      
      totalHours = Math.max(0, workingHours);
      overtime = Math.max(0, totalHours - 8);
    }

    const date = existingAttendance.date.toISOString().split('T')[0];
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        timeIn: timeIn ? new Date(`${date}T${timeIn}`) : null,
        timeOut: timeOut ? new Date(`${date}T${timeOut}`) : null,
        breakStart: breakStart ? new Date(`${date}T${breakStart}`) : null,
        breakEnd: breakEnd ? new Date(`${date}T${breakEnd}`) : null,
        totalHours,
        overtime,
        status: status || existingAttendance.status,
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
      data: attendance,
      message: 'Cập nhật bản ghi chấm công thành công'
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật bản ghi chấm công' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/attendances - Xóa bản ghi chấm công
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID bản ghi' },
        { status: 400 }
      );
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Bản ghi chấm công không tồn tại' },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa bản ghi chấm công thành công'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa bản ghi chấm công' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hr/attendance - Lấy dữ liệu chấm công
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (dateFrom && dateTo) {
      where.date = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải dữ liệu chấm công' },
      { status: 500 }
    );
  }
}

// POST /api/hr/attendance - Tạo bản ghi chấm công
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      userId,
      date,
      timeIn,
      timeOut,
      breakStart,
      breakEnd,
      status,
      location,
      notes,
    } = body;

    // Validate required fields
    if (!employeeId || !date) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Đã có bản ghi chấm công cho ngày này' },
        { status: 409 }
      );
    }

    // Calculate total hours if both timeIn and timeOut are provided
    let totalHours = null;
    let overtime = 0;

    if (timeIn && timeOut) {
      const timeInDate = new Date(`${date}T${timeIn}`);
      const timeOutDate = new Date(`${date}T${timeOut}`);
      
      let workMinutes = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60);
      
      // Subtract break time if provided
      if (breakStart && breakEnd) {
        const breakStartDate = new Date(`${date}T${breakStart}`);
        const breakEndDate = new Date(`${date}T${breakEnd}`);
        const breakMinutes = (breakEndDate.getTime() - breakStartDate.getTime()) / (1000 * 60);
        workMinutes -= breakMinutes;
      }

      totalHours = workMinutes / 60;
      
      // Calculate overtime (assuming 8 hours is standard work day)
      if (totalHours > 8) {
        overtime = totalHours - 8;
      }
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        userId,
        date: new Date(date),
        timeIn: timeIn ? new Date(`${date}T${timeIn}`) : null,
        timeOut: timeOut ? new Date(`${date}T${timeOut}`) : null,
        breakStart: breakStart ? new Date(`${date}T${breakStart}`) : null,
        breakEnd: breakEnd ? new Date(`${date}T${breakEnd}`) : null,
        totalHours,
        overtime,
        status: status || 'PRESENT',
        location,
        notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: attendance,
      message: 'Tạo bản ghi chấm công thành công',
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo bản ghi chấm công' },
      { status: 500 }
    );
  }
}

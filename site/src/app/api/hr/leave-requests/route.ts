import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma';

// GET /api/hr/leave-requests - Lấy danh sách đơn nghỉ phép
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
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
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.leaveRequest.count({ where });

    return NextResponse.json({
      data: leaveRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách đơn nghỉ phép' },
      { status: 500 }
    );
  }
}

// POST /api/hr/leave-requests - Tạo đơn nghỉ phép mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      startDate,
      endDate,
      days,
      type,
      reason,
      notes
    } = body;

    // Kiểm tra nhân viên tồn tại
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    // Kiểm tra xung đột thời gian
    const conflictingRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        OR: [
          {
            startDate: {
              lte: new Date(endDate)
            },
            endDate: {
              gte: new Date(startDate)
            }
          }
        ]
      }
    });

    if (conflictingRequests.length > 0) {
      return NextResponse.json(
        { error: 'Đã có đơn nghỉ phép trong khoảng thời gian này' },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        userId: employee.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        type,
        reason,
        notes,
        status: 'PENDING'
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

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { error: 'Không thể tạo đơn nghỉ phép mới' },
      { status: 500 }
    );
  }
}

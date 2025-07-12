import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../shared/lib/prisma';
import { EmployeeFilters, ApiResponse, EmployeeWithRelations } from '../../../../../shared/types/database';

// GET /api/hr/employees - Lấy danh sách nhân viên
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const departmentId = searchParams.get('departmentId') || 'all';

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
          position: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    const response: ApiResponse<EmployeeWithRelations[]> = {
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách nhân viên' },
      { status: 500 }
    );
  }
}

// POST /api/hr/employees - Tạo nhân viên mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      positionId,
      departmentId,
      salary,
      hireDate,
      contractType,
      dateOfBirth,
      gender,
      nationality,
      idNumber,
      address,
      emergencyContact,
      notes,
    } = body;

    // Validate required fields
    if (!employeeId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if employeeId already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Mã nhân viên đã tồn tại' },
        { status: 409 }
      );
    }

    // Create employee with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account if email provided
      let userId = null;
      if (email) {
        // Find employee role
        const employeeRole = await tx.role.findFirst({
          where: { name: 'EMPLOYEE' }
        });

        if (employeeRole) {
          const user = await tx.user.create({
            data: {
              email,
              displayName: `${firstName} ${lastName}`,
              phone,
              password: 'temporary-password', // Should be changed on first login
              roleId: employeeRole.id,
            },
          });
          userId = user.id;
        }
      }

      // Create employee record
      const employee = await tx.employee.create({
        data: {
          employeeId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          userId,
          positionId,
          departmentId,
          salary: salary ? parseFloat(salary) : null,
          hireDate: hireDate ? new Date(hireDate) : null,
          contractType: contractType || 'FULL_TIME',
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          nationality,
          idNumber,
          address,
          phone,
          emergencyContact,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              email: true,
              phone: true,
            },
          },
          position: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return employee;
    });

    const response: ApiResponse<EmployeeWithRelations> = {
      success: true,
      data: result,
      message: 'Tạo nhân viên thành công',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo nhân viên mới' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/employees/[id] - Cập nhật nhân viên
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID nhân viên không hợp lệ' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      positionId,
      departmentId,
      salary,
      contractType,
      status,
      dateOfBirth,
      gender,
      nationality,
      idNumber,
      address,
      emergencyContact,
      notes,
    } = body;

    // Update employee with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user account if exists
      const existingEmployee = await tx.employee.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingEmployee) {
        throw new Error('Nhân viên không tồn tại');
      }

      if (existingEmployee.user && email) {
        await tx.user.update({
          where: { id: existingEmployee.user.id },
          data: {
            email,
            displayName: `${firstName} ${lastName}`,
            phone,
          },
        });
      }

      // Update employee record
      const employee = await tx.employee.update({
        where: { id },
        data: {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          positionId,
          departmentId,
          salary: salary ? parseFloat(salary) : null,
          contractType,
          status,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          nationality,
          idNumber,
          address,
          phone,
          emergencyContact,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              email: true,
              phone: true,
            },
          },
          position: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return employee;
    });

    const response: ApiResponse<EmployeeWithRelations> = {
      success: true,
      data: result,
      message: 'Cập nhật nhân viên thành công',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Không thể cập nhật nhân viên' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/employees/[id] - Xóa nhân viên
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID nhân viên không hợp lệ' },
        { status: 400 }
      );
    }

    // Delete employee with transaction
    await prisma.$transaction(async (tx) => {
      // Find employee with related data
      const employee = await tx.employee.findUnique({
        where: { id },
        include: {
          attendances: true,
          leaveRequests: true,
          payrolls: true,
          performanceReviews: true,
        },
      });

      if (!employee) {
        throw new Error('Nhân viên không tồn tại');
      }

      // Delete related records first
      await tx.attendance.deleteMany({
        where: { employeeId: id },
      });

      await tx.leaveRequest.deleteMany({
        where: { employeeId: id },
      });

      await tx.payroll.deleteMany({
        where: { employeeId: id },
      });

      await tx.performanceReview.deleteMany({
        where: { employeeId: id },
      });

      // Delete employee
      await tx.employee.delete({
        where: { id },
      });

      // Optionally delete user account if it exists and has no other relations
      if (employee.userId) {
        const userRelations = await tx.user.findUnique({
          where: { id: employee.userId },
          include: {
            managedDepartments: true,
            approvedLeaveRequests: true,
          },
        });

        if (userRelations && 
            userRelations.managedDepartments.length === 0 && 
            userRelations.approvedLeaveRequests.length === 0) {
          await tx.user.delete({
            where: { id: employee.userId },
          });
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Xóa nhân viên thành công',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Không thể xóa nhân viên' },
      { status: 500 }
    );
  }
}

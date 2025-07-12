import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface EmployeeFilters {
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  page?: number;
  limit?: number;
}

export interface CreateEmployeeDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  positionId?: string;
  departmentId?: string;
  salary?: number;
  hireDate?: Date;
  contractType?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  idNumber?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: EmployeeFilters): Promise<ApiResponse> {
    const { page = 1, limit = 10, search, status, departmentId } = filters;
    
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
      this.prisma.employee.findMany({
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
      this.prisma.employee.count({ where }),
    ]);

    return {
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
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
        attendances: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return {
      success: true,
      data: employee,
    };
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<ApiResponse> {
    const { firstName, lastName, email, ...rest } = createEmployeeDto;
    
    // Check if employeeId already exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { employeeId: createEmployeeDto.employeeId },
    });

    if (existingEmployee) {
      throw new Error('Employee ID already exists');
    }

    const result = await this.prisma.$transaction(async (tx) => {
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
              password: 'temporary-password', // Should be changed on first login
              roleId: employeeRole.id,
            },
          });
          userId = user.id;
        }
      }

      // Create employee record
      return tx.employee.create({
        data: {
          ...rest,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          userId,
        },
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
      });
    });

    return {
      success: true,
      data: result,
      message: 'Employee created successfully',
    };
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<ApiResponse> {
    const { firstName, lastName, email, ...rest } = updateEmployeeDto;
    
    const result = await this.prisma.$transaction(async (tx) => {
      // Check if employee exists
      const existingEmployee = await tx.employee.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingEmployee) {
        throw new Error('Employee not found');
      }

      // Update user account if exists and email provided
      if (existingEmployee.user && email) {
        await tx.user.update({
          where: { id: existingEmployee.user.id },
          data: {
            email,
            displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
          },
        });
      }

      // Update employee record
      return tx.employee.update({
        where: { id },
        data: {
          ...rest,
          ...(firstName && lastName && { 
            firstName, 
            lastName, 
            fullName: `${firstName} ${lastName}` 
          }),
        },
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
      });
    });

    return {
      success: true,
      data: result,
      message: 'Employee updated successfully',
    };
  }

  async remove(id: string): Promise<ApiResponse> {
    await this.prisma.$transaction(async (tx) => {
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
        throw new Error('Employee not found');
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

    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  }

  async getStatistics(): Promise<ApiResponse> {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      recentHires,
      departmentStats,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.employee.count({ where: { status: 'INACTIVE' } }),
      this.prisma.employee.count({ where: { status: 'ON_LEAVE' } }),
      this.prisma.employee.count({
        where: {
          hireDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      this.prisma.department.findMany({
        include: {
          _count: {
            select: {
              employees: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        onLeaveEmployees,
        recentHires,
        departmentStats,
      },
    };
  }
}

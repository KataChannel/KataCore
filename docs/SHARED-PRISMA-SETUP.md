# 🔄 Shared Prisma Configuration Guide

Hướng dẫn thiết lập Prisma chung cho Next.js và NestJS trong TazaCore.

## 🎯 Mục tiêu

- Chia sẻ database schema giữa Next.js API routes và NestJS
- Đồng bộ hóa migrations và seed data
- Tối ưu hóa development workflow

## 📁 Cấu trúc thư mục

```
tazagroup/
├── shared/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── types/
│   │   └── database.ts
│   └── package.json
├── site/ (Next.js)
│   ├── prisma/ → ../shared/prisma (symlink)
│   └── src/app/api/
└── api/ (NestJS)
    ├── prisma/ → ../shared/prisma (symlink)
    └── src/
```

## 🚀 Thiết lập bước 1: Tạo shared configuration

### 1. Tạo shared Prisma client

```typescript
// shared/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
```

### 2. Tạo shared types

```typescript
// shared/types/database.ts
import { User, Role, Employee, Department, Position } from '@prisma/client';

// Extended types with relations
export type UserWithRole = User & {
  role: Role;
};

export type EmployeeWithRelations = Employee & {
  user?: User;
  position?: Position & {
    department: Department;
  };
  department?: Department;
};

export type DepartmentWithManager = Department & {
  manager?: User;
  _count?: {
    employees: number;
    positions: number;
  };
};

// API Response types
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

// Filter types
export interface EmployeeFilters {
  search?: string;
  status?: string;
  departmentId?: string;
  positionId?: string;
  page?: number;
  limit?: number;
}
```

### 3. Cập nhật Prisma schema

```prisma
// shared/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String?  @unique
  displayName String
  password    String
  phone       String?
  avatar      String?
  isVerified  Boolean  @default(false)
  isActive    Boolean  @default(true)
  roleId      String
  provider    String   @default("email")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  role         Role                      @relation(fields: [roleId], references: [id])
  employee     Employee?
  sentMessages Message[]
  conversations ConversationParticipant[]
  performanceReviews PerformanceReview[] @relation("UserReviews")
  attendances  Attendance[]
  managedDepartments Department[]        @relation("DepartmentManager")
  approvedLeaveRequests LeaveRequest[]   @relation("LeaveApprover")

  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  permissions String   // JSON string array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users User[]

  @@map("roles")
}

model Employee {
  id           String      @id @default(cuid())
  employeeId   String      @unique
  userId       String?     @unique
  firstName    String
  lastName     String
  fullName     String
  dateOfBirth  DateTime?
  gender       String?
  nationality  String?
  idNumber     String?     @unique
  address      String?
  phone        String?
  emergencyContact String?
  positionId   String?
  departmentId String?
  salary       Float?
  hireDate     DateTime?
  terminationDate DateTime?
  status       String      @default("ACTIVE") // ACTIVE, INACTIVE, TERMINATED, ON_LEAVE, PROBATION
  contractType String?     // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
  notes        String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  user         User?       @relation(fields: [userId], references: [id])
  position     Position?   @relation(fields: [positionId], references: [id])
  department   Department? @relation(fields: [departmentId], references: [id])
  attendances  Attendance[]
  leaveRequests LeaveRequest[]
  payrolls     Payroll[]
  performanceReviews PerformanceReview[]

  @@map("employees")
}

model Department {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  code        String?    @unique
  budget      Float?
  location    String?
  phone       String?
  email       String?
  isActive    Boolean    @default(true)
  managerId   String?
  parentId    String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  manager     User?      @relation("DepartmentManager", fields: [managerId], references: [id])
  parent      Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children    Department[] @relation("DepartmentHierarchy")
  positions   Position[]
  employees   Employee[]

  @@map("departments")
}

model Position {
  id           String     @id @default(cuid())
  title        String
  description  String?
  level        Int?
  minSalary    Float?
  maxSalary    Float?
  requirements String?
  isActive     Boolean    @default(true)
  departmentId String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  department   Department @relation(fields: [departmentId], references: [id])
  employees    Employee[]

  @@unique([title, departmentId])
  @@map("positions")
}

// Additional models for attendance, payroll, etc.
model Attendance {
  id         String    @id @default(cuid())
  employeeId String
  userId     String?
  date       DateTime
  timeIn     DateTime?
  timeOut    DateTime?
  breakStart DateTime?
  breakEnd   DateTime?
  totalHours Float?
  overtime   Float?
  status     String    @default("PRESENT") // PRESENT, ABSENT, LATE, EARLY_LEAVE
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  employee   Employee  @relation(fields: [employeeId], references: [id])
  user       User?     @relation(fields: [userId], references: [id])

  @@unique([employeeId, date])
  @@map("attendances")
}

model LeaveRequest {
  id         String    @id @default(cuid())
  employeeId String
  type       String    // ANNUAL, SICK, MATERNITY, PERSONAL
  startDate  DateTime
  endDate    DateTime
  days       Int
  reason     String?
  status     String    @default("PENDING") // PENDING, APPROVED, REJECTED
  approverId String?
  approvedAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  employee   Employee  @relation(fields: [employeeId], references: [id])
  approver   User?     @relation("LeaveApprover", fields: [approverId], references: [id])

  @@map("leave_requests")
}

model Payroll {
  id           String    @id @default(cuid())
  employeeId   String
  period       String    // YYYY-MM format
  basicSalary  Float
  overtime     Float     @default(0)
  bonus        Float     @default(0)
  deductions   Float     @default(0)
  netSalary    Float
  paidAt       DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  employee     Employee  @relation(fields: [employeeId], references: [id])

  @@unique([employeeId, period])
  @@map("payrolls")
}

model PerformanceReview {
  id           String   @id @default(cuid())
  employeeId   String
  reviewerId   String
  period       String   // YYYY-Q1, YYYY-Q2, etc.
  goals        String?
  achievements String?
  rating       Float?
  feedback     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  employee     Employee @relation(fields: [employeeId], references: [id])
  reviewer     User     @relation("UserReviews", fields: [reviewerId], references: [id])

  @@unique([employeeId, period])
  @@map("performance_reviews")
}

// Chat system models
model Conversation {
  id          String   @id @default(cuid())
  title       String
  description String?
  isPublic    Boolean  @default(false)
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  createdBy    User                      @relation("ConversationCreator", fields: [createdById], references: [id])
  messages     Message[]
  participants ConversationParticipant[]

  @@map("conversations")
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  joinedAt       DateTime @default(now())
  leftAt         DateTime?

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])

  @@unique([conversationId, userId])
  @@map("conversation_participants")
}

model Message {
  id             String   @id @default(cuid())
  content        String
  conversationId String
  userId         String
  timestamp      DateTime @default(now())
  editedAt       DateTime?
  isDeleted      Boolean  @default(false)

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])

  @@map("messages")
}
```

## 🚀 Thiết lập bước 2: Next.js API Routes

### 1. Cập nhật Next.js API để sử dụng shared Prisma

```typescript
// site/src/app/api/hr/employees/route.ts
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
        const user = await tx.user.create({
          data: {
            email,
            displayName: `${firstName} ${lastName}`,
            phone,
            password: 'temporary-password', // Should be changed on first login
            roleId: 'employee-role-id', // Set appropriate role
          },
        });
        userId = user.id;
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
```

## 🚀 Thiết lập bước 3: NestJS Services

### 1. Tạo Prisma service cho NestJS

```typescript
// api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🔗 Connected to database via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}
```

### 2. Tạo Prisma module

```typescript
// api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 3. Tạo Employee service cho NestJS

```typescript
// api/src/hr/employees/employees.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilters } from './dto/employee.dto';
import { EmployeeWithRelations, ApiResponse } from '../../../../shared/types/database';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: EmployeeFilters): Promise<ApiResponse<EmployeeWithRelations[]>> {
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

  async findOne(id: string): Promise<EmployeeWithRelations | null> {
    return this.prisma.employee.findUnique({
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
      },
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeWithRelations> {
    const { firstName, lastName, email, ...rest } = createEmployeeDto;
    
    return this.prisma.$transaction(async (tx) => {
      // Create user account if email provided
      let userId = null;
      if (email) {
        const user = await tx.user.create({
          data: {
            email,
            displayName: `${firstName} ${lastName}`,
            password: 'temporary-password', // Should be changed on first login
            roleId: 'employee-role-id', // Set appropriate role
          },
        });
        userId = user.id;
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
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeWithRelations> {
    const { firstName, lastName, ...rest } = updateEmployeeDto;
    
    return this.prisma.employee.update({
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
  }

  async remove(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id },
    });
  }
}
```

### 4. Tạo Employee controller

```typescript
// api/src/hr/employees/employees.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { ApiResponse } from '../../../../shared/types/database';

@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      const employee = await this.employeesService.create(createEmployeeDto);
      return {
        success: true,
        data: employee,
        message: 'Employee created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to create employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Query() query: EmployeeQueryDto) {
    try {
      return await this.employeesService.findAll(query);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch employees',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const employee = await this.employeesService.findOne(id);
      if (!employee) {
        throw new HttpException(
          { success: false, error: 'Employee not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: employee,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const employee = await this.employeesService.update(id, updateEmployeeDto);
      return {
        success: true,
        data: employee,
        message: 'Employee updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to update employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.employeesService.remove(id);
      return {
        success: true,
        message: 'Employee deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to delete employee',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
```

## 🚀 Thiết lập bước 4: Environment & Configuration

### 1. Shared environment configuration

```bash
# .env (root level)
DATABASE_URL="postgresql://tazacore:tazacore123@localhost:5432/tazacore_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Docker Compose configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: tazacore
      POSTGRES_PASSWORD: tazacore123
      POSTGRES_DB: tazacore_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  site:
    build:
      context: ./site
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://tazacore:tazacore123@postgres:5432/tazacore_db
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - postgres
    volumes:
      - ./shared:/app/shared:ro

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://tazacore:tazacore123@postgres:5432/tazacore_db
    depends_on:
      - postgres
    volumes:
      - ./shared:/app/shared:ro

volumes:
  postgres_data:
```

## 🚀 Thiết lập bước 5: Package.json Scripts

### 1. Root package.json

```json
{
  "name": "tazacore",
  "scripts": {
    "dev": "concurrently \"cd site && bun run dev\" \"cd api && bun run start:dev\"",
    "build": "cd shared && bun run db:generate && cd ../site && bun run build && cd ../api && bun run build",
    "start": "concurrently \"cd site && bun run start\" \"cd api && bun run start:prod\"",
    "db:generate": "cd shared && bun run db:generate",
    "db:migrate": "cd shared && bun run db:migrate",
    "db:seed": "cd shared && bun run db:seed",
    "db:studio": "cd shared && bun run db:studio",
    "db:reset": "cd shared && bun run db:reset",
    "setup:shared": "./setup-shared-prisma.sh"
  }
}
```

### 2. Shared package.json

```json
{
  "name": "@tazacore/shared",
  "version": "1.0.0",
  "description": "Shared Prisma configuration for TazaCore",
  "main": "lib/prisma.ts",
  "dependencies": {
    "@prisma/client": "^6.11.1",
    "prisma": "^6.11.1"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
```

## 🚀 Chạy script thiết lập

```bash
# Chạy script tự động thiết lập
chmod +x setup-shared-prisma.sh
./setup-shared-prisma.sh

# Hoặc thiết lập thủ công
cd shared
npm install
npx prisma generate
npx prisma migrate dev
```

## ✅ Kết quả

Sau khi thiết lập xong:

1. **Shared database schema** - Cả Next.js và NestJS sử dụng cùng schema
2. **Consistent API responses** - Cùng format response và types
3. **Unified data access** - Cùng Prisma client và queries
4. **Synchronized migrations** - Database changes được đồng bộ
5. **Development efficiency** - Dễ dàng maintain và scale

## 📚 Best Practices

1. **Always generate Prisma client** sau khi update schema
2. **Use transactions** cho complex operations
3. **Implement proper error handling** ở cả client và server
4. **Keep types in sync** giữa frontend và backend
5. **Use environment variables** cho configuration
6. **Test API endpoints** trước khi deploy

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Prisma client not found**: Chạy `npm run db:generate`
2. **Connection refused**: Kiểm tra DATABASE_URL
3. **Migration conflicts**: Chạy `npm run db:reset` và migrate lại
4. **Symlink issues**: Recreate symlinks sau khi copy files

Với setup này, bạn có thể dễ dàng phát triển và maintain cả Next.js API routes và NestJS với cùng một database schema!

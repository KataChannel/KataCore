import { User, Role, Employee, Department, Position, Attendance, LeaveRequest, Payroll, PerformanceReview } from '@prisma/client';

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

export type PositionWithDepartment = Position & {
  department: Department;
  _count?: {
    employees: number;
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

export interface DepartmentFilters {
  search?: string;
  isActive?: boolean;
  managerId?: string;
  page?: number;
  limit?: number;
}

// Fixed Prisma imports to match actual generated client
import type { 
  users as User, 
  roles as Role, 
  employees as Employee, 
  departments as Department, 
  positions as Position, 
  attendances as Attendance, 
  leave_requests as LeaveRequest, 
  payrolls as Payroll, 
  performance_reviews as PerformanceReview 
} from '@prisma/client';

// Re-export with original names for backward compatibility
export type {
  User,
  Role, 
  Employee,
  Department,
  Position,
  Attendance,
  LeaveRequest,
  Payroll,
  PerformanceReview
};

// Extended types
export interface UserWithRole extends User {
  role?: Role;
}

export interface EmployeeWithDepartment extends Employee {
  department?: Department;
  position?: Position;
  user?: User;
}

export interface AttendanceWithEmployee extends Attendance {
  employee?: EmployeeWithDepartment;
}

import { Module } from '@nestjs/common';
import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { LeaveRequestsController } from './leave-requests/leave-requests.controller';
import { LeaveRequestsService } from './leave-requests/leave-requests.service';

@Module({
  controllers: [
    EmployeesController,
    DepartmentsController,
    AttendanceController,
    LeaveRequestsController,
  ],
  providers: [
    EmployeesService,
    DepartmentsService,
    AttendanceService,
    LeaveRequestsService,
  ],
  exports: [
    EmployeesService,
    DepartmentsService,
    AttendanceService,
    LeaveRequestsService,
  ],
})
export class HrModule {}

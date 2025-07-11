// HR Permission System - Role-based access control for HR operations

export interface HRPermission {
  action: string;
  resource: string;
  scope?: 'own' | 'department' | 'all';
}

export interface HRRole {
  id: string;
  name: string;
  description: string;
  permissions: HRPermission[];
  level: number; // 1-5, higher number = more permissions
}

// Define HR-specific permissions
export const HR_PERMISSIONS = {
  // Employee Management
  EMPLOYEE_READ: { action: 'read', resource: 'employee' },
  EMPLOYEE_CREATE: { action: 'create', resource: 'employee' },
  EMPLOYEE_UPDATE: { action: 'update', resource: 'employee' },
  EMPLOYEE_DELETE: { action: 'delete', resource: 'employee' },

  // Department Management
  DEPARTMENT_READ: { action: 'read', resource: 'department' },
  DEPARTMENT_CREATE: { action: 'create', resource: 'department' },
  DEPARTMENT_UPDATE: { action: 'update', resource: 'department' },
  DEPARTMENT_DELETE: { action: 'delete', resource: 'department' },

  // Attendance Management
  ATTENDANCE_READ: { action: 'read', resource: 'attendance' },
  ATTENDANCE_CREATE: { action: 'create', resource: 'attendance' },
  ATTENDANCE_UPDATE: { action: 'update', resource: 'attendance' },
  ATTENDANCE_DELETE: { action: 'delete', resource: 'attendance' },

  // Leave Management
  LEAVE_READ: { action: 'read', resource: 'leave' },
  LEAVE_CREATE: { action: 'create', resource: 'leave' },
  LEAVE_APPROVE: { action: 'approve', resource: 'leave' },
  LEAVE_REJECT: { action: 'reject', resource: 'leave' },

  // Payroll Management
  PAYROLL_READ: { action: 'read', resource: 'payroll' },
  PAYROLL_CREATE: { action: 'create', resource: 'payroll' },
  PAYROLL_UPDATE: { action: 'update', resource: 'payroll' },
  PAYROLL_DELETE: { action: 'delete', resource: 'payroll' },

  // Performance Management
  PERFORMANCE_READ: { action: 'read', resource: 'performance' },
  PERFORMANCE_CREATE: { action: 'create', resource: 'performance' },
  PERFORMANCE_UPDATE: { action: 'update', resource: 'performance' },

  // Reports and Analytics
  REPORTS_READ: { action: 'read', resource: 'reports' },
  REPORTS_EXPORT: { action: 'export', resource: 'reports' },

  // System Administration
  SETTINGS_READ: { action: 'read', resource: 'settings' },
  SETTINGS_UPDATE: { action: 'update', resource: 'settings' },
  USERS_MANAGE: { action: 'manage', resource: 'users' },
} as const;

// Define HR roles with their permissions
export const HR_ROLES: HRRole[] = [
  {
    id: 'hr_admin',
    name: 'HR Administrator',
    description: 'Full access to all HR functions',
    level: 5,
    permissions: [
      // All permissions for HR Admin
      { ...HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_DELETE, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_DELETE, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_DELETE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_APPROVE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_REJECT, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_DELETE, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
      { ...HR_PERMISSIONS.REPORTS_EXPORT, scope: 'all' },
      { ...HR_PERMISSIONS.SETTINGS_READ, scope: 'all' },
      { ...HR_PERMISSIONS.SETTINGS_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.USERS_MANAGE, scope: 'all' },
    ],
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Management level access to HR functions',
    level: 4,
    permissions: [
      { ...HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_APPROVE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_REJECT, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
      { ...HR_PERMISSIONS.REPORTS_EXPORT, scope: 'all' },
    ],
  },
  {
    id: 'hr_specialist',
    name: 'HR Specialist',
    description: 'Standard HR operations access',
    level: 3,
    permissions: [
      { ...HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.LEAVE_CREATE, scope: 'all' },
      { ...HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
    ],
  },
  {
    id: 'dept_manager',
    name: 'Department Manager',
    description: 'Department-level HR access',
    level: 3,
    permissions: [
      { ...HR_PERMISSIONS.EMPLOYEE_READ, scope: 'department' },
      { ...HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'department' },
      { ...HR_PERMISSIONS.ATTENDANCE_READ, scope: 'department' },
      { ...HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'department' },
      { ...HR_PERMISSIONS.LEAVE_READ, scope: 'department' },
      { ...HR_PERMISSIONS.LEAVE_APPROVE, scope: 'department' },
      { ...HR_PERMISSIONS.LEAVE_REJECT, scope: 'department' },
      { ...HR_PERMISSIONS.PERFORMANCE_READ, scope: 'department' },
      { ...HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'department' },
      { ...HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'department' },
      { ...HR_PERMISSIONS.REPORTS_READ, scope: 'department' },
    ],
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee self-service access',
    level: 1,
    permissions: [
      { ...HR_PERMISSIONS.EMPLOYEE_READ, scope: 'own' },
      { ...HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'own' },
      { ...HR_PERMISSIONS.ATTENDANCE_READ, scope: 'own' },
      { ...HR_PERMISSIONS.LEAVE_READ, scope: 'own' },
      { ...HR_PERMISSIONS.LEAVE_CREATE, scope: 'own' },
      { ...HR_PERMISSIONS.PERFORMANCE_READ, scope: 'own' },
    ],
  },
];

export class HRPermissionService {
  private userRole: HRRole | null = null;
  private userDepartment: string | null = null;
  private userId: string | null = null;

  constructor(roleId: string, departmentId?: string, userId?: string) {
    this.userRole = HR_ROLES.find(role => role.id === roleId) || null;
    this.userDepartment = departmentId || null;
    this.userId = userId || null;
  }

  /**
   * Check if user has permission to perform an action on a resource
   */
  hasPermission(
    action: string,
    resource: string,
    targetDepartment?: string,
    targetUserId?: string
  ): boolean {
    if (!this.userRole) return false;

    const permission = this.userRole.permissions.find(
      p => p.action === action && p.resource === resource
    );

    if (!permission) return false;

    // Check scope restrictions
    switch (permission.scope) {
      case 'own':
        return targetUserId === this.userId;
      case 'department':
        return targetDepartment === this.userDepartment;
      case 'all':
        return true;
      default:
        return true;
    }
  }

  /**
   * Check if user can read employee data
   */
  canReadEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission(
      'read',
      'employee',
      targetDepartment,
      targetUserId
    );
  }

  /**
   * Check if user can create employees
   */
  canCreateEmployee(): boolean {
    return this.hasPermission('create', 'employee');
  }

  /**
   * Check if user can update employee data
   */
  canUpdateEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission(
      'update',
      'employee',
      targetDepartment,
      targetUserId
    );
  }

  /**
   * Check if user can delete employees
   */
  canDeleteEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission(
      'delete',
      'employee',
      targetDepartment,
      targetUserId
    );
  }

  /**
   * Check if user can manage departments
   */
  canManageDepartments(): boolean {
    return (
      this.hasPermission('create', 'department') ||
      this.hasPermission('update', 'department')
    );
  }

  /**
   * Check if user can approve leave requests
   */
  canApproveLeave(targetDepartment?: string): boolean {
    return this.hasPermission('approve', 'leave', targetDepartment);
  }

  /**
   * Check if user can reject leave requests
   */
  canRejectLeave(targetDepartment?: string): boolean {
    return this.hasPermission('reject', 'leave', targetDepartment);
  }

  /**
   * Check if user can access payroll data
   */
  canAccessPayroll(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission(
      'read',
      'payroll',
      targetDepartment,
      targetUserId
    );
  }

  /**
   * Check if user can manage system settings
   */
  canManageSettings(): boolean {
    return this.hasPermission('update', 'settings');
  }

  /**
   * Check if user can export reports
   */
  canExportReports(): boolean {
    return this.hasPermission('export', 'reports');
  }

  /**
   * Get user role information
   */
  getUserRole(): HRRole | null {
    return this.userRole;
  }

  /**
   * Get user's permission level
   */
  getPermissionLevel(): number {
    return this.userRole?.level || 0;
  }

  /**
   * Check if user has higher or equal permission level
   */
  hasPermissionLevel(requiredLevel: number): boolean {
    return this.getPermissionLevel() >= requiredLevel;
  }

  /**
   * Get filtered navigation items based on user permissions
   */
  getAuthorizedNavigation(): Array<{
    name: string;
    href: string;
    permission: () => boolean;
  }> {
    return [
      {
        name: 'Dashboard',
        href: '/hr',
        permission: () => true, // Everyone can access dashboard
      },
      {
        name: 'Employees',
        href: '/hr/employees',
        permission: () => this.canReadEmployee(),
      },
      {
        name: 'Departments',
        href: '/hr/departments',
        permission: () => this.hasPermission('read', 'department'),
      },
      {
        name: 'Attendance',
        href: '/hr/attendance',
        permission: () => this.hasPermission('read', 'attendance'),
      },
      {
        name: 'Leave Requests',
        href: '/hr/leave-requests',
        permission: () => this.hasPermission('read', 'leave'),
      },
      {
        name: 'Payroll',
        href: '/hr/payroll',
        permission: () => this.hasPermission('read', 'payroll'),
      },
      {
        name: 'Performance',
        href: '/hr/performance',
        permission: () => this.hasPermission('read', 'performance'),
      },
      {
        name: 'Reports',
        href: '/hr/reports',
        permission: () => this.hasPermission('read', 'reports'),
      },
      {
        name: 'Settings',
        href: '/hr/settings',
        permission: () => this.hasPermission('read', 'settings'),
      },
    ].filter(item => item.permission());
  }
}

/**
 * React hook for HR permissions
 */
export const useHRPermissions = (
  roleId: string,
  departmentId?: string,
  userId?: string
) => {
  const permissionService = new HRPermissionService(
    roleId,
    departmentId,
    userId
  );

  return {
    hasPermission: (
      action: string,
      resource: string,
      targetDepartment?: string,
      targetUserId?: string
    ) =>
      permissionService.hasPermission(
        action,
        resource,
        targetDepartment,
        targetUserId
      ),
    canReadEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canReadEmployee(targetDepartment, targetUserId),
    canCreateEmployee: () => permissionService.canCreateEmployee(),
    canUpdateEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canUpdateEmployee(targetDepartment, targetUserId),
    canDeleteEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canDeleteEmployee(targetDepartment, targetUserId),
    canManageDepartments: () => permissionService.canManageDepartments(),
    canApproveLeave: (targetDepartment?: string) =>
      permissionService.canApproveLeave(targetDepartment),
    canRejectLeave: (targetDepartment?: string) =>
      permissionService.canRejectLeave(targetDepartment),
    canAccessPayroll: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canAccessPayroll(targetDepartment, targetUserId),
    canManageSettings: () => permissionService.canManageSettings(),
    canExportReports: () => permissionService.canExportReports(),
    getUserRole: () => permissionService.getUserRole(),
    getPermissionLevel: () => permissionService.getPermissionLevel(),
    hasPermissionLevel: (level: number) =>
      permissionService.hasPermissionLevel(level),
    getAuthorizedNavigation: () => permissionService.getAuthorizedNavigation(),
  };
};

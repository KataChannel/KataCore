// Enhanced HR Permission System - Comprehensive role-based access control

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

// Enhanced permission definitions with better categorization
export const ENHANCED_HR_PERMISSIONS = {
  // Employee Management
  EMPLOYEE_READ: { action: 'read', resource: 'employee' },
  EMPLOYEE_CREATE: { action: 'create', resource: 'employee' },
  EMPLOYEE_UPDATE: { action: 'update', resource: 'employee' },
  EMPLOYEE_DELETE: { action: 'delete', resource: 'employee' },
  EMPLOYEE_IMPORT: { action: 'import', resource: 'employee' },
  EMPLOYEE_EXPORT: { action: 'export', resource: 'employee' },
  
  // Department Management
  DEPARTMENT_READ: { action: 'read', resource: 'department' },
  DEPARTMENT_CREATE: { action: 'create', resource: 'department' },
  DEPARTMENT_UPDATE: { action: 'update', resource: 'department' },
  DEPARTMENT_DELETE: { action: 'delete', resource: 'department' },
  DEPARTMENT_MANAGE_BUDGET: { action: 'manage_budget', resource: 'department' },
  
  // Attendance Management
  ATTENDANCE_READ: { action: 'read', resource: 'attendance' },
  ATTENDANCE_CREATE: { action: 'create', resource: 'attendance' },
  ATTENDANCE_UPDATE: { action: 'update', resource: 'attendance' },
  ATTENDANCE_DELETE: { action: 'delete', resource: 'attendance' },
  ATTENDANCE_APPROVE: { action: 'approve', resource: 'attendance' },
  ATTENDANCE_REJECT: { action: 'reject', resource: 'attendance' },
  
  // Leave Management
  LEAVE_READ: { action: 'read', resource: 'leave' },
  LEAVE_CREATE: { action: 'create', resource: 'leave' },
  LEAVE_UPDATE: { action: 'update', resource: 'leave' },
  LEAVE_DELETE: { action: 'delete', resource: 'leave' },
  LEAVE_APPROVE: { action: 'approve', resource: 'leave' },
  LEAVE_REJECT: { action: 'reject', resource: 'leave' },
  LEAVE_CANCEL: { action: 'cancel', resource: 'leave' },
  
  // Payroll Management
  PAYROLL_READ: { action: 'read', resource: 'payroll' },
  PAYROLL_CREATE: { action: 'create', resource: 'payroll' },
  PAYROLL_UPDATE: { action: 'update', resource: 'payroll' },
  PAYROLL_DELETE: { action: 'delete', resource: 'payroll' },
  PAYROLL_APPROVE: { action: 'approve', resource: 'payroll' },
  PAYROLL_PROCESS: { action: 'process', resource: 'payroll' },
  
  // Performance Management
  PERFORMANCE_READ: { action: 'read', resource: 'performance' },
  PERFORMANCE_CREATE: { action: 'create', resource: 'performance' },
  PERFORMANCE_UPDATE: { action: 'update', resource: 'performance' },
  PERFORMANCE_DELETE: { action: 'delete', resource: 'performance' },
  
  // Reports and Analytics
  REPORTS_READ: { action: 'read', resource: 'reports' },
  REPORTS_CREATE: { action: 'create', resource: 'reports' },
  REPORTS_EXPORT: { action: 'export', resource: 'reports' },
  REPORTS_SCHEDULE: { action: 'schedule', resource: 'reports' },
  
  // System Administration
  SETTINGS_READ: { action: 'read', resource: 'settings' },
  SETTINGS_UPDATE: { action: 'update', resource: 'settings' },
  USERS_READ: { action: 'read', resource: 'users' },
  USERS_CREATE: { action: 'create', resource: 'users' },
  USERS_UPDATE: { action: 'update', resource: 'users' },
  USERS_DELETE: { action: 'delete', resource: 'users' },
  USERS_MANAGE: { action: 'manage', resource: 'users' },
  ROLES_READ: { action: 'read', resource: 'roles' },
  ROLES_CREATE: { action: 'create', resource: 'roles' },
  ROLES_UPDATE: { action: 'update', resource: 'roles' },
  ROLES_DELETE: { action: 'delete', resource: 'roles' },
  
  // Notifications
  NOTIFICATIONS_READ: { action: 'read', resource: 'notifications' },
  NOTIFICATIONS_CREATE: { action: 'create', resource: 'notifications' },
  NOTIFICATIONS_SEND: { action: 'send', resource: 'notifications' },
  
  // Audit Logs
  AUDIT_READ: { action: 'read', resource: 'audit' },
  AUDIT_EXPORT: { action: 'export', resource: 'audit' },
  
  // Integrations
  INTEGRATIONS_READ: { action: 'read', resource: 'integrations' },
  INTEGRATIONS_MANAGE: { action: 'manage', resource: 'integrations' },
} as const;

// Enhanced role definitions with comprehensive permissions
export const ENHANCED_HR_ROLES: HRRole[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Complete system access with all permissions',
    level: 5,
    permissions: Object.values(ENHANCED_HR_PERMISSIONS).map(p => ({ ...p, scope: 'all' as const })),
  },
  {
    id: 'hr_admin',
    name: 'HR Administrator',
    description: 'Full access to HR functions with some restrictions',
    level: 4,
    permissions: [
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_DELETE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_IMPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_EXPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_DELETE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_DELETE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_REJECT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_DELETE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_REJECT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CANCEL, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_DELETE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_EXPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.SETTINGS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.USERS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.USERS_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.USERS_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ROLES_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_SEND, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.AUDIT_READ, scope: 'all' },
    ],
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Management level access to HR functions',
    level: 3,
    permissions: [
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_EXPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_REJECT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_REJECT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CANCEL, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_APPROVE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_EXPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_CREATE, scope: 'all' },
    ],
  },
  {
    id: 'hr_specialist',
    name: 'HR Specialist',
    description: 'Standard HR operations access',
    level: 2,
    permissions: [
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_EXPORT, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.DEPARTMENT_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_UPDATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PAYROLL_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_READ, scope: 'all' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_READ, scope: 'all' },
    ],
  },
  {
    id: 'dept_manager',
    name: 'Department Manager',
    description: 'Department-level HR access',
    level: 2,
    permissions: [
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_READ, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_READ, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_UPDATE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_APPROVE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_REJECT, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_READ, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_APPROVE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_REJECT, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_READ, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_CREATE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_UPDATE, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.REPORTS_READ, scope: 'department' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_READ, scope: 'department' },
    ],
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee self-service access',
    level: 1,
    permissions: [
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_READ, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_READ, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.ATTENDANCE_CREATE, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_READ, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_CREATE, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.LEAVE_UPDATE, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.PERFORMANCE_READ, scope: 'own' },
      { ...ENHANCED_HR_PERMISSIONS.NOTIFICATIONS_READ, scope: 'own' },
    ],
  },
];

export class EnhancedHRPermissionService {
  private userRole: HRRole | null = null;
  private userDepartment: string | null = null;
  private userId: string | null = null;

  constructor(roleId: string, departmentId?: string, userId?: string) {
    this.userRole = ENHANCED_HR_ROLES.find(role => role.id === roleId) || null;
    this.userDepartment = departmentId || null;
    this.userId = userId || null;
  }

  /**
   * Check if user has permission to perform an action on a resource
   */
  hasPermission(action: string, resource: string, targetDepartment?: string, targetUserId?: string): boolean {
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
   * Employee management permissions
   */
  canReadEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission('read', 'employee', targetDepartment, targetUserId);
  }

  canCreateEmployee(): boolean {
    return this.hasPermission('create', 'employee');
  }

  canUpdateEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission('update', 'employee', targetDepartment, targetUserId);
  }

  canDeleteEmployee(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission('delete', 'employee', targetDepartment, targetUserId);
  }

  canImportEmployee(): boolean {
    return this.hasPermission('import', 'employee');
  }

  canExportEmployee(): boolean {
    return this.hasPermission('export', 'employee');
  }

  /**
   * Department management permissions
   */
  canManageDepartments(): boolean {
    return this.hasPermission('create', 'department') || this.hasPermission('update', 'department');
  }

  canManageDepartmentBudget(): boolean {
    return this.hasPermission('manage_budget', 'department');
  }

  /**
   * Leave management permissions
   */
  canApproveLeave(targetDepartment?: string): boolean {
    return this.hasPermission('approve', 'leave', targetDepartment);
  }

  canRejectLeave(targetDepartment?: string): boolean {
    return this.hasPermission('reject', 'leave', targetDepartment);
  }

  canCancelLeave(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission('cancel', 'leave', targetDepartment, targetUserId);
  }

  /**
   * Payroll management permissions
   */
  canAccessPayroll(targetDepartment?: string, targetUserId?: string): boolean {
    return this.hasPermission('read', 'payroll', targetDepartment, targetUserId);
  }

  canProcessPayroll(): boolean {
    return this.hasPermission('process', 'payroll');
  }

  canApprovePayroll(): boolean {
    return this.hasPermission('approve', 'payroll');
  }

  /**
   * Attendance management permissions
   */
  canApproveAttendance(targetDepartment?: string): boolean {
    return this.hasPermission('approve', 'attendance', targetDepartment);
  }

  canRejectAttendance(targetDepartment?: string): boolean {
    return this.hasPermission('reject', 'attendance', targetDepartment);
  }

  /**
   * System administration permissions
   */
  canManageSettings(): boolean {
    return this.hasPermission('update', 'settings');
  }

  canManageUsers(): boolean {
    return this.hasPermission('manage', 'users');
  }

  canCreateUsers(): boolean {
    return this.hasPermission('create', 'users');
  }

  canUpdateUsers(): boolean {
    return this.hasPermission('update', 'users');
  }

  canDeleteUsers(): boolean {
    return this.hasPermission('delete', 'users');
  }

  canManageRoles(): boolean {
    return this.hasPermission('create', 'roles') || this.hasPermission('update', 'roles');
  }

  /**
   * Notification permissions
   */
  canCreateNotifications(): boolean {
    return this.hasPermission('create', 'notifications');
  }

  canSendNotifications(): boolean {
    return this.hasPermission('send', 'notifications');
  }

  /**
   * Report permissions
   */
  canCreateReports(): boolean {
    return this.hasPermission('create', 'reports');
  }

  canExportReports(): boolean {
    return this.hasPermission('export', 'reports');
  }

  canScheduleReports(): boolean {
    return this.hasPermission('schedule', 'reports');
  }

  /**
   * Audit permissions
   */
  canAccessAuditLogs(): boolean {
    return this.hasPermission('read', 'audit');
  }

  canExportAuditLogs(): boolean {
    return this.hasPermission('export', 'audit');
  }

  /**
   * Integration permissions
   */
  canManageIntegrations(): boolean {
    return this.hasPermission('manage', 'integrations');
  }

  /**
   * Utility methods
   */
  getUserRole(): HRRole | null {
    return this.userRole;
  }

  getPermissionLevel(): number {
    return this.userRole?.level || 0;
  }

  hasPermissionLevel(requiredLevel: number): boolean {
    return this.getPermissionLevel() >= requiredLevel;
  }

  getAllPermissions(): HRPermission[] {
    return this.userRole?.permissions || [];
  }

  canAccessRoute(route: string): boolean {
    const routePermissions: Record<string, () => boolean> = {
      '/hr': () => true,
      '/hr/employees': () => this.canReadEmployee(),
      '/hr/employees/new': () => this.canCreateEmployee(),
      '/hr/employees/import': () => this.canImportEmployee(),
      '/hr/departments': () => this.hasPermission('read', 'department'),
      '/hr/departments/new': () => this.hasPermission('create', 'department'),
      '/hr/attendance': () => this.hasPermission('read', 'attendance'),
      '/hr/leave-requests': () => this.hasPermission('read', 'leave'),
      '/hr/payroll': () => this.canAccessPayroll(),
      '/hr/performance': () => this.hasPermission('read', 'performance'),
      '/hr/reports': () => this.hasPermission('read', 'reports'),
      '/hr/roles': () => this.hasPermission('read', 'roles'),
      '/hr/settings': () => this.canManageSettings(),
    };

    const permissionCheck = routePermissions[route];
    return permissionCheck ? permissionCheck() : false;
  }

  getAuthorizedNavigation(): Array<{name: string, href: string, permission: () => boolean}> {
    return [
      {
        name: 'Dashboard',
        href: '/hr',
        permission: () => true
      },
      {
        name: 'Employees',
        href: '/hr/employees',
        permission: () => this.canReadEmployee()
      },
      {
        name: 'Departments',
        href: '/hr/departments',
        permission: () => this.hasPermission('read', 'department')
      },
      {
        name: 'Attendance',
        href: '/hr/attendance',
        permission: () => this.hasPermission('read', 'attendance')
      },
      {
        name: 'Leave Requests',
        href: '/hr/leave-requests',
        permission: () => this.hasPermission('read', 'leave')
      },
      {
        name: 'Payroll',
        href: '/hr/payroll',
        permission: () => this.canAccessPayroll()
      },
      {
        name: 'Performance',
        href: '/hr/performance',
        permission: () => this.hasPermission('read', 'performance')
      },
      {
        name: 'Reports',
        href: '/hr/reports',
        permission: () => this.hasPermission('read', 'reports')
      },
      {
        name: 'Roles & Permissions',
        href: '/hr/roles',
        permission: () => this.hasPermission('read', 'roles')
      },
      {
        name: 'Settings',
        href: '/hr/settings',
        permission: () => this.canManageSettings()
      },
    ].filter(item => item.permission());
  }
}

/**
 * React hook for enhanced HR permissions
 */
export const useEnhancedHRPermissions = (roleId: string, departmentId?: string, userId?: string) => {
  const permissionService = new EnhancedHRPermissionService(roleId, departmentId, userId);
  
  return {
    // Core permission checking
    hasPermission: (action: string, resource: string, targetDepartment?: string, targetUserId?: string) =>
      permissionService.hasPermission(action, resource, targetDepartment, targetUserId),
    
    // Employee permissions
    canReadEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canReadEmployee(targetDepartment, targetUserId),
    canCreateEmployee: () => permissionService.canCreateEmployee(),
    canUpdateEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canUpdateEmployee(targetDepartment, targetUserId),
    canDeleteEmployee: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canDeleteEmployee(targetDepartment, targetUserId),
    canImportEmployee: () => permissionService.canImportEmployee(),
    canExportEmployee: () => permissionService.canExportEmployee(),
    
    // Department permissions
    canManageDepartments: () => permissionService.canManageDepartments(),
    canManageDepartmentBudget: () => permissionService.canManageDepartmentBudget(),
    
    // Leave permissions
    canApproveLeave: (targetDepartment?: string) => permissionService.canApproveLeave(targetDepartment),
    canRejectLeave: (targetDepartment?: string) => permissionService.canRejectLeave(targetDepartment),
    canCancelLeave: (targetDepartment?: string, targetUserId?: string) => 
      permissionService.canCancelLeave(targetDepartment, targetUserId),
    
    // Payroll permissions
    canAccessPayroll: (targetDepartment?: string, targetUserId?: string) =>
      permissionService.canAccessPayroll(targetDepartment, targetUserId),
    canProcessPayroll: () => permissionService.canProcessPayroll(),
    canApprovePayroll: () => permissionService.canApprovePayroll(),
    
    // Attendance permissions
    canApproveAttendance: (targetDepartment?: string) => permissionService.canApproveAttendance(targetDepartment),
    canRejectAttendance: (targetDepartment?: string) => permissionService.canRejectAttendance(targetDepartment),
    
    // Administrative permissions
    canManageSettings: () => permissionService.canManageSettings(),
    canManageUsers: () => permissionService.canManageUsers(),
    canCreateUsers: () => permissionService.canCreateUsers(),
    canUpdateUsers: () => permissionService.canUpdateUsers(),
    canDeleteUsers: () => permissionService.canDeleteUsers(),
    canManageRoles: () => permissionService.canManageRoles(),
    
    // Notification permissions
    canCreateNotifications: () => permissionService.canCreateNotifications(),
    canSendNotifications: () => permissionService.canSendNotifications(),
    
    // Report permissions
    canCreateReports: () => permissionService.canCreateReports(),
    canExportReports: () => permissionService.canExportReports(),
    canScheduleReports: () => permissionService.canScheduleReports(),
    
    // Audit permissions
    canAccessAuditLogs: () => permissionService.canAccessAuditLogs(),
    canExportAuditLogs: () => permissionService.canExportAuditLogs(),
    
    // Integration permissions
    canManageIntegrations: () => permissionService.canManageIntegrations(),
    
    // Utility methods
    getUserRole: () => permissionService.getUserRole(),
    getPermissionLevel: () => permissionService.getPermissionLevel(),
    hasPermissionLevel: (level: number) => permissionService.hasPermissionLevel(level),
    getAllPermissions: () => permissionService.getAllPermissions(),
    canAccessRoute: (route: string) => permissionService.canAccessRoute(route),
    getAuthorizedNavigation: () => permissionService.getAuthorizedNavigation(),
  };
};

/**
 * Utility functions
 */
export const getAvailableRoles = (currentUserLevel: number): HRRole[] => {
  return ENHANCED_HR_ROLES.filter(role => role.level <= currentUserLevel);
};

export const getRoleById = (roleId: string): HRRole | null => {
  return ENHANCED_HR_ROLES.find(role => role.id === roleId) || null;
};

export const getPermissionsByCategory = (): Record<string, typeof ENHANCED_HR_PERMISSIONS[keyof typeof ENHANCED_HR_PERMISSIONS][]> => {
  const categories: Record<string, typeof ENHANCED_HR_PERMISSIONS[keyof typeof ENHANCED_HR_PERMISSIONS][]> = {
    employee: [],
    department: [],
    attendance: [],
    leave: [],
    payroll: [],
    performance: [],
    reports: [],
    settings: [],
    users: [],
    roles: [],
    notifications: [],
    audit: [],
    integrations: [],
  };

  Object.entries(ENHANCED_HR_PERMISSIONS).forEach(([key, permission]) => {
    const category = permission.resource;
    if (categories[category]) {
      categories[category].push(permission);
    }
  });

  return categories;
};

export default EnhancedHRPermissionService;

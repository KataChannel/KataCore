// Enhanced permissions system for HR module
import { useState, useEffect } from 'react';

export interface Permission {
  resource: string;
  action: string;
  condition?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface UserPermissions {
  userId: string;
  roleId: string;
  permissions: Permission[];
}

// Hook for enhanced HR permissions
export function useEnhancedHRPermissions(userId?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching permissions
    setTimeout(() => {
      // Default permissions for demonstration
      setPermissions([
        { resource: 'employees', action: 'read' },
        { resource: 'employees', action: 'write' },
        { resource: 'departments', action: 'read' },
        { resource: 'payroll', action: 'read' },
      ]);
      setLoading(false);
    }, 500);
  }, [userId]);

  const hasPermission = (resource: string, action: string) => {
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  return {
    permissions,
    loading,
    hasPermission,
    canRead: (resource: string) => hasPermission(resource, 'read'),
    canWrite: (resource: string) => hasPermission(resource, 'write'),
    canDelete: (resource: string) => hasPermission(resource, 'delete'),
  };
}

// Predefined permissions for HR system
export const HR_PERMISSIONS = {
  // Employee permissions
  EMPLOYEE_VIEW: { resource: 'employee', action: 'view' },
  EMPLOYEE_CREATE: { resource: 'employee', action: 'create' },
  EMPLOYEE_EDIT: { resource: 'employee', action: 'edit' },
  EMPLOYEE_DELETE: { resource: 'employee', action: 'delete' },
  EMPLOYEE_VIEW_OWN: { resource: 'employee', action: 'view', condition: 'own' },
  EMPLOYEE_EDIT_OWN: { resource: 'employee', action: 'edit', condition: 'own' },

  // Department permissions
  DEPARTMENT_VIEW: { resource: 'department', action: 'view' },
  DEPARTMENT_CREATE: { resource: 'department', action: 'create' },
  DEPARTMENT_EDIT: { resource: 'department', action: 'edit' },
  DEPARTMENT_DELETE: { resource: 'department', action: 'delete' },

  // Attendance permissions
  ATTENDANCE_VIEW: { resource: 'attendance', action: 'view' },
  ATTENDANCE_CREATE: { resource: 'attendance', action: 'create' },
  ATTENDANCE_EDIT: { resource: 'attendance', action: 'edit' },
  ATTENDANCE_DELETE: { resource: 'attendance', action: 'delete' },
  ATTENDANCE_VIEW_OWN: { resource: 'attendance', action: 'view', condition: 'own' },
  ATTENDANCE_EDIT_OWN: { resource: 'attendance', action: 'edit', condition: 'own' },

  // Leave permissions
  LEAVE_VIEW: { resource: 'leave', action: 'view' },
  LEAVE_CREATE: { resource: 'leave', action: 'create' },
  LEAVE_APPROVE: { resource: 'leave', action: 'approve' },
  LEAVE_REJECT: { resource: 'leave', action: 'reject' },
  LEAVE_VIEW_OWN: { resource: 'leave', action: 'view', condition: 'own' },

  // Payroll permissions
  PAYROLL_VIEW: { resource: 'payroll', action: 'view' },
  PAYROLL_CREATE: { resource: 'payroll', action: 'create' },
  PAYROLL_EDIT: { resource: 'payroll', action: 'edit' },
  PAYROLL_DELETE: { resource: 'payroll', action: 'delete' },
  PAYROLL_VIEW_OWN: { resource: 'payroll', action: 'view', condition: 'own' },

  // Performance permissions
  PERFORMANCE_VIEW: { resource: 'performance', action: 'view' },
  PERFORMANCE_CREATE: { resource: 'performance', action: 'create' },
  PERFORMANCE_EDIT: { resource: 'performance', action: 'edit' },
  PERFORMANCE_DELETE: { resource: 'performance', action: 'delete' },
  PERFORMANCE_VIEW_OWN: { resource: 'performance', action: 'view', condition: 'own' },

  // Position permissions
  POSITION_VIEW: { resource: 'position', action: 'view' },
  POSITION_CREATE: { resource: 'position', action: 'create' },
  POSITION_EDIT: { resource: 'position', action: 'edit' },
  POSITION_DELETE: { resource: 'position', action: 'delete' },

  // Role permissions
  ROLE_VIEW: { resource: 'role', action: 'view' },
  ROLE_CREATE: { resource: 'role', action: 'create' },
  ROLE_EDIT: { resource: 'role', action: 'edit' },
  ROLE_DELETE: { resource: 'role', action: 'delete' },

  // User permissions
  USER_VIEW: { resource: 'user', action: 'view' },
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_EDIT: { resource: 'user', action: 'edit' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  USER_VIEW_OWN: { resource: 'user', action: 'view', condition: 'own' },
  USER_EDIT_OWN: { resource: 'user', action: 'edit', condition: 'own' },

  // Reports permissions
  REPORT_VIEW: { resource: 'report', action: 'view' },
  REPORT_CREATE: { resource: 'report', action: 'create' },
  REPORT_EXPORT: { resource: 'report', action: 'export' },

  // Admin permissions
  ADMIN_FULL: { resource: '*', action: '*' },
};

// Predefined role templates
export const ROLE_TEMPLATES = {
  ADMIN: {
    name: 'Administrator',
    permissions: [HR_PERMISSIONS.ADMIN_FULL]
  },
  HR_MANAGER: {
    name: 'HR Manager',
    permissions: [
      HR_PERMISSIONS.EMPLOYEE_VIEW,
      HR_PERMISSIONS.EMPLOYEE_CREATE,
      HR_PERMISSIONS.EMPLOYEE_EDIT,
      HR_PERMISSIONS.EMPLOYEE_DELETE,
      HR_PERMISSIONS.DEPARTMENT_VIEW,
      HR_PERMISSIONS.DEPARTMENT_CREATE,
      HR_PERMISSIONS.DEPARTMENT_EDIT,
      HR_PERMISSIONS.DEPARTMENT_DELETE,
      HR_PERMISSIONS.ATTENDANCE_VIEW,
      HR_PERMISSIONS.ATTENDANCE_CREATE,
      HR_PERMISSIONS.ATTENDANCE_EDIT,
      HR_PERMISSIONS.ATTENDANCE_DELETE,
      HR_PERMISSIONS.LEAVE_VIEW,
      HR_PERMISSIONS.LEAVE_APPROVE,
      HR_PERMISSIONS.LEAVE_REJECT,
      HR_PERMISSIONS.PAYROLL_VIEW,
      HR_PERMISSIONS.PAYROLL_CREATE,
      HR_PERMISSIONS.PAYROLL_EDIT,
      HR_PERMISSIONS.PAYROLL_DELETE,
      HR_PERMISSIONS.PERFORMANCE_VIEW,
      HR_PERMISSIONS.PERFORMANCE_CREATE,
      HR_PERMISSIONS.PERFORMANCE_EDIT,
      HR_PERMISSIONS.PERFORMANCE_DELETE,
      HR_PERMISSIONS.POSITION_VIEW,
      HR_PERMISSIONS.POSITION_CREATE,
      HR_PERMISSIONS.POSITION_EDIT,
      HR_PERMISSIONS.POSITION_DELETE,
      HR_PERMISSIONS.ROLE_VIEW,
      HR_PERMISSIONS.USER_VIEW,
      HR_PERMISSIONS.USER_CREATE,
      HR_PERMISSIONS.USER_EDIT,
      HR_PERMISSIONS.REPORT_VIEW,
      HR_PERMISSIONS.REPORT_CREATE,
      HR_PERMISSIONS.REPORT_EXPORT,
    ]
  },
  HR_STAFF: {
    name: 'HR Staff',
    permissions: [
      HR_PERMISSIONS.EMPLOYEE_VIEW,
      HR_PERMISSIONS.EMPLOYEE_CREATE,
      HR_PERMISSIONS.EMPLOYEE_EDIT,
      HR_PERMISSIONS.DEPARTMENT_VIEW,
      HR_PERMISSIONS.ATTENDANCE_VIEW,
      HR_PERMISSIONS.ATTENDANCE_CREATE,
      HR_PERMISSIONS.ATTENDANCE_EDIT,
      HR_PERMISSIONS.LEAVE_VIEW,
      HR_PERMISSIONS.PAYROLL_VIEW,
      HR_PERMISSIONS.PERFORMANCE_VIEW,
      HR_PERMISSIONS.POSITION_VIEW,
      HR_PERMISSIONS.USER_VIEW,
      HR_PERMISSIONS.REPORT_VIEW,
    ]
  },
  MANAGER: {
    name: 'Department Manager',
    permissions: [
      HR_PERMISSIONS.EMPLOYEE_VIEW,
      HR_PERMISSIONS.ATTENDANCE_VIEW,
      HR_PERMISSIONS.LEAVE_VIEW,
      HR_PERMISSIONS.LEAVE_APPROVE,
      HR_PERMISSIONS.LEAVE_REJECT,
      HR_PERMISSIONS.PERFORMANCE_VIEW,
      HR_PERMISSIONS.PERFORMANCE_CREATE,
      HR_PERMISSIONS.PERFORMANCE_EDIT,
      HR_PERMISSIONS.REPORT_VIEW,
      HR_PERMISSIONS.USER_VIEW,
    ]
  },
  EMPLOYEE: {
    name: 'Employee',
    permissions: [
      HR_PERMISSIONS.EMPLOYEE_VIEW_OWN,
      HR_PERMISSIONS.EMPLOYEE_EDIT_OWN,
      HR_PERMISSIONS.ATTENDANCE_VIEW_OWN,
      HR_PERMISSIONS.ATTENDANCE_EDIT_OWN,
      HR_PERMISSIONS.LEAVE_VIEW_OWN,
      HR_PERMISSIONS.LEAVE_CREATE,
      HR_PERMISSIONS.PAYROLL_VIEW_OWN,
      HR_PERMISSIONS.PERFORMANCE_VIEW_OWN,
      HR_PERMISSIONS.USER_VIEW_OWN,
      HR_PERMISSIONS.USER_EDIT_OWN,
    ]
  }
};

// Permission checking utility
export class PermissionChecker {
  private userPermissions: Permission[];
  private userId: string;

  constructor(userPermissions: Permission[], userId: string) {
    this.userPermissions = userPermissions;
    this.userId = userId;
  }

  hasPermission(resource: string, action: string, targetUserId?: string): boolean {
    // Check for admin permission (wildcard)
    if (this.userPermissions.some(p => p.resource === '*' && p.action === '*')) {
      return true;
    }

    // Check for exact match
    const exactMatch = this.userPermissions.find(p => 
      p.resource === resource && p.action === action && !p.condition
    );
    if (exactMatch) return true;

    // Check for conditional permission (own resource)
    if (targetUserId && targetUserId === this.userId) {
      const ownPermission = this.userPermissions.find(p => 
        p.resource === resource && p.action === action && p.condition === 'own'
      );
      if (ownPermission) return true;
    }

    return false;
  }

  canView(resource: string, targetUserId?: string): boolean {
    return this.hasPermission(resource, 'view', targetUserId);
  }

  canCreate(resource: string): boolean {
    return this.hasPermission(resource, 'create');
  }

  canEdit(resource: string, targetUserId?: string): boolean {
    return this.hasPermission(resource, 'edit', targetUserId);
  }

  canDelete(resource: string): boolean {
    return this.hasPermission(resource, 'delete');
  }

  canApprove(resource: string): boolean {
    return this.hasPermission(resource, 'approve');
  }

  canReject(resource: string): boolean {
    return this.hasPermission(resource, 'reject');
  }

  canExport(resource: string): boolean {
    return this.hasPermission(resource, 'export');
  }

  // Resource-specific helpers
  canManageEmployees(): boolean {
    return this.canView('employee') && this.canEdit('employee');
  }

  canManageDepartments(): boolean {
    return this.canView('department') && this.canEdit('department');
  }

  canManageAttendance(): boolean {
    return this.canView('attendance') && this.canEdit('attendance');
  }

  canManageLeaves(): boolean {
    return this.canView('leave') && (this.canApprove('leave') || this.canReject('leave'));
  }

  canManagePayroll(): boolean {
    return this.canView('payroll') && this.canEdit('payroll');
  }

  canManagePerformance(): boolean {
    return this.canView('performance') && this.canEdit('performance');
  }

  canManageUsers(): boolean {
    return this.canView('user') && this.canEdit('user');
  }

  canManageRoles(): boolean {
    return this.canView('role') && this.canEdit('role');
  }

  canViewReports(): boolean {
    return this.canView('report');
  }

  canExportReports(): boolean {
    return this.canExport('report');
  }

  // Get all permissions
  getAllPermissions(): Permission[] {
    return this.userPermissions;
  }

  // Check if user has any admin permissions
  isAdmin(): boolean {
    return this.userPermissions.some(p => p.resource === '*' && p.action === '*');
  }
}

// Utility function to create permission checker from user data
export function createPermissionChecker(userPermissions: string[], userId: string): PermissionChecker {
  // Convert string permissions to Permission objects
  const permissions: Permission[] = userPermissions.map(permStr => {
    // Parse permission string format: "resource:action" or "resource:action:condition"
    const parts = permStr.split(':');
    if (parts.length === 2) {
      return { resource: parts[0], action: parts[1] };
    } else if (parts.length === 3) {
      return { resource: parts[0], action: parts[1], condition: parts[2] };
    }
    // Fallback for simple permission names
    const permission = Object.values(HR_PERMISSIONS).find(p => 
      permStr.toLowerCase().includes(p.resource.toLowerCase()) && 
      permStr.toLowerCase().includes(p.action.toLowerCase())
    );
    return permission || { resource: 'unknown', action: 'unknown' };
  });

  return new PermissionChecker(permissions, userId);
}

export default {
  HR_PERMISSIONS,
  ROLE_TEMPLATES,
  PermissionChecker,
  createPermissionChecker
};

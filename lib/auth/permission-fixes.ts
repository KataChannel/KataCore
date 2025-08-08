// Fix for menu permission checking in UnifiedAuthProvider
// This file contains patches for common permission issues

import { User } from '@/types/auth';

export function validateUserPermissions(user: User): {
  isValid: boolean;
  issues: string[];
  fixes: string[];
} {
  const issues: string[] = [];
  const fixes: string[] = [];

  // Check basic user structure
  if (!user.id) {
    issues.push('User ID is missing');
    fixes.push('Ensure user object has valid ID');
  }

  if (!user.roleId) {
    issues.push('User role ID is missing');
    fixes.push('Assign a valid role to the user');
  }

  if (!user.role) {
    issues.push('User role object is missing');
    fixes.push('Include role data in user object');
  } else {
    // Check role structure
    if (!user.role.name) {
      issues.push('Role name is missing');
      fixes.push('Ensure role has a valid name');
    }

    if (typeof user.role.level !== 'number') {
      issues.push('Role level is not a number');
      fixes.push('Set role level as a numeric value');
    }

    if (!Array.isArray(user.role.permissions)) {
      issues.push('Role permissions is not an array');
      fixes.push('Ensure role.permissions is an array of permission strings');
    }
  }

  // Check permissions structure
  if (user.permissions && !Array.isArray(user.permissions)) {
    issues.push('User permissions is not an array');
    fixes.push('Ensure user.permissions is an array of permission strings');
  }

  // Check modules structure
  if (user.modules && !Array.isArray(user.modules)) {
    issues.push('User modules is not an array');
    fixes.push('Ensure user.modules is an array of module strings');
  }

  return {
    isValid: issues.length === 0,
    issues,
    fixes
  };
}

export function fixUserPermissionStructure(user: any): User | null {
  try {
    if (!user || typeof user !== 'object') {
      console.error('[PERMISSION_FIX] Invalid user object');
      return null;
    }

    const fixedUser: User = {
      id: user.id || '',
      displayName: user.displayName || user.name || 'Unknown User',
      email: user.email || null,
      phone: user.phone || null,
      username: user.username || null,
      avatar: user.avatar || null,
      roleId: user.roleId || user.role?.id || 'default',
      isActive: user.isActive !== false,
      isVerified: user.isVerified || false,
      provider: user.provider || 'email',
      modules: Array.isArray(user.modules) ? user.modules : [],
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      role: user.role ? {
        id: user.role.id || user.roleId || 'default',
        name: user.role.name || 'Default Role',
        level: typeof user.role.level === 'number' ? user.role.level : 1,
        permissions: Array.isArray(user.role.permissions) 
          ? user.role.permissions 
          : []
      } : undefined
    };

    // Parse JSON permissions if they're stored as string
    if (typeof user.role?.permissions === 'string') {
      try {
        const parsed = JSON.parse(user.role.permissions);
        if (parsed.permissions && Array.isArray(parsed.permissions)) {
          fixedUser.role!.permissions = parsed.permissions;
        }
      } catch (e) {
        console.warn('[PERMISSION_FIX] Failed to parse role permissions JSON');
      }
    }

    return fixedUser;
  } catch (error) {
    console.error('[PERMISSION_FIX] Failed to fix user structure:', error);
    return null;
  }
}

export function debugPermissionGate(props: {
  action?: string;
  resource?: string;
  module?: string;
  role?: string;
  minLevel?: number;
}, user: User | null, hasPermission: Function, hasModuleAccess: Function, hasRole: Function, hasMinimumRoleLevel: Function) {
  console.group('[PERMISSION_GATE_DEBUG]');
  console.log('Props:', props);
  console.log('User:', user?.displayName || 'No user');
  console.log('User Role:', user?.role?.name || 'No role');
  console.log('User Level:', user?.role?.level || 'No level');

  if (props.action && props.resource) {
    const permissionResult = hasPermission(props.action, props.resource);
    console.log(`Permission ${props.action}:${props.resource}:`, permissionResult);
  }

  if (props.module) {
    const moduleResult = hasModuleAccess(props.module);
    console.log(`Module ${props.module}:`, moduleResult);
  }

  if (props.role) {
    const roleResult = hasRole(props.role);
    console.log(`Role ${props.role}:`, roleResult);
  }

  if (props.minLevel) {
    const levelResult = hasMinimumRoleLevel(props.minLevel);
    console.log(`MinLevel ${props.minLevel}:`, levelResult);
  }

  console.groupEnd();
}

export function getPermissionCheckSummary(user: User | null): {
  hasUser: boolean;
  hasRole: boolean;
  hasPermissions: boolean;
  hasModules: boolean;
  roleLevel: number;
  permissionCount: number;
  moduleCount: number;
  commonIssues: string[];
} {
  const summary = {
    hasUser: !!user,
    hasRole: !!(user?.role),
    hasPermissions: !!(user?.permissions?.length || user?.role?.permissions?.length),
    hasModules: !!(user?.modules?.length),
    roleLevel: user?.role?.level || 0,
    permissionCount: (user?.permissions?.length || 0) + (user?.role?.permissions?.length || 0),
    moduleCount: user?.modules?.length || 0,
    commonIssues: [] as string[]
  };

  // Identify common issues
  if (!summary.hasUser) {
    summary.commonIssues.push('No user logged in');
  }

  if (summary.hasUser && !summary.hasRole) {
    summary.commonIssues.push('User has no role assigned');
  }

  if (summary.hasRole && !summary.hasPermissions) {
    summary.commonIssues.push('Role has no permissions defined');
  }

  if (summary.roleLevel === 0) {
    summary.commonIssues.push('Role level not set or invalid');
  }

  if (summary.hasUser && summary.permissionCount === 0) {
    summary.commonIssues.push('User has no effective permissions');
  }

  return summary;
}

import { UnifiedPermissionService } from './unified-permission.service';
import type { User, Permission } from '@/types/auth';

export function validateUserForPermissions(user: any): boolean {
  if (!user || typeof user !== 'object') {
    console.error('[PERMISSION_VALIDATOR] Invalid user object');
    return false;
  }

  const requiredFields = ['id', 'displayName', 'roleId', 'isActive'];
  for (const field of requiredFields) {
    if (!user[field] && user[field] !== false) {
      console.error(`[PERMISSION_VALIDATOR] Missing required field: ${field}`);
      return false;
    }
  }

  return true;
}

export function normalizePermissions(permissions: (string | Permission)[]): Permission[] {
  return permissions.map(p => {
    if (typeof p === 'string') {
      const parts = p.split(':');
      return {
        action: parts[0] || 'unknown',
        resource: parts[1] || parts[0] || 'unknown',
        scope: (parts[2] as any) || 'all',
      };
    }
    return p;
  }).filter(p => p.action && p.resource) as Permission[];
}

export function createSafePermissionService(user: any): UnifiedPermissionService | null {
  try {
    if (!validateUserForPermissions(user)) {
      console.error('[PERMISSION_VALIDATOR] User validation failed');
      return null;
    }

    const service = new UnifiedPermissionService(user);
    console.log(`[PERMISSION_VALIDATOR] Successfully created permission service for user: ${user.displayName}`);
    return service;
  } catch (error) {
    console.error('[PERMISSION_VALIDATOR] Failed to create permission service:', error);
    return null;
  }
}

export function debugUserPermissions(user: any, permissionService?: UnifiedPermissionService) {
  if (!user) {
    console.log('[PERMISSION_DEBUG] No user provided');
    return;
  }

  console.group('[PERMISSION_DEBUG] User Permission Analysis');
  console.log('User ID:', user.id);
  console.log('Display Name:', user.displayName);
  console.log('Role ID:', user.roleId);
  console.log('Is Active:', user.isActive);
  
  if (user.role) {
    console.log('Role Name:', user.role.name);
    console.log('Role Level:', user.role.level);
    console.log('Role Permissions:', user.role.permissions);
  }

  if (permissionService) {
    console.log('Permission Service Available:', true);
    console.log('Can Manage Users:', permissionService.hasPermission('manage', 'user'));
    console.log('Can Read Reports:', permissionService.hasPermission('read', 'report'));
    console.log('Can Access Admin:', permissionService.hasModuleAccess('admin'));
  } else {
    console.log('Permission Service Available:', false);
  }
  
  console.groupEnd();
}

export function migrateLegacyPermissions(legacyPermissions: any[]): Permission[] {
  if (!Array.isArray(legacyPermissions)) {
    console.warn('[PERMISSION_VALIDATOR] Legacy permissions is not an array:', legacyPermissions);
    return [];
  }

  return legacyPermissions.map(p => {
    if (typeof p === 'string') {
      const parts = p.split(':');
      return {
        action: parts[0] || 'unknown',
        resource: parts[1] || parts[0] || 'unknown',
        scope: (parts[2] as any) || 'all',
      };
    }

    if (typeof p === 'object' && p.action && p.resource) {
      return {
        action: p.action,
        resource: p.resource,
        scope: p.scope || 'all',
      };
    }

    console.warn('[PERMISSION_VALIDATOR] Unknown permission format:', p);
    return {
      action: 'unknown',
      resource: 'unknown',
      scope: 'all',
    };
  }).filter(p => p.action !== 'unknown' && p.resource !== 'unknown') as Permission[];
}

export function serializePermissions(permissions: Permission[]): string[] {
  return permissions.map(p => {
    if (p.scope && p.scope !== 'all') {
      return `${p.action}:${p.resource}:${p.scope}`;
    }
    return `${p.action}:${p.resource}`;
  });
}

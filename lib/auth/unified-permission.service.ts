// ============================================================================
// TAZA CORE UNIFIED PERMISSION SERVICE
// ============================================================================
// Centralized permission and module access control system
// Follows TazaCore standards for consistency and security

// Import unified types from single source of truth
import type { 
  Permission as UnifiedPermission, 
  UserRole as UnifiedUserRole,
  User as UnifiedUser 
} from '@/types/auth';

// Import unified permission constants
import { 
  MODULES, 
  ACTIONS, 
  RESOURCES, 
  SCOPES,
  ROLE_PERMISSION_SETS,
  getRolePermissions,
  getRoleModules,
  SALES_PERMISSIONS,
  CRM_PERMISSIONS,
  HRM_PERMISSIONS,
  FINANCE_PERMISSIONS,
  INVENTORY_PERMISSIONS,
} from './permissions-constants';

// ============================================================================
// INTERFACES & TYPES (Service-specific extensions)
// ============================================================================
export interface Permission extends UnifiedPermission {
  scope?: 'own' | 'team' | 'department' | 'all';
  conditions?: Record<string, any>;
}

export interface Role extends UnifiedUserRole {
  description: string;
  permissions: Permission[];
  modules: string[];
}

export interface User extends UnifiedUser {
  name: string; // For compatibility
  departmentId?: string | undefined;
  teamId?: string | undefined;
  customPermissions?: Permission[] | undefined; // Additional permissions beyond role
  role?: {
  id: string;
  name: string;
  description?: string;
  level: number;
  permissions: Permission[] | string | any; // Support multiple formats
  modules?: string[];
} | undefined;
}

// ============================================================================
// MODULE DEFINITIONS (Re-export from constants)
// ============================================================================
export { MODULES } from './permissions-constants';

// ============================================================================
// SYSTEM ROLES WITH PERMISSIONS (Updated to use constants)
// ============================================================================
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: 10,
    permissions: [...ROLE_PERMISSION_SETS.SUPER_ADMIN],
    modules: Object.values(MODULES),
  },
  {
    id: 'system_admin',
    name: 'System Administrator',
    description: 'System administration and user management',
    level: 9,
    permissions: [...ROLE_PERMISSION_SETS.SYSTEM_ADMIN],
    modules: getRoleModules('SYSTEM_ADMIN'),
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Sales module management and oversight',
    level: 7,
    permissions: [...ROLE_PERMISSION_SETS.SALES_MANAGER],
    modules: getRoleModules('SALES_MANAGER'),
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Human resources management',
    level: 7,
    permissions: [...ROLE_PERMISSION_SETS.HR_MANAGER],
    modules: getRoleModules('HR_MANAGER'),
  },
  {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Financial operations and reporting',
    level: 7,
    permissions: [...ROLE_PERMISSION_SETS.FINANCE_MANAGER],
    modules: getRoleModules('FINANCE_MANAGER'),
  },
  {
    id: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Inventory and warehouse management',
    level: 6,
    permissions: [...ROLE_PERMISSION_SETS.INVENTORY_MANAGER],
    modules: getRoleModules('INVENTORY_MANAGER'),
  },
  {
    id: 'department_manager',
    name: 'Department Manager',
    description: 'Department-level management and oversight',
    level: 6,
    permissions: [...ROLE_PERMISSION_SETS.DEPARTMENT_MANAGER],
    modules: getRoleModules('DEPARTMENT_MANAGER'),
  },
  {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Team leadership and coordination',
    level: 4,
    permissions: [...ROLE_PERMISSION_SETS.TEAM_LEAD],
    modules: getRoleModules('TEAM_LEAD'),
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    level: 2,
    permissions: [...ROLE_PERMISSION_SETS.EMPLOYEE],
    modules: getRoleModules('EMPLOYEE'),
  },
];

// ============================================================================
// UNIFIED PERMISSION SERVICE
// ============================================================================
export class UnifiedPermissionService {
  private user: User;
  private role: Role | null;

  constructor(user: User) {
    // console.log('🔍 [UnifiedPermissionService] Constructor called with user:', user);
    this.user = user;
    
    // Convert UserRole to Role if needed
    if (user.role) {
      // console.log('🔍 [UnifiedPermissionService] User has role object:', user.role);
      // Kiểm tra và xử lý permissions an toàn
      let permissions: Permission[] = [];
      
      if (Array.isArray(user.role.permissions)) {
        permissions = user.role.permissions.map(p => {
          if (typeof p === 'string') {
            const parts = p.split(':');
            return {
              action: parts[0] || 'unknown',
              resource: parts[1] || parts[0] || 'unknown',
              scope: (parts[2] as any) || 'all',
            };
          }
          return p as Permission;
        });
      } else if (typeof user.role.permissions === 'string') {
        // Nếu permissions là string JSON, parse nó
        try {
          const parsed = JSON.parse(user.role.permissions);
          if (Array.isArray(parsed)) {
            permissions = parsed.map(p => {
              if (typeof p === 'string') {
                const parts = p.split(':');
                return {
                  action: parts[0] || 'unknown',
                  resource: parts[1] || parts[0] || 'unknown',
                  scope: (parts[2] as any) || 'all',
                };
              }
              return p as Permission;
            });
          }
        } catch (e) {
          console.warn('Failed to parse user role permissions:', e);
          permissions = [];
        }
      }

      this.role = {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description || '',
        level: user.role.level,
        permissions: permissions,
        modules: Array.isArray(user.role.modules) ? user.role.modules : [],
      };
      
     // console.log('🔍 [UnifiedPermissionService] Created role object:', this.role);
     // console.log('🔍 [UnifiedPermissionService] Role level set to:', this.role.level);
    } else {
      // Find role from SYSTEM_ROLES
     // console.log('🔍 [UnifiedPermissionService] No role object, looking up by roleId:', user.roleId);
      this.role = SYSTEM_ROLES.find((r) => r.id === user.roleId) || null;
     // console.log('🔍 [UnifiedPermissionService] Found system role:', this.role);
    }
  }

  // ==========================================================================
  // CORE PERMISSION METHODS
  // ==========================================================================

  /**
   * Checks if user has specific permission
   */
  hasPermission(
    action: string,
    resource: string,
    scope: 'own' | 'team' | 'department' | 'all' = 'all',
    targetData?: { userId?: string; departmentId?: string; teamId?: string }
  ): boolean {
    // Super admin has all permissions
    if (this.isSuperAdmin()) {
      return true;
    }

    // Check role permissions
    const rolePermissions = this.role?.permissions || [];
    const customPermissions = this.user.customPermissions || [];
    const allPermissions = [...rolePermissions, ...customPermissions];

    // Check for exact permission match
    const hasExactPermission = allPermissions.some((permission) => {
      // Universal permission patterns
      if (permission.resource === '*' && permission.action === 'manage') {
        return true; // Universal manage permission
      }
      
      if (permission.action === 'admin' && permission.resource === '*') {
        return true; // Universal admin permission
      }

      if (permission.action === action && permission.resource === resource) {
        return this.checkScope(permission.scope || 'all', scope, targetData);
      }

      // Check wildcard permissions
      if (permission.action === action && permission.resource === '*') {
        return this.checkScope(permission.scope || 'all', scope, targetData);
      }

      if (permission.action === '*' && permission.resource === resource) {
        return this.checkScope(permission.scope || 'all', scope, targetData);
      }

      return false;
    });

    return hasExactPermission;
  }

  /**
   * Checks if user has module access
   */
  hasModuleAccess(moduleId: string): boolean {
    // Super admin has access to all modules
    if (this.isSuperAdmin()) {
      return true;
    }

    // Check role modules first
    const roleModules = this.role?.modules || [];
    if (roleModules.includes('*') || roleModules.includes(moduleId)) {
      return true;
    }

    // Check user-specific modules
    const userModules = this.user.modules || [];
    return userModules.includes('*') || userModules.includes(moduleId);
  }

  /**
   * Gets all user permissions
   */
  getAllPermissions(): Permission[] {
    if (this.isSuperAdmin()) {
      return [{ action: 'manage', resource: '*', scope: 'all' }];
    }

    const rolePermissions = this.role?.permissions || [];
    const customPermissions = this.user.customPermissions || [];

    return [...rolePermissions, ...customPermissions];
  }

  /**
   * Gets all accessible modules
   */
  getAccessibleModules(): string[] {
    if (this.isSuperAdmin()) {
      return Object.values(MODULES);
    }

    const roleModules = this.role?.modules || [];
    const userModules = this.user.modules || [];
    
    // Combine and deduplicate modules
    const allModules = roleModules.concat(userModules).filter((value, index, self) => 
      self.indexOf(value) === index
    );
    
    // If has wildcard access, return all modules
    if (allModules.includes('*')) {
      return Object.values(MODULES);
    }
    
    return allModules;
  }

  // ==========================================================================
  // SCOPE CHECKING
  // ==========================================================================

  /**
   * Checks if user meets the required scope for an action
   */
  private checkScope(
    permissionScope: string,
    requiredScope: string,
    targetData?: { userId?: string; departmentId?: string; teamId?: string }
  ): boolean {
    // 'all' scope covers everything
    if (permissionScope === 'all') {
      return true;
    }

    // Same scope requirement
    if (permissionScope === requiredScope) {
      return this.validateScopeContext(requiredScope, targetData);
    }

    // Higher scope covers lower scope
    const scopeHierarchy = ['own', 'team', 'department', 'all'];
    const permissionLevel = scopeHierarchy.indexOf(permissionScope);
    const requiredLevel = scopeHierarchy.indexOf(requiredScope);

    if (permissionLevel >= requiredLevel) {
      return this.validateScopeContext(requiredScope, targetData);
    }

    return false;
  }

  /**
   * Validates the context for scope-based permissions
   */
  private validateScopeContext(
    scope: string,
    targetData?: { userId?: string; departmentId?: string; teamId?: string }
  ): boolean {
    switch (scope) {
      case 'own':
        return !targetData?.userId || targetData.userId === this.user.id;

      case 'team':
        return !targetData?.teamId || !this.user.teamId || targetData.teamId === this.user.teamId;

      case 'department':
        return (
          !targetData?.departmentId ||
          !this.user.departmentId ||
          targetData.departmentId === this.user.departmentId
        );

      case 'all':
        return true;

      default:
        return false;
    }
  }

  // ==========================================================================
  // ROLE CHECKING
  // ==========================================================================

  /**
   * Checks if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.user.roleId === 'super_admin' || this.role?.name === 'Super Administrator';
  }

  /**
   * Checks if user is system admin
   */
  isSystemAdmin(): boolean {
    return this.user.roleId === 'system_admin' || this.role?.name === 'System Administrator';
  }

  /**
   * Checks if user is manager (level 6+)
   */
  isManager(): boolean {
    return (this.role?.level || 0) >= 6;
  }

  /**
   * Checks if user has specific role
   */
  hasRole(roleId: string): boolean {
    return this.user.roleId === roleId;
  }

  /**
   * Checks if user has minimum role level
   */
  hasMinimumRoleLevel(level: number): boolean {
    return (this.role?.level || 0) >= level;
  }

  // ==========================================================================
  // MODULE-SPECIFIC PERMISSION HELPERS
  // ==========================================================================

  /**
   * Sales module permissions
   */
  canManageSales(): boolean {
    return this.hasModuleAccess(MODULES.SALES) && this.hasPermission('manage', 'order');
  }

  /**
   * CRM module permissions
   */
  canManageCRM(): boolean {
    return this.hasModuleAccess(MODULES.CRM) && this.hasPermission('manage', 'customer');
  }

  /**
   * HR module permissions
   */
  canManageHR(): boolean {
    return this.hasModuleAccess(MODULES.HRM) && this.hasPermission('manage', 'employee');
  }

  /**
   * Finance module permissions
   */
  canManageFinance(): boolean {
    return this.hasModuleAccess(MODULES.FINANCE) && this.hasPermission('manage', 'invoice');
  }

  /**
   * Inventory module permissions
   */
  canManageInventory(): boolean {
    return this.hasModuleAccess(MODULES.INVENTORY) && this.hasPermission('manage', 'product');
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Checks if user has universal permissions (admin:* or manage:*)
   */
  private hasUniversalPermission(action: string, resource: string): boolean {
    const rolePermissions = this.role?.permissions || [];
    const customPermissions = this.user.customPermissions || [];
    const allPermissions = [...rolePermissions, ...customPermissions];

    return allPermissions.some((permission) => {
      // Universal admin permission
      if (permission.action === 'admin' && permission.resource === '*') {
        return true;
      }
      
      // Universal manage permission  
      if (permission.action === 'manage' && permission.resource === '*') {
        return true;
      }
      
      // Specific admin permission for resource
      if (permission.action === 'admin' && permission.resource === resource) {
        return true;
      }
      
      // Module admin permissions (admin:sales, admin:hrm, etc.)
      if (permission.action === 'admin' && this.getResourceModule(resource) === permission.resource) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Gets the module for a resource
   */
  private getResourceModule(resource: string): string {
    const moduleMap: Record<string, string> = {
      'order': 'sales',
      'customer': 'crm', 
      'employee': 'hrm',
      'invoice': 'finance',
      'product': 'inventory',
      'user': 'system',
      'role': 'system',
      'permission': 'system',
      'users': 'system',
      'roles': 'system',
      'permissions': 'system',
      'system': 'system',
    };
    
    return moduleMap[resource] || resource;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Gets user's role information
   */
  getUserRole(): Role | null {
    return this.role;
  }

  /**
   * Gets user information
   */
  getUser(): User {
    return this.user;
  }

  /**
   * Updates user data
   */
  updateUser(user: User): void {
    this.user = user;
    
    // Convert UserRole to Role if needed
    if (user.role) {
      // Kiểm tra và xử lý permissions an toàn
      let permissions: Permission[] = [];
      
      if (Array.isArray(user.role.permissions)) {
        permissions = user.role.permissions.map(p => {
          if (typeof p === 'string') {
            const parts = p.split(':');
            return {
              action: parts[0] || 'unknown',
              resource: parts[1] || parts[0] || 'unknown',
              scope: (parts[2] as any) || 'all',
            };
          }
          return p as Permission;
        });
      } else if (typeof user.role.permissions === 'string') {
        // Nếu permissions là string JSON, parse nó
        try {
          const parsed = JSON.parse(user.role.permissions);
          if (Array.isArray(parsed)) {
            permissions = parsed.map(p => {
              if (typeof p === 'string') {
                const parts = p.split(':');
                return {
                  action: parts[0] || 'unknown',
                  resource: parts[1] || parts[0] || 'unknown',
                  scope: (parts[2] as any) || 'all',
                };
              }
              return p as Permission;
            });
          }
        } catch (e) {
          console.warn('Failed to parse user role permissions:', e);
          permissions = [];
        }
      }

      this.role = {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description || '',
        level: user.role.level,
        permissions: permissions,
        modules: Array.isArray(user.role.modules) ? user.role.modules : [],
      };
    } else {
      this.role = SYSTEM_ROLES.find((r) => r.id === user.roleId) || null;
    }
  }

  /**
   * Checks route access based on URL
   */
  canAccessRoute(route: string): boolean {
    // Public routes
    const publicRoutes = ['/', '/login', '/register', '/api/health'];
    if (publicRoutes.some((publicRoute) => route.startsWith(publicRoute))) {
      return true;
    }

    // Admin routes require admin access
    if (route.startsWith('/admin')) {
      return this.isSystemAdmin() || this.isSuperAdmin();
    }

    // Module routes require module access
    for (const [routePrefix, moduleId] of Object.entries({
      '/sales': MODULES.SALES,
      '/crm': MODULES.CRM,
      '/inventory': MODULES.INVENTORY,
      '/finance': MODULES.FINANCE,
      '/hrm': MODULES.HRM,
      '/hr': MODULES.HRM,
      '/projects': MODULES.PROJECTS,
      '/manufacturing': MODULES.MANUFACTURING,
      '/marketing': MODULES.MARKETING,
      '/support': MODULES.SUPPORT,
      '/analytics': MODULES.ANALYTICS,
      '/ecommerce': MODULES.ECOMMERCE,
    })) {
      if (route.startsWith(routePrefix)) {
        return this.hasModuleAccess(moduleId);
      }
    }

    return false;
  }
}

/**
 * Helper function to safely parse permissions
 */
function parsePermissions(permissions: any): Permission[] {
  if (!permissions) return [];
  
  if (Array.isArray(permissions)) {
    return permissions.map(p => {
      if (typeof p === 'string') {
        const parts = p.split(':');
        return {
          action: parts[0] || 'unknown',
          resource: parts[1] || parts[0] || 'unknown',
          scope: (parts[2] as any) || 'all',
        };
      }
      return p as Permission;
    });
  }
  
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      if (Array.isArray(parsed)) {
        return parsePermissions(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse permissions string:', e);
    }
  }
  
  return [];
}

/**
 * Creates permission service for user with error handling
 */
export function createPermissionService(user: User): UnifiedPermissionService {
  try {
    return new UnifiedPermissionService(user);
  } catch (error) {
    console.error('Failed to create permission service:', error);
    
    // Fallback: create service with basic user data
    const fallbackUser: User = {
      ...user,
      role: user.role ? {
        ...user.role,
        permissions: parsePermissions(user.role.permissions),
        modules: Array.isArray(user.role.modules) ? user.role.modules : [],
      } : undefined,
    };
    
    return new UnifiedPermissionService(fallbackUser);
  }
}

/**
 * Gets role by ID
 */
export function getRoleById(roleId: string): Role | null {
  return SYSTEM_ROLES.find((role) => role.id === roleId) || null;
}

/**
 * Gets all available roles
 */
export function getAllRoles(): Role[] {
  return SYSTEM_ROLES;
}

/**
 * Gets permissions for a specific module
 */
export function getModulePermissions(moduleId: string): Permission[] {
  switch (moduleId) {
    case MODULES.SALES:
      return SALES_PERMISSIONS;
    case MODULES.CRM:
      return CRM_PERMISSIONS;
    case MODULES.INVENTORY:
      return INVENTORY_PERMISSIONS;
    case MODULES.FINANCE:
      return FINANCE_PERMISSIONS;
    case MODULES.HRM:
      return HRM_PERMISSIONS;
    default:
      return [];
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export { UnifiedPermissionService as default };

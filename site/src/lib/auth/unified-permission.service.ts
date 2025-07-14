// ============================================================================
// TAZA CORE UNIFIED PERMISSION SERVICE
// ============================================================================
// Centralized permission and module access control system
// Follows TazaCore standards for consistency and security

// ============================================================================
// INTERFACES & TYPES
// ============================================================================
export interface Permission {
  action:
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'manage'
    | 'approve'
    | 'export'
    | 'import'
    | '*';
  resource: string;
  scope?: 'own' | 'team' | 'department' | 'all';
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1-10, higher = more permissions
  permissions: Permission[];
  modules: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role?: Role;
  departmentId?: string;
  teamId?: string;
  isActive: boolean;
  customPermissions?: Permission[]; // Additional permissions beyond role
}

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================
export const MODULES = {
  SALES: 'sales',
  CRM: 'crm',
  INVENTORY: 'inventory',
  FINANCE: 'finance',
  HRM: 'hrm',
  PROJECTS: 'projects',
  MANUFACTURING: 'manufacturing',
  MARKETING: 'marketing',
  SUPPORT: 'support',
  ANALYTICS: 'analytics',
  ECOMMERCE: 'ecommerce',
  ADMIN: 'admin',
} as const;

// ============================================================================
// PERMISSION DEFINITIONS BY MODULE
// ============================================================================

// Sales Module Permissions
export const SALES_PERMISSIONS: Permission[] = [
  { action: 'read', resource: 'order', scope: 'all' },
  { action: 'create', resource: 'order', scope: 'all' },
  { action: 'update', resource: 'order', scope: 'all' },
  { action: 'delete', resource: 'order', scope: 'all' },
  { action: 'approve', resource: 'order', scope: 'all' },
  { action: 'manage', resource: 'pipeline', scope: 'all' },
  { action: 'read', resource: 'revenue', scope: 'all' },
  { action: 'read', resource: 'sales_reports', scope: 'all' },
  { action: 'export', resource: 'sales_data', scope: 'all' },
];

// CRM Module Permissions
export const CRM_PERMISSIONS: Permission[] = [
  { action: 'read', resource: 'customer', scope: 'all' },
  { action: 'create', resource: 'customer', scope: 'all' },
  { action: 'update', resource: 'customer', scope: 'all' },
  { action: 'delete', resource: 'customer', scope: 'all' },
  { action: 'read', resource: 'lead', scope: 'all' },
  { action: 'create', resource: 'lead', scope: 'all' },
  { action: 'update', resource: 'lead', scope: 'all' },
  { action: 'manage', resource: 'campaign', scope: 'all' },
  { action: 'export', resource: 'customer_data', scope: 'all' },
  { action: 'import', resource: 'customer_data', scope: 'all' },
];

// Inventory Module Permissions
export const INVENTORY_PERMISSIONS: Permission[] = [
  { action: 'read', resource: 'product', scope: 'all' },
  { action: 'create', resource: 'product', scope: 'all' },
  { action: 'update', resource: 'product', scope: 'all' },
  { action: 'delete', resource: 'product', scope: 'all' },
  { action: 'read', resource: 'stock', scope: 'all' },
  { action: 'update', resource: 'stock', scope: 'all' },
  { action: 'manage', resource: 'warehouse', scope: 'all' },
  { action: 'export', resource: 'inventory_reports', scope: 'all' },
];

// Finance Module Permissions
export const FINANCE_PERMISSIONS: Permission[] = [
  { action: 'read', resource: 'invoice', scope: 'all' },
  { action: 'create', resource: 'invoice', scope: 'all' },
  { action: 'update', resource: 'invoice', scope: 'all' },
  { action: 'approve', resource: 'invoice', scope: 'all' },
  { action: 'read', resource: 'payment', scope: 'all' },
  { action: 'create', resource: 'payment', scope: 'all' },
  { action: 'read', resource: 'financial_reports', scope: 'all' },
  { action: 'export', resource: 'financial_data', scope: 'all' },
];

// HRM Module Permissions
export const HRM_PERMISSIONS: Permission[] = [
  { action: 'read', resource: 'employee', scope: 'all' },
  { action: 'create', resource: 'employee', scope: 'all' },
  { action: 'update', resource: 'employee', scope: 'all' },
  { action: 'delete', resource: 'employee', scope: 'all' },
  { action: 'read', resource: 'attendance', scope: 'all' },
  { action: 'update', resource: 'attendance', scope: 'all' },
  { action: 'read', resource: 'payroll', scope: 'all' },
  { action: 'create', resource: 'payroll', scope: 'all' },
  { action: 'approve', resource: 'leave_request', scope: 'all' },
  { action: 'manage', resource: 'department', scope: 'all' },
  { action: 'export', resource: 'hr_reports', scope: 'all' },
];

// ============================================================================
// SYSTEM ROLES WITH PERMISSIONS
// ============================================================================
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: 10,
    permissions: [
      { action: 'manage', resource: '*', scope: 'all' }, // Universal permission
    ],
    modules: ['*'], // Access to all modules
  },
  {
    id: 'system_admin',
    name: 'System Administrator',
    description: 'System administration and user management',
    level: 9,
    permissions: [
      { action: 'manage', resource: 'user', scope: 'all' },
      { action: 'manage', resource: 'role', scope: 'all' },
      { action: 'manage', resource: 'permission', scope: 'all' },
      { action: 'read', resource: 'system_logs', scope: 'all' },
      { action: 'manage', resource: 'settings', scope: 'all' },
    ],
    modules: [MODULES.ADMIN, MODULES.ANALYTICS],
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Sales module management and oversight',
    level: 7,
    permissions: SALES_PERMISSIONS,
    modules: [MODULES.SALES, MODULES.CRM, MODULES.ANALYTICS],
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Human resources management',
    level: 7,
    permissions: HRM_PERMISSIONS,
    modules: [MODULES.HRM, MODULES.ANALYTICS],
  },
  {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Financial operations and reporting',
    level: 7,
    permissions: FINANCE_PERMISSIONS,
    modules: [MODULES.FINANCE, MODULES.ANALYTICS],
  },
  {
    id: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Inventory and warehouse management',
    level: 6,
    permissions: INVENTORY_PERMISSIONS,
    modules: [MODULES.INVENTORY, MODULES.ANALYTICS],
  },
  {
    id: 'department_manager',
    name: 'Department Manager',
    description: 'Department-level management and oversight',
    level: 6,
    permissions: [
      { action: 'read', resource: 'employee', scope: 'department' },
      { action: 'update', resource: 'employee', scope: 'department' },
      { action: 'approve', resource: 'leave_request', scope: 'department' },
      { action: 'read', resource: 'department_reports', scope: 'department' },
    ],
    modules: [MODULES.HRM],
  },
  {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Team leadership and coordination',
    level: 4,
    permissions: [
      { action: 'read', resource: 'employee', scope: 'team' },
      { action: 'read', resource: 'task', scope: 'team' },
      { action: 'update', resource: 'task', scope: 'team' },
      { action: 'create', resource: 'task', scope: 'team' },
    ],
    modules: [MODULES.PROJECTS],
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    level: 2,
    permissions: [
      { action: 'read', resource: 'employee', scope: 'own' },
      { action: 'update', resource: 'employee', scope: 'own' },
      { action: 'create', resource: 'leave_request', scope: 'own' },
      { action: 'read', resource: 'attendance', scope: 'own' },
      { action: 'read', resource: 'payroll', scope: 'own' },
    ],
    modules: [MODULES.HRM],
  },
];

// ============================================================================
// UNIFIED PERMISSION SERVICE
// ============================================================================
export class UnifiedPermissionService {
  private user: User;
  private role: Role | null;

  constructor(user: User) {
    this.user = user;
    this.role = user.role || SYSTEM_ROLES.find((r) => r.id === user.roleId) || null;
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
      if (permission.resource === '*' && permission.action === 'manage') {
        return true; // Universal permission
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

    const userModules = this.role?.modules || [];
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

    return this.role?.modules || [];
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
    this.role = user.role || SYSTEM_ROLES.find((r) => r.id === user.roleId) || null;
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates permission service for user
 */
export function createPermissionService(user: User): UnifiedPermissionService {
  return new UnifiedPermissionService(user);
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

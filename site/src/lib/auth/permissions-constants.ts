// ============================================================================
// TAZA CORE UNIFIED PERMISSIONS CONSTANTS
// ============================================================================
// Central definition of all permissions and modules across the system

// ============================================================================
// SYSTEM MODULES
// ============================================================================
export const SYSTEM_MODULES = {
  // Core business modules
  SALES: 'sales',
  CRM: 'crm', 
  INVENTORY: 'inventory',
  FINANCE: 'finance',
  HRM: 'hrm',
  
  // Operational modules
  PROJECTS: 'projects',
  MANUFACTURING: 'manufacturing',
  MARKETING: 'marketing',
  SUPPORT: 'support',
  
  // Analytics & reporting
  ANALYTICS: 'analytics',
  ECOMMERCE: 'ecommerce',
  
  // System administration
  ADMIN: 'admin',
  SETTINGS: 'settings',
} as const;

// ============================================================================
// STANDARD ACTIONS
// ============================================================================
export const ACTIONS = {
  // CRUD operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Workflow actions
  APPROVE: 'approve',
  REJECT: 'reject',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  
  // Management actions
  MANAGE: 'manage',
  ADMIN: 'admin',
  ASSIGN: 'assign',
  TRANSFER: 'transfer',
  
  // Data operations
  EXPORT: 'export',
  IMPORT: 'import',
  BACKUP: 'backup',
  RESTORE: 'restore',
  
  // Communication
  SEND: 'send',
  NOTIFY: 'notify',
  CHAT: 'chat',
  EMAIL: 'email',
  
  // System operations
  VIEW: 'view', // Alias for read
  EDIT: 'edit', // Alias for update
  EXECUTE: 'execute',
  CONFIGURE: 'configure',
} as const;

// ============================================================================
// STANDARD RESOURCES
// ============================================================================
export const RESOURCES = {
  // User management
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  
  // Business entities
  CUSTOMER: 'customer',
  LEAD: 'lead',
  ORDER: 'order',
  INVOICE: 'invoice',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  
  // HR entities
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  PERFORMANCE: 'performance',
  
  // Project entities
  PROJECT: 'project',
  TASK: 'task',
  TEAM: 'team',
  TIMESHEET: 'timesheet',
  
  // Inventory entities
  STOCK: 'stock',
  WAREHOUSE: 'warehouse',
  SUPPLIER: 'supplier',
  PURCHASE_ORDER: 'purchase_order',
  
  // Manufacturing entities
  PRODUCTION_PLAN: 'production_plan',
  WORK_ORDER: 'work_order',
  BOM: 'bom',
  QUALITY_CONTROL: 'quality_control',
  
  // Marketing entities
  CAMPAIGN: 'campaign',
  CONTENT: 'content',
  SOCIAL_MEDIA: 'social_media',
  EMAIL_CAMPAIGN: 'email_campaign',
  
  // Support entities
  TICKET: 'ticket',
  KNOWLEDGE_BASE: 'knowledge_base',
  FAQ: 'faq',
  
  // Analytics entities
  DASHBOARD: 'dashboard',
  REPORT: 'report',
  ANALYTICS: 'analytics',
  
  // System entities
  SETTINGS: 'settings',
  AUDIT_LOG: 'audit_log',
  NOTIFICATION: 'notification',
  INTEGRATION: 'integration',
  
  // Special resources
  WILDCARD: '*',
  SYSTEM: 'system',
} as const;

// ============================================================================
// PERMISSION SCOPES
// ============================================================================
export const SCOPES = {
  OWN: 'own',
  TEAM: 'team', 
  DEPARTMENT: 'department',
  ALL: 'all',
} as const;

// ============================================================================
// PERMISSION BUILDERS
// ============================================================================

/**
 * Creates a standardized permission object
 */
export function createPermission(action: string, resource: string, scope: string = SCOPES.ALL) {
  return {
    action,
    resource,
    scope: scope as any,
  };
}

/**
 * Creates multiple permissions for a resource
 */
export function createResourcePermissions(resource: string, actions: string[], scope: string = SCOPES.ALL) {
  return actions.map(action => createPermission(action, resource, scope));
}

/**
 * Creates CRUD permissions for a resource
 */
export function createCRUDPermissions(resource: string, scope: string = SCOPES.ALL) {
  return createResourcePermissions(resource, [
    ACTIONS.CREATE,
    ACTIONS.READ,
    ACTIONS.UPDATE,
    ACTIONS.DELETE,
  ], scope);
}

/**
 * Creates read-only permissions for a resource
 */
export function createReadOnlyPermissions(resource: string, scope: string = SCOPES.ALL) {
  return [createPermission(ACTIONS.READ, resource, scope)];
}

/**
 * Creates management permissions for a resource
 */
export function createManagementPermissions(resource: string, scope: string = SCOPES.ALL) {
  return [
    ...createCRUDPermissions(resource, scope),
    createPermission(ACTIONS.MANAGE, resource, scope),
    createPermission(ACTIONS.EXPORT, resource, scope),
    createPermission(ACTIONS.IMPORT, resource, scope),
  ];
}

// ============================================================================
// PERMISSION CONSTANTS BY MODULE
// ============================================================================

// Sales module permissions
const SALES_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.ORDER),
  ...createCRUDPermissions(RESOURCES.CUSTOMER),
  ...createCRUDPermissions(RESOURCES.LEAD),
  createPermission(ACTIONS.APPROVE, RESOURCES.ORDER),
  createPermission(ACTIONS.MANAGE, 'pipeline'),
  createPermission(ACTIONS.READ, 'sales_reports'),
  createPermission(ACTIONS.EXPORT, 'sales_data'),
];

// CRM module permissions
const CRM_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.CUSTOMER),
  ...createCRUDPermissions(RESOURCES.LEAD),
  ...createCRUDPermissions(RESOURCES.CAMPAIGN),
  createPermission(ACTIONS.MANAGE, RESOURCES.CAMPAIGN),
  createPermission(ACTIONS.EXPORT, 'customer_data'),
  createPermission(ACTIONS.IMPORT, 'customer_data'),
];

// HR module permissions
const HRM_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.EMPLOYEE),
  ...createCRUDPermissions(RESOURCES.DEPARTMENT),
  ...createCRUDPermissions(RESOURCES.ATTENDANCE),
  ...createCRUDPermissions(RESOURCES.LEAVE),
  ...createCRUDPermissions(RESOURCES.PAYROLL),
  ...createCRUDPermissions(RESOURCES.PERFORMANCE),
  createPermission(ACTIONS.APPROVE, RESOURCES.LEAVE),
  createPermission(ACTIONS.REJECT, RESOURCES.LEAVE),
  createPermission(ACTIONS.EXPORT, 'hr_reports'),
];

// Finance module permissions
const FINANCE_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.INVOICE),
  ...createCRUDPermissions(RESOURCES.PAYMENT),
  createPermission(ACTIONS.APPROVE, RESOURCES.INVOICE),
  createPermission(ACTIONS.APPROVE, RESOURCES.PAYMENT),
  createPermission(ACTIONS.READ, 'financial_reports'),
  createPermission(ACTIONS.EXPORT, 'financial_data'),
];

// Inventory module permissions  
const INVENTORY_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.PRODUCT),
  ...createCRUDPermissions(RESOURCES.STOCK),
  ...createCRUDPermissions(RESOURCES.WAREHOUSE),
  ...createCRUDPermissions(RESOURCES.SUPPLIER),
  ...createCRUDPermissions(RESOURCES.PURCHASE_ORDER),
  createPermission(ACTIONS.APPROVE, RESOURCES.PURCHASE_ORDER),
  createPermission(ACTIONS.TRANSFER, RESOURCES.STOCK),
  createPermission(ACTIONS.EXPORT, 'inventory_reports'),
];

// Admin module permissions
const ADMIN_PERMISSIONS = [
  ...createCRUDPermissions(RESOURCES.USER),
  ...createCRUDPermissions(RESOURCES.ROLE),
  ...createCRUDPermissions(RESOURCES.PERMISSION),
  ...createCRUDPermissions(RESOURCES.SETTINGS),
  createPermission(ACTIONS.READ, RESOURCES.AUDIT_LOG),
  createPermission(ACTIONS.MANAGE, RESOURCES.SYSTEM),
  createPermission(ACTIONS.BACKUP, RESOURCES.SYSTEM),
  createPermission(ACTIONS.RESTORE, RESOURCES.SYSTEM),
];

// ============================================================================
// ROLE-BASED PERMISSION SETS
// ============================================================================

export const ROLE_PERMISSION_SETS = {
  SUPER_ADMIN: [
    createPermission(ACTIONS.MANAGE, RESOURCES.WILDCARD, SCOPES.ALL),
  ],
  
  SYSTEM_ADMIN: [
    ...ADMIN_PERMISSIONS,
    createPermission(ACTIONS.READ, RESOURCES.WILDCARD, SCOPES.ALL),
  ],
  
  SALES_MANAGER: [
    ...SALES_PERMISSIONS,
    ...CRM_PERMISSIONS,
  ],
  
  HR_MANAGER: HRM_PERMISSIONS,
  
  FINANCE_MANAGER: FINANCE_PERMISSIONS,
  
  INVENTORY_MANAGER: INVENTORY_PERMISSIONS,
  
  DEPARTMENT_MANAGER: [
    createPermission(ACTIONS.READ, RESOURCES.EMPLOYEE, SCOPES.DEPARTMENT),
    createPermission(ACTIONS.UPDATE, RESOURCES.EMPLOYEE, SCOPES.DEPARTMENT),
    createPermission(ACTIONS.APPROVE, RESOURCES.LEAVE, SCOPES.DEPARTMENT),
    createPermission(ACTIONS.READ, 'department_reports', SCOPES.DEPARTMENT),
  ],
  
  TEAM_LEAD: [
    createPermission(ACTIONS.READ, RESOURCES.EMPLOYEE, SCOPES.TEAM),
    createPermission(ACTIONS.READ, RESOURCES.TASK, SCOPES.TEAM),
    createPermission(ACTIONS.UPDATE, RESOURCES.TASK, SCOPES.TEAM),
    createPermission(ACTIONS.CREATE, RESOURCES.TASK, SCOPES.TEAM),
  ],
  
  EMPLOYEE: [
    createPermission(ACTIONS.READ, RESOURCES.EMPLOYEE, SCOPES.OWN),
    createPermission(ACTIONS.UPDATE, RESOURCES.EMPLOYEE, SCOPES.OWN),
    createPermission(ACTIONS.CREATE, RESOURCES.LEAVE, SCOPES.OWN),
    createPermission(ACTIONS.READ, RESOURCES.ATTENDANCE, SCOPES.OWN),
    createPermission(ACTIONS.READ, RESOURCES.PAYROLL, SCOPES.OWN),
  ],
} as const;

// ============================================================================
// MODULE-ROLE MAPPINGS
// ============================================================================

export const MODULE_ROLE_MAPPINGS = {
  [SYSTEM_MODULES.SALES]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'SALES_MANAGER'],
  [SYSTEM_MODULES.CRM]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'SALES_MANAGER'],
  [SYSTEM_MODULES.HRM]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'EMPLOYEE'],
  [SYSTEM_MODULES.FINANCE]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'FINANCE_MANAGER'],
  [SYSTEM_MODULES.INVENTORY]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'INVENTORY_MANAGER'],
  [SYSTEM_MODULES.PROJECTS]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'TEAM_LEAD'],
  [SYSTEM_MODULES.ADMIN]: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
  [SYSTEM_MODULES.ANALYTICS]: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'SALES_MANAGER', 'HR_MANAGER', 'FINANCE_MANAGER'],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets all permissions for a role
 */
export function getRolePermissions(roleId: string) {
  const upperRoleId = roleId.toUpperCase() as keyof typeof ROLE_PERMISSION_SETS;
  return ROLE_PERMISSION_SETS[upperRoleId] || [];
}

/**
 * Gets all modules accessible by a role
 */
export function getRoleModules(roleId: string) {
  const modules = [];
  const upperRoleId = roleId.toUpperCase();
  
  for (const [module, roles] of Object.entries(MODULE_ROLE_MAPPINGS)) {
    if (roles.includes(upperRoleId as any)) {
      modules.push(module);
    }
  }
  return modules;
}

/**
 * Checks if a role can access a module
 */
export function canRoleAccessModule(roleId: string, moduleId: string) {
  const roleModules = getRoleModules(roleId);
  return roleModules.includes(moduleId);
}

// ============================================================================
// EXPORTS
// ============================================================================
export {
  SYSTEM_MODULES as MODULES,
  SALES_PERMISSIONS,
  CRM_PERMISSIONS,
  HRM_PERMISSIONS,
  FINANCE_PERMISSIONS,
  INVENTORY_PERMISSIONS,
};

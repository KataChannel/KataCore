// Comprehensive Module Permissions System
// Defines permissions for all business modules in TazaCore

export interface ModulePermission {
  action: string;
  resource: string;
  scope?: 'own' | 'department' | 'team' | 'all';
  description?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermission[];
  level: number; // 1-10, higher = more permissions
  modules: string[]; // Array of module names this role can access
}

// ==============================================
// MODULE PERMISSIONS DEFINITIONS
// ==============================================

// Sales Management Permissions
export const SALES_PERMISSIONS = {
  // Order Management
  ORDER_READ: { action: 'read', resource: 'order', description: 'View orders' },
  ORDER_CREATE: { action: 'create', resource: 'order', description: 'Create new orders' },
  ORDER_UPDATE: { action: 'update', resource: 'order', description: 'Edit orders' },
  ORDER_DELETE: { action: 'delete', resource: 'order', description: 'Delete orders' },
  ORDER_APPROVE: { action: 'approve', resource: 'order', description: 'Approve orders' },
  ORDER_CANCEL: { action: 'cancel', resource: 'order', description: 'Cancel orders' },

  // Sales Pipeline
  PIPELINE_READ: { action: 'read', resource: 'pipeline', description: 'View sales pipeline' },
  PIPELINE_MANAGE: { action: 'manage', resource: 'pipeline', description: 'Manage sales pipeline' },

  // Revenue & Reports
  REVENUE_READ: { action: 'read', resource: 'revenue', description: 'View revenue data' },
  SALES_REPORTS: { action: 'read', resource: 'sales_reports', description: 'View sales reports' },
  SALES_ANALYTICS: {
    action: 'read',
    resource: 'sales_analytics',
    description: 'View sales analytics',
  },

  // Quotations
  QUOTE_READ: { action: 'read', resource: 'quote', description: 'View quotations' },
  QUOTE_CREATE: { action: 'create', resource: 'quote', description: 'Create quotations' },
  QUOTE_UPDATE: { action: 'update', resource: 'quote', description: 'Edit quotations' },
  QUOTE_APPROVE: { action: 'approve', resource: 'quote', description: 'Approve quotations' },

  // Sales Team Management
  SALES_TEAM_READ: { action: 'read', resource: 'sales_team', description: 'View sales team' },
  SALES_TEAM_MANAGE: { action: 'manage', resource: 'sales_team', description: 'Manage sales team' },
} as const;

// CRM Permissions
export const CRM_PERMISSIONS = {
  // Customer Management
  CUSTOMER_READ: { action: 'read', resource: 'customer', description: 'View customers' },
  CUSTOMER_CREATE: { action: 'create', resource: 'customer', description: 'Create customers' },
  CUSTOMER_UPDATE: { action: 'update', resource: 'customer', description: 'Edit customers' },
  CUSTOMER_DELETE: { action: 'delete', resource: 'customer', description: 'Delete customers' },
  CUSTOMER_IMPORT: { action: 'import', resource: 'customer', description: 'Import customers' },
  CUSTOMER_EXPORT: { action: 'export', resource: 'customer', description: 'Export customers' },

  // Lead Management
  LEAD_READ: { action: 'read', resource: 'lead', description: 'View leads' },
  LEAD_CREATE: { action: 'create', resource: 'lead', description: 'Create leads' },
  LEAD_UPDATE: { action: 'update', resource: 'lead', description: 'Edit leads' },
  LEAD_ASSIGN: { action: 'assign', resource: 'lead', description: 'Assign leads' },
  LEAD_CONVERT: { action: 'convert', resource: 'lead', description: 'Convert leads to customers' },

  // Contact Management
  CONTACT_READ: { action: 'read', resource: 'contact', description: 'View contacts' },
  CONTACT_CREATE: { action: 'create', resource: 'contact', description: 'Create contacts' },
  CONTACT_UPDATE: { action: 'update', resource: 'contact', description: 'Edit contacts' },

  // Campaign Management
  CAMPAIGN_READ: { action: 'read', resource: 'campaign', description: 'View campaigns' },
  CAMPAIGN_CREATE: { action: 'create', resource: 'campaign', description: 'Create campaigns' },
  CAMPAIGN_MANAGE: { action: 'manage', resource: 'campaign', description: 'Manage campaigns' },

  // Customer Analytics
  CRM_ANALYTICS: { action: 'read', resource: 'crm_analytics', description: 'View CRM analytics' },
  CRM_REPORTS: { action: 'read', resource: 'crm_reports', description: 'View CRM reports' },
} as const;

// Inventory Management Permissions
export const INVENTORY_PERMISSIONS = {
  // Product Management
  PRODUCT_READ: { action: 'read', resource: 'product', description: 'View products' },
  PRODUCT_CREATE: { action: 'create', resource: 'product', description: 'Create products' },
  PRODUCT_UPDATE: { action: 'update', resource: 'product', description: 'Edit products' },
  PRODUCT_DELETE: { action: 'delete', resource: 'product', description: 'Delete products' },

  // Stock Management
  STOCK_READ: { action: 'read', resource: 'stock', description: 'View stock levels' },
  STOCK_UPDATE: { action: 'update', resource: 'stock', description: 'Update stock levels' },
  STOCK_TRANSFER: { action: 'transfer', resource: 'stock', description: 'Transfer stock' },

  // Warehouse Management
  WAREHOUSE_READ: { action: 'read', resource: 'warehouse', description: 'View warehouses' },
  WAREHOUSE_MANAGE: { action: 'manage', resource: 'warehouse', description: 'Manage warehouses' },

  // Purchase Orders
  PURCHASE_ORDER_READ: {
    action: 'read',
    resource: 'purchase_order',
    description: 'View purchase orders',
  },
  PURCHASE_ORDER_CREATE: {
    action: 'create',
    resource: 'purchase_order',
    description: 'Create purchase orders',
  },
  PURCHASE_ORDER_APPROVE: {
    action: 'approve',
    resource: 'purchase_order',
    description: 'Approve purchase orders',
  },

  // Suppliers
  SUPPLIER_READ: { action: 'read', resource: 'supplier', description: 'View suppliers' },
  SUPPLIER_CREATE: { action: 'create', resource: 'supplier', description: 'Create suppliers' },
  SUPPLIER_MANAGE: { action: 'manage', resource: 'supplier', description: 'Manage suppliers' },

  // Inventory Reports
  INVENTORY_REPORTS: {
    action: 'read',
    resource: 'inventory_reports',
    description: 'View inventory reports',
  },
  LOW_STOCK_ALERTS: { action: 'read', resource: 'stock_alerts', description: 'View stock alerts' },
} as const;

// Finance & Accounting Permissions
export const FINANCE_PERMISSIONS = {
  // Invoicing
  INVOICE_READ: { action: 'read', resource: 'invoice', description: 'View invoices' },
  INVOICE_CREATE: { action: 'create', resource: 'invoice', description: 'Create invoices' },
  INVOICE_UPDATE: { action: 'update', resource: 'invoice', description: 'Edit invoices' },
  INVOICE_APPROVE: { action: 'approve', resource: 'invoice', description: 'Approve invoices' },
  INVOICE_SEND: { action: 'send', resource: 'invoice', description: 'Send invoices' },

  // Payments
  PAYMENT_READ: { action: 'read', resource: 'payment', description: 'View payments' },
  PAYMENT_CREATE: { action: 'create', resource: 'payment', description: 'Record payments' },
  PAYMENT_APPROVE: { action: 'approve', resource: 'payment', description: 'Approve payments' },

  // Accounting
  ACCOUNT_READ: { action: 'read', resource: 'account', description: 'View accounts' },
  ACCOUNT_MANAGE: {
    action: 'manage',
    resource: 'account',
    description: 'Manage chart of accounts',
  },
  JOURNAL_ENTRY: {
    action: 'create',
    resource: 'journal_entry',
    description: 'Create journal entries',
  },

  // Financial Reports
  FINANCIAL_REPORTS: {
    action: 'read',
    resource: 'financial_reports',
    description: 'View financial reports',
  },
  CASH_FLOW: { action: 'read', resource: 'cash_flow', description: 'View cash flow' },
  PROFIT_LOSS: { action: 'read', resource: 'profit_loss', description: 'View P&L statements' },
  BALANCE_SHEET: { action: 'read', resource: 'balance_sheet', description: 'View balance sheet' },

  // Tax Management
  TAX_READ: { action: 'read', resource: 'tax', description: 'View tax information' },
  TAX_MANAGE: { action: 'manage', resource: 'tax', description: 'Manage tax settings' },
  TAX_REPORTS: { action: 'read', resource: 'tax_reports', description: 'View tax reports' },

  // Budget Management
  BUDGET_READ: { action: 'read', resource: 'budget', description: 'View budgets' },
  BUDGET_CREATE: { action: 'create', resource: 'budget', description: 'Create budgets' },
  BUDGET_APPROVE: { action: 'approve', resource: 'budget', description: 'Approve budgets' },
} as const;

// HRM Permissions (Extended from existing)
export const HRM_PERMISSIONS = {
  // Employee Management
  EMPLOYEE_READ: { action: 'read', resource: 'employee', description: 'View employees' },
  EMPLOYEE_CREATE: { action: 'create', resource: 'employee', description: 'Create employees' },
  EMPLOYEE_UPDATE: { action: 'update', resource: 'employee', description: 'Edit employees' },
  EMPLOYEE_DELETE: { action: 'delete', resource: 'employee', description: 'Delete employees' },

  // Payroll
  PAYROLL_READ: { action: 'read', resource: 'payroll', description: 'View payroll' },
  PAYROLL_PROCESS: { action: 'process', resource: 'payroll', description: 'Process payroll' },
  PAYROLL_APPROVE: { action: 'approve', resource: 'payroll', description: 'Approve payroll' },

  // Attendance
  ATTENDANCE_READ: { action: 'read', resource: 'attendance', description: 'View attendance' },
  ATTENDANCE_MANAGE: { action: 'manage', resource: 'attendance', description: 'Manage attendance' },

  // Leave Management
  LEAVE_READ: { action: 'read', resource: 'leave', description: 'View leave requests' },
  LEAVE_APPROVE: { action: 'approve', resource: 'leave', description: 'Approve leave requests' },

  // Performance
  PERFORMANCE_READ: {
    action: 'read',
    resource: 'performance',
    description: 'View performance reviews',
  },
  PERFORMANCE_MANAGE: {
    action: 'manage',
    resource: 'performance',
    description: 'Manage performance reviews',
  },

  // HR Reports
  HR_REPORTS: { action: 'read', resource: 'hr_reports', description: 'View HR reports' },
} as const;

// Project Management Permissions
export const PROJECT_PERMISSIONS = {
  // Project Management
  PROJECT_READ: { action: 'read', resource: 'project', description: 'View projects' },
  PROJECT_CREATE: { action: 'create', resource: 'project', description: 'Create projects' },
  PROJECT_UPDATE: { action: 'update', resource: 'project', description: 'Edit projects' },
  PROJECT_DELETE: { action: 'delete', resource: 'project', description: 'Delete projects' },
  PROJECT_MANAGE: { action: 'manage', resource: 'project', description: 'Manage projects' },

  // Task Management
  TASK_READ: { action: 'read', resource: 'task', description: 'View tasks' },
  TASK_CREATE: { action: 'create', resource: 'task', description: 'Create tasks' },
  TASK_UPDATE: { action: 'update', resource: 'task', description: 'Edit tasks' },
  TASK_ASSIGN: { action: 'assign', resource: 'task', description: 'Assign tasks' },
  TASK_COMPLETE: { action: 'complete', resource: 'task', description: 'Mark tasks complete' },

  // Team Management
  TEAM_READ: { action: 'read', resource: 'team', description: 'View teams' },
  TEAM_MANAGE: { action: 'manage', resource: 'team', description: 'Manage teams' },

  // Time Tracking
  TIME_TRACK: { action: 'create', resource: 'time_entry', description: 'Track time' },
  TIME_READ: { action: 'read', resource: 'time_entry', description: 'View time entries' },
  TIME_APPROVE: { action: 'approve', resource: 'time_entry', description: 'Approve time entries' },

  // Project Reports
  PROJECT_REPORTS: {
    action: 'read',
    resource: 'project_reports',
    description: 'View project reports',
  },
  RESOURCE_PLANNING: {
    action: 'read',
    resource: 'resource_planning',
    description: 'View resource planning',
  },
} as const;

// Manufacturing Permissions
export const MANUFACTURING_PERMISSIONS = {
  // Production Planning
  PRODUCTION_PLAN_READ: {
    action: 'read',
    resource: 'production_plan',
    description: 'View production plans',
  },
  PRODUCTION_PLAN_CREATE: {
    action: 'create',
    resource: 'production_plan',
    description: 'Create production plans',
  },
  PRODUCTION_PLAN_APPROVE: {
    action: 'approve',
    resource: 'production_plan',
    description: 'Approve production plans',
  },

  // Work Orders
  WORK_ORDER_READ: { action: 'read', resource: 'work_order', description: 'View work orders' },
  WORK_ORDER_CREATE: {
    action: 'create',
    resource: 'work_order',
    description: 'Create work orders',
  },
  WORK_ORDER_UPDATE: {
    action: 'update',
    resource: 'work_order',
    description: 'Update work orders',
  },
  WORK_ORDER_COMPLETE: {
    action: 'complete',
    resource: 'work_order',
    description: 'Complete work orders',
  },

  // Bill of Materials
  BOM_READ: { action: 'read', resource: 'bom', description: 'View bill of materials' },
  BOM_CREATE: { action: 'create', resource: 'bom', description: 'Create bill of materials' },
  BOM_UPDATE: { action: 'update', resource: 'bom', description: 'Edit bill of materials' },

  // Quality Control
  QC_READ: { action: 'read', resource: 'quality_control', description: 'View quality control' },
  QC_MANAGE: {
    action: 'manage',
    resource: 'quality_control',
    description: 'Manage quality control',
  },

  // Manufacturing Reports
  MFG_REPORTS: {
    action: 'read',
    resource: 'manufacturing_reports',
    description: 'View manufacturing reports',
  },
  EFFICIENCY_REPORTS: {
    action: 'read',
    resource: 'efficiency_reports',
    description: 'View efficiency reports',
  },
} as const;

// Marketing Permissions
export const MARKETING_PERMISSIONS = {
  // Campaign Management
  CAMPAIGN_READ: {
    action: 'read',
    resource: 'marketing_campaign',
    description: 'View marketing campaigns',
  },
  CAMPAIGN_CREATE: {
    action: 'create',
    resource: 'marketing_campaign',
    description: 'Create campaigns',
  },
  CAMPAIGN_MANAGE: {
    action: 'manage',
    resource: 'marketing_campaign',
    description: 'Manage campaigns',
  },

  // Content Management
  CONTENT_READ: { action: 'read', resource: 'content', description: 'View content' },
  CONTENT_CREATE: { action: 'create', resource: 'content', description: 'Create content' },
  CONTENT_PUBLISH: { action: 'publish', resource: 'content', description: 'Publish content' },

  // Social Media
  SOCIAL_MEDIA_READ: { action: 'read', resource: 'social_media', description: 'View social media' },
  SOCIAL_MEDIA_MANAGE: {
    action: 'manage',
    resource: 'social_media',
    description: 'Manage social media',
  },
  SOCIAL_MEDIA_POST: {
    action: 'post',
    resource: 'social_media',
    description: 'Post to social media',
  },

  // Email Marketing
  EMAIL_CAMPAIGN_READ: {
    action: 'read',
    resource: 'email_campaign',
    description: 'View email campaigns',
  },
  EMAIL_CAMPAIGN_CREATE: {
    action: 'create',
    resource: 'email_campaign',
    description: 'Create email campaigns',
  },
  EMAIL_CAMPAIGN_SEND: {
    action: 'send',
    resource: 'email_campaign',
    description: 'Send email campaigns',
  },

  // Marketing Analytics
  MARKETING_ANALYTICS: {
    action: 'read',
    resource: 'marketing_analytics',
    description: 'View marketing analytics',
  },
  MARKETING_REPORTS: {
    action: 'read',
    resource: 'marketing_reports',
    description: 'View marketing reports',
  },
} as const;

// Customer Support Permissions
export const SUPPORT_PERMISSIONS = {
  // Ticket Management
  TICKET_READ: { action: 'read', resource: 'ticket', description: 'View support tickets' },
  TICKET_CREATE: { action: 'create', resource: 'ticket', description: 'Create tickets' },
  TICKET_UPDATE: { action: 'update', resource: 'ticket', description: 'Update tickets' },
  TICKET_ASSIGN: { action: 'assign', resource: 'ticket', description: 'Assign tickets' },
  TICKET_CLOSE: { action: 'close', resource: 'ticket', description: 'Close tickets' },

  // Knowledge Base
  KB_READ: { action: 'read', resource: 'knowledge_base', description: 'View knowledge base' },
  KB_CREATE: { action: 'create', resource: 'knowledge_base', description: 'Create KB articles' },
  KB_UPDATE: { action: 'update', resource: 'knowledge_base', description: 'Edit KB articles' },
  KB_PUBLISH: { action: 'publish', resource: 'knowledge_base', description: 'Publish KB articles' },

  // Customer Communication
  CUSTOMER_CHAT: {
    action: 'chat',
    resource: 'customer_communication',
    description: 'Chat with customers',
  },
  CUSTOMER_EMAIL: {
    action: 'email',
    resource: 'customer_communication',
    description: 'Email customers',
  },

  // Support Reports
  SUPPORT_REPORTS: {
    action: 'read',
    resource: 'support_reports',
    description: 'View support reports',
  },
  SLA_REPORTS: { action: 'read', resource: 'sla_reports', description: 'View SLA reports' },
} as const;

// Analytics & Reporting Permissions
export const ANALYTICS_PERMISSIONS = {
  // Dashboard Access
  DASHBOARD_READ: { action: 'read', resource: 'dashboard', description: 'View dashboards' },
  DASHBOARD_CREATE: { action: 'create', resource: 'dashboard', description: 'Create dashboards' },
  DASHBOARD_CUSTOMIZE: {
    action: 'customize',
    resource: 'dashboard',
    description: 'Customize dashboards',
  },

  // Reports
  REPORT_READ: { action: 'read', resource: 'report', description: 'View reports' },
  REPORT_CREATE: { action: 'create', resource: 'report', description: 'Create reports' },
  REPORT_EXPORT: { action: 'export', resource: 'report', description: 'Export reports' },
  REPORT_SCHEDULE: { action: 'schedule', resource: 'report', description: 'Schedule reports' },

  // Data Analysis
  DATA_ANALYSIS: { action: 'analyze', resource: 'data', description: 'Perform data analysis' },
  ADVANCED_ANALYTICS: {
    action: 'advanced_analyze',
    resource: 'data',
    description: 'Advanced analytics',
  },

  // Business Intelligence
  BI_READ: { action: 'read', resource: 'business_intelligence', description: 'View BI reports' },
  BI_CREATE: {
    action: 'create',
    resource: 'business_intelligence',
    description: 'Create BI reports',
  },
} as const;

// E-commerce Permissions
export const ECOMMERCE_PERMISSIONS = {
  // Product Catalog
  CATALOG_READ: { action: 'read', resource: 'catalog', description: 'View product catalog' },
  CATALOG_MANAGE: { action: 'manage', resource: 'catalog', description: 'Manage product catalog' },

  // Online Orders
  ONLINE_ORDER_READ: {
    action: 'read',
    resource: 'online_order',
    description: 'View online orders',
  },
  ONLINE_ORDER_PROCESS: {
    action: 'process',
    resource: 'online_order',
    description: 'Process online orders',
  },
  ONLINE_ORDER_FULFILL: {
    action: 'fulfill',
    resource: 'online_order',
    description: 'Fulfill orders',
  },

  // Website Management
  WEBSITE_READ: { action: 'read', resource: 'website', description: 'View website' },
  WEBSITE_MANAGE: { action: 'manage', resource: 'website', description: 'Manage website' },
  WEBSITE_DESIGN: { action: 'design', resource: 'website', description: 'Design website' },

  // SEO & Marketing
  SEO_READ: { action: 'read', resource: 'seo', description: 'View SEO data' },
  SEO_MANAGE: { action: 'manage', resource: 'seo', description: 'Manage SEO' },

  // E-commerce Analytics
  ECOMMERCE_ANALYTICS: {
    action: 'read',
    resource: 'ecommerce_analytics',
    description: 'View e-commerce analytics',
  },
  CONVERSION_REPORTS: {
    action: 'read',
    resource: 'conversion_reports',
    description: 'View conversion reports',
  },
} as const;

// ==============================================
// COMBINED PERMISSIONS
// ==============================================

export const ALL_MODULE_PERMISSIONS = {
  ...SALES_PERMISSIONS,
  ...CRM_PERMISSIONS,
  ...INVENTORY_PERMISSIONS,
  ...FINANCE_PERMISSIONS,
  ...HRM_PERMISSIONS,
  ...PROJECT_PERMISSIONS,
  ...MANUFACTURING_PERMISSIONS,
  ...MARKETING_PERMISSIONS,
  ...SUPPORT_PERMISSIONS,
  ...ANALYTICS_PERMISSIONS,
  ...ECOMMERCE_PERMISSIONS,
} as const;

// ==============================================
// PREDEFINED ROLES
// ==============================================

export const SYSTEM_ROLES: UserRole[] = [
  // Super Administrator
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access across all modules',
    level: 10,
    modules: [
      'sales',
      'crm',
      'inventory',
      'finance',
      'hrm',
      'projects',
      'manufacturing',
      'marketing',
      'support',
      'analytics',
      'ecommerce',
    ],
    permissions: Object.values(ALL_MODULE_PERMISSIONS).map((permission) => ({
      ...permission,
      scope: 'all' as const,
    })),
  },

  // Department Managers
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Full access to sales and CRM modules',
    level: 8,
    modules: ['sales', 'crm', 'analytics'],
    permissions: [
      // Sales permissions
      ...Object.values(SALES_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      // CRM permissions
      ...Object.values(CRM_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      // Analytics permissions (limited)
      { ...ANALYTICS_PERMISSIONS.DASHBOARD_READ, scope: 'department' as const },
      { ...ANALYTICS_PERMISSIONS.REPORT_READ, scope: 'department' as const },
    ],
  },

  {
    id: 'finance_manager',
    name: 'Finance Manager',
    description: 'Full access to finance and accounting',
    level: 8,
    modules: ['finance', 'analytics'],
    permissions: [
      ...Object.values(FINANCE_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      { ...ANALYTICS_PERMISSIONS.DASHBOARD_READ, scope: 'department' as const },
      { ...ANALYTICS_PERMISSIONS.REPORT_READ, scope: 'department' as const },
    ],
  },

  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Full access to human resources',
    level: 8,
    modules: ['hrm', 'analytics'],
    permissions: [
      ...Object.values(HRM_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      { ...ANALYTICS_PERMISSIONS.DASHBOARD_READ, scope: 'department' as const },
      { ...ANALYTICS_PERMISSIONS.REPORT_READ, scope: 'department' as const },
    ],
  },

  {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Access to inventory, manufacturing, and projects',
    level: 8,
    modules: ['inventory', 'manufacturing', 'projects', 'analytics'],
    permissions: [
      ...Object.values(INVENTORY_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      ...Object.values(MANUFACTURING_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      ...Object.values(PROJECT_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      { ...ANALYTICS_PERMISSIONS.DASHBOARD_READ, scope: 'department' as const },
    ],
  },

  {
    id: 'marketing_manager',
    name: 'Marketing Manager',
    description: 'Access to marketing and e-commerce',
    level: 7,
    modules: ['marketing', 'ecommerce', 'analytics'],
    permissions: [
      ...Object.values(MARKETING_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      ...Object.values(ECOMMERCE_PERMISSIONS).map((p) => ({ ...p, scope: 'all' as const })),
      { ...ANALYTICS_PERMISSIONS.DASHBOARD_READ, scope: 'department' as const },
    ],
  },

  // Staff Roles
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    description: 'Sales team member with limited access',
    level: 5,
    modules: ['sales', 'crm'],
    permissions: [
      { ...SALES_PERMISSIONS.ORDER_READ, scope: 'own' as const },
      { ...SALES_PERMISSIONS.ORDER_CREATE, scope: 'own' as const },
      { ...SALES_PERMISSIONS.ORDER_UPDATE, scope: 'own' as const },
      { ...SALES_PERMISSIONS.QUOTE_READ, scope: 'own' as const },
      { ...SALES_PERMISSIONS.QUOTE_CREATE, scope: 'own' as const },
      { ...CRM_PERMISSIONS.CUSTOMER_READ, scope: 'own' as const },
      { ...CRM_PERMISSIONS.CUSTOMER_UPDATE, scope: 'own' as const },
      { ...CRM_PERMISSIONS.LEAD_READ, scope: 'own' as const },
      { ...CRM_PERMISSIONS.LEAD_UPDATE, scope: 'own' as const },
    ],
  },

  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Finance team member',
    level: 6,
    modules: ['finance'],
    permissions: [
      { ...FINANCE_PERMISSIONS.INVOICE_READ, scope: 'all' as const },
      { ...FINANCE_PERMISSIONS.INVOICE_CREATE, scope: 'all' as const },
      { ...FINANCE_PERMISSIONS.PAYMENT_READ, scope: 'all' as const },
      { ...FINANCE_PERMISSIONS.PAYMENT_CREATE, scope: 'all' as const },
      { ...FINANCE_PERMISSIONS.FINANCIAL_REPORTS, scope: 'all' as const },
      { ...FINANCE_PERMISSIONS.JOURNAL_ENTRY, scope: 'all' as const },
    ],
  },

  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Project management role',
    level: 6,
    modules: ['projects'],
    permissions: [
      ...Object.values(PROJECT_PERMISSIONS).map((p) => ({ ...p, scope: 'team' as const })),
    ],
  },

  {
    id: 'employee',
    name: 'Employee',
    description: 'Standard employee access',
    level: 3,
    modules: ['hrm'],
    permissions: [
      { ...HRM_PERMISSIONS.EMPLOYEE_READ, scope: 'own' as const },
      { ...HRM_PERMISSIONS.EMPLOYEE_UPDATE, scope: 'own' as const },
      { ...HRM_PERMISSIONS.ATTENDANCE_READ, scope: 'own' as const },
      { ...HRM_PERMISSIONS.LEAVE_READ, scope: 'own' as const },
      { ...PROJECT_PERMISSIONS.TASK_READ, scope: 'own' as const },
      { ...PROJECT_PERMISSIONS.TASK_UPDATE, scope: 'own' as const },
      { ...PROJECT_PERMISSIONS.TIME_TRACK, scope: 'own' as const },
    ],
  },

  {
    id: 'support_agent',
    name: 'Support Agent',
    description: 'Customer support team member',
    level: 4,
    modules: ['support'],
    permissions: [
      ...Object.values(SUPPORT_PERMISSIONS).map((p) => ({ ...p, scope: 'department' as const })),
    ],
  },

  {
    id: 'warehouse_staff',
    name: 'Warehouse Staff',
    description: 'Inventory and warehouse management',
    level: 4,
    modules: ['inventory'],
    permissions: [
      { ...INVENTORY_PERMISSIONS.PRODUCT_READ, scope: 'all' as const },
      { ...INVENTORY_PERMISSIONS.STOCK_READ, scope: 'all' as const },
      { ...INVENTORY_PERMISSIONS.STOCK_UPDATE, scope: 'department' as const },
      { ...INVENTORY_PERMISSIONS.WAREHOUSE_READ, scope: 'department' as const },
    ],
  },
];

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

export const getModulePermissions = (moduleNames: string[]): ModulePermission[] => {
  const permissions: ModulePermission[] = [];

  moduleNames.forEach((moduleName) => {
    switch (moduleName) {
      case 'sales':
        permissions.push(...Object.values(SALES_PERMISSIONS));
        break;
      case 'crm':
        permissions.push(...Object.values(CRM_PERMISSIONS));
        break;
      case 'inventory':
        permissions.push(...Object.values(INVENTORY_PERMISSIONS));
        break;
      case 'finance':
        permissions.push(...Object.values(FINANCE_PERMISSIONS));
        break;
      case 'hrm':
        permissions.push(...Object.values(HRM_PERMISSIONS));
        break;
      case 'projects':
        permissions.push(...Object.values(PROJECT_PERMISSIONS));
        break;
      case 'manufacturing':
        permissions.push(...Object.values(MANUFACTURING_PERMISSIONS));
        break;
      case 'marketing':
        permissions.push(...Object.values(MARKETING_PERMISSIONS));
        break;
      case 'support':
        permissions.push(...Object.values(SUPPORT_PERMISSIONS));
        break;
      case 'analytics':
        permissions.push(...Object.values(ANALYTICS_PERMISSIONS));
        break;
      case 'ecommerce':
        permissions.push(...Object.values(ECOMMERCE_PERMISSIONS));
        break;
    }
  });

  return permissions;
};

export const getRoleByLevel = (level: number): UserRole[] => {
  return SYSTEM_ROLES.filter((role) => role.level <= level);
};

export const hasModuleAccess = (userRole: UserRole, moduleName: string): boolean => {
  return userRole.modules.includes(moduleName);
};

export const hasPermission = (
  userRole: UserRole,
  action: string,
  resource: string,
  scope?: string
): boolean => {
  return userRole.permissions.some(
    (permission) =>
      permission.action === action &&
      permission.resource === resource &&
      (!scope || permission.scope === scope || permission.scope === 'all')
  );
};

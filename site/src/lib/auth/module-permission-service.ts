// Comprehensive Permission Service for All Modules
import { useState, useEffect } from 'react';
import {
  ModulePermission,
  UserRole,
  ALL_MODULE_PERMISSIONS,
  SYSTEM_ROLES,
  hasModuleAccess,
  hasPermission,
  getModulePermissions,
} from './modules-permissions';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  departmentId?: string;
  teamId?: string;
  isActive: boolean;
}

export class ModulePermissionService {
  private userRole: UserRole | null = null;
  private user: User | null = null;

  constructor(user: User) {
    this.user = user;
    this.userRole = SYSTEM_ROLES.find(role => role.id === user.roleId) || null;
  }

  // ==============================================
  // CORE PERMISSION CHECKING
  // ==============================================

  /**
   * Check if user has specific permission
   */
  hasPermission(
    action: string,
    resource: string,
    targetScope?: 'own' | 'department' | 'team' | 'all',
    targetUserId?: string,
    targetDepartmentId?: string,
    targetTeamId?: string
  ): boolean {
    if (!this.userRole) return false;

    const permission = this.userRole.permissions.find(
      p => p.action === action && p.resource === resource
    );

    if (!permission) return false;

    // Check scope restrictions
    return this.checkScope(permission, targetScope, targetUserId, targetDepartmentId, targetTeamId);
  }

  /**
   * Check if user can access a specific module
   */
  canAccessModule(moduleName: string): boolean {
    if (!this.userRole) return false;
    return hasModuleAccess(this.userRole, moduleName);
  }

  /**
   * Get all accessible modules for the user
   */
  getAccessibleModules(): string[] {
    if (!this.userRole) return [];
    return this.userRole.modules;
  }

  /**
   * Check permission scope
   */
  private checkScope(
    permission: ModulePermission,
    targetScope?: string,
    targetUserId?: string,
    targetDepartmentId?: string,
    targetTeamId?: string
  ): boolean {
    switch (permission.scope) {
      case 'own':
        return targetUserId === this.user?.id;
      case 'department':
        return targetDepartmentId === this.user?.departmentId;
      case 'team':
        return targetTeamId === this.user?.teamId;
      case 'all':
        return true;
      default:
        return true;
    }
  }

  // ==============================================
  // SALES MODULE PERMISSIONS
  // ==============================================

  // Order Management
  canReadOrders(scope?: string, targetUserId?: string): boolean {
    return this.hasPermission('read', 'order', scope as any, targetUserId);
  }

  canCreateOrders(): boolean {
    return this.hasPermission('create', 'order');
  }

  canUpdateOrders(targetUserId?: string): boolean {
    return this.hasPermission('update', 'order', undefined, targetUserId);
  }

  canDeleteOrders(): boolean {
    return this.hasPermission('delete', 'order');
  }

  canApproveOrders(): boolean {
    return this.hasPermission('approve', 'order');
  }

  // Sales Pipeline
  canManagePipeline(): boolean {
    return this.hasPermission('manage', 'pipeline');
  }

  // Sales Reports
  canViewSalesReports(): boolean {
    return this.hasPermission('read', 'sales_reports');
  }

  canViewSalesAnalytics(): boolean {
    return this.hasPermission('read', 'sales_analytics');
  }

  // ==============================================
  // CRM MODULE PERMISSIONS
  // ==============================================

  // Customer Management
  canReadCustomers(scope?: string): boolean {
    return this.hasPermission('read', 'customer', scope as any);
  }

  canCreateCustomers(): boolean {
    return this.hasPermission('create', 'customer');
  }

  canUpdateCustomers(targetUserId?: string): boolean {
    return this.hasPermission('update', 'customer', undefined, targetUserId);
  }

  canDeleteCustomers(): boolean {
    return this.hasPermission('delete', 'customer');
  }

  canImportCustomers(): boolean {
    return this.hasPermission('import', 'customer');
  }

  canExportCustomers(): boolean {
    return this.hasPermission('export', 'customer');
  }

  // Lead Management
  canReadLeads(scope?: string): boolean {
    return this.hasPermission('read', 'lead', scope as any);
  }

  canCreateLeads(): boolean {
    return this.hasPermission('create', 'lead');
  }

  canAssignLeads(): boolean {
    return this.hasPermission('assign', 'lead');
  }

  canConvertLeads(): boolean {
    return this.hasPermission('convert', 'lead');
  }

  // Campaign Management
  canManageCampaigns(): boolean {
    return this.hasPermission('manage', 'campaign');
  }

  // ==============================================
  // INVENTORY MODULE PERMISSIONS
  // ==============================================

  // Product Management
  canReadProducts(): boolean {
    return this.hasPermission('read', 'product');
  }

  canCreateProducts(): boolean {
    return this.hasPermission('create', 'product');
  }

  canUpdateProducts(): boolean {
    return this.hasPermission('update', 'product');
  }

  canDeleteProducts(): boolean {
    return this.hasPermission('delete', 'product');
  }

  // Stock Management
  canReadStock(): boolean {
    return this.hasPermission('read', 'stock');
  }

  canUpdateStock(): boolean {
    return this.hasPermission('update', 'stock');
  }

  canTransferStock(): boolean {
    return this.hasPermission('transfer', 'stock');
  }

  // Warehouse Management
  canManageWarehouses(): boolean {
    return this.hasPermission('manage', 'warehouse');
  }

  // Purchase Orders
  canCreatePurchaseOrders(): boolean {
    return this.hasPermission('create', 'purchase_order');
  }

  canApprovePurchaseOrders(): boolean {
    return this.hasPermission('approve', 'purchase_order');
  }

  // ==============================================
  // FINANCE MODULE PERMISSIONS
  // ==============================================

  // Invoice Management
  canReadInvoices(): boolean {
    return this.hasPermission('read', 'invoice');
  }

  canCreateInvoices(): boolean {
    return this.hasPermission('create', 'invoice');
  }

  canApproveInvoices(): boolean {
    return this.hasPermission('approve', 'invoice');
  }

  canSendInvoices(): boolean {
    return this.hasPermission('send', 'invoice');
  }

  // Payment Management
  canReadPayments(): boolean {
    return this.hasPermission('read', 'payment');
  }

  canCreatePayments(): boolean {
    return this.hasPermission('create', 'payment');
  }

  canApprovePayments(): boolean {
    return this.hasPermission('approve', 'payment');
  }

  // Financial Reports
  canViewFinancialReports(): boolean {
    return this.hasPermission('read', 'financial_reports');
  }

  canViewCashFlow(): boolean {
    return this.hasPermission('read', 'cash_flow');
  }

  canViewProfitLoss(): boolean {
    return this.hasPermission('read', 'profit_loss');
  }

  canViewBalanceSheet(): boolean {
    return this.hasPermission('read', 'balance_sheet');
  }

  // Account Management
  canManageAccounts(): boolean {
    return this.hasPermission('manage', 'account');
  }

  canCreateJournalEntries(): boolean {
    return this.hasPermission('create', 'journal_entry');
  }

  // Tax Management
  canManageTax(): boolean {
    return this.hasPermission('manage', 'tax');
  }

  canViewTaxReports(): boolean {
    return this.hasPermission('read', 'tax_reports');
  }

  // Budget Management
  canCreateBudgets(): boolean {
    return this.hasPermission('create', 'budget');
  }

  canApproveBudgets(): boolean {
    return this.hasPermission('approve', 'budget');
  }

  // ==============================================
  // HRM MODULE PERMISSIONS
  // ==============================================

  // Employee Management
  canReadEmployees(scope?: string, targetUserId?: string): boolean {
    return this.hasPermission('read', 'employee', scope as any, targetUserId);
  }

  canCreateEmployees(): boolean {
    return this.hasPermission('create', 'employee');
  }

  canUpdateEmployees(targetUserId?: string): boolean {
    return this.hasPermission('update', 'employee', undefined, targetUserId);
  }

  canDeleteEmployees(): boolean {
    return this.hasPermission('delete', 'employee');
  }

  // Payroll
  canReadPayroll(scope?: string): boolean {
    return this.hasPermission('read', 'payroll', scope as any);
  }

  canProcessPayroll(): boolean {
    return this.hasPermission('process', 'payroll');
  }

  canApprovePayroll(): boolean {
    return this.hasPermission('approve', 'payroll');
  }

  // Attendance
  canReadAttendance(scope?: string): boolean {
    return this.hasPermission('read', 'attendance', scope as any);
  }

  canManageAttendance(): boolean {
    return this.hasPermission('manage', 'attendance');
  }

  // Leave Management
  canReadLeaveRequests(): boolean {
    return this.hasPermission('read', 'leave');
  }

  canApproveLeaveRequests(): boolean {
    return this.hasPermission('approve', 'leave');
  }

  // Performance
  canReadPerformance(): boolean {
    return this.hasPermission('read', 'performance');
  }

  canManagePerformance(): boolean {
    return this.hasPermission('manage', 'performance');
  }

  // ==============================================
  // PROJECT MODULE PERMISSIONS
  // ==============================================

  // Project Management
  canReadProjects(): boolean {
    return this.hasPermission('read', 'project');
  }

  canCreateProjects(): boolean {
    return this.hasPermission('create', 'project');
  }

  canUpdateProjects(): boolean {
    return this.hasPermission('update', 'project');
  }

  canDeleteProjects(): boolean {
    return this.hasPermission('delete', 'project');
  }

  canManageProjects(): boolean {
    return this.hasPermission('manage', 'project');
  }

  // Task Management
  canReadTasks(): boolean {
    return this.hasPermission('read', 'task');
  }

  canCreateTasks(): boolean {
    return this.hasPermission('create', 'task');
  }

  canUpdateTasks(): boolean {
    return this.hasPermission('update', 'task');
  }

  canAssignTasks(): boolean {
    return this.hasPermission('assign', 'task');
  }

  canCompleteTasks(): boolean {
    return this.hasPermission('complete', 'task');
  }

  // Team Management
  canManageTeams(): boolean {
    return this.hasPermission('manage', 'team');
  }

  // Time Tracking
  canTrackTime(): boolean {
    return this.hasPermission('create', 'time_entry');
  }

  canReadTimeEntries(): boolean {
    return this.hasPermission('read', 'time_entry');
  }

  canApproveTimeEntries(): boolean {
    return this.hasPermission('approve', 'time_entry');
  }

  // ==============================================
  // MANUFACTURING MODULE PERMISSIONS
  // ==============================================

  // Production Planning
  canReadProductionPlans(): boolean {
    return this.hasPermission('read', 'production_plan');
  }

  canCreateProductionPlans(): boolean {
    return this.hasPermission('create', 'production_plan');
  }

  canApproveProductionPlans(): boolean {
    return this.hasPermission('approve', 'production_plan');
  }

  // Work Orders
  canReadWorkOrders(): boolean {
    return this.hasPermission('read', 'work_order');
  }

  canCreateWorkOrders(): boolean {
    return this.hasPermission('create', 'work_order');
  }

  canCompleteWorkOrders(): boolean {
    return this.hasPermission('complete', 'work_order');
  }

  // Bill of Materials
  canReadBOM(): boolean {
    return this.hasPermission('read', 'bom');
  }

  canCreateBOM(): boolean {
    return this.hasPermission('create', 'bom');
  }

  // Quality Control
  canManageQualityControl(): boolean {
    return this.hasPermission('manage', 'quality_control');
  }

  // ==============================================
  // MARKETING MODULE PERMISSIONS
  // ==============================================

  // Campaign Management
  canReadMarketingCampaigns(): boolean {
    return this.hasPermission('read', 'marketing_campaign');
  }

  canCreateMarketingCampaigns(): boolean {
    return this.hasPermission('create', 'marketing_campaign');
  }

  canManageMarketingCampaigns(): boolean {
    return this.hasPermission('manage', 'marketing_campaign');
  }

  // Content Management
  canCreateContent(): boolean {
    return this.hasPermission('create', 'content');
  }

  canPublishContent(): boolean {
    return this.hasPermission('publish', 'content');
  }

  // Social Media
  canManageSocialMedia(): boolean {
    return this.hasPermission('manage', 'social_media');
  }

  canPostToSocialMedia(): boolean {
    return this.hasPermission('post', 'social_media');
  }

  // Email Marketing
  canCreateEmailCampaigns(): boolean {
    return this.hasPermission('create', 'email_campaign');
  }

  canSendEmailCampaigns(): boolean {
    return this.hasPermission('send', 'email_campaign');
  }

  // ==============================================
  // SUPPORT MODULE PERMISSIONS
  // ==============================================

  // Ticket Management
  canReadTickets(): boolean {
    return this.hasPermission('read', 'ticket');
  }

  canCreateTickets(): boolean {
    return this.hasPermission('create', 'ticket');
  }

  canUpdateTickets(): boolean {
    return this.hasPermission('update', 'ticket');
  }

  canAssignTickets(): boolean {
    return this.hasPermission('assign', 'ticket');
  }

  canCloseTickets(): boolean {
    return this.hasPermission('close', 'ticket');
  }

  // Knowledge Base
  canCreateKBArticles(): boolean {
    return this.hasPermission('create', 'knowledge_base');
  }

  canPublishKBArticles(): boolean {
    return this.hasPermission('publish', 'knowledge_base');
  }

  // Customer Communication
  canChatWithCustomers(): boolean {
    return this.hasPermission('chat', 'customer_communication');
  }

  canEmailCustomers(): boolean {
    return this.hasPermission('email', 'customer_communication');
  }

  // ==============================================
  // ANALYTICS MODULE PERMISSIONS
  // ==============================================

  // Dashboard
  canReadDashboards(): boolean {
    return this.hasPermission('read', 'dashboard');
  }

  canCreateDashboards(): boolean {
    return this.hasPermission('create', 'dashboard');
  }

  canCustomizeDashboards(): boolean {
    return this.hasPermission('customize', 'dashboard');
  }

  // Reports
  canReadReports(): boolean {
    return this.hasPermission('read', 'report');
  }

  canCreateReports(): boolean {
    return this.hasPermission('create', 'report');
  }

  canExportReports(): boolean {
    return this.hasPermission('export', 'report');
  }

  canScheduleReports(): boolean {
    return this.hasPermission('schedule', 'report');
  }

  // Data Analysis
  canPerformDataAnalysis(): boolean {
    return this.hasPermission('analyze', 'data');
  }

  canPerformAdvancedAnalytics(): boolean {
    return this.hasPermission('advanced_analyze', 'data');
  }

  // Business Intelligence
  canReadBI(): boolean {
    return this.hasPermission('read', 'business_intelligence');
  }

  canCreateBI(): boolean {
    return this.hasPermission('create', 'business_intelligence');
  }

  // ==============================================
  // E-COMMERCE MODULE PERMISSIONS
  // ==============================================

  // Product Catalog
  canManageCatalog(): boolean {
    return this.hasPermission('manage', 'catalog');
  }

  // Online Orders
  canReadOnlineOrders(): boolean {
    return this.hasPermission('read', 'online_order');
  }

  canProcessOnlineOrders(): boolean {
    return this.hasPermission('process', 'online_order');
  }

  canFulfillOrders(): boolean {
    return this.hasPermission('fulfill', 'online_order');
  }

  // Website Management
  canManageWebsite(): boolean {
    return this.hasPermission('manage', 'website');
  }

  canDesignWebsite(): boolean {
    return this.hasPermission('design', 'website');
  }

  // SEO
  canManageSEO(): boolean {
    return this.hasPermission('manage', 'seo');
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  /**
   * Get user role information
   */
  getUserRole(): UserRole | null {
    return this.userRole;
  }

  /**
   * Get user permission level
   */
  getPermissionLevel(): number {
    return this.userRole?.level || 0;
  }

  /**
   * Check if user has sufficient permission level
   */
  hasPermissionLevel(requiredLevel: number): boolean {
    return this.getPermissionLevel() >= requiredLevel;
  }

  /**
   * Get all user permissions
   */
  getAllPermissions(): ModulePermission[] {
    return this.userRole?.permissions || [];
  }

  /**
   * Check if user is admin (level 8+)
   */
  isAdmin(): boolean {
    return this.getPermissionLevel() >= 8;
  }

  /**
   * Check if user is super admin (level 10)
   */
  isSuperAdmin(): boolean {
    return this.getPermissionLevel() >= 10;
  }

  /**
   * Get authorized navigation for all modules
   */
  getAuthorizedNavigation(): Array<{
    module: string;
    name: string;
    href: string;
    permission: () => boolean;
  }> {
    const navigation = [
      // Sales Module
      {
        module: 'sales',
        name: 'Dashboard',
        href: '/sales',
        permission: () => this.canAccessModule('sales'),
      },
      {
        module: 'sales',
        name: 'Orders',
        href: '/sales/orders',
        permission: () => this.canReadOrders(),
      },
      {
        module: 'sales',
        name: 'Pipeline',
        href: '/sales/pipeline',
        permission: () => this.canManagePipeline(),
      },
      {
        module: 'sales',
        name: 'Reports',
        href: '/sales/reports',
        permission: () => this.canViewSalesReports(),
      },

      // CRM Module
      {
        module: 'crm',
        name: 'Dashboard',
        href: '/admin/crm',
        permission: () => this.canAccessModule('crm'),
      },
      {
        module: 'crm',
        name: 'Customers',
        href: '/admin/crm/customers',
        permission: () => this.canReadCustomers(),
      },
      {
        module: 'crm',
        name: 'Leads',
        href: '/admin/crm/leads',
        permission: () => this.canReadLeads(),
      },
      {
        module: 'crm',
        name: 'Campaigns',
        href: '/admin/crm/campaigns',
        permission: () => this.canManageCampaigns(),
      },

      // Inventory Module
      {
        module: 'inventory',
        name: 'Dashboard',
        href: '/inventory',
        permission: () => this.canAccessModule('inventory'),
      },
      {
        module: 'inventory',
        name: 'Products',
        href: '/inventory/products',
        permission: () => this.canReadProducts(),
      },
      {
        module: 'inventory',
        name: 'Stock',
        href: '/inventory/stock',
        permission: () => this.canReadStock(),
      },
      {
        module: 'inventory',
        name: 'Warehouses',
        href: '/inventory/warehouses',
        permission: () => this.canManageWarehouses(),
      },

      // Finance Module
      {
        module: 'finance',
        name: 'Dashboard',
        href: '/finance',
        permission: () => this.canAccessModule('finance'),
      },
      {
        module: 'finance',
        name: 'Invoices',
        href: '/finance/invoices',
        permission: () => this.canReadInvoices(),
      },
      {
        module: 'finance',
        name: 'Payments',
        href: '/finance/payments',
        permission: () => this.canReadPayments(),
      },
      {
        module: 'finance',
        name: 'Reports',
        href: '/finance/reports',
        permission: () => this.canViewFinancialReports(),
      },

      // HRM Module
      {
        module: 'hrm',
        name: 'Dashboard',
        href: '/hrm',
        permission: () => this.canAccessModule('hrm'),
      },
      {
        module: 'hrm',
        name: 'Employees',
        href: '/hrm/employees',
        permission: () => this.canReadEmployees(),
      },
      {
        module: 'hrm',
        name: 'Payroll',
        href: '/hrm/payroll',
        permission: () => this.canReadPayroll(),
      },
      {
        module: 'hrm',
        name: 'Attendance',
        href: '/hrm/attendance',
        permission: () => this.canReadAttendance(),
      },

      // Projects Module
      {
        module: 'projects',
        name: 'Dashboard',
        href: '/projects',
        permission: () => this.canAccessModule('projects'),
      },
      {
        module: 'projects',
        name: 'Projects',
        href: '/projects/list',
        permission: () => this.canReadProjects(),
      },
      {
        module: 'projects',
        name: 'Tasks',
        href: '/projects/tasks',
        permission: () => this.canReadTasks(),
      },
      {
        module: 'projects',
        name: 'Teams',
        href: '/projects/teams',
        permission: () => this.canManageTeams(),
      },

      // Manufacturing Module
      {
        module: 'manufacturing',
        name: 'Dashboard',
        href: '/manufacturing',
        permission: () => this.canAccessModule('manufacturing'),
      },
      {
        module: 'manufacturing',
        name: 'Production Plans',
        href: '/manufacturing/production-plans',
        permission: () => this.canReadProductionPlans(),
      },
      {
        module: 'manufacturing',
        name: 'Work Orders',
        href: '/manufacturing/work-orders',
        permission: () => this.canReadWorkOrders(),
      },
      {
        module: 'manufacturing',
        name: 'Quality Control',
        href: '/manufacturing/quality-control',
        permission: () => this.canManageQualityControl(),
      },

      // Marketing Module
      {
        module: 'marketing',
        name: 'Dashboard',
        href: '/marketing',
        permission: () => this.canAccessModule('marketing'),
      },
      {
        module: 'marketing',
        name: 'Campaigns',
        href: '/marketing/campaigns',
        permission: () => this.canReadMarketingCampaigns(),
      },
      {
        module: 'marketing',
        name: 'Content',
        href: '/marketing/content',
        permission: () => this.canCreateContent(),
      },
      {
        module: 'marketing',
        name: 'Social Media',
        href: '/marketing/social-media',
        permission: () => this.canManageSocialMedia(),
      },

      // Support Module
      {
        module: 'support',
        name: 'Dashboard',
        href: '/support',
        permission: () => this.canAccessModule('support'),
      },
      {
        module: 'support',
        name: 'Tickets',
        href: '/support/tickets',
        permission: () => this.canReadTickets(),
      },
      {
        module: 'support',
        name: 'Knowledge Base',
        href: '/support/knowledge-base',
        permission: () => this.canCreateKBArticles(),
      },

      // Analytics Module
      {
        module: 'analytics',
        name: 'Dashboard',
        href: '/analytics',
        permission: () => this.canAccessModule('analytics'),
      },
      {
        module: 'analytics',
        name: 'Reports',
        href: '/analytics/reports',
        permission: () => this.canReadReports(),
      },
      {
        module: 'analytics',
        name: 'Business Intelligence',
        href: '/analytics/business-intelligence',
        permission: () => this.canReadBI(),
      },

      // E-commerce Module
      {
        module: 'ecommerce',
        name: 'Dashboard',
        href: '/ecommerce',
        permission: () => this.canAccessModule('ecommerce'),
      },
      {
        module: 'ecommerce',
        name: 'Catalog',
        href: '/ecommerce/catalog',
        permission: () => this.canManageCatalog(),
      },
      {
        module: 'ecommerce',
        name: 'Orders',
        href: '/ecommerce/orders',
        permission: () => this.canReadOnlineOrders(),
      },
      {
        module: 'ecommerce',
        name: 'Website',
        href: '/ecommerce/website',
        permission: () => this.canManageWebsite(),
      },
    ];

    return navigation.filter(item => item.permission());
  }
}

// ==============================================
// REACT HOOKS
// ==============================================

/**
 * React hook for module permissions
 */
export const useModulePermissions = (user: User) => {
  const permissionService = new ModulePermissionService(user);

  return {
    // Core methods
    hasPermission: (action: string, resource: string, scope?: any, targetUserId?: string) =>
      permissionService.hasPermission(action, resource, scope, targetUserId),
    canAccessModule: (moduleName: string) => permissionService.canAccessModule(moduleName),
    getAccessibleModules: () => permissionService.getAccessibleModules(),

    // Sales permissions
    canReadOrders: (scope?: string, targetUserId?: string) =>
      permissionService.canReadOrders(scope, targetUserId),
    canCreateOrders: () => permissionService.canCreateOrders(),
    canManagePipeline: () => permissionService.canManagePipeline(),
    canViewSalesReports: () => permissionService.canViewSalesReports(),

    // CRM permissions
    canReadCustomers: (scope?: string) => permissionService.canReadCustomers(scope),
    canCreateCustomers: () => permissionService.canCreateCustomers(),
    canReadLeads: (scope?: string) => permissionService.canReadLeads(scope),
    canManageCampaigns: () => permissionService.canManageCampaigns(),

    // Inventory permissions
    canReadProducts: () => permissionService.canReadProducts(),
    canCreateProducts: () => permissionService.canCreateProducts(),
    canReadStock: () => permissionService.canReadStock(),
    canManageWarehouses: () => permissionService.canManageWarehouses(),

    // Finance permissions
    canReadInvoices: () => permissionService.canReadInvoices(),
    canCreateInvoices: () => permissionService.canCreateInvoices(),
    canReadPayments: () => permissionService.canReadPayments(),
    canViewFinancialReports: () => permissionService.canViewFinancialReports(),

    // HRM permissions
    canReadEmployees: (scope?: string, targetUserId?: string) =>
      permissionService.canReadEmployees(scope, targetUserId),
    canCreateEmployees: () => permissionService.canCreateEmployees(),
    canReadPayroll: () => permissionService.canReadPayroll(),
    canReadAttendance: () => permissionService.canReadAttendance(),

    // Project permissions
    canReadProjects: () => permissionService.canReadProjects(),
    canCreateProjects: () => permissionService.canCreateProjects(),
    canReadTasks: () => permissionService.canReadTasks(),
    canManageTeams: () => permissionService.canManageTeams(),

    // Manufacturing permissions
    canReadProductionPlans: () => permissionService.canReadProductionPlans(),
    canReadWorkOrders: () => permissionService.canReadWorkOrders(),
    canManageQualityControl: () => permissionService.canManageQualityControl(),

    // Marketing permissions
    canReadMarketingCampaigns: () => permissionService.canReadMarketingCampaigns(),
    canCreateContent: () => permissionService.canCreateContent(),
    canManageSocialMedia: () => permissionService.canManageSocialMedia(),

    // Support permissions
    canReadTickets: () => permissionService.canReadTickets(),
    canCreateTickets: () => permissionService.canCreateTickets(),
    canCreateKBArticles: () => permissionService.canCreateKBArticles(),

    // Analytics permissions
    canReadDashboards: () => permissionService.canReadDashboards(),
    canReadReports: () => permissionService.canReadReports(),
    canReadBI: () => permissionService.canReadBI(),

    // E-commerce permissions
    canManageCatalog: () => permissionService.canManageCatalog(),
    canReadOnlineOrders: () => permissionService.canReadOnlineOrders(),
    canManageWebsite: () => permissionService.canManageWebsite(),

    // Utility methods
    getUserRole: () => permissionService.getUserRole(),
    getPermissionLevel: () => permissionService.getPermissionLevel(),
    hasPermissionLevel: (level: number) => permissionService.hasPermissionLevel(level),
    isAdmin: () => permissionService.isAdmin(),
    isSuperAdmin: () => permissionService.isSuperAdmin(),
    getAuthorizedNavigation: () => permissionService.getAuthorizedNavigation(),
  };
};

export default ModulePermissionService;

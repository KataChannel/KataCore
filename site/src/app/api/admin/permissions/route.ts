import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';
import { ALL_MODULE_PERMISSIONS } from '@/lib/auth/modules-permissions';

// Middleware to check admin permissions
async function checkAdminPermissions(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = await authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user || !user.role) {
      throw new Error('User not found');
    }

    // Check if user has admin permissions or is super admin
    const isSuperAdmin = user.role.name === 'Super Administrator';
    
    // Get permissions array from user object or role permissions
    let userPermissions: string[] = [];
    if (Array.isArray(user.permissions)) {
      userPermissions = user.permissions;
    } else if (user.role && user.role.permissions) {
      // If permissions is an object with a permissions array
      if (typeof user.role.permissions === 'object' && Array.isArray(user.role.permissions.permissions)) {
        userPermissions = user.role.permissions.permissions;
      } else if (Array.isArray(user.role.permissions)) {
        userPermissions = user.role.permissions;
      }
    }
    
    const hasAdminPermission = userPermissions.includes('admin:system') || 
                              userPermissions.includes('read:permissions') ||
                              userPermissions.includes('system:admin') ||
                              userPermissions.includes('admin:*');

    if (!isSuperAdmin && !hasAdminPermission) {
      throw new Error('Insufficient permissions');
    }

    return user;
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Helper function to determine module from resource
function getModuleFromResource(resource: string): string {
  const moduleMap: Record<string, string> = {
    // Sales
    'order': 'sales',
    'quote': 'sales',
    'pipeline': 'sales',
    'revenue': 'sales',
    'sales_reports': 'sales',
    'sales_analytics': 'sales',
    'sales_data': 'sales',

    // CRM
    'customer': 'crm',
    'lead': 'crm',
    'contact': 'crm',
    'campaign': 'crm',
    'customer_data': 'crm',
    'call_center': 'crm',

    // Inventory
    'product': 'inventory',
    'stock': 'inventory',
    'warehouse': 'inventory',
    'supplier': 'inventory',
    'purchase': 'inventory',
    'inventory_reports': 'inventory',

    // Finance
    'invoice': 'finance',
    'payment': 'finance',
    'expense': 'finance',
    'budget': 'finance',
    'financial_reports': 'finance',
    'journal_entry': 'finance',
    'tax': 'finance',

    // HRM
    'employee': 'hrm',
    'department': 'hrm',
    'position': 'hrm',
    'attendance': 'hrm',
    'leave_request': 'hrm',
    'payroll': 'hrm',
    'performance': 'hrm',
    'report': 'hrm',

    // Projects
    'project': 'projects',
    'task': 'projects',
    'milestone': 'projects',
    'time_entry': 'projects',
    'project_reports': 'projects',

    // Manufacturing
    'production': 'manufacturing',
    'bom': 'manufacturing',
    'quality': 'manufacturing',
    'maintenance': 'manufacturing',

    // Marketing
    'content': 'marketing',
    'social_media': 'marketing',
    'email_campaign': 'marketing',
    'seo': 'marketing',

    // Support
    'ticket': 'support',
    'knowledge_base': 'support',

    // Analytics
    'dashboard': 'analytics',
    'analytics': 'analytics',

    // E-commerce
    'catalog': 'ecommerce',
    'online_order': 'ecommerce',
    'website': 'ecommerce',
    'ecommerce_analytics': 'ecommerce',
    'conversion_reports': 'ecommerce',

    // System
    'users': 'system',
    'roles': 'system',
    'permissions': 'system',
    'system': 'system',
    'settings': 'system',
    'audit': 'system',
    'integrations': 'system',
    'notifications': 'system',
  };

  return moduleMap[resource] || 'general';
}

// GET - List all available permissions
export async function GET(request: NextRequest) {
  try {
    // Check permissions
    await checkAdminPermissions(request);

    const url = new URL(request.url);
    const moduleFilter = url.searchParams.get('module') || '';
    const search = url.searchParams.get('search') || '';

    // Transform permissions from constants
    const permissions = Object.entries(ALL_MODULE_PERMISSIONS).map(([key, permission]) => {
      const module = getModuleFromResource(permission.resource);
      
      return {
        id: key,
        name: key
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        action: permission.action,
        resource: permission.resource,
        description: permission.description || `${permission.action} ${permission.resource}`,
        module: module,
      };
    });

    // Filter permissions
    let filteredPermissions = permissions;

    if (moduleFilter) {
      filteredPermissions = filteredPermissions.filter(
        (permission) => permission.module === moduleFilter
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPermissions = filteredPermissions.filter(
        (permission) =>
          permission.name.toLowerCase().includes(searchLower) ||
          permission.description.toLowerCase().includes(searchLower) ||
          permission.action.toLowerCase().includes(searchLower) ||
          permission.resource.toLowerCase().includes(searchLower)
      );
    }

    // Get unique modules
    const modules = Array.from(new Set(permissions.map((p) => p.module))).sort();

    return NextResponse.json({
      success: true,
      permissions: filteredPermissions,
      modules: modules,
      total: filteredPermissions.length,
    });
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch permissions' },
      { status: error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}

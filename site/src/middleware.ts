// Enhanced middleware for route protection with comprehensive module access control
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { siteConfig } from './lib/config/site';

// Enhanced route to module mapping
const ROUTE_MODULE_MAP: Record<string, string> = {
  '/admin/sales': 'sales',
  '/sales': 'sales',
  '/admin/crm': 'crm',
  '/crm': 'crm',
  '/admin/inventory': 'inventory',
  '/inventory': 'inventory',
  '/admin/finance': 'finance',
  '/finance': 'finance',
  '/admin/hr': 'hrm',
  '/hrm': 'hrm',
  '/admin/projects': 'projects',
  '/projects': 'projects',
  '/admin/manufacturing': 'manufacturing',
  '/manufacturing': 'manufacturing',
  '/admin/marketing': 'marketing',
  '/marketing': 'marketing',
  '/admin/support': 'support',
  '/support': 'support',
  '/admin/analytics': 'analytics',
  '/analytics': 'analytics',
  '/admin/ecommerce': 'ecommerce',
  '/ecommerce': 'ecommerce',
};

// Comprehensive route to permission mapping
const ROUTE_PERMISSION_MAP: Record<string, { action: string; resource: string }> = {
  // Sales routes
  '/admin/sales': { action: 'read', resource: 'order' },
  '/admin/sales/orders': { action: 'read', resource: 'order' },
  '/admin/sales/orders/new': { action: 'create', resource: 'order' },
  '/admin/sales/pipeline': { action: 'manage', resource: 'pipeline' },
  '/admin/sales/quotes': { action: 'read', resource: 'quote' },
  '/sales': { action: 'read', resource: 'order' },
  '/sales/orders': { action: 'read', resource: 'order' },
  '/sales/pipeline': { action: 'manage', resource: 'pipeline' },
  
  // CRM routes
  '/admin/crm': { action: 'read', resource: 'customer' },
  '/admin/crm/customers': { action: 'read', resource: 'customer' },
  '/admin/crm/customers/new': { action: 'create', resource: 'customer' },
  '/admin/crm/leads': { action: 'read', resource: 'lead' },
  '/admin/crm/campaigns': { action: 'read', resource: 'campaign' },
  '/crm': { action: 'read', resource: 'customer' },
  '/crm/customers': { action: 'read', resource: 'customer' },
  '/crm/leads': { action: 'read', resource: 'lead' },
  
  // Inventory routes
  '/admin/inventory': { action: 'read', resource: 'product' },
  '/admin/inventory/products': { action: 'read', resource: 'product' },
  '/admin/inventory/products/new': { action: 'create', resource: 'product' },
  '/admin/inventory/stock': { action: 'read', resource: 'stock' },
  '/admin/inventory/warehouses': { action: 'read', resource: 'warehouse' },
  '/inventory': { action: 'read', resource: 'product' },
  '/inventory/products': { action: 'read', resource: 'product' },
  '/inventory/stock': { action: 'read', resource: 'stock' },
  
  // Finance routes
  '/admin/finance': { action: 'read', resource: 'invoice' },
  '/admin/finance/invoices': { action: 'read', resource: 'invoice' },
  '/admin/finance/invoices/new': { action: 'create', resource: 'invoice' },
  '/admin/finance/payments': { action: 'read', resource: 'payment' },
  '/admin/finance/reports': { action: 'read', resource: 'financial_reports' },
  '/finance': { action: 'read', resource: 'invoice' },
  '/finance/invoices': { action: 'read', resource: 'invoice' },
  '/finance/payments': { action: 'read', resource: 'payment' },
  
  // HR routes
  '/admin/hr': { action: 'read', resource: 'employee' },
  '/admin/hr/employees': { action: 'read', resource: 'employee' },
  '/admin/hr/employees/new': { action: 'create', resource: 'employee' },
  '/admin/hr/departments': { action: 'read', resource: 'department' },
  '/admin/hr/attendance': { action: 'read', resource: 'attendance' },
  '/admin/hr/leave': { action: 'read', resource: 'leave' },
  '/admin/hr/payroll': { action: 'read', resource: 'payroll' },
  '/admin/hr/roles': { action: 'read', resource: 'roles' },
  '/hrm': { action: 'read', resource: 'employee' },
  '/hrm/employees': { action: 'read', resource: 'employee' },
  '/hrm/attendance': { action: 'read', resource: 'attendance' },
  
  // Project routes
  '/admin/projects': { action: 'read', resource: 'project' },
  '/admin/projects/new': { action: 'create', resource: 'project' },
  '/admin/projects/tasks': { action: 'read', resource: 'task' },
  '/projects': { action: 'read', resource: 'project' },
  '/projects/tasks': { action: 'read', resource: 'task' },
  
  // Manufacturing routes
  '/admin/manufacturing': { action: 'read', resource: 'production_plan' },
  '/admin/manufacturing/production': { action: 'read', resource: 'production_plan' },
  '/admin/manufacturing/work-orders': { action: 'read', resource: 'work_order' },
  '/admin/manufacturing/quality': { action: 'read', resource: 'quality_control' },
  '/manufacturing': { action: 'read', resource: 'production_plan' },
  '/manufacturing/production': { action: 'read', resource: 'production_plan' },
  
  // Marketing routes
  '/admin/marketing': { action: 'read', resource: 'campaign' },
  '/admin/marketing/campaigns': { action: 'read', resource: 'campaign' },
  '/admin/marketing/social': { action: 'read', resource: 'social_media' },
  '/admin/marketing/email': { action: 'read', resource: 'email_campaign' },
  '/marketing': { action: 'read', resource: 'campaign' },
  '/marketing/campaigns': { action: 'read', resource: 'campaign' },
  
  // Support routes
  '/admin/support': { action: 'read', resource: 'ticket' },
  '/admin/support/tickets': { action: 'read', resource: 'ticket' },
  '/admin/support/knowledge-base': { action: 'read', resource: 'knowledge_base' },
  '/support': { action: 'read', resource: 'ticket' },
  '/support/tickets': { action: 'read', resource: 'ticket' },
  
  // Analytics routes
  '/admin/analytics': { action: 'read', resource: 'dashboard' },
  '/admin/analytics/reports': { action: 'read', resource: 'report' },
  '/admin/analytics/dashboard': { action: 'read', resource: 'dashboard' },
  '/analytics': { action: 'read', resource: 'dashboard' },
  '/analytics/reports': { action: 'read', resource: 'report' },
  
  // E-commerce routes
  '/admin/ecommerce': { action: 'read', resource: 'catalog' },
  '/admin/ecommerce/products': { action: 'read', resource: 'catalog' },
  '/admin/ecommerce/orders': { action: 'read', resource: 'online_order' },
  '/admin/ecommerce/website': { action: 'read', resource: 'website' },
  '/ecommerce': { action: 'read', resource: 'catalog' },
  '/ecommerce/products': { action: 'read', resource: 'catalog' },
  
  // Admin user management
  '/admin/users': { action: 'read', resource: 'users' },
  '/admin/roles': { action: 'read', resource: 'roles' },
  '/admin/settings': { action: 'read', resource: 'settings' },
};

async function getUserFromToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    // Here you would typically fetch user data from database
    // For now, we'll return the payload which should contain user info
    return payload as any;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

function checkPermission(userPermissions: any[], requiredAction: string, requiredResource: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  return userPermissions.some(permission => {
    // Handle both string and object permission formats
    if (typeof permission === 'string') {
      const [action, resource] = permission.split(':');
      return action === requiredAction && resource === requiredResource;
    } else if (typeof permission === 'object') {
      return permission.action === requiredAction && permission.resource === requiredResource;
    }
    return false;
  });
}

function checkModuleAccess(userModules: string[], requiredModule: string): boolean {
  if (!userModules || !Array.isArray(userModules)) return false;
  return userModules.includes(requiredModule);
}

function getModuleFromPath(pathname: string): string | null {
  // Find the best matching route
  const sortedRoutes = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length);
  
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      return ROUTE_MODULE_MAP[route];
    }
  }
  
  return null;
}

function getPermissionFromPath(pathname: string): { action: string; resource: string } | null {
  // Find exact match first
  if (ROUTE_PERMISSION_MAP[pathname]) {
    return ROUTE_PERMISSION_MAP[pathname];
  }
  
  // Find the best matching route by length (longest first)
  const sortedRoutes = Object.keys(ROUTE_PERMISSION_MAP).sort((a, b) => b.length - a.length);
  
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route)) {
      return ROUTE_PERMISSION_MAP[route];
    }
  }
  
  return null;
}

export async function middleware(request: NextRequest) {
  console.log('Enhanced middleware called for:', request.nextUrl.pathname);

  // Get token from cookie or header
  const token = request.cookies.get('token')?.value || 
                request.cookies.get('accessToken')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  console.log('Token from cookie/header:', token ? '***' + token.slice(-10) : 'null');

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') ||
                          request.nextUrl.pathname.startsWith('/dashboard') ||
                          Object.keys(ROUTE_MODULE_MAP).some(route => 
                            request.nextUrl.pathname.startsWith(route)
                          );

  // If on auth page and already authenticated, redirect to dashboard
  if (isAuthPage) {
    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        console.log('Redirecting authenticated user from auth page to dashboard');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // If on protected route, check authentication and permissions
  if (isProtectedRoute && siteConfig.auth.loginRequired) {
    if (!token) {
      console.log('Redirecting unauthenticated user from protected route to login');
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url));
    }

    const user = await getUserFromToken(token);
    if (!user) {
      console.log('Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url));
    }

    // Check module and permission based access
    const requiredModule = getModuleFromPath(request.nextUrl.pathname);
    const requiredPermission = getPermissionFromPath(request.nextUrl.pathname);

    console.log('Checking permissions for route:', request.nextUrl.pathname);
    console.log('Required module:', requiredModule);
    console.log('Required permission:', requiredPermission);
    console.log('User role:', user.roleId);
    console.log('User modules:', user.modules);
    console.log('User permissions:', user.permissions);

    // Special handling for super admin - allow all access
    if (user.roleId === 'super_admin' || user.role?.name === 'Super Administrator') {
      console.log('Super admin access granted');
      return NextResponse.next();
    }

    // Check module access
    if (requiredModule) {
      const hasModuleAccess = checkModuleAccess(user.modules || [], requiredModule);
      
      if (!hasModuleAccess) {
        console.log('Module access denied for:', requiredModule);
        return NextResponse.redirect(new URL('/?error=module-access-denied&module=' + requiredModule, request.url));
      }
      
      console.log('Module access check passed for:', requiredModule);
    }

    // Check specific permission
    if (requiredPermission) {
      const hasPermission = checkPermission(
        user.permissions || [],
        requiredPermission.action,
        requiredPermission.resource
      );

      if (!hasPermission) {
        console.log('Permission denied:', requiredPermission);
        return NextResponse.redirect(new URL('/?error=permission-denied&action=' + requiredPermission.action + '&resource=' + requiredPermission.resource, request.url));
      }

      console.log('Permission check passed:', requiredPermission);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

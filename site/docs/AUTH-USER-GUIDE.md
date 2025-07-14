# TazaCore Authentication System User Guide

## Overview

The TazaCore authentication system provides comprehensive role-based access control (RBAC) across all 11 business modules. This guide explains how to use the authentication features and understand the permission system.

## Demo Access

Visit `/auth-demo` to test the authentication system with different user roles and access levels.

## Architecture

### Core Components

1. **AuthProvider** - React context provider for authentication state
2. **ModuleGuard** - Higher-order component for protecting routes
3. **ModulePermissionService** - Backend service for permission checking
4. **Middleware** - Route-level access control

### User Roles & System Levels

| Role     | System Level | Description           | Default Modules |
| -------- | ------------ | --------------------- | --------------- |
| Admin    | 10           | Full system access    | All 11 modules  |
| Manager  | 7-9          | Department management | 6-8 modules     |
| Employee | 3-6          | Standard user access  | 2-4 modules     |
| Viewer   | 1-2          | Read-only access      | 1-2 modules     |

### Business Modules

1. **Sales Management** - Orders, quotes, pipeline
2. **CRM** - Customer relationships, leads
3. **Inventory Management** - Stock, warehouse operations
4. **Accounting & Finance** - Invoicing, financial reports
5. **HRM** - Human resources, payroll
6. **Project Management** - Tasks, planning
7. **Manufacturing** - Production, quality control
8. **Marketing** - Campaigns, analysis
9. **Customer Support** - Tickets, helpdesk
10. **Analytics** - Business intelligence, reporting
11. **E-commerce** - Online store management

## Authentication Flow

### 1. Login Process

```typescript
// Demo accounts available
const demoAccounts = [
  { email: 'admin@taza.com', role: 'admin', level: 10 },
  { email: 'manager@taza.com', role: 'manager', level: 7 },
  { email: 'employee@taza.com', role: 'employee', level: 3 },
  { email: 'viewer@taza.com', role: 'viewer', level: 1 },
];
```

### 2. Permission Checking

```typescript
// Check module access
const hasAccess = checkModuleAccess('sales');

// Check specific permission
const canWrite = checkPermission('write', 'inventory');

// Check admin access
const isAdmin = checkPermission('admin', 'system');
```

### 3. Route Protection

```typescript
// Protect entire routes
export default withModuleGuard(SalesPage, 'sales', 'read');

// Conditional rendering
{hasAccess && <SensitiveComponent />}
```

## Permission Levels

### Module-Specific Permissions

- **read** - View data, basic navigation
- **write** - Create and edit records
- **manage** - Advanced operations, user management within module
- **admin** - Full module administration

### System-Wide Permissions

- **admin** - Global system administration
- **manage** - Cross-module management capabilities
- **audit** - Access to audit logs and system monitoring

## Usage Examples

### Frontend Integration

```typescript
import { AuthProvider, useAuth, withModuleGuard } from '@/components/auth/ModuleGuard';

// Wrap your app
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}

// Protect a component
const ProtectedSalesPage = withModuleGuard(SalesPage, 'sales', 'read');

// Use auth in components
function MyComponent() {
  const { user, checkModuleAccess, logout } = useAuth();

  if (!checkModuleAccess('crm')) {
    return <AccessDenied />;
  }

  return <CRMDashboard />;
}
```

### API Integration

```typescript
// API routes are automatically protected by middleware
// Access is determined by JWT token and user permissions

// Example API call with authentication
const response = await fetch('/api/sales/orders', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Access Control Matrix

| Module        | Viewer  | Employee      | Manager       | Admin    |
| ------------- | ------- | ------------- | ------------- | -------- |
| Sales         | ❌      | ✅ Read/Write | ✅ Manage     | ✅ Admin |
| CRM           | ❌      | ✅ Read/Write | ✅ Manage     | ✅ Admin |
| Inventory     | ❌      | ❌            | ✅ Read/Write | ✅ Admin |
| Finance       | ❌      | ❌            | ✅ Read       | ✅ Admin |
| HRM           | ❌      | ❌            | ✅ Read       | ✅ Admin |
| Projects      | ❌      | ❌            | ✅ Manage     | ✅ Admin |
| Manufacturing | ❌      | ❌            | ❌            | ✅ Admin |
| Marketing     | ❌      | ❌            | ✅ Manage     | ✅ Admin |
| Support       | ❌      | ❌            | ✅ Read       | ✅ Admin |
| Analytics     | ✅ Read | ❌            | ✅ Read       | ✅ Admin |
| E-commerce    | ❌      | ❌            | ❌            | ✅ Admin |

## Navigation & UI

### Module Access Indicators

- 🟢 **Green Badge** - Full access (read/write/manage/admin)
- 🟡 **Yellow Badge** - Limited access (read-only)
- 🔒 **Lock Icon** - No access
- 🛡️ **Shield Icon** - Admin access

### Route Structure

```
/login                 - Authentication page
/register             - User registration
/auth-demo            - Demo and testing page

/admin/*              - Admin-only routes
  /admin/users        - User management
  /admin/sales        - Sales administration
  /admin/crm          - CRM administration
  ... (all modules)

/dashboard/*          - User dashboard routes
  /sales              - Sales module
  /crm                - CRM module
  /inventory          - Inventory module
  ... (accessible modules based on role)
```

## Security Features

### JWT Token Management

- Automatic token refresh
- Secure storage in httpOnly cookies
- Token expiration handling
- Logout on token invalidation

### Route Protection

- Middleware-level access control
- Component-level guards
- API endpoint protection
- Automatic redirects for unauthorized access

### Audit Logging

- User authentication events
- Permission changes
- Module access attempts
- Administrative actions

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Check user role and system level
   - Verify module permissions in database
   - Ensure JWT token is valid

2. **Login Problems**
   - Clear browser cache and cookies
   - Check network connectivity
   - Verify demo account credentials

3. **Module Not Loading**
   - Check browser console for errors
   - Verify route protection middleware
   - Ensure component is properly wrapped with ModuleGuard

### Debug Commands

```bash
# Check user permissions
console.log(user.permissions);

# Test module access
console.log(checkModuleAccess('sales'));

# View JWT token
console.log(localStorage.getItem('auth-token'));
```

## API Reference

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user info

### User Management Endpoints

- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Permission Endpoints

- `GET /api/permissions/modules` - Available modules
- `GET /api/permissions/user/:id` - User permissions
- `POST /api/permissions/check` - Check specific permission

## Best Practices

1. **Always use AuthProvider** at the root of your application
2. **Protect sensitive routes** with ModuleGuard or middleware
3. **Check permissions** before rendering sensitive UI components
4. **Handle access denied** gracefully with user-friendly messages
5. **Use demo page** for testing different access scenarios
6. **Keep permission logic** centralized in the ModulePermissionService
7. **Implement proper error handling** for authentication failures

## Support

For technical support or questions about the authentication system:

1. Check the demo page at `/auth-demo` for interactive testing
2. Review this documentation for implementation details
3. Contact the development team for system administration issues

---

_Last updated: July 2025_
_TazaCore Enterprise v2.0.0_

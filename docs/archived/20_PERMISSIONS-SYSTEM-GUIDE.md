# TAZA CORE UNIFIED PERMISSION SYSTEM

## Overview

The TazaCore Unified Permission System provides a comprehensive, scalable, and secure approach to managing user permissions and access control across all modules of the application. This document outlines the complete architecture, usage patterns, and best practices.

## Architecture

### Core Components

1. **UnifiedPermissionService** - Central permission checking service
2. **Permission Constants** - Standardized permissions, modules, and roles
3. **Permission Validator** - Safe creation and validation utilities
4. **Auth Provider Integration** - Seamless integration with authentication

### Key Features

- ✅ **Role-based Access Control (RBAC)**
- ✅ **Scope-based Permissions** (own, team, department, all)
- ✅ **Module-based Access Control**
- ✅ **Route Protection**
- ✅ **Type-safe Permission Definitions**
- ✅ **Hierarchical Role System**
- ✅ **Custom Permission Support**

## Permission Structure

### Scopes

```typescript
SCOPES = {
  OWN: 'own',           // User can only access their own resources
  TEAM: 'team',         // User can access team resources
  DEPARTMENT: 'department', // User can access department resources  
  ALL: 'all'            // User can access all resources
}
```

### Standard Actions

```typescript
ACTIONS = {
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
  
  // Data operations
  EXPORT: 'export',
  IMPORT: 'import',
  
  // And more...
}
```

### Standard Resources

```typescript
RESOURCES = {
  // User management
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  
  // Business entities
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee', 
  ORDER: 'order',
  INVOICE: 'invoice',
  PRODUCT: 'product',
  
  // Special resources
  WILDCARD: '*',
  // And more...
}
```

## System Modules

```typescript
MODULES = {
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
}
```

## Predefined Roles

### Super Administrator (Level 10)
- **Full system access**
- **All modules**
- **All permissions**

### System Administrator (Level 9)  
- **User management**
- **System administration**
- **Admin and Analytics modules**

### Department Managers (Level 6-7)
- **Sales Manager**: Sales, CRM, Analytics
- **HR Manager**: HRM, Analytics  
- **Finance Manager**: Finance, Analytics
- **Inventory Manager**: Inventory, Analytics

### Team Leads (Level 4)
- **Department-scoped permissions**
- **Team management**
- **Limited modules**

### Employees (Level 2)
- **Own resource access**
- **Basic functionality**
- **Limited scope**

## Usage Examples

### Basic Permission Checking

```typescript
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';

function MyComponent() {
  const { hasPermission, hasModuleAccess, canAccessRoute } = useUnifiedAuth();
  
  // Check specific permission
  const canCreateUsers = hasPermission('create', 'user');
  
  // Check module access
  const canAccessHR = hasModuleAccess('hrm');
  
  // Check route access
  const canAccessAdminPanel = canAccessRoute('/admin');
  
  return (
    <div>
      {canCreateUsers && <CreateUserButton />}
      {canAccessHR && <HRDashboard />}
    </div>
  );
}
```

### Component-level Protection

```typescript
import { PermissionGate } from '@/components/auth/UnifiedAuthProvider';

function ProtectedComponent() {
  return (
    <PermissionGate
      action="read"
      resource="employee"
      fallback={<div>Access Denied</div>}
    >
      <EmployeeList />
    </PermissionGate>
  );
}
```

### Route Protection

```typescript
import { withAuth } from '@/components/auth/UnifiedAuthProvider';

const AdminPage = withAuth(AdminPageComponent, {
  requireAuth: true,
  requireModule: 'admin',
  requireMinLevel: 8,
  redirectTo: '/login'
});
```

### Scope-based Permissions

```typescript
// Employee can only read their own data
const canReadOwnData = hasPermission('read', 'employee', 'own');

// Manager can read department data
const canReadDeptData = hasPermission('read', 'employee', 'department');

// Admin can read all data
const canReadAllData = hasPermission('read', 'employee', 'all');
```

## Integration Guide

### Setting Up Authentication

```typescript
// app.tsx
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';

function App() {
  return (
    <UnifiedAuthProvider>
      <YourAppContent />
    </UnifiedAuthProvider>
  );
}
```

### Creating Custom Permissions

```typescript
import { createPermission, createCRUDPermissions } from '@/lib/auth/permissions-constants';

// Create a single permission
const customPermission = createPermission('execute', 'report', 'department');

// Create CRUD permissions for a resource
const taskPermissions = createCRUDPermissions('task', 'team');
```

### Custom Role Definition

```typescript
const customRole = {
  id: 'custom_manager',
  name: 'Custom Manager',
  description: 'Custom role with specific permissions',
  level: 5,
  permissions: [
    createPermission('read', 'order', 'all'),
    createPermission('create', 'order', 'department'),
    createPermission('approve', 'order', 'department'),
  ],
  modules: ['sales', 'analytics'],
};
```

## Best Practices

### 1. Use Predefined Constants

```typescript
// ✅ Good
hasPermission(ACTIONS.READ, RESOURCES.EMPLOYEE);

// ❌ Bad  
hasPermission('read', 'employee');
```

### 2. Implement Proper Error Handling

```typescript
// ✅ Good
try {
  const service = createSafePermissionService(user);
  if (service) {
    return service.hasPermission('read', 'user');
  }
  return false;
} catch (error) {
  console.error('Permission check failed:', error);
  return false;
}
```

### 3. Use Appropriate Scopes

```typescript
// ✅ Good - Employee accessing own data
hasPermission('read', 'payroll', 'own', { userId: currentUser.id });

// ✅ Good - Manager accessing department data  
hasPermission('read', 'employee', 'department', { departmentId: currentUser.departmentId });
```

### 4. Implement Fallback UI

```typescript
// ✅ Good
<PermissionGate 
  action="create" 
  resource="user"
  fallback={<div>You don't have permission to create users.</div>}
>
  <CreateUserForm />
</PermissionGate>
```

## Testing

### Running Permission Tests

```typescript
import { runPermissionTests } from '@/lib/auth/permission-tests';

// Run comprehensive test suite
runPermissionTests();
```

### Manual Testing

```typescript
import { debugUserPermissions } from '@/lib/auth/permission-validator';

// Debug user permissions
debugUserPermissions(user, permissionService);
```

## Security Considerations

### 1. Server-side Validation
- Always validate permissions on the server side
- Client-side permissions are for UI convenience only
- Never trust client-side permission checks for security

### 2. Principle of Least Privilege
- Assign minimum required permissions
- Use appropriate scopes
- Regularly audit role permissions

### 3. Permission Inheritance
- Higher role levels include lower level permissions
- Scope hierarchy: all > department > team > own
- Super admin has universal access

### 4. Data Validation
- Validate user data before creating permission service
- Handle invalid or missing permission data gracefully
- Log permission failures for security monitoring

## Common Issues and Solutions

### Issue: Permission Service Not Initializing

```typescript
// Check user data validity
if (!validateUserForPermissions(user)) {
  console.error('Invalid user data for permissions');
  return;
}

// Use safe creation
const service = createSafePermissionService(user);
```

### Issue: Scope-based Permissions Not Working

```typescript
// Ensure target data is provided for scope checks
const hasAccess = hasPermission('read', 'employee', 'own', {
  userId: targetEmployeeId
});
```

### Issue: Module Access Denied

```typescript
// Check both role modules and user modules
const hasModuleAccess = (moduleId: string) => {
  const roleModules = user.role?.modules || [];
  const userModules = user.modules || [];
  return [...roleModules, ...userModules].includes(moduleId);
};
```

## Migration Guide

### From Legacy Permission System

1. **Update imports**:
   ```typescript
   // Old
   import { useAuth } from '@/contexts/AuthContext';
   
   // New
   import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
   ```

2. **Update permission checks**:
   ```typescript
   // Old
   if (user.role === 'admin') { ... }
   
   // New
   if (hasPermission('manage', 'user')) { ... }
   ```

3. **Update role definitions**:
   ```typescript
   // Old format
   permissions: ['read:user', 'create:user']
   
   // New format (automatically converted)
   permissions: [
     { action: 'read', resource: 'user', scope: 'all' },
     { action: 'create', resource: 'user', scope: 'all' }
   ]
   ```

## API Reference

### UnifiedPermissionService Methods

- `hasPermission(action, resource, scope?, targetData?)` - Check specific permission
- `hasModuleAccess(moduleId)` - Check module access
- `canAccessRoute(route)` - Check route access
- `isSuperAdmin()` - Check if super admin
- `isSystemAdmin()` - Check if system admin
- `isManager()` - Check if manager level
- `hasRole(roleId)` - Check specific role
- `hasMinimumRoleLevel(level)` - Check minimum role level
- `getAllPermissions()` - Get all user permissions
- `getAccessibleModules()` - Get all accessible modules

### Auth Context Methods

- `hasPermission(action, resource, scope?)` - Check permission
- `hasModuleAccess(module)` - Check module access
- `canAccessRoute(route)` - Check route access
- `isSuperAdmin()` - Check super admin status
- `isSystemAdmin()` - Check system admin status
- `isManager()` - Check manager status
- `hasRole(roleId)` - Check role
- `hasMinimumRoleLevel(level)` - Check role level

## Performance Considerations

### 1. Permission Caching
- Permission service is cached per user session
- Role and module data is pre-computed
- Avoid recreating permission service unnecessarily

### 2. Efficient Permission Checks
- Use specific permission checks rather than broad checks
- Cache frequently used permission results
- Avoid permission checks in render loops

### 3. Lazy Loading
- Load permission data only when needed
- Use React hooks for component-level caching
- Implement permission preloading for critical paths

## Conclusion

The TazaCore Unified Permission System provides a robust, scalable, and secure foundation for managing user access across your application. By following the patterns and best practices outlined in this documentation, you can implement comprehensive access control that grows with your application's needs.

For additional support or questions, refer to the test files and implementation examples provided in the codebase.

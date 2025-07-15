# 🔐 AUTH SYSTEM - SENIOR DEVELOPER GUIDE

## 📖 **Overview**

The auth system has been completely synchronized and optimized for senior-level development standards. This guide provides comprehensive information for working with the unified authentication system.

## 🚀 **Quick Start**

### **Option 1: Use the Centralized Index (Recommended)**
```typescript
// Everything you need from one import
import { 
  useUnifiedAuth, 
  UnifiedAuthProvider,
  PermissionGate,
  type User,
  type AuthContextType 
} from '@/auth';
```

### **Option 2: Direct Imports**
```typescript
// Main auth functionality
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';

// Types only
import { type User, type AuthContextType } from '@/types/auth';

// Legacy compatibility (deprecated but working)
import { useAuth } from '@/hooks/useAuth';
```

## 🏗️ **Architecture**

```
AUTH SYSTEM STRUCTURE

📁 /src/auth/index.ts
   └── 🎯 Single entry point for all auth functionality

📁 /src/types/auth.ts  
   └── 🎯 Unified type definitions (single source of truth)

📁 /src/components/auth/UnifiedAuthProvider.tsx
   └── 🎯 Main auth provider implementation

📁 /src/hooks/useAuth.tsx
   └── 🔄 Backward compatibility layer (deprecated)

📁 /src/lib/auth/auth-validation.ts
   └── 🛡️ Validation and monitoring utilities
```

## 💻 **Usage Examples**

### **Basic Authentication**
```typescript
import { useUnifiedAuth } from '@/auth';

function MyComponent() {
  const { user, login, logout, loading } = useUnifiedAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginForm onLogin={login} />;
  
  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### **Permission-Based Access Control**
```typescript
import { PermissionGate, useUnifiedAuth } from '@/auth';

function AdminPanel() {
  const { hasPermission, hasModuleAccess } = useUnifiedAuth();
  
  return (
    <div>
      <PermissionGate action="read" resource="users">
        <UserList />
      </PermissionGate>
      
      <PermissionGate module="admin" fallback={<div>Access denied</div>}>
        <AdminSettings />
      </PermissionGate>
      
      {hasPermission('write', 'users') && (
        <button>Create User</button>
      )}
    </div>
  );
}
```

### **Route Protection**
```typescript
import { withAuth } from '@/auth';

const ProtectedPage = withAuth(MyComponent, {
  requireAuth: true,
  requireModule: 'admin',
  requireMinLevel: 5,
  redirectTo: '/login'
});

// Or use as HOC
export default withAuth(AdminDashboard, {
  requirePermission: { action: 'read', resource: 'dashboard' }
});
```

### **Type Safety**
```typescript
import { type User, isValidUser } from '@/auth';

function processUser(userData: unknown) {
  if (isValidUser(userData)) {
    // TypeScript knows userData is User type
    console.log(userData.displayName);
    console.log(userData.role?.name);
  }
}
```

## 🔧 **Advanced Features**

### **Performance Monitoring**
```typescript
import { AuthPerformanceMonitor } from '@/auth';

async function loginWithMonitoring(credentials) {
  AuthPerformanceMonitor.startTimer('login');
  
  try {
    await login(credentials);
  } finally {
    AuthPerformanceMonitor.endTimer('login');
  }
}
```

### **System Health Checks**
```typescript
import { AuthSystemValidator } from '@/auth';

// In development or monitoring
const isHealthy = AuthSystemValidator.performHealthCheck();
if (!isHealthy) {
  console.error('Auth system has issues!');
}
```

### **Custom Validation**
```typescript
import { type LoginCredentials, isValidLoginCredentials } from '@/auth';

function validateLogin(data: unknown): data is LoginCredentials {
  return isValidLoginCredentials(data);
}
```

## 🔄 **Migration Guide**

### **From Legacy useAuth Hook:**
```typescript
// ❌ Old way (still works but deprecated)
import { useAuth } from '@/hooks/useAuth';

// ✅ New way (recommended)
import { useUnifiedAuth } from '@/auth';
// or
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
```

### **From Duplicate User Interfaces:**
```typescript
// ❌ Old way (multiple definitions)
interface User {
  id: string;
  email: string;
  // ... duplicate definitions everywhere
}

// ✅ New way (single source of truth)
import { type User } from '@/auth';
// or
import { type User } from '@/types/auth';
```

## 🛡️ **Type Definitions**

### **Core User Interface**
```typescript
interface User {
  // Core identity
  id: string;
  email?: string | undefined;
  phone?: string | undefined;
  username?: string | undefined;
  displayName: string;
  avatar?: string | undefined;
  
  // Role & permissions
  roleId: string;
  role?: UserRole | undefined;
  modules?: string[] | undefined;
  permissions?: string[] | undefined;
  
  // Status & metadata
  isActive: boolean;
  isVerified: boolean;
  provider: string;
}
```

### **Auth Context Interface**
```typescript
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  
  // Core methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  
  // Permission methods
  hasPermission: (action: string, resource: string, scope?: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  
  // Role methods
  isSuperAdmin: () => boolean;
  isSystemAdmin: () => boolean;
  isManager: () => boolean;
  hasRole: (roleId: string) => boolean;
  hasMinimumRoleLevel: (level: number) => boolean;
}
```

## ⚡ **Performance Considerations**

### **Optimized Imports**
```typescript
// ✅ Good - tree-shakeable
import { useUnifiedAuth } from '@/auth';

// ✅ Good - specific imports
import { type User } from '@/types/auth';

// ❌ Avoid - imports everything
import * as Auth from '@/auth';
```

### **Lazy Loading**
```typescript
// For non-critical auth components
const LoginModal = lazy(() => import('@/auth').then(m => ({ default: m.LoginModal })));
```

## 🔍 **Debugging & Troubleshooting**

### **Development Tools**
```typescript
// Automatic health check in development
import { logAuthSystemStatus } from '@/auth';
logAuthSystemStatus(); // Only runs in development

// Manual validation
import { AuthSystemValidator } from '@/auth';
AuthSystemValidator.performHealthCheck();
```

### **Common Issues**

**1. "useAuth must be used within a UnifiedAuthProvider"**
```typescript
// Ensure your app is wrapped with the provider
function App() {
  return (
    <UnifiedAuthProvider>
      <YourApp />
    </UnifiedAuthProvider>
  );
}
```

**2. Type conflicts**
```typescript
// Always import types from the unified source
import { type User } from '@/types/auth'; // ✅ Correct
// not from individual components
```

**3. Permission checks not working**
```typescript
// Ensure user has a role with proper structure
const { user } = useUnifiedAuth();
console.log(user?.role?.permissions); // Check permissions array
```

## 📊 **Testing**

### **Unit Testing Auth Components**
```typescript
import { render, screen } from '@testing-library/react';
import { UnifiedAuthProvider } from '@/auth';

const TestWrapper = ({ children }) => (
  <UnifiedAuthProvider>
    {children}
  </UnifiedAuthProvider>
);

test('auth component', () => {
  render(<MyAuthComponent />, { wrapper: TestWrapper });
  // ... test logic
});
```

### **Mocking Auth Context**
```typescript
import { type AuthContextType } from '@/auth';

const mockAuthContext: AuthContextType = {
  user: mockUser,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  // ... other methods
};
```

## 🎯 **Best Practices**

### **1. Always Use Type Guards**
```typescript
import { isValidUser } from '@/auth';

function handleUserData(data: unknown) {
  if (isValidUser(data)) {
    // Safe to use data as User
    return data.displayName;
  }
  throw new Error('Invalid user data');
}
```

### **2. Consistent Import Patterns**
```typescript
// For components - use the index
import { useUnifiedAuth, PermissionGate } from '@/auth';

// For types only - use types directly
import { type User, type AuthContextType } from '@/types/auth';
```

### **3. Handle Loading States**
```typescript
function MyComponent() {
  const { user, loading } = useUnifiedAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;
  
  return <AuthenticatedContent user={user} />;
}
```

### **4. Use Permission Gates for UI**
```typescript
// Declarative permissions
<PermissionGate action="write" resource="posts">
  <CreatePostButton />
</PermissionGate>

// Programmatic permissions
const canEdit = hasPermission('write', 'posts');
```

## 🔗 **Related Files**

- 📄 `/src/auth/index.ts` - Main entry point
- 📄 `/src/types/auth.ts` - Type definitions
- 📄 `/src/components/auth/UnifiedAuthProvider.tsx` - Core provider
- 📄 `/src/hooks/useAuth.tsx` - Legacy compatibility
- 📄 `/src/lib/auth/auth-validation.ts` - Validation utilities
- 📄 `/AUTH-SYNC-SUMMARY.md` - Synchronization details

---

**🏆 The auth system is fully synchronized and production-ready!**

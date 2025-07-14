# 🎯 TazaCore Unified Standards & Architecture

## 📋 **Table of Contents**
1. [Architecture Overview](#architecture)
2. [Code Standards](#code-standards)  
3. [Permission System](#permission-system)
4. [File Structure](#file-structure)
5. [Component Patterns](#component-patterns)
6. [API Standards](#api-standards)

---

## 🏗️ **Architecture Overview** {#architecture}

### **Core Principles**
- **Single Source of Truth**: One unified system per feature
- **Type Safety**: 100% TypeScript coverage
- **Modular Design**: Clean separation of concerns
- **Performance First**: Optimized for scale
- **Developer Experience**: Clear patterns and consistent APIs

### **Technology Stack**
```
Frontend: Next.js 14 + TypeScript + Tailwind CSS
Backend: Next.js API Routes + Prisma
Database: PostgreSQL
Authentication: JWT + Role-based Access Control
State Management: React Context + Custom Hooks
UI Components: Radix UI + Custom Design System
```

---

## 📝 **Code Standards** {#code-standards}

### **TypeScript Configuration**
```typescript
// tsconfig.json - Strict configuration
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **File Naming Conventions**
```
Components: PascalCase.tsx (UserProfile.tsx)
Hooks: camelCase.ts (useAuth.ts)
Utils: camelCase.ts (formatDate.ts)
Types: camelCase.ts (user.types.ts)
Constants: SCREAMING_SNAKE_CASE.ts (API_ENDPOINTS.ts)
```

### **Import Order Standard**
```typescript
// 1. External libraries
import React from 'react';
import { NextPage } from 'next';
import { z } from 'zod';

// 2. Internal utilities
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/helpers';

// 3. Components
import { Button } from '@/components/ui';
import { UserCard } from '@/components/features';

// 4. Types
import type { User, Permission } from '@/types';

// 5. Local imports
import { useLocalState } from './hooks';
```

---

## 🔐 **Unified Permission System** {#permission-system}

### **Architecture Overview**
```
Role-Based Access Control (RBAC) + Module-Based Permissions
├── Super Administrator (Level 10) - Universal Access
├── System Administrator (Level 9) - System Management
├── Module Administrator (Level 8) - Specific Module Admin
├── Department Manager (Level 6) - Department Scope
├── Team Lead (Level 4) - Team Scope
└── Employee (Level 2) - Own Data Only
```

### **Permission Structure**
```typescript
interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve';
  resource: string; // 'user', 'order', 'product', etc.
  scope: 'own' | 'team' | 'department' | 'all';
  conditions?: Record<string, any>;
}

interface Module {
  id: string;
  name: string;
  permissions: Permission[];
  requiredRole: string[];
}
```

### **Module Access Matrix**
```typescript
const MODULE_ACCESS_MATRIX = {
  sales: {
    superAdmin: ['*'],
    admin: ['read', 'create', 'update', 'delete'],
    manager: ['read', 'create', 'update'],
    employee: ['read:own', 'create:own']
  },
  crm: {
    superAdmin: ['*'],
    admin: ['read', 'create', 'update', 'delete'],
    manager: ['read:department', 'create', 'update:department'],
    employee: ['read:own']
  }
  // ... other modules
} as const;
```

---

## 📁 **Unified File Structure** {#file-structure}

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group routes
│   ├── (dashboard)/              # Dashboard group routes
│   ├── (modules)/                # Module group routes
│   │   ├── sales/
│   │   ├── crm/
│   │   └── hrm/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── modules/
│   │   └── admin/
│   └── globals.css
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── modules/                  # Module-specific components
│   ├── layouts/                  # Layout components
│   └── features/                 # Feature components
├── lib/                         # Utilities & services
│   ├── auth/                    # Authentication system
│   ├── database/                # Database utilities
│   ├── validation/              # Zod schemas
│   ├── utils/                   # General utilities
│   └── config/                  # Configuration
├── types/                       # TypeScript definitions
│   ├── global.ts
│   ├── auth.ts
│   ├── modules/
│   └── api.ts
├── hooks/                       # Custom React hooks
└── middleware.ts                # Single unified middleware
```

---

## 🧩 **Component Patterns** {#component-patterns}

### **Standard Component Template**
```typescript
// ============================================================================
// IMPORTS
// ============================================================================
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { BaseComponentProps } from '@/types/global';

// ============================================================================
// INTERFACES
// ============================================================================
interface ComponentNameProps extends BaseComponentProps {
  // Required props first
  title: string;
  data: any[];

  // Optional props second
  variant?: 'primary' | 'secondary';
  onAction?: (item: any) => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  data,
  variant = 'primary',
  onAction,
  disabled = false,
  className,
  children,
  ...props
}) => {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleAction = useCallback(
    (item: any) => {
      if (disabled) return;
      onAction?.(item);
    },
    [disabled, onAction]
  );

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Render
  return (
    <div
      className={cn(
        'base-component-styles',
        variant === 'primary' && 'primary-styles',
        variant === 'secondary' && 'secondary-styles',
        disabled && 'disabled-styles',
        className
      )}
      {...props}
    >
      {/* Component content */}
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default ComponentName;
export type { ComponentNameProps };
```

---

## 🌐 **API Standards** {#api-standards}

### **Unified API Route Pattern**
```typescript
// app/api/modules/[module]/[...params]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { withPermission } from '@/lib/auth/permissions';
import { handleApiError } from '@/lib/api/error-handler';

// ============================================================================
// SCHEMAS
// ============================================================================
const CreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// ============================================================================
// HANDLERS
// ============================================================================
async function handleGET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);
    
    // Implementation
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const GET = withAuth(withPermission('read', 'resource')(handleGET));
export const POST = withAuth(withPermission('create', 'resource')(handlePOST));
```

---

## 🎨 **UI Design System**

### **Color Palette**
```typescript
const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  
  // Module-specific colors
  modules: {
    sales: '#10b981',      // Emerald
    crm: '#3b82f6',        // Blue
    inventory: '#f59e0b',  // Amber
    finance: '#8b5cf6',    // Violet
    hrm: '#ec4899',        // Pink
  }
} as const;
```

### **Component Variants**
```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## 🔧 **Development Workflow**

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/module-name
git commit -m "feat(module): add new feature"
git push origin feature/module-name

# Commit message format
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs(scope): description     # Documentation
style(scope): description    # Code style
refactor(scope): description # Code refactoring
test(scope): description     # Tests
chore(scope): description    # Maintenance
```

### **Code Quality Gates**
```bash
# Pre-commit hooks
npm run lint:fix          # ESLint + Prettier
npm run type-check        # TypeScript validation
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
```

---

## 📊 **Performance Standards**

### **Core Web Vitals Targets**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Bundle Size**: < 200KB gzipped

### **Optimization Strategies**
```typescript
// Code splitting by module
const SalesModule = lazy(() => import('@/modules/sales'));
const CRMModule = lazy(() => import('@/modules/crm'));

// Optimized API calls
const useOptimizedQuery = (key: string) => {
  return useQuery({
    queryKey: [key],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

---

## 🧪 **Testing Strategy**

### **Testing Pyramid**
```
E2E Tests (Playwright)     ← 5%  Integration testing
Integration Tests (Jest)   ← 15% API + Component integration  
Unit Tests (Jest + RTL)    ← 80% Individual functions/components
```

### **Test Standards**
```typescript
// Component testing template
describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName title="Test" data={[]} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const onAction = jest.fn();
    render(<ComponentName title="Test" data={[]} onAction={onAction} />);
    
    await user.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

---

## 🚀 **Deployment & CI/CD**

### **Deployment Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy TazaCore
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: npm run deploy
```

---

## 📖 **Documentation Standards**

### **Code Documentation**
```typescript
/**
 * Calculates user permissions based on role and module access
 * 
 * @param user - User object with role information
 * @param module - Target module identifier
 * @returns Array of permissions for the specified module
 * 
 * @example
 * ```typescript
 * const permissions = calculatePermissions(user, 'sales');
 * console.log(permissions); // ['read', 'create', 'update']
 * ```
 */
export function calculatePermissions(user: User, module: string): Permission[] {
  // Implementation
}
```

---

This unified standard ensures:
- ✅ **Consistency**: Same patterns across all modules
- ✅ **Scalability**: Easy to add new modules
- ✅ **Maintainability**: Clear structure and documentation
- ✅ **Performance**: Optimized for production
- ✅ **Developer Experience**: Clear guidelines and tooling

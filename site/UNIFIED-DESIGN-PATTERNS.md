# 🎯 TazaCore Design Patterns & Code Standards

## 📋 Mục tiêu đồng nhất

Tài liệu này nhằm đồng nhất các pattern design và coding standards trong toàn bộ dự án TazaCore.

## ⚛️ React Component Patterns

### 1. Component Structure Standard

```tsx
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
```

### 2. Hook Pattern Standard

```tsx
// ============================================================================
// IMPORTS
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types/global';

// ============================================================================
// INTERFACES
// ============================================================================
interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================
export function useApi<T>(url: string, options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      setData(result.data);
      options.onSuccess?.(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
```

## 📁 File Organization Standards

### Directory Structure

```
src/
├── types/                     # 📝 Global type definitions
│   ├── global.ts             # Core shared types
│   ├── api.ts                # API related types
│   ├── auth.ts               # Authentication types
│   └── common.ts             # Common application types
├── components/               # 🧩 Shared components
│   ├── ui/                   # Basic UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts          # Barrel exports
│   ├── forms/                # Form components
│   ├── layout/               # Layout components
│   └── features/             # Feature-specific components
├── hooks/                    # 🎣 Custom React hooks
│   ├── useAuth.tsx
│   ├── useApi.ts
│   ├── useTheme.tsx
│   └── index.ts              # Barrel exports
├── lib/                      # 🔧 Utilities and configurations
│   ├── utils/                # Helper functions
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── config/               # Configuration files
│   ├── api/                  # API clients
│   └── validators/           # Validation schemas
└── app/                      # 📱 Next.js app directory
```

### Naming Conventions

#### Files & Folders

```bash
# ✅ Components (PascalCase)
Button.tsx
UserProfile.tsx
DataTable.tsx

# ✅ Hooks (camelCase with 'use' prefix)
useAuth.tsx
useLocalStorage.ts
useEmployeeData.ts

# ✅ Utils & Configs (camelCase)
helpers.ts
apiClient.ts
themeConfig.ts

# ✅ Types (camelCase)
userTypes.ts
apiTypes.ts
commonTypes.ts

# ✅ Folders (kebab-case)
user-profile/
data-table/
auth-forms/
```

#### Variables & Functions

```typescript
// ✅ Variables (camelCase)
const userName = 'john';
const isLoading = false;
const apiResponse = await fetch();

// ✅ Functions (camelCase)
const fetchUserData = async () => {};
const handleSubmit = () => {};
const validateForm = () => {};

// ✅ Constants (SCREAMING_SNAKE_CASE)
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Types & Interfaces (PascalCase)
interface UserProfile {}
type ButtonVariant = 'primary' | 'secondary';
enum UserRole {}
```

## 🔗 TypeScript Patterns

### Interface Design

```typescript
// ============================================================================
// BASE INTERFACES
// ============================================================================
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// SPECIFIC INTERFACES
// ============================================================================
interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
}

interface ComponentProps extends BaseComponentProps {
  // Component-specific props
  title: string;
  onAction?: () => void;
}

// ============================================================================
// API INTERFACES
// ============================================================================
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Union Types & Enums

```typescript
// ✅ Union types for specific values
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ThemeMode = 'light' | 'dark' | 'auto';
type UserStatus = 'active' | 'inactive' | 'pending';

// ✅ Enums for related constants
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
```

## 📦 Import/Export Patterns

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import axios from 'axios';

// 2. Internal utilities and configs
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/lib/config';

// 3. Components (external to internal)
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// 4. Types
import type { User, ApiResponse } from '@/types';

// 5. Relative imports
import './styles.css';
```

### Export Patterns

```typescript
// ✅ Named exports for components
export const Button: React.FC<ButtonProps> = () => {};
export const Modal: React.FC<ModalProps> = () => {};

// ✅ Barrel exports (index.ts)
export { Button } from './Button';
export { Modal } from './Modal';
export { Input } from './Input';
export * from './types';

// ✅ Default export only for pages
export default function HomePage() {}

// ✅ Type-only exports
export type { ButtonProps, ModalProps } from './types';
```

## 🎨 Styling Patterns

### CSS Classes with clsx

```typescript
import { cn } from '@/lib/utils';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  children
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none',

        // Variant styles
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',

        // Size styles
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',

        // State styles
        disabled && 'opacity-50 cursor-not-allowed',

        // Custom className
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'monochrome' | 'colorful';
  language: 'vi' | 'en';
  animationLevel: 'none' | 'reduced' | 'full';
}

const THEME_COLORS = {
  light: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    border: '#e5e7eb',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
  },
};
```

## 🔧 Error Handling Patterns

### API Error Handling

```typescript
interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

class ApiClient {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError({
        message: errorData.message || 'Request failed',
        code: errorData.code,
        status: response.status,
        details: errorData,
      });
    }

    return response.json();
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: 'Network error occurred',
        details: error,
      });
    }
  }
}
```

### Component Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🎯 Performance Patterns

### Memoization

```typescript
// Component memoization
export const ExpensiveComponent = React.memo<Props>(
  ({ data, onAction }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison logic
    return prevProps.data.id === nextProps.data.id;
  }
);

// Hook memoization
export function useExpensiveComputation(data: any[]) {
  const computedValue = useMemo(() => {
    return data.reduce((acc, item) => {
      // Expensive computation
      return acc + item.value;
    }, 0);
  }, [data]);

  const expensiveCallback = useCallback((item: any) => {
    // Expensive callback logic
  }, []);

  return { computedValue, expensiveCallback };
}
```

### Lazy Loading

```typescript
// Component lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Usage with Suspense
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// Dynamic imports in hooks
export function useDynamicImport<T>(importFunc: () => Promise<T>) {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    importFunc()
      .then(setModule)
      .finally(() => setLoading(false));
  }, [importFunc]);

  return { module, loading };
}
```

## 📊 State Management Patterns

### Local State

```typescript
// Simple state
const [count, setCount] = useState(0);

// Complex state with reducer
interface State {
  data: any[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'FETCH_ERROR'; payload: string };

function dataReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Usage
const [state, dispatch] = useReducer(dataReducer, {
  data: [],
  loading: false,
  error: null,
});
```

### Context Pattern

```typescript
// Context definition
interface AppContextType {
  user: User | null;
  theme: ThemeConfig;
  updateUser: (user: User) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const updateUser = useCallback((user: User) => {
    setUser(user);
  }, []);

  const updateTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  }, []);

  const value = useMemo(() => ({
    user,
    theme,
    updateUser,
    updateTheme,
  }), [user, theme, updateUser, updateTheme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

## ✅ Best Practices Checklist

### Code Quality

- [ ] All components have TypeScript interfaces
- [ ] Error boundaries are implemented
- [ ] Loading states are handled
- [ ] Proper error handling in async operations
- [ ] Components are memoized when appropriate
- [ ] Hooks follow the rules of hooks

### Performance

- [ ] Large lists are virtualized
- [ ] Images are optimized and lazy loaded
- [ ] Bundle is analyzed and optimized
- [ ] Unused code is eliminated
- [ ] API calls are debounced/throttled when needed

### Accessibility

- [ ] Semantic HTML is used
- [ ] ARIA attributes are properly set
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards
- [ ] Screen reader support is implemented

### Security

- [ ] User inputs are validated and sanitized
- [ ] XSS protection is implemented
- [ ] CSRF protection is in place
- [ ] Authentication is properly handled
- [ ] Sensitive data is not exposed

### Testing

- [ ] Unit tests cover critical functions
- [ ] Integration tests cover user flows
- [ ] E2E tests cover main features
- [ ] Tests are maintainable and readable

## 🚀 Migration Guide

### From Current State to Standards

1. **Update all components** to follow the new structure
2. **Consolidate type definitions** in `src/types/`
3. **Implement consistent naming** across all files
4. **Add barrel exports** for better imports
5. **Update error handling** to use standard patterns
6. **Add performance optimizations** where needed

### Priority Order

1. **High Priority**: Types, Components, Hooks
2. **Medium Priority**: Utils, API clients, Styling
3. **Low Priority**: Documentation, Examples, Tests

---

_Tài liệu này sẽ được cập nhật thường xuyên để phản ánh các thay đổi và cải tiến trong dự án._

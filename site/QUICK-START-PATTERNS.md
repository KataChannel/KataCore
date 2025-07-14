# 🚀 Quick Start - Áp dụng Design Patterns mới

## 🎯 Mục tiêu

Hướng dẫn nhanh để áp dụng design patterns và coding standards mới trong TazaCore.

## 📋 Checklist nhanh

### 1. Thiết lập môi trường (5 phút)

```bash
# Di chuyển đến thư mục site
cd site

# Cài đặt dependencies
bun install

# Format toàn bộ code theo standards mới
bun run format

# Fix linting issues
bun run lint:fix

# Kiểm tra TypeScript
bun run type-check
```

### 2. Cập nhật import statements (10 phút)

Thay đổi tất cả imports theo pattern mới:

```tsx
// ❌ Cũ
import Button from '../../../components/ui/Button';
import { User } from '../../../types/user';

// ✅ Mới
import { Button } from '@/components/ui';
import type { User } from '@/types';
```

### 3. Chuẩn hóa component structure (15 phút mỗi component)

#### Template component mới:

```tsx
// ============================================================================
// IMPORTS
// ============================================================================
import React from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { BaseComponentProps } from '@/types';

// ============================================================================
// INTERFACES
// ============================================================================
interface ComponentProps extends BaseComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onAction?: () => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const Component: React.FC<ComponentProps> = ({
  title,
  variant = 'primary',
  onAction,
  disabled = false,
  className,
  children,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(() => {
    if (disabled) return;
    onAction?.();
  }, [disabled, onAction]);

  return (
    <div
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        disabled && 'disabled-styles',
        className
      )}
      {...props}
    >
      <h3>{title}</h3>
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default Component;
export type { ComponentProps };
```

### 4. Chuẩn hóa hook structure (10 phút mỗi hook)

#### Template hook mới:

```tsx
// ============================================================================
// IMPORTS
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types';

// ============================================================================
// INTERFACES
// ============================================================================
interface UseHookOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================
export function useHook<T>(url: string, options: UseHookOptions<T> = {}): UseHookReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Implementation
  }, [url, options]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return { data, loading, error, refetch: fetchData };
}
```

## 🎨 Styling Quick Guide

### 1. Sử dụng clsx pattern

```tsx
import { cn } from '@/lib/utils';

const className = cn(
  'base-styles',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  disabled && 'opacity-50 cursor-not-allowed',
  customClassName
);
```

### 2. Theme-aware components

```tsx
import { useUnifiedTheme } from '@/hooks';

export const ThemedComponent = () => {
  const { colors, actualMode } = useUnifiedTheme();

  return (
    <div
      className={cn('unified-card', actualMode === 'dark' && 'dark-theme-specific')}
      style={{ backgroundColor: colors.surface }}
    >
      Content
    </div>
  );
};
```

## 📁 File Organization Quick Actions

### 1. Di chuyển files vào structure mới

```bash
# Components
mkdir -p src/components/{ui,forms,layout,features,common}

# Types
mkdir -p src/types

# Hooks
mkdir -p src/hooks

# Utils
mkdir -p src/lib/{utils,config,api,validators}
```

### 2. Tạo barrel exports

```tsx
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Dialog } from './Dialog';
export type { ButtonProps, InputProps, DialogProps };

// src/types/index.ts
export * from './global';
export * from './api';
export * from './auth';
export * from './common';

// src/hooks/index.ts
export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { useUnifiedTheme } from './useUnifiedTheme';
```

## ⚡ Performance Quick Wins

### 1. Component memoization

```tsx
export const ExpensiveComponent = React.memo<Props>(
  ({ data }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. Hook optimization

```tsx
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

const stableCallback = useCallback(
  (item) => {
    // Logic here
  },
  [dependency]
);
```

## 🔧 Development Workflow

### 1. Trước khi code

```bash
# Pull latest changes
git pull origin main

# Kiểm tra formatting
bun run format

# Kiểm tra linting
bun run lint:fix
```

### 2. Khi develop

```bash
# Chạy development server
bun run dev

# Mở tab khác để watch TypeScript
bun run type-check --watch
```

### 3. Trước khi commit

```bash
# Format code
bun run format

# Fix linting
bun run lint:fix

# Type check
bun run type-check

# Test (nếu có)
bun run test
```

## 🏃‍♂️ Quick Migration Checklist

### Component Migration (per component)

- [ ] Move to correct folder structure
- [ ] Update imports to use barrel exports
- [ ] Add proper TypeScript interface
- [ ] Follow component structure template
- [ ] Add error boundary if needed
- [ ] Optimize with memo/callback if needed
- [ ] Update exports in barrel file

### Hook Migration (per hook)

- [ ] Move to src/hooks/
- [ ] Follow hook structure template
- [ ] Add proper TypeScript interfaces
- [ ] Add error handling
- [ ] Optimize with useCallback/useMemo
- [ ] Add to hooks barrel export

### Type Migration

- [ ] Move types to src/types/
- [ ] Follow naming conventions
- [ ] Extend base interfaces where appropriate
- [ ] Add to types barrel export
- [ ] Update imports across project

## 🚨 Common Issues & Solutions

### 1. Import errors

```tsx
// ❌ Error: Module not found
import { Button } from './ui/Button';

// ✅ Solution: Use barrel exports
import { Button } from '@/components/ui';
```

### 2. TypeScript errors

```tsx
// ❌ Error: any type
const data: any = fetchData();

// ✅ Solution: Proper typing
const data: ApiResponse<User[]> = await fetchData();
```

### 3. Performance issues

```tsx
// ❌ Problem: Re-rendering
const onClick = () => doSomething();

// ✅ Solution: useCallback
const onClick = useCallback(() => doSomething(), []);
```

## 📚 Resources

- **Main Guide**: `UNIFIED-DESIGN-PATTERNS.md`
- **Progress Tracking**: `UNIFICATION-REPORT.md`
- **Coding Standards**: `CODING_STANDARDS.md`
- **Scripts**: `scripts/unify-code-patterns.sh`

## 🆘 Need Help?

1. **Documentation**: Kiểm tra các file guide trên
2. **Examples**: Xem implementation hiện tại trong project
3. **Code Review**: Yêu cầu review từ team members
4. **Issues**: Tạo issue trong project nếu gặp blockers

---

🎯 **Mục tiêu**: Trong 1 tuần, tất cả components chính đã được migrate theo patterns mới.

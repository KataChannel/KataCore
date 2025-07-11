# Coding Standards & Design Patterns - TazaGroup

## 📋 Table of Contents
1. [TypeScript Patterns](#typescript-patterns)
2. [React Component Patterns](#react-component-patterns)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [Interface & Type Patterns](#interface--type-patterns)
6. [Import/Export Patterns](#importexport-patterns)

## 🎯 TypeScript Patterns

### Interface Naming
```typescript
// ✅ Good - Use PascalCase with descriptive names
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// ❌ Bad
interface userProfile { }
interface props { }
```

### Type Definitions
```typescript
// ✅ Good - Use union types for specific values
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ThemeMode = 'light' | 'dark' | 'auto';

// ✅ Good - Use generic types when needed
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

## ⚛️ React Component Patterns

### Function Component Definition
```typescript
// ✅ Good - Standard pattern với interface Props
interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(getButtonStyles(variant), className)}
    >
      {children}
    </button>
  );
};

// ❌ Bad - Inconsistent patterns
export default function Button(props: any) { }
```

### Props Interface Pattern
```typescript
// ✅ Good - Always define props interface
interface ComponentNameProps {
  // Required props first
  title: string;
  data: DataType[];
  
  // Optional props second
  className?: string;
  onAction?: (item: DataType) => void;
  
  // Children last if needed
  children?: React.ReactNode;
}
```

### Export Pattern
```typescript
// ✅ Good - Named exports preferred
export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  // Component logic
};

// ✅ Good - Default export only for pages
export default function PageName() {
  return <div>Page content</div>;
}
```

## 📁 File Organization

### Directory Structure
```
src/
├── types/              # Global type definitions
│   ├── api.ts         # API related types
│   ├── auth.ts        # Authentication types  
│   ├── common.ts      # Common shared types
│   └── ui.ts          # UI component types
├── components/        # Shared components
│   ├── ui/           # Basic UI components
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── hooks/            # Custom hooks
├── lib/              # Utilities and configurations
│   ├── utils/        # Utility functions
│   ├── config/       # Configuration files
│   └── validators/   # Validation schemas
└── app/              # Next.js app directory
```

### Component File Naming
```
// ✅ Good
Button.tsx
UserProfile.tsx
DataTable.tsx

// ❌ Bad  
button.tsx
userprofile.tsx
dataTable.tsx
```

## 🏷️ Naming Conventions

### Variables & Functions
```typescript
// ✅ Good - camelCase
const userName = 'john';
const fetchUserData = async () => {};
const isLoading = false;

// ❌ Bad
const user_name = 'john';
const FetchUserData = async () => {};
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const apiBaseUrl = 'https://api.example.com';
```

### Component & Interface Names
```typescript
// ✅ Good - PascalCase
interface UserProfileProps { }
const UserProfile: React.FC<UserProfileProps> = () => {};

// ❌ Bad
interface userProfileProps { }
const userProfile = () => {};
```

## 🔗 Interface & Type Patterns

### Base Interfaces
```typescript
// Common base patterns to extend
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface BaseModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
}
```

### API Response Types
```typescript
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
// ✅ Good - Named exports for components
export const Button: React.FC<ButtonProps> = () => {};
export const Modal: React.FC<ModalProps> = () => {};

// ✅ Good - Barrel exports for related items
// index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Input } from './Input';

// ✅ Good - Default export only for pages
export default function HomePage() {}
```

## 🎨 Theme & Styling Patterns

### CSS Class Naming
```typescript
// ✅ Good - Use utility function for className management
import { cn } from '@/lib/utils';

const Button: React.FC<ButtonProps> = ({ className, variant }) => {
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        className
      )}
    />
  );
};
```

### Theme Configuration
```typescript
// Use centralized theme configuration
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'monochrome' | 'colorful';
  language: 'vi' | 'en';
}
```

## 🔧 Custom Hooks Patterns

```typescript
// ✅ Good - Hook naming and structure
interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  url: string, 
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Hook logic here

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(),
  };
}
```

## ✅ Best Practices Summary

1. **Always use TypeScript** - Define interfaces for all props and data structures
2. **Consistent component patterns** - Use React.FC with proper props interfaces  
3. **File organization** - Follow the established directory structure
4. **Naming conventions** - PascalCase for components/interfaces, camelCase for variables
5. **Import organization** - Follow the specified import order
6. **Code reusability** - Create shared components and utilities
7. **Type safety** - Avoid `any` types, use proper generics
8. **Performance** - Use React.memo, useMemo, useCallback when appropriate
9. **Accessibility** - Include proper ARIA attributes and semantic HTML
10. **Documentation** - Comment complex logic and provide JSDoc for public APIs

## 🚀 Enforcement

- Use ESLint and Prettier for code formatting
- Set up pre-commit hooks for code quality checks
- Regular code reviews focusing on these standards
- TypeScript strict mode enabled
- Automated testing for components and utilities

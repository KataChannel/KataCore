# 🚀 Next.js v15 Project Structure Optimization Guide

## 📁 Cấu trúc dự án chuẩn Next.js v15 - TazaCore

### Current Structure Analysis
```
tazagroup/
├── app/                          # ✅ App Router (Next.js 13+)
│   ├── (auth)/                   # ✅ Route Groups  
│   ├── (dashboard)/              # ✅ Layout groups
│   ├── admin/                    # ✅ Admin routes
│   ├── api/                      # ✅ API Routes
│   ├── layout.tsx                # ✅ Root layout
│   ├── loading.tsx               # ✅ Loading UI
│   ├── error.tsx                 # ✅ Error boundaries
│   ├── global-error.tsx          # ✅ Global error handling
│   ├── not-found.tsx             # ✅ 404 pages
│   └── page.tsx                  # ✅ Home page
├── src/                          # ✅ Source directory
│   ├── app/                      # ⚠️  Duplicate app structure
│   ├── components/               # ✅ React components
│   ├── hooks/                    # ✅ Custom hooks
│   ├── lib/                      # ✅ Utilities & configs
│   ├── types/                    # ✅ TypeScript types
│   └── styles/                   # ✅ Global styles
├── public/                       # ✅ Static assets
├── prisma/                       # ✅ Database schema
├── docs/                         # ✅ Documentation
├── sh/                           # ✅ Shell scripts
├── next.config.ts                # ✅ Next.js config
├── tailwind.config.ts            # ✅ Tailwind config
├── tsconfig.json                 # ✅ TypeScript config
├── package.json                  # ✅ Dependencies
└── .env.*                        # ✅ Environment vars
```

## 🔧 Optimization Recommendations

### 1. Cấu trúc thư mục tối ưu

#### ✅ Recommended Structure:
```
tazagroup/
├── app/                          # App Router - Single source of truth
│   ├── (auth)/                   # Authentication routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard routes group  
│   │   ├── admin/
│   │   ├── user/
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── v1/                   # API versioning
│   │   └── health/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── loading.tsx              # Global loading
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 page
│   └── page.tsx                 # Homepage
├── src/                         # Source code
│   ├── components/              # UI Components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   └── features/            # Feature-specific components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities & configurations
│   │   ├── auth/                # Authentication logic
│   │   ├── db/                  # Database utilities
│   │   ├── api/                 # API client utilities
│   │   ├── utils/               # General utilities
│   │   └── config/              # Configuration files
│   ├── types/                   # TypeScript type definitions
│   ├── stores/                  # State management (Zustand/Redux)
│   └── middleware/              # Custom middleware
├── public/                      # Static assets
│   ├── icons/                   # App icons
│   ├── images/                  # Images
│   └── manifest.json            # PWA manifest
├── prisma/                      # Database
│   ├── schema.prisma           
│   ├── migrations/
│   └── seed/
├── docs/                        # Documentation
├── scripts/                     # Build & utility scripts
├── .next/                       # Next.js build output
└── configs/                     # Configuration files
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── tailwind.config.ts
    └── tsconfig.json
```

### 2. File Naming Conventions

#### ✅ Best Practices:
```typescript
// Page components
app/admin/users/page.tsx         // ✅ Lowercase, descriptive
app/admin/users/[id]/page.tsx    // ✅ Dynamic routes

// Layout components  
app/admin/layout.tsx             // ✅ Layout files
app/(dashboard)/layout.tsx       // ✅ Group layouts

// Component files
components/ui/Button.tsx         // ✅ PascalCase for components
components/forms/UserForm.tsx    // ✅ Descriptive names

// Utility files
lib/utils/formatDate.ts          // ✅ camelCase for utilities
lib/auth/authService.ts          // ✅ Service suffix

// Type files
types/user.ts                    // ✅ Lowercase for types
types/api.ts                     // ✅ Grouped by domain
```

### 3. Import Optimization

#### ✅ Path Mapping (tsconfig.json):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./app/*"],
      "@/public/*": ["./public/*"]
    }
  }
}
```

#### ✅ Barrel Exports:
```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';

// Usage
import { Button, Input, Card } from '@/components/ui';
```

### 4. Performance Optimizations

#### ✅ Next.js 15 Features:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    // Server Components optimization
    serverComponentsExternalPackages: [
      'prisma', '@prisma/client', 'bcryptjs'
    ],
    
    // Package imports optimization
    optimizePackageImports: [
      'lucide-react', 'date-fns', '@radix-ui/react-icons'
    ],
    
    // Turbopack (dev performance)
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack']
      }
    }
  }
};
```

### 5. Code Organization

#### ✅ Feature-based Structure:
```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── dashboard/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── admin/
    ├── users/
    ├── roles/
    └── settings/
```

### 6. API Structure

#### ✅ Versioned API Routes:
```
app/api/
├── v1/
│   ├── auth/
│   ├── users/
│   └── admin/
├── v2/           # Future versions
├── webhooks/     # Webhook endpoints
└── health/       # Health checks
```

## 🚀 Implementation Steps

### Step 1: Clean duplicate structures
```bash
# Remove duplicate app directory
rm -rf src/app/

# Consolidate components
mv src/components/ui/ components/ui/
```

### Step 2: Update imports
```bash
# Update all import paths
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|src/components|@/components|g'
```

### Step 3: Optimize configurations
```bash
# Update next.config.ts with optimizations
# Update tsconfig.json with better paths
# Update package.json scripts
```

## 📊 Expected Benefits

1. **Build Performance**: 40-60% faster builds
2. **Dev Performance**: 30-50% faster HMR
3. **Bundle Size**: 20-30% smaller bundles
4. **Type Safety**: Better TypeScript integration
5. **Developer Experience**: Cleaner imports, better IntelliSense

## 🎯 Migration Checklist

- [ ] Remove duplicate `src/app/` directory
- [ ] Consolidate component structure
- [ ] Update import paths  
- [ ] Optimize next.config.ts
- [ ] Update TypeScript paths
- [ ] Test build and dev performance
- [ ] Update documentation
- [ ] Train team on new structure

## 🔧 Tools & Scripts

```bash
# Performance analysis
npm run build:analyze

# Bundle size check  
npm run build:bundle-analyzer

# Type checking
npm run type-check

# Lint and format
npm run lint:fix
```

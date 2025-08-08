# 🔄 Migration Next.js 15 Structure Guide

## Vấn đề hiện tại
- **Xung đột paths**: `@/components/*` đang point tới `./app/components/*` 
- **Cấu trúc không chuẩn**: Có cả `/components/` và `/app/components/`
- **Import confusion**: Không rõ ràng component nào là global, local

## Cấu trúc Next.js 15 chuẩn

```
project/
├── app/                    # App Router
│   ├── components/        # Page-specific components (local to routes)
│   ├── hooks/            # Page-specific hooks (local to routes)
│   └── (routes)/
├── components/           # Global shared components
├── hooks/               # Global shared hooks
├── lib/                # Utilities, configs, theme
└── types/              # Type definitions
```

## 1. Cập nhật tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./components/*"],           // Global components
      "@/app-components/*": ["./app/components/*"],   // Local app components  
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],                     // Global hooks
      "@/app-hooks/*": ["./app/hooks/*"],            // Local app hooks
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/public/*": ["./public/*"]
    }
  }
}
```

## 2. Phân loại Components

### Global Components (→ `/components/`)
- ThemeManager.tsx ✅
- ThemeProvider.tsx
- ErrorBoundary.tsx
- Layout components
- UI library components

### Local Components (→ `/app/components/`)
- Page-specific components
- Route-specific layouts
- Forms cho specific pages

## 3. Phân loại Hooks

### Global Hooks (→ `/hooks/`)
- useUnifiedTheme ✅
- useAuth
- useLocalStorage
- Custom hooks dùng chung

### Local Hooks (→ `/app/hooks/`)
- Page-specific business logic
- Route-specific data fetching

## 4. Migration Steps

### Step 1: Backup
```bash
mkdir -p migration_backup_$(date +%Y%m%d_%H%M%S)
cp -r app/components migration_backup_*/app_components_backup
cp -r app/hooks migration_backup_*/app_hooks_backup
```

### Step 2: Move Global Components
```bash
# ThemeManager là global component
mv app/components/ThemeManager.tsx components/

# Các global components khác
mv app/components/*Provider.tsx components/
mv app/components/*Layout.tsx components/
mv app/components/*Manager.tsx components/
```

### Step 3: Update Imports
Thay đổi imports từ:
```typescript
// CŨ - Sai
import { ThemeManager } from '@/app/components/ThemeManager';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

// MỚI - Đúng
import { ThemeManager } from '@/components/ThemeManager';
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';
```

### Step 4: Fix ThemeInitScript Error
```typescript
// app/layout.tsx
import { ThemeInitScript } from '@/components/ThemeManager';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <meta name="application-name" content="TazaCore" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## 5. Import Rules

### Global imports
```typescript
import { ThemeManager } from '@/components/ThemeManager';
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';
import { UNIFIED_THEME_CONFIG } from '@/lib/config/unified-theme';
```

### Local app imports  
```typescript
import { LoginForm } from '@/app-components/LoginForm';
import { usePageData } from '@/app-hooks/usePageData';
```

## 6. Verification

Sau khi migration, kiểm tra:
- [ ] Build thành công: `npm run build`
- [ ] No TypeScript errors
- [ ] ThemeInitScript works
- [ ] All imports resolved correctly

## 7. Benefits

✅ **Rõ ràng**: Phân biệt global vs local components  
✅ **Maintainable**: Dễ maintain và scale  
✅ **Next.js 15 compliant**: Theo chuẩn mới nhất  
✅ **No conflicts**: Loại bỏ xung đột paths  

## 8. Migration Script

Chạy script tự động:
```bash
chmod +x migrate-structure-nextjs15.sh
./migrate-structure-nextjs15.sh
```

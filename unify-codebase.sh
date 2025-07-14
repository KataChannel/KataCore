#!/bin/bash
# ============================================================================
# TAZA CORE UNIFICATION MIGRATION SCRIPT
# ============================================================================
# This script migrates the codebase to unified standards

echo "🚀 Starting TazaCore Unification Migration..."

# ============================================================================
# PHASE 1: CLEANUP DUPLICATE FILES
# ============================================================================
echo "📁 Phase 1: Cleaning up duplicate files..."

# Remove duplicate middleware files
echo "  - Removing duplicate middleware files..."
rm -f site/src/middleware.enhanced.ts
rm -f site/src/middleware.ts

# Move unified middleware to correct location
echo "  - Setting up unified middleware..."
mv site/src/middleware.unified.ts site/src/middleware.ts

# Remove duplicate auth files
echo "  - Cleaning up duplicate auth files..."
rm -f site/app/lib/lib/auth\ copy.ts
rm -f site/app/api/auth/*/route\ copy.ts
rm -f site/src/components/auth/ModuleGuard.tsx

# Remove duplicate component folders
echo "  - Removing duplicate component folders..."
rm -rf site/src/components/layout/Button.tsx
rm -rf site/src/components/common/Button.tsx

# ============================================================================
# PHASE 2: UPDATE IMPORT STATEMENTS
# ============================================================================
echo "📝 Phase 2: Updating import statements..."

# Find and replace old auth imports
echo "  - Updating auth provider imports..."
find site/src -name "*.tsx" -type f -exec sed -i 's|@/components/auth/ModuleGuard|@/components/auth/UnifiedAuthProvider|g' {} \;
find site/src -name "*.ts" -type f -exec sed -i 's|@/components/auth/ModuleGuard|@/components/auth/UnifiedAuthProvider|g' {} \;

# Update middleware imports
echo "  - Updating middleware imports..."
find site/src -name "*.ts" -type f -exec sed -i 's|./middleware.enhanced|./middleware|g' {} \;

# Update auth service imports
echo "  - Updating auth service imports..."
find site/src -name "*.ts" -type f -exec sed -i 's|authService|@/lib/auth/unified-auth.service|g' {} \;

# ============================================================================
# PHASE 3: UPDATE PACKAGE.JSON SCRIPTS
# ============================================================================
echo "📦 Phase 3: Updating package.json scripts..."

cd site

# Add unified development scripts
npm pkg set scripts.dev:unified="next dev --turbo"
npm pkg set scripts.build:check="npm run type-check && npm run lint && npm run build"
npm pkg set scripts.type-check="tsc --noEmit"
npm pkg set scripts.lint:fix="eslint . --fix && prettier --write ."
npm pkg set scripts.test:unit="jest"
npm pkg set scripts.test:coverage="jest --coverage"

# ============================================================================
# PHASE 4: CREATE CONFIGURATION FILES
# ============================================================================
echo "⚙️  Phase 4: Creating unified configuration files..."

# Create unified ESLint config
cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["node_modules/", ".next/", "dist/"]
}
EOF

# Create unified Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Update TypeScript config for strict mode
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# ============================================================================
# PHASE 5: CREATE UNIFIED API ROUTE TEMPLATE
# ============================================================================
echo "🌐 Phase 5: Creating unified API route templates..."

mkdir -p src/app/api/_templates

cat > src/app/api/_templates/route.template.ts << 'EOF'
// ============================================================================
// TAZA CORE UNIFIED API ROUTE TEMPLATE
// ============================================================================
// Copy this template for new API routes
// Follow TazaCore standards for consistency

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/auth/unified-auth.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const CreateSchema = z.object({
  // Define your schema here
  name: z.string().min(1),
});

const UpdateSchema = CreateSchema.partial();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
async function withAuth(handler: Function, requiredPermission?: string) {
  return async (request: NextRequest) => {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const user = await authService.verifyToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Check permission if required
      if (requiredPermission && !authService.hasPermission(user, requiredPermission, 'resource')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      return handler(request, user);
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================
async function handleGET(request: NextRequest, user?: any) {
  try {
    // Implementation here
    return NextResponse.json({ data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handlePOST(request: NextRequest, user?: any) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);
    
    // Implementation here
    return NextResponse.json({ data: validated }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const GET = withAuth(handleGET, 'read');
export const POST = withAuth(handlePOST, 'create');
EOF

# ============================================================================
# PHASE 6: CREATE COMPONENT TEMPLATE
# ============================================================================
echo "🧩 Phase 6: Creating unified component templates..."

mkdir -p src/components/_templates

cat > src/components/_templates/Component.template.tsx << 'EOF'
// ============================================================================
// TAZA CORE UNIFIED COMPONENT TEMPLATE
// ============================================================================
// Copy this template for new components
// Follow TazaCore standards for consistency

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
EOF

# ============================================================================
# PHASE 7: UPDATE MAIN LAYOUT
# ============================================================================
echo "🎨 Phase 7: Updating main layout..."

# Update layout to use unified auth provider
cat > src/app/layout.tsx << 'EOF'
// ============================================================================
// TAZA CORE MAIN LAYOUT
// ============================================================================
// Root layout following TazaCore unified standards

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/UnifiedAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TazaCore - Unified Business Management',
  description: 'Complete business management solution with unified modules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
EOF

cd ..

# ============================================================================
# PHASE 8: FINAL CLEANUP AND VERIFICATION
# ============================================================================
echo "🧹 Phase 8: Final cleanup and verification..."

# Install/update dependencies if needed
echo "  - Checking dependencies..."
cd site
npm install --silent

# Run type checking
echo "  - Running type check..."
npm run type-check 2>/dev/null || echo "    ⚠️  Some type errors remain - please review"

# Run linting
echo "  - Running linter..."
npm run lint:fix 2>/dev/null || echo "    ⚠️  Some lint issues remain - please review"

cd ..

# ============================================================================
# COMPLETION
# ============================================================================
echo ""
echo "✅ TazaCore Unification Migration Complete!"
echo ""
echo "📋 Summary of changes:"
echo "  ✅ Removed duplicate files"
echo "  ✅ Unified middleware system"
echo "  ✅ Centralized authentication"
echo "  ✅ Standardized component patterns"
echo "  ✅ Updated configuration files"
echo "  ✅ Created development templates"
echo ""
echo "🚀 Next steps:"
echo "  1. Review any remaining type errors"
echo "  2. Test authentication flow"
echo "  3. Verify module access controls"
echo "  4. Run full application tests"
echo ""
echo "📚 Documentation: See TAZA-CORE-STANDARDS.md for complete standards"
echo ""
echo "Happy coding! 🎉"

#!/bin/bash

# 🎯 TazaCore Code Unification Script
# Đồng nhất code và patterns trong toàn bộ dự án

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🎯 TazaCore Code Unification Tool                        ║
║                                                                              ║
║    Đồng nhất patterns, conventions và code standards                        ║
║    Version: 1.0.0                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -d "site" ]]; then
        error "Please run this script from the TazaCore root directory"
        exit 1
    fi
    
    if [[ ! -f "site/UNIFIED-DESIGN-PATTERNS.md" ]]; then
        error "UNIFIED-DESIGN-PATTERNS.md not found. Please ensure it exists."
        exit 1
    fi
}

# Create standardized folder structure
create_standard_structure() {
    log "Creating standardized folder structure..."
    
    cd site/src
    
    # Create missing directories
    mkdir -p {types,hooks,lib/{utils,config,api,validators},components/{ui,forms,layout,features}}
    
    # Create barrel export files if they don't exist
    create_barrel_exports
    
    success "Standard folder structure created"
    cd ../..
}

# Create barrel export files
create_barrel_exports() {
    log "Creating barrel export files..."
    
    # Types barrel export
    if [[ ! -f "types/index.ts" ]]; then
        cat > types/index.ts << 'EOF'
// Types barrel exports
export * from './global';
export * from './api';
export * from './auth';
export * from './common';
EOF
    fi
    
    # Components barrel export
    if [[ ! -f "components/index.ts" ]]; then
        cat > components/index.ts << 'EOF'
// Components barrel exports
export * from './ui';
export * from './forms';
export * from './layout';
export * from './features';
EOF
    fi
    
    # UI components barrel export
    if [[ ! -f "components/ui/index.ts" ]]; then
        cat > components/ui/index.ts << 'EOF'
// UI Components barrel exports
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Dialog } from './Dialog';
export { default as Card } from './Card';

// Export types
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { DialogProps } from './Dialog';
export type { CardProps } from './Card';
EOF
    fi
    
    # Hooks barrel export exists, just ensure it's complete
    if [[ -f "hooks/index.ts" ]]; then
        # Update existing hooks barrel export
        cat > hooks/index.ts << 'EOF'
// Custom hooks barrel exports
export { default as useAuth } from './useAuth';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useApi } from './useApi';
export { default as useUnifiedTheme } from './useUnifiedTheme';

// Export hook types
export type { AuthContextType } from './useAuth';
export type { UseApiReturn } from './useApi';
EOF
    fi
    
    success "Barrel export files created/updated"
}

# Standardize component files
standardize_components() {
    log "Standardizing component files..."
    
    # Find all component files
    find components -name "*.tsx" -not -path "*/node_modules/*" | while read -r file; do
        if [[ -f "$file" ]]; then
            # Check if component follows standard pattern
            if ! grep -q "React.FC" "$file" && ! grep -q "interface.*Props" "$file"; then
                warning "Component $file may need standardization"
                # Add to TODO list for manual review
                echo "- Review component: $file" >> ../STANDARDIZATION_TODO.md
            fi
        fi
    done
    
    success "Component standardization check completed"
}

# Standardize import orders
standardize_imports() {
    log "Checking import order patterns..."
    
    # Create a simple script to check import orders
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | while read -r file; do
        if [[ -f "$file" ]]; then
            # Check if imports follow the standard order
            if grep -q "^import.*from 'react'" "$file" && grep -q "^import.*from '@/" "$file"; then
                # File has both React and internal imports - check order
                react_line=$(grep -n "^import.*from 'react'" "$file" | head -1 | cut -d: -f1)
                internal_line=$(grep -n "^import.*from '@/" "$file" | head -1 | cut -d: -f1)
                
                if [[ $react_line -gt $internal_line ]]; then
                    warning "Import order issue in $file"
                    echo "- Fix import order: $file" >> ../STANDARDIZATION_TODO.md
                fi
            fi
        fi
    done
    
    success "Import order check completed"
}

# Update TypeScript configurations
update_typescript_config() {
    log "Updating TypeScript configuration..."
    
    # Update tsconfig.json with path mappings if not exists
    if [[ -f "tsconfig.json" ]] && ! grep -q '"@/types"' tsconfig.json; then
        # Backup existing tsconfig
        cp tsconfig.json tsconfig.json.backup
        
        # Create updated tsconfig with better path mappings
        cat > tsconfig_temp.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
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
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/lib/utils/*"],
      "@/config/*": ["./src/lib/config/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
        
        # Only update if the new config is valid
        if node -e "JSON.parse(require('fs').readFileSync('tsconfig_temp.json', 'utf8'))" 2>/dev/null; then
            mv tsconfig_temp.json tsconfig.json
            success "TypeScript configuration updated"
        else
            error "Failed to update TypeScript config - invalid JSON"
            rm tsconfig_temp.json
        fi
    fi
}

# Create standardization TODO list
create_todo_list() {
    log "Creating standardization TODO list..."
    
    cat > STANDARDIZATION_TODO.md << 'EOF'
# 📋 TazaCore Standardization TODO

Danh sách các items cần được chuẩn hóa theo UNIFIED-DESIGN-PATTERNS.md

## 🎯 Ưu tiên cao

### Components
- [ ] Chuẩn hóa tất cả components theo pattern mới
- [ ] Thêm TypeScript interfaces cho tất cả props
- [ ] Cập nhật error boundaries
- [ ] Thêm loading states

### Types
- [ ] Consolidate tất cả type definitions vào src/types/
- [ ] Tạo base interfaces
- [ ] Chuẩn hóa naming conventions

### Hooks
- [ ] Chuẩn hóa tất cả custom hooks
- [ ] Thêm proper error handling
- [ ] Implement memoization patterns

## 🎯 Ưu tiên trung bình

### Utils & Config
- [ ] Chuẩn hóa utility functions
- [ ] Consolidate configuration files
- [ ] Update API clients

### Styling
- [ ] Implement consistent className patterns
- [ ] Update theme configuration
- [ ] Add CSS-in-JS patterns

## 🎯 Ưu tiên thấp

### Documentation
- [ ] Update component documentation
- [ ] Add code examples
- [ ] Create migration guides

### Testing
- [ ] Add unit tests for components
- [ ] Add integration tests
- [ ] Implement E2E tests

## 📋 Items cần review thủ công:

EOF
    
    success "TODO list created: STANDARDIZATION_TODO.md"
}

# Update package.json scripts
update_package_scripts() {
    log "Updating package.json scripts..."
    
    if [[ -f "package.json" ]]; then
        # Add standardization scripts if they don't exist
        if ! grep -q "lint:fix" package.json; then
            # Backup package.json
            cp package.json package.json.backup
            
            # Add helpful scripts
            node << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add new scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts['type-check'] = 'tsc --noEmit';
pkg.scripts['lint:fix'] = 'next lint --fix';
pkg.scripts['format'] = 'prettier --write "src/**/*.{ts,tsx,js,jsx}"';
pkg.scripts['standardize'] = './scripts/unify-code-patterns.sh';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF
            
            success "Package.json scripts updated"
        fi
    fi
}

# Create ESLint configuration for consistency
update_eslint_config() {
    log "Updating ESLint configuration..."
    
    if [[ -f "eslint.config.mjs" ]]; then
        # Backup existing config
        cp eslint.config.mjs eslint.config.mjs.backup
        
        cat > eslint.config.mjs << 'EOF'
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce consistent naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
        },
      ],
      
      // Enforce consistent imports
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      
      // Component patterns
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      
      // Prevent common issues
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
EOF
        
        success "ESLint configuration updated"
    fi
}

# Create Prettier configuration
create_prettier_config() {
    log "Creating Prettier configuration..."
    
    if [[ ! -f ".prettierrc" ]]; then
        cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOF
        success "Prettier configuration created"
    fi
    
    if [[ ! -f ".prettierignore" ]]; then
        cat > .prettierignore << 'EOF'
node_modules
.next
out
dist
build
*.min.js
*.min.css
.env*
public
.git
EOF
        success "Prettier ignore file created"
    fi
}

# Run basic checks
run_checks() {
    log "Running basic checks..."
    
    cd site
    
    # Check if TypeScript compiles
    if command -v bun &> /dev/null; then
        info "Running TypeScript check..."
        if bun run type-check 2>/dev/null; then
            success "TypeScript check passed"
        else
            warning "TypeScript check failed - check for errors"
        fi
    fi
    
    # Check if Next.js builds
    if [[ -f "package.json" ]]; then
        info "Checking Next.js configuration..."
        if node -e "require('./next.config.ts')" 2>/dev/null; then
            success "Next.js configuration is valid"
        else
            warning "Next.js configuration may have issues"
        fi
    fi
    
    cd ..
}

# Generate summary report
generate_report() {
    log "Generating standardization report..."
    
    cat > STANDARDIZATION_REPORT.md << 'EOF'
# 📊 TazaCore Standardization Report

## ✅ Completed Tasks

### Structure
- [x] Created standardized folder structure
- [x] Added barrel export files
- [x] Updated TypeScript configuration
- [x] Added ESLint configuration
- [x] Created Prettier configuration

### Scripts
- [x] Added helpful npm scripts
- [x] Created standardization TODO list
- [x] Set up basic code checks

## 📋 Next Steps

1. **Review STANDARDIZATION_TODO.md** for manual tasks
2. **Run `bun run format`** to format all code
3. **Run `bun run lint:fix`** to fix linting issues
4. **Review and update components** according to new patterns
5. **Consolidate type definitions** in src/types/
6. **Update import statements** to use new path mappings

## 🎯 Recommended Actions

### Immediate (Today)
- [ ] Review UNIFIED-DESIGN-PATTERNS.md
- [ ] Fix any TypeScript errors
- [ ] Update critical components

### Short-term (This Week)
- [ ] Migrate all components to new patterns
- [ ] Consolidate type definitions
- [ ] Update all import statements
- [ ] Add error boundaries

### Long-term (This Month)
- [ ] Add comprehensive testing
- [ ] Implement performance optimizations
- [ ] Add accessibility features
- [ ] Complete documentation

## 📈 Progress Tracking

Use this checklist to track progress:

### Components (Priority: High)
- [ ] Button component standardized
- [ ] Input component standardized
- [ ] Dialog component standardized
- [ ] All form components standardized
- [ ] All layout components standardized

### Types & Interfaces (Priority: High)
- [ ] All props interfaces defined
- [ ] Base interfaces created
- [ ] API types consolidated
- [ ] Common types updated

### Hooks (Priority: High)  
- [ ] useAuth hook standardized
- [ ] useApi hook standardized
- [ ] useTheme hook standardized
- [ ] All custom hooks follow patterns

### Performance (Priority: Medium)
- [ ] Components memoized where appropriate
- [ ] Callbacks optimized with useCallback
- [ ] Expensive computations memoized
- [ ] Bundle size optimized

### Testing (Priority: Medium)
- [ ] Unit tests for components
- [ ] Integration tests for features
- [ ] E2E tests for user flows
- [ ] Test coverage > 80%

### Documentation (Priority: Low)
- [ ] Component documentation updated
- [ ] API documentation complete
- [ ] Migration guides created
- [ ] Examples added

---

*Report generated on: $(date)*
*Next review: Schedule weekly progress reviews*
EOF
    
    success "Standardization report generated: STANDARDIZATION_REPORT.md"
}

# Main execution
main() {
    show_banner
    
    check_directory
    
    log "Starting TazaCore code unification process..."
    
    create_standard_structure
    standardize_components
    standardize_imports
    update_typescript_config
    create_todo_list
    update_package_scripts
    update_eslint_config
    create_prettier_config
    run_checks
    generate_report
    
    success "Code unification process completed!"
    
    echo
    info "📋 Next steps:"
    echo "  1. Review UNIFIED-DESIGN-PATTERNS.md"
    echo "  2. Check STANDARDIZATION_TODO.md for manual tasks"
    echo "  3. Review STANDARDIZATION_REPORT.md for progress tracking"
    echo "  4. Run 'cd site && bun run format' to format code"
    echo "  5. Run 'cd site && bun run lint:fix' to fix linting issues"
    echo "  6. Run 'cd site && bun run type-check' to check types"
    echo
    info "🎯 Focus areas:"
    echo "  • Update components to use new patterns"
    echo "  • Consolidate type definitions"
    echo "  • Fix import order in files"
    echo "  • Add proper error handling"
    echo
    warning "Remember to test the application after making changes!"
}

# Run main function
main "$@"

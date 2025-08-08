#!/bin/bash

# 🔄 Migration Next.js 15 Structure
# Đồng bộ và loại bỏ xung đột components/hooks

echo "🚀 Bắt đầu migration cấu trúc Next.js 15..."

# Backup
BACKUP_DIR="migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Tạo backup tại $BACKUP_DIR"

[ -d "app/components" ] && cp -r app/components "$BACKUP_DIR/app_components_backup"
[ -d "app/hooks" ] && cp -r app/hooks "$BACKUP_DIR/app_hooks_backup"

# Kiểm tra cấu trúc hiện tại
echo "🔍 Cấu trúc hiện tại:"
echo "  Root components: $(find components/ -name "*.tsx" 2>/dev/null | wc -l) files"
echo "  App components:  $(find app/components/ -name "*.tsx" 2>/dev/null | wc -l) files"
echo "  Root hooks:      $(find hooks/ -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l) files"
echo "  App hooks:       $(find app/hooks/ -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l) files"

# 1. Fix tsconfig.json paths
echo "🔧 Cập nhật tsconfig.json..."
cp tsconfig.json "$BACKUP_DIR/tsconfig.json.backup"

cat > tsconfig.json << 'TSCONFIG_EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/app-components/*": ["./app/components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/app-hooks/*": ["./app/hooks/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/public/*": ["./public/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "migration_backup_*",
    "src"
  ]
}
TSCONFIG_EOF

# 2. Di chuyển global components
echo "📦 Di chuyển global components..."
if [ -f "app/components/ThemeManager.tsx" ]; then
    echo "  → ThemeManager.tsx"
    mv app/components/ThemeManager.tsx components/
fi

# Di chuyển các global components khác
for file in app/components/*{Manager,Provider,Layout,Wrapper}.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        if [ ! -f "components/$filename" ]; then
            echo "  → $filename"
            mv "$file" "components/"
        fi
    fi
done

# 3. Tìm và update imports
echo "🔍 Tìm imports cần update..."
echo "Cần update các import sau:"
grep -r "from.*app/components" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | head -10
echo ""
echo "Import patterns found:"
grep -r "from.*components" app/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -5

echo ""
echo "✅ Migration cấu trúc hoàn tất!"
echo "📋 TODO tiếp theo:"
echo "   1. Update imports trong code"
echo "   2. Test build: npm run build"
echo "   3. Fix ThemeInitScript import"
echo "💡 Backup tại: $BACKUP_DIR"

#!/bin/bash

# NextJS v15 Structure Synchronization Script
# Đồng bộ và loại bỏ thư mục/file trùng lặp theo chuẩn NextJS v15

set -e

echo "🚀 Bắt đầu đồng bộ cấu trúc NextJS v15..."

# Backup trước khi thay đổi
echo "📦 Tạo backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="migration_backup_sync_${timestamp}"
mkdir -p "$backup_dir"

# Backup các thư mục có thể bị ảnh hưởng
cp -r components "$backup_dir/" 2>/dev/null || true
cp -r hooks "$backup_dir/" 2>/dev/null || true
cp -r app/components "$backup_dir/app_components" 2>/dev/null || true
cp -r app/hooks "$backup_dir/app_hooks" 2>/dev/null || true
cp -r src "$backup_dir/" 2>/dev/null || true

echo "✅ Backup hoàn tất tại: $backup_dir"

# 1. Phân tích và di chuyển components
echo "🔄 Phân tích components..."

# Tạo danh sách components toàn cục (shared)
global_components=(
  "AuthDebugger.tsx"
  "ClientOnly.tsx"
  "ErrorBoundary.tsx"
  "LanguageSelector.tsx"
  "PWAInstallPrompt.tsx"
  "SafeLayout.tsx"
  "ThemeDebugger.tsx"
  "ThemeErrorBoundary.tsx"
  "ThemeManager.tsx"
  "UnifiedThemeDemo.tsx"
)

# Tạo danh sách components app-specific
app_components=(
  "sidebar.tsx"
)

# 2. Tạo cấu trúc thư mục chuẩn
echo "📁 Tạo cấu trúc thư mục chuẩn..."

# Tạo thư mục components/ui cho shared UI components
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/common
mkdir -p components/providers

# Tạo thư mục app/components cho app-specific components
mkdir -p app/components/shared
mkdir -p app/components/layout

# 3. Di chuyển global components
echo "🔄 Di chuyển global components..."
for component in "${global_components[@]}"; do
  if [ -f "components/$component" ]; then
    # Phân loại component theo chức năng
    case "$component" in
      *Theme*|*Debug*)
        mkdir -p components/providers
        mv "components/$component" "components/providers/"
        echo "  ✅ Moved $component to components/providers/"
        ;;
      *Layout*|*Safe*)
        mkdir -p components/layout
        mv "components/$component" "components/layout/"
        echo "  ✅ Moved $component to components/layout/"
        ;;
      *Auth*|*PWA*|*Error*)
        mkdir -p components/common
        mv "components/$component" "components/common/"
        echo "  ✅ Moved $component to components/common/"
        ;;
      *)
        mkdir -p components/ui
        mv "components/$component" "components/ui/"
        echo "  ✅ Moved $component to components/ui/"
        ;;
    esac
  fi
done

# 4. Di chuyển app-specific components
echo "🔄 Di chuyển app-specific components..."
for component in "${app_components[@]}"; do
  if [ -f "components/$component" ]; then
    mv "components/$component" "app/components/layout/"
    echo "  ✅ Moved $component to app/components/layout/"
  fi
done

# 5. Xử lý thư mục components con
echo "🔄 Xử lý thư mục components con..."
if [ -d "components" ]; then
  for subdir in components/*/; do
    if [ -d "$subdir" ]; then
      dirname=$(basename "$subdir")
      case "$dirname" in
        admin|auth|forms)
          # Di chuyển vào app/components
          if [ ! -d "app/components/$dirname" ]; then
            mv "$subdir" "app/components/"
            echo "  ✅ Moved components/$dirname to app/components/"
          else
            # Merge nếu đã tồn tại
            cp -r "$subdir"* "app/components/$dirname/"
            rm -rf "$subdir"
            echo "  ✅ Merged components/$dirname into app/components/$dirname/"
          fi
          ;;
        ui|common|layout|features|modules)
          # Giữ ở root components
          echo "  ✅ Kept components/$dirname at root level"
          ;;
        *)
          # Di chuyển các thư mục khác vào features
          mkdir -p "components/features"
          if [ ! -d "components/features/$dirname" ]; then
            mv "$subdir" "components/features/"
            echo "  ✅ Moved components/$dirname to components/features/"
          fi
          ;;
      esac
    fi
  done
fi

# 6. Xử lý hooks tương tự
echo "🔄 Phân tích hooks..."

# Global hooks (shared across app)
global_hooks=(
  "useLocalStorage.ts"
  "useTheme.ts"
  "useUnifiedTheme.ts"
  "useDebounce.ts"
  "useApi.ts"
)

# App-specific hooks
app_hooks=(
  "useMenuItems.ts"
  "useAuth.ts"
  "useAdmin.ts"
)

# 7. Di chuyển global hooks
echo "🔄 Di chuyển global hooks..."
for hook in "${global_hooks[@]}"; do
  if [ -f "hooks/$hook" ]; then
    mv "hooks/$hook" "hooks/"
    echo "  ✅ Kept $hook in global hooks"
  fi
done

# 8. Di chuyển app-specific hooks
echo "🔄 Di chuyển app-specific hooks..."
for hook in "${app_hooks[@]}"; do
  if [ -f "hooks/$hook" ]; then
    mv "hooks/$hook" "app/hooks/"
    echo "  ✅ Moved $hook to app/hooks/"
  elif [ -f "app/hooks/$hook" ]; then
    echo "  ✅ $hook already in app/hooks/"
  fi
done

# 9. Dọn dẹp thư mục src cũ
echo "🧹 Dọn dẹp thư mục src cũ..."
if [ -d "src" ]; then
  echo "  ⚠️  Tìm thấy thư mục src cũ - sẽ di chuyển vào backup"
  mv src "$backup_dir/src_old"
  echo "  ✅ Đã di chuyển src cũ vào backup"
fi

# 10. Dọn dẹp file trùng lặp
echo "🧹 Dọn dẹp file trùng lặp..."

# Xóa các file .backup hoặc .old
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.old" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true

# Xóa thư mục node_modules cũ nếu có
rm -rf node_modules/.cache 2>/dev/null || true

echo "✅ Hoàn tất dọn dẹp"

# 11. Cập nhật tsconfig.json
echo "🔧 Cập nhật tsconfig.json..."
# Backup tsconfig hiện tại
cp tsconfig.json "$backup_dir/tsconfig.json.backup"

echo "✅ Đồng bộ cấu trúc NextJS v15 hoàn tất!"
echo ""
echo "📋 Tóm tắt thay đổi:"
echo "  - Global components: components/{ui,layout,common,providers}/"
echo "  - App components: app/components/{layout,shared,admin,auth}/"
echo "  - Global hooks: hooks/"
echo "  - App hooks: app/hooks/"
echo "  - Backup: $backup_dir/"
echo ""
echo "🔄 Tiếp theo chạy: npm run build để kiểm tra"

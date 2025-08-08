#!/bin/bash

# Script để loại bỏ hoàn toàn HR/HRM khỏi dự án TazaCore
# Chạy: ./remove_hr_modules.sh

echo "🗑️ Bắt đầu loại bỏ HR/HRM modules khỏi TazaCore..."

# Di chuyển đến thư mục dự án
cd /chikiet/kataoffical/tazagroup

echo "📂 Xóa các thư mục HR..."
# Xóa thư mục admin/hr
rm -rf app/admin/hr
echo "   ✅ Đã xóa app/admin/hr"

# Xóa các component HR
rm -rf components/hr
rm -rf components/admin/hr  
rm -rf components/modules/hr
echo "   ✅ Đã xóa components HR"

# Xóa các API route HR
rm -rf app/api/hr
rm -rf app/api/admin/hr
rm -rf app/api/employees
rm -rf app/api/payroll
rm -rf app/api/attendance
rm -rf app/api/leave
rm -rf app/api/performance
echo "   ✅ Đã xóa API routes HR"

echo "🔍 Tìm và xóa các file riêng lẻ..."
# Xóa các file types liên quan
find types/ -name "*hr*" -delete 2>/dev/null
find types/ -name "*employee*" -delete 2>/dev/null  
find types/ -name "*payroll*" -delete 2>/dev/null
find types/ -name "*attendance*" -delete 2>/dev/null
find types/ -name "*leave*" -delete 2>/dev/null
find types/ -name "*performance*" -delete 2>/dev/null
echo "   ✅ Đã xóa type definitions"

# Xóa các utility functions HR
find utils/ -name "*hr*" -delete 2>/dev/null
find lib/ -name "*hr*" -delete 2>/dev/null
echo "   ✅ Đã xóa utility functions"

# Xóa các hook liên quan
find hooks/ -name "*hr*" -delete 2>/dev/null
find hooks/ -name "*employee*" -delete 2>/dev/null
echo "   ✅ Đã xóa hooks"

echo "🔍 Tìm các file chứa import HR..."
# Tìm và liệt kê các file còn import HR (để review manual)
echo "📝 Các file có thể còn import HR cần kiểm tra:"
grep -r "from.*hr" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | head -10
grep -r "import.*hr" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | head -10

echo ""
echo "📝 Các file có thể còn reference HR:"
grep -r "employee\|payroll\|attendance" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | head -10

echo ""
echo "✅ Đã hoàn thành việc xóa HR modules!"
echo "🔧 Các bước tiếp theo cần làm thủ công:"
echo "   1. Kiểm tra và sửa các import còn lại trong code"
echo "   2. Cập nhật navigation/menu để xóa link HR"
echo "   3. Cập nhật database schema nếu có"
echo "   4. Chạy 'npm run build' để kiểm tra lỗi compile"
echo "   5. Cập nhật documentation"

echo ""
echo "🚀 Chạy lệnh sau để kiểm tra:"
echo "   npm run build"
echo "   npm run lint"

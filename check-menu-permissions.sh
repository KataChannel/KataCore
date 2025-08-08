#!/bin/bash

# Script kiểm tra các lỗi phổ biến trong hệ thống quyền menu

echo "🔍 Kiểm tra hệ thống quyền menu TazaGroup..."

echo ""
echo "1. Kiểm tra database schema..."

# Kiểm tra xem các bảng cần thiết có tồn tại không
npx prisma db execute --stdin <<SQL
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('menu_items', 'role_menu_items', 'roles', 'users')
ORDER BY table_name, ordinal_position;
SQL

echo ""
echo "2. Kiểm tra dữ liệu menu items..."

npx prisma db execute --stdin <<SQL
SELECT 
  mi.id,
  mi.title,
  mi.path,
  mi.permission,
  mi.parentId,
  COUNT(rmi.id) as role_permissions_count
FROM menu_items mi
LEFT JOIN role_menu_items rmi ON mi.id = rmi.menuItemId
GROUP BY mi.id
ORDER BY mi.sortOrder;
SQL

echo ""
echo "3. Kiểm tra role permissions..."

npx prisma db execute --stdin <<SQL
SELECT 
  r.name as role_name,
  r.level as role_level,
  COUNT(rmi.id) as menu_permissions_count,
  COUNT(CASE WHEN rmi.canAccess = true THEN 1 END) as accessible_menus
FROM roles r
LEFT JOIN role_menu_items rmi ON r.id = rmi.roleId
GROUP BY r.id
ORDER BY r.level DESC;
SQL

echo ""
echo "4. Kiểm tra users với role permissions..."

npx prisma db execute --stdin <<SQL
SELECT 
  u.displayName,
  u.email,
  r.name as role_name,
  r.level as role_level,
  u.isActive
FROM users u
LEFT JOIN roles r ON u.roleId = r.id
ORDER BY r.level DESC, u.displayName;
SQL

echo ""
echo "5. Kiểm tra menu items không có permissions..."

npx prisma db execute --stdin <<SQL
SELECT 
  mi.title,
  mi.path,
  mi.permission
FROM menu_items mi
LEFT JOIN role_menu_items rmi ON mi.id = rmi.menuItemId
WHERE rmi.id IS NULL
ORDER BY mi.title;
SQL

echo ""
echo "✅ Kiểm tra hoàn tất!"

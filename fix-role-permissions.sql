-- Fix HR_MANAGER and EMPLOYEE permissions based on their roles

-- Update HR_MANAGER to have access to appropriate menus
UPDATE role_menu_items 
SET "canAccess" = true, "canView" = true
WHERE "roleId" = (SELECT id FROM roles WHERE name = 'HR_MANAGER')
  AND "menuItemId" IN (
    SELECT id FROM menu_items 
    WHERE permission IN ('read:dashboard', 'read:crm', 'read:customer')
       OR title LIKE '%HR%'
       OR title LIKE '%Employee%'
       OR title LIKE '%Customer%'
  );

-- Update EMPLOYEE to have basic dashboard and limited access
UPDATE role_menu_items 
SET "canAccess" = true, "canView" = true
WHERE "roleId" = (SELECT id FROM roles WHERE name = 'EMPLOYEE')
  AND "menuItemId" IN (
    SELECT id FROM menu_items 
    WHERE permission = 'read:dashboard'
  );

-- Add view-only access for EMPLOYEE to CRM (they can see but not modify)
UPDATE role_menu_items 
SET "canView" = true, "canAccess" = false
WHERE "roleId" = (SELECT id FROM roles WHERE name = 'EMPLOYEE')
  AND "menuItemId" IN (
    SELECT id FROM menu_items 
    WHERE permission IN ('read:crm', 'read:customer')
  );

-- Show updated summary
SELECT 
    r.name as role_name,
    r.level,
    COUNT(rmi.id) as total_permissions,
    COUNT(CASE WHEN rmi."canAccess" = true THEN 1 END) as accessible_menus,
    COUNT(CASE WHEN rmi."canView" = true AND rmi."canAccess" = false THEN 1 END) as view_only_menus
FROM roles r
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId"
WHERE r.name IN ('SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
GROUP BY r.id, r.name, r.level
ORDER BY r.level DESC;

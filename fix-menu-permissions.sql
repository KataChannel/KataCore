-- SQL script to fix common menu permission issues

-- 1. Ensure all menu items have at least basic permissions for super admin
INSERT INTO role_menu_items ("roleId", "menuItemId", "canView", "canAccess")
SELECT 
    r.id as "roleId",
    m.id as "menuItemId",
    true as "canView",
    true as "canAccess"
FROM roles r
CROSS JOIN menu_items m
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId" AND m.id = rmi."menuItemId"
WHERE r.name IN ('Super Administrator', 'SUPER_ADMIN')
  AND rmi.id IS NULL;

-- 2. Fix admin permissions (give access to most menus except super admin specific)
INSERT INTO role_menu_items ("roleId", "menuItemId", "canView", "canAccess")
SELECT 
    r.id as "roleId",
    m.id as "menuItemId",
    true as "canView",
    CASE 
        WHEN m.permission LIKE '%admin:system%' THEN false
        ELSE true
    END as "canAccess"
FROM roles r
CROSS JOIN menu_items m
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId" AND m.id = rmi."menuItemId"
WHERE r.name = 'Administrator'
  AND rmi.id IS NULL;

-- 3. Fix HR Manager permissions (give access to HR and basic menus)
INSERT INTO role_menu_items ("roleId", "menuItemId", "canView", "canAccess")
SELECT 
    r.id as "roleId",
    m.id as "menuItemId",
    true as "canView",
    CASE 
        WHEN m.permission IN ('read:dashboard') THEN true
        WHEN m.permission LIKE '%hrm%' THEN true
        WHEN m.permission LIKE '%employee%' THEN true
        WHEN m.permission LIKE '%department%' THEN true
        WHEN m.permission LIKE '%position%' THEN true
        WHEN m.permission LIKE '%attendance%' THEN true
        WHEN m.permission LIKE '%leave_request%' THEN true
        WHEN m.permission LIKE '%payroll%' THEN true
        WHEN m.permission LIKE '%performance%' THEN true
        WHEN m.permission LIKE '%report%' THEN true
        ELSE false
    END as "canAccess"
FROM roles r
CROSS JOIN menu_items m
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId" AND m.id = rmi."menuItemId"
WHERE r.name = 'HR Manager'
  AND rmi.id IS NULL;

-- 4. Fix Employee permissions (basic access only)
INSERT INTO role_menu_items ("roleId", "menuItemId", "canView", "canAccess")
SELECT 
    r.id as "roleId",
    m.id as "menuItemId",
    CASE 
        WHEN m.permission = 'read:dashboard' THEN true
        WHEN m.permission LIKE '%hrm%' AND m.path = '/admin/hr' THEN true
        WHEN m.permission LIKE '%attendance%' THEN true
        ELSE false
    END as "canView",
    CASE 
        WHEN m.permission = 'read:dashboard' THEN true
        WHEN m.permission LIKE '%hrm%' AND m.path = '/admin/hr' THEN true
        WHEN m.permission LIKE '%attendance%' THEN true
        ELSE false
    END as "canAccess"
FROM roles r
CROSS JOIN menu_items m
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId" AND m.id = rmi."menuItemId"
WHERE r.name = 'Employee'
  AND rmi.id IS NULL;

-- 5. Update existing permissions that might be incorrectly set
UPDATE role_menu_items 
SET "canView" = true, "canAccess" = true
WHERE "roleId" IN (
    SELECT id FROM roles WHERE name IN ('Super Administrator', 'SUPER_ADMIN') OR level >= 10
);

-- 6. Ensure dashboard access for all roles
UPDATE role_menu_items 
SET "canView" = true, "canAccess" = true
WHERE "menuItemId" IN (
    SELECT id FROM menu_items WHERE permission = 'read:dashboard'
);

-- 7. Check for duplicate permissions and clean them up
DELETE FROM role_menu_items 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM role_menu_items 
    GROUP BY "roleId", "menuItemId"
);

-- Show summary after fixes
SELECT 
    r.name as role_name,
    r.level,
    COUNT(rmi.id) as total_permissions,
    COUNT(CASE WHEN rmi."canAccess" = true THEN 1 END) as accessible_menus,
    COUNT(CASE WHEN rmi."canView" = true AND rmi."canAccess" = false THEN 1 END) as view_only_menus
FROM roles r
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId"
GROUP BY r.id, r.name, r.level
ORDER BY r.level DESC;

-- Quick diagnostic query
SELECT 
    r.name as role_name,
    r.level,
    m.title as menu_title,
    rmi."canAccess" as can_access,
    rmi."canView" as can_view
FROM roles r
LEFT JOIN role_menu_items rmi ON r.id = rmi."roleId"
LEFT JOIN menu_items m ON rmi."menuItemId" = m.id
WHERE r.name IN ('SUPER_ADMIN', 'Administrator', 'HR Manager', 'Employee')
ORDER BY r.level DESC, m.title;

import { PrismaClient } from '@prisma/client';
import { COMPREHENSIVE_ADMIN_MENU, ADMIN_FULL_PERMISSIONS } from '../config/admin-menu-complete';

const prisma = new PrismaClient();

async function updateComprehensiveAdminMenuAndPermissions() {
  console.log('🚀 Starting comprehensive admin menu and permissions update...');
  
  try {
    // 1. Clear existing menu items and permissions
    console.log('🧹 Clearing existing menu data...');
    await prisma.role_menu_items.deleteMany({});
    await prisma.menu_items.deleteMany({});
    
    // 2. Create parent menu items first
    console.log('📁 Creating parent menu items...');
    const parentMenus = COMPREHENSIVE_ADMIN_MENU.filter(menu => !menu.parentId);
    const parentMenuMap = new Map<string, string>();
    
    for (const menu of parentMenus) {
      const created = await prisma.menu_items.create({
        data: {
          id: menu.id,
          title: menu.title,
          titleVi: menu.titleVi,
          path: menu.path,
          icon: menu.icon,
          permission: menu.permission,
          sortOrder: menu.sortOrder,
          isActive: menu.isActive
        }
      });
      parentMenuMap.set(menu.id, created.id);
      console.log(`  ✅ Created parent menu: ${menu.title}`);
    }
    
    // 3. Create child menu items
    console.log('📄 Creating child menu items...');
    const childMenus = COMPREHENSIVE_ADMIN_MENU.filter(menu => menu.parentId);
    let childrenCreated = 0;
    
    for (const child of childMenus) {
      const parentId = parentMenuMap.get(child.parentId!);
      if (parentId) {
        await prisma.menu_items.create({
          data: {
            id: child.id,
            title: child.title,
            titleVi: child.titleVi,
            path: child.path,
            icon: child.icon,
            permission: child.permission,
            parentId: parentId,
            sortOrder: child.sortOrder,
            isActive: child.isActive
          }
        });
        childrenCreated++;
        console.log(`  ➡️ Created child menu: ${child.title}`);
      }
    }
    
    console.log(`📊 Total menus created: ${parentMenus.length} parents + ${childrenCreated} children = ${parentMenus.length + childrenCreated}`);
    
    // 4. Get all menu items
    const allMenus = await prisma.menu_items.findMany();
    console.log(`📋 Retrieved ${allMenus.length} menu items from database`);
    
    // 5. Get admin roles (level >= 8 or specific admin names)
    const adminRoles = await prisma.roles.findMany({
      where: {
        OR: [
          { level: { gte: 8 } },
          { 
            name: { 
              in: [
                'Super Administrator', 
                'ADMIN', 
                'Administrator', 
                'System Admin',
                'Admin',
                'SUPER_ADMIN',
                'ADMINISTRATOR'
              ] 
            } 
          }
        ]
      }
    });
    
    console.log(`👑 Found ${adminRoles.length} admin roles:`, adminRoles.map(r => `${r.name} (Level: ${r.level})`));
    
    // 6. Grant full menu access to admin roles
    console.log('🔐 Granting full menu access to admin roles...');
    let totalPermissionsGranted = 0;
    
    for (const role of adminRoles) {
      console.log(`🔑 Processing role: ${role.name} (Level: ${role.level})`);
      
      // Delete existing role menu permissions
      await prisma.role_menu_items.deleteMany({
        where: { roleId: role.id }
      });
      
      // Grant access to all menus
      const menuPermissions = allMenus.map(menu => ({
        roleId: role.id,
        menuItemId: menu.id,
        canView: true,
        canAccess: true
      }));
      
      await prisma.role_menu_items.createMany({
        data: menuPermissions
      });
      
      totalPermissionsGranted += menuPermissions.length;
      console.log(`  ✅ Granted ${menuPermissions.length} menu permissions to ${role.name}`);
    }
    
    console.log(`🔐 Total menu permissions granted: ${totalPermissionsGranted}`);
    
    // 7. Update admin role permissions (system permissions)
    console.log('🔒 Updating admin role system permissions...');
    
    for (const role of adminRoles) {
      // Create comprehensive permissions JSON for admin roles
      const adminPermissions = {
        permissions: ADMIN_FULL_PERMISSIONS,
        level: role.level || 8,
        modules: [
          'dashboard', 'cms', 'seo', 'hrm', 'crm', 'social', 
          'information-hub', 'website', 'users', 'permissions', 
          'reports', 'settings'
        ],
        // Super admin gets additional permissions
        ...(role.level >= 10 && {
          superAdmin: true,
          systemControl: true,
          modules: [
            'dashboard', 'cms', 'seo', 'hrm', 'crm', 'social', 
            'information-hub', 'website', 'users', 'permissions', 
            'reports', 'settings', 'super-admin', 'dev-tools'
          ]
        })
      };
      
      // Update role permissions
      await prisma.roles.update({
        where: { id: role.id },
        data: {
          permissions: JSON.stringify(adminPermissions),
          description: `${role.name} with comprehensive admin access to all modules`
        }
      });
      
      console.log(`  🔒 Updated system permissions for ${role.name} - ${ADMIN_FULL_PERMISSIONS.length} permissions`);
    }
    
    // 8. Create default non-admin role permissions (basic access)
    console.log('👥 Setting up basic user role permissions...');
    
    const basicRoles = await prisma.roles.findMany({
      where: {
        level: { lt: 8 },
        name: { 
          notIn: [
            'Super Administrator', 
            'ADMIN', 
            'Administrator', 
            'System Admin',
            'Admin',
            'SUPER_ADMIN',
            'ADMINISTRATOR'
          ] 
        }
      }
    });
    
    console.log(`👤 Found ${basicRoles.length} basic roles:`, basicRoles.map(r => `${r.name} (Level: ${r.level})`));
    
    // Basic menus accessible to all users
    const basicMenuIds = ['dashboard', 'information-hub', 'info-dashboard', 'info-articles'];
    const basicMenus = allMenus.filter(menu => basicMenuIds.includes(menu.id));
    
    for (const role of basicRoles) {
      console.log(`👤 Processing basic role: ${role.name} (Level: ${role.level})`);
      
      // Delete existing permissions
      await prisma.role_menu_items.deleteMany({
        where: { roleId: role.id }
      });
      
      // Grant basic menu access
      const basicPermissions = basicMenus.map(menu => ({
        roleId: role.id,
        menuItemId: menu.id,
        canView: true,
        canAccess: true
      }));
      
      if (basicPermissions.length > 0) {
        await prisma.role_menu_items.createMany({
          data: basicPermissions
        });
        console.log(`  ✅ Granted ${basicPermissions.length} basic menu permissions to ${role.name}`);
      }
      
      // Update basic role permissions
      const basicRolePermissions = {
        permissions: ['read:dashboard', 'read:information-hub', 'read:information-hub:articles'],
        level: role.level || 1,
        modules: ['dashboard', 'information-hub']
      };
      
      await prisma.roles.update({
        where: { id: role.id },
        data: {
          permissions: JSON.stringify(basicRolePermissions),
          description: `${role.name} with basic user access`
        }
      });
    }
    
    // 9. Create summary report
    const totalMenus = await prisma.menu_items.count();
    const totalRoleMenuPermissions = await prisma.role_menu_items.count();
    const totalRoles = await prisma.roles.count();
    
    console.log('\n🎉 ===== UPDATE COMPLETE ===== 🎉');
    console.log(`📊 SUMMARY:`);
    console.log(`   📁 Total menu items: ${totalMenus}`);
    console.log(`   👥 Total roles: ${totalRoles}`);
    console.log(`   👑 Admin roles: ${adminRoles.length}`);
    console.log(`   👤 Basic roles: ${basicRoles.length}`);
    console.log(`   🔐 Total role-menu permissions: ${totalRoleMenuPermissions}`);
    console.log(`   📋 Admin permissions per role: ${ADMIN_FULL_PERMISSIONS.length}`);
    console.log('\n✅ All admin roles now have FULL ACCESS to all modules!');
    console.log('✅ Menu structure updated with comprehensive TazaGroup admin panel!');
    console.log('✅ Permissions granted for CMS, SEO, HRM, CRM, Social, and all other modules!');
    
    return {
      success: true,
      totalMenus,
      totalRoles,
      adminRoles: adminRoles.length,
      basicRoles: basicRoles.length,
      totalPermissions: totalRoleMenuPermissions,
      adminPermissionsCount: ADMIN_FULL_PERMISSIONS.length
    };
    
  } catch (error) {
    console.error('❌ Error updating admin menu and permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the update
if (require.main === module) {
  updateComprehensiveAdminMenuAndPermissions()
    .then((result) => {
      console.log('\n🚀 Update completed successfully!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Update failed:', error);
      process.exit(1);
    });
}

export { updateComprehensiveAdminMenuAndPermissions };

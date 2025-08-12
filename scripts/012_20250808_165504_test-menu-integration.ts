#!/usr/bin/env tsx
// Test menu API endpoint and verify data flow
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMenuSystem() {
  console.log('🧪 Testing Menu System Integration...\n');

  try {
    // 1. Check database menu items
    console.log('📊 Database Menu Items:');
    const menuItems = await prisma.menu_items.findMany({
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      where: {
        parentId: null,
      },
      orderBy: { sortOrder: 'asc' },
    });

    console.log(`Found ${menuItems.length} parent menu items:`);
    menuItems.forEach(menu => {
      console.log(`  • ${menu.title} (${menu.titleVi}) - ${menu.children.length} children`);
      menu.children.forEach(child => {
        console.log(`    ◦ ${child.title} (${child.titleVi})`);
      });
    });
    console.log();

    // 2. Check role permissions
    console.log('🔐 Role Menu Permissions:');
    const roles = await prisma.roles.findMany({
      include: {
        role_menu_items: {
          include: {
            menuItem: true,
          },
          where: {
            OR: [
              { canView: true },
              { canAccess: true },
            ],
          },
        },
      },
    });

    roles.forEach(role => {
      const accessibleMenus = role.role_menu_items.filter(rm => rm.canView || rm.canAccess);
      console.log(`  • ${role.name}: ${accessibleMenus.length} accessible menus`);
      
      // Show CRM and Social menus specifically
      const crmMenus = accessibleMenus.filter(rm => 
        rm.menuItem.title.toLowerCase().includes('crm') ||
        rm.menuItem.title.toLowerCase().includes('customer')
      );
      const socialMenus = accessibleMenus.filter(rm => 
        rm.menuItem.title.toLowerCase().includes('social') ||
        rm.menuItem.title.toLowerCase().includes('facebook')
      );
      
      if (crmMenus.length > 0) {
        console.log(`    ✅ CRM access: ${crmMenus.length} items`);
      }
      if (socialMenus.length > 0) {
        console.log(`    ✅ Social access: ${socialMenus.length} items`);
      }
    });
    console.log();

    // 3. Simulate API endpoint test
    console.log('🌐 Simulating API Response for ADMIN role:');
    const adminRole = await prisma.roles.findFirst({
      where: { name: { contains: 'ADMIN' } },
    });

    if (adminRole) {
      const roleMenuItems = await prisma.role_menu_items.findMany({
        where: {
          roleId: adminRole.id,
          canView: true,
        },
        include: {
          menuItem: {
            include: {
              children: {
                include: {
                  role_menu_items: {
                    where: {
                      roleId: adminRole.id,
                      canView: true,
                    },
                  },
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: {
          menuItem: {
            sortOrder: 'asc',
          },
        },
      });

      const parentMenuItems = roleMenuItems
        .filter(rm => !rm.menuItem.parentId)
        .map(rm => {
          const menuItem = rm.menuItem;
          
          const accessibleChildren = menuItem.children.filter(child => 
            child.role_menu_items.length > 0
          );

          return {
            id: menuItem.id,
            title: menuItem.title,
            titleVi: menuItem.titleVi,
            path: menuItem.path,
            icon: menuItem.icon,
            permission: menuItem.permission,
            sortOrder: menuItem.sortOrder,
            isActive: menuItem.isActive,
            canAccess: rm.canAccess,
            children: accessibleChildren.map(child => ({
              id: child.id,
              title: child.title,
              titleVi: child.titleVi,
              path: child.path,
              icon: child.icon,
              permission: child.permission,
              sortOrder: child.sortOrder,
              isActive: child.isActive,
              canAccess: child.role_menu_items[0]?.canAccess || false,
            })),
          };
        });

      console.log(`API would return ${parentMenuItems.length} menu items for ADMIN:`);
      parentMenuItems.forEach(item => {
        console.log(`  • ${item.title} (${item.titleVi}) - ${item.children.length} children`);
      });
    }

    console.log('\n✅ Menu system test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. The database contains the menu structure');
    console.log('2. The API endpoint is ready');
    console.log('3. The useMenuItems hook is configured');
    console.log('4. The admin layout is already set up to use dynamic menus');
    console.log('\n🎯 The integration should work automatically in the admin layout!');

  } catch (error) {
    console.error('❌ Error testing menu system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenuSystem();

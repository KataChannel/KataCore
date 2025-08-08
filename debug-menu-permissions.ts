// Debug utility to diagnose menu permission issues
import { prisma } from '@/lib/prisma';

export async function debugMenuPermissions() {
  console.log('🔍 [MENU DEBUG] Starting menu permission diagnosis...\n');

  try {
    // 1. Check database connection
    console.log('1. Checking database connection...');
    const userCount = await prisma.users.count();
    console.log(`   ✅ Database connected, found ${userCount} users\n`);

    // 2. Check menu items structure
    console.log('2. Checking menu items...');
    const menuItems = await prisma.menu_items.findMany({
      include: {
        parent: true,
        children: true,
        role_menu_items: {
          include: {
            role: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`   Found ${menuItems.length} menu items`);
    
    // Check for orphaned menus (no permissions)
    const orphanedMenus = menuItems.filter(menu => menu.role_menu_items.length === 0);
    if (orphanedMenus.length > 0) {
      console.log(`   ⚠️  Warning: ${orphanedMenus.length} menu items have no role permissions:`);
      orphanedMenus.forEach(menu => {
        console.log(`     - ${menu.title} (${menu.path})`);
      });
    }
    console.log('');

    // 3. Check roles and their permissions
    console.log('3. Checking roles...');
    const roles = await prisma.roles.findMany({
      include: {
        users: true,
        role_menu_items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { level: 'desc' }
    });

    console.log(`   Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   - ${role.name} (Level ${role.level}): ${role.users.length} users, ${role.role_menu_items.length} menu permissions`);
      
      // Check for roles with too few permissions
      if (role.role_menu_items.length < 5 && role.name !== 'Employee') {
        console.log(`     ⚠️  Warning: ${role.name} has very few menu permissions (${role.role_menu_items.length})`);
      }
    });
    console.log('');

    // 4. Check super admin permissions
    console.log('4. Checking super admin permissions...');
    const superAdminRole = roles.find(r => 
      r.name === 'Super Administrator' || 
      r.name === 'SUPER_ADMIN' || 
      r.level >= 10
    );
    
    if (superAdminRole) {
      console.log(`   ✅ Super admin role found: ${superAdminRole.name}`);
      console.log(`   - Users: ${superAdminRole.users.length}`);
      console.log(`   - Menu permissions: ${superAdminRole.role_menu_items.length}`);
      
      // Check if super admin has all menu permissions
      const totalMenus = menuItems.length;
      const superAdminPermissions = superAdminRole.role_menu_items.length;
      
      if (superAdminPermissions < totalMenus) {
        console.log(`   ⚠️  Warning: Super admin missing permissions for ${totalMenus - superAdminPermissions} menus`);
      }
    } else {
      console.log('   ❌ No super admin role found!');
    }
    console.log('');

    // 5. Check specific permission issues
    console.log('5. Checking for common permission issues...');
    
    // Check for permission mismatches
    const permissionMismatches = [];
    
    for (const role of roles) {
      if (role.level >= 8) { // Admin level roles
        const deniedAccessCount = role.role_menu_items.filter((rmi: any) => !rmi.canAccess).length;
        if (deniedAccessCount > 0) {
          permissionMismatches.push({
            role: role.name,
            issue: `Admin-level role has ${deniedAccessCount} menus with denied access`
          });
        }
      }
    }
    
    if (permissionMismatches.length > 0) {
      console.log('   ⚠️  Permission mismatches found:');
      permissionMismatches.forEach(mismatch => {
        console.log(`     - ${mismatch.role}: ${mismatch.issue}`);
      });
    } else {
      console.log('   ✅ No permission mismatches found');
    }
    console.log('');

    // 6. Generate permission matrix sample
    console.log('6. Permission matrix sample (first 5 menus):');
    console.log('   Menu Item               | Super Admin | Admin | HR Manager | Employee');
    console.log('   -------------------------|-------------|-------|------------|----------');
    
    const sampleMenus = menuItems.slice(0, 5);
    const rolesByName = {
      'Super Administrator': roles.find(r => r.name === 'Super Administrator'),
      'Administrator': roles.find(r => r.name === 'Administrator'),
      'HR Manager': roles.find(r => r.name === 'HR Manager'),
      'Employee': roles.find(r => r.name === 'Employee')
    };
    
    sampleMenus.forEach(menu => {
      const menuTitle = menu.title.substring(0, 22).padEnd(23);
      let row = `   ${menuTitle}|`;
      
      Object.values(rolesByName).forEach(role => {
        if (role) {
          const permission = role.role_menu_items.find((rmi: any) => rmi.menuItemId === menu.id);
          const access = permission ? (permission.canAccess ? '✅' : '❌') : '❌';
          row += `     ${access}     |`;
        } else {
          row += `     ❌     |`;
        }
      });
      
      console.log(row);
    });

    console.log('\n🎉 Menu permission diagnosis completed!');
    
    return {
      success: true,
      summary: {
        totalMenus: menuItems.length,
        totalRoles: roles.length,
        orphanedMenus: orphanedMenus.length,
        permissionMismatches: permissionMismatches.length,
        superAdminFound: !!superAdminRole
      }
    };

  } catch (error: any) {
    console.error('❌ Menu permission diagnosis failed:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error'
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugMenuPermissions()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Debug failed:', error);
      process.exit(1);
    });
}

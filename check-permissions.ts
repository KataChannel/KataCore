// Check current permission status
import { prisma } from '@/lib/prisma';

async function checkCurrentPermissions() {
  console.log('🔍 Checking current menu permission status...\n');

  try {
    // Get all roles
    const roles = await prisma.roles.findMany({
      orderBy: { level: 'desc' }
    });

    console.log('📋 Available roles:');
    roles.forEach(role => {
      console.log(`   - ${role.name} (Level ${role.level})`);
    });
    console.log('');

    // Get all menu items
    const menuItems = await prisma.menu_items.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    console.log('📋 Available menu items:');
    menuItems.forEach(menu => {
      console.log(`   - ${menu.title} (${menu.path}) - Permission: ${menu.permission}`);
    });
    console.log('');

    // Get permission matrix for key roles
    const keyRoles = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'HR_MANAGER', 'EMPLOYEE'];
    
    console.log('🔐 Permission Matrix:');
    console.log('Menu Item'.padEnd(25) + keyRoles.map(r => r.padEnd(15)).join(''));
    console.log('-'.repeat(25 + keyRoles.length * 15));

    for (const menu of menuItems) {
      let row = menu.title.substring(0, 23).padEnd(25);
      
      for (const roleName of keyRoles) {
        const role = roles.find(r => r.name === roleName);
        if (role) {
          const permission = await prisma.role_menu_items.findFirst({
            where: {
              roleId: role.id,
              menuItemId: menu.id
            }
          });
          
          const status = permission 
            ? (permission.canAccess ? '✅ Access' : permission.canView ? '👁️ View' : '❌ None')
            : '❌ None';
          
          row += status.padEnd(15);
        } else {
          row += '❓ N/A'.padEnd(15);
        }
      }
      
      console.log(row);
    }

    console.log('');

    // Check for issues
    console.log('⚠️  Issues found:');
    let issueCount = 0;

    for (const role of roles) {
      const permissions = await prisma.role_menu_items.findMany({
        where: { roleId: role.id },
        include: { menuItem: true }
      });

      // Check super admin
      if (role.level >= 10) {
        const totalMenus = menuItems.length;
        const accessibleMenus = permissions.filter(p => p.canAccess).length;
        
        if (accessibleMenus < totalMenus) {
          console.log(`   - ${role.name} missing access to ${totalMenus - accessibleMenus} menus`);
          issueCount++;
        }
      }

      // Check for roles with no permissions
      if (permissions.length === 0) {
        console.log(`   - ${role.name} has no menu permissions assigned`);
        issueCount++;
      }
    }

    if (issueCount === 0) {
      console.log('   ✅ No issues found!');
    }

    console.log(`\n✅ Permission check completed. Found ${issueCount} issues.`);

  } catch (error) {
    console.error('❌ Error checking permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkCurrentPermissions();

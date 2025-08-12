import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHighLevelRolePermissions(): Promise<void> {
  console.log('🔄 Updating permissions for high-level roles...');
  
  try {
    // Get all menus
    const allMenus = await prisma.menu_items.findMany();
    console.log(`📋 Found ${allMenus.length} menu items`);
    
    // Get roles with level >= 8 (Admin level and above)
    const adminRoles = await prisma.roles.findMany({
      where: {
        level: { gte: 8 }
      }
    });
    
    console.log(`👑 Found ${adminRoles.length} admin-level roles:`);
    adminRoles.forEach(role => {
      console.log(`   - ${role.name} (Level: ${role.level})`);
    });
    
    for (const role of adminRoles) {
      // Delete existing permissions for this role
      await prisma.role_menu_items.deleteMany({
        where: { roleId: role.id }
      });
      
      // Grant access to all menus for admin-level roles
      const menuPermissions = allMenus.map(menu => ({
        roleId: role.id,
        menuItemId: menu.id,
        canView: true,
        canAccess: true
      }));
      
      await prisma.role_menu_items.createMany({
        data: menuPermissions
      });
      
      console.log(`✅ Granted ${allMenus.length} menu permissions to ${role.name}`);
    }
    
    // Also grant permissions to roles with specific admin names
    const adminNameRoles = await prisma.roles.findMany({
      where: {
        OR: [
          { name: { contains: 'Administrator' } },
          { name: { contains: 'Admin' } },
          { name: { contains: 'ADMIN' } }
        ]
      }
    });
    
    for (const role of adminNameRoles) {
      // Skip if already processed
      if (adminRoles.find(r => r.id === role.id)) continue;
      
      console.log(`🔄 Processing admin name role: ${role.name}`);
      
      // Delete existing permissions
      await prisma.role_menu_items.deleteMany({
        where: { roleId: role.id }
      });
      
      // Grant access to all menus except dev tools for named admin roles
      const allowedMenus = allMenus.filter(menu => !menu.id.startsWith('dev'));
      const menuPermissions = allowedMenus.map(menu => ({
        roleId: role.id,
        menuItemId: menu.id,
        canView: true,
        canAccess: true
      }));
      
      await prisma.role_menu_items.createMany({
        data: menuPermissions
      });
      
      console.log(`✅ Granted ${allowedMenus.length} menu permissions to ${role.name}`);
    }
    
    console.log('✅ Successfully updated admin role permissions');
    
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🚀 BẮT ĐẦU CẬP NHẬT PHÂN QUYỀN ADMIN');
  
  try {
    await updateHighLevelRolePermissions();
    
    // Verify results
    const totalPermissions = await prisma.role_menu_items.count();
    console.log(`\n📊 Total role menu permissions: ${totalPermissions}`);
    
  } catch (error) {
    console.error(`💥 Update failed: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('\n✅ Admin permissions update completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });

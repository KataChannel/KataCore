const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserMenuAccess() {
  try {
    // Find current admin user
    const adminUser = await prisma.users.findFirst({
      where: { username: 'chikiet' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log(`👤 User: ${adminUser.username} (${adminUser.email})`);
    console.log(`🔑 Role ID: ${adminUser.roleId}`);
    
    // Get user role details
    const userRole = await prisma.roles.findFirst({
      where: { id: adminUser.roleId }
    });
    
    if (userRole) {
      console.log(`👑 Role: ${userRole.name} (Level: ${userRole.level})`);
      
      // Get user menu permissions
      const userMenus = await prisma.role_menu_items.findMany({
        where: { roleId: adminUser.roleId },
        include: { menuItem: true },
        orderBy: { menuItem: { sortOrder: 'asc' } }
      });
      
      console.log(`\n📋 USER MENU ACCESS (${userMenus.length} items):`);
      userMenus.forEach(p => {
        const icon = p.canAccess ? '✅' : '❌';
        console.log(`   ${icon} ${p.menuItem.title} - ${p.menuItem.path}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking user menu access:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserMenuAccess();

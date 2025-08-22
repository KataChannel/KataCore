import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllAdminRoles() {
  try {
    console.log('🔧 Fixing all admin roles with limited permissions...');
    
    // Find roles with insufficient permissions
    const rolesWithPermissions = await prisma.role_menu_items.groupBy({
      by: ['roleId'],
      _count: {
        roleId: true
      }
    });
    
    // Get role details
    const rolePermissionMap = new Map(
      rolesWithPermissions.map(r => [r.roleId, r._count.roleId])
    );
    
    const allRoles = await prisma.roles.findMany({
      where: { level: { gte: 8 } }, // Admin level roles
      orderBy: { level: 'desc' }
    });
    
    console.log('📋 Admin level roles (Level >= 8):');
    
    for (const role of allRoles) {
      const permCount = rolePermissionMap.get(role.id) || 0;
      console.log(`- ${role.name} (Level ${role.level}): ${permCount} permissions`);
      
      // If admin role has less than 10 permissions, it's problematic
      if (role.level >= 9 && permCount < 10) {
        console.log(`  ⚠️  This high-level role has insufficient permissions!`);
        
        // Find users with this role
        const usersWithRole = await prisma.users.findMany({
          where: { roleId: role.id },
          select: { email: true, id: true }
        });
        
        if (usersWithRole.length > 0) {
          console.log(`  👥 Users affected: ${usersWithRole.map(u => u.email).join(', ')}`);
        }
      }
    }
    
    // Suggest consolidation
    console.log('\n💡 Recommendation:');
    console.log('Consider consolidating duplicate admin roles:');
    console.log('- Use SUPER_ADMIN for Level 10 users');
    console.log('- Use SYSTEM_ADMIN for Level 9 users');
    console.log('- Remove duplicate roles to avoid confusion');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAdminRoles();

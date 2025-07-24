// Check migration status
const { PrismaClient } = require('@prisma/client');

async function checkStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Migration Status...');
    console.log('================================');
    
    // Check roles
    const systemRoles = await prisma.role.count({ where: { isSystemRole: true } });
    const allRoles = await prisma.role.findMany({ 
      where: { isSystemRole: true },
      select: { name: true, level: true, _count: { select: { users: true } } }
    });
    
    console.log(`✅ System Roles: ${systemRoles}`);
    allRoles.forEach(role => {
      console.log(`   • ${role.name} (Level ${role.level}) - ${role._count.users} users`);
    });
    
    // Check users
    const totalUsers = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { email: true, displayName: true, role: { select: { name: true } } }
    });
    
    console.log(`\n✅ Total Users: ${totalUsers}`);
    users.forEach(user => {
      console.log(`   • ${user.email} (${user.role.name})`);
    });
    
    // Check admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@taza.com' },
      include: { role: true }
    });
    
    console.log(`\n🔑 Admin Status: ${adminUser ? 'Ready' : 'Not found'}`);
    if (adminUser) {
      console.log(`   • Email: ${adminUser.email}`);
      console.log(`   • Role: ${adminUser.role.name}`);
      console.log(`   • Active: ${adminUser.isActive}`);
      console.log(`   • Verified: ${adminUser.isVerified}`);
    }
    
    console.log('\n🌐 Next Steps:');
    console.log('   1. Start the application: npm run dev');
    console.log('   2. Open: http://localhost:3000/admin');
    console.log('   3. Login: admin@taza.com / TazaAdmin@2024!');
    console.log('   4. Navigate to Permissions tab');
    console.log('   5. Use Sync tab for permission management');
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

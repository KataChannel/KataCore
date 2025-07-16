const { PrismaClient } = require('@prisma/client');

async function testPrismaClient() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Prisma client with new schema...');
    
    // Test finding a role first
    const role = await prisma.role.findFirst();
    console.log('✅ Found role:', role?.name);
    
    if (role) {
      // Test updating with the new fields
      const updated = await prisma.role.update({
        where: { id: role.id },
        data: { 
          level: 8,
          modules: JSON.stringify(['test'])
        }
      });
      
      console.log('✅ Updated role with new fields!');
      console.log('📊 Result:', {
        id: updated.id,
        name: updated.name,
        level: updated.level,
        modules: updated.modules
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();

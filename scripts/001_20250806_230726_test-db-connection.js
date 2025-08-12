// Database connection test
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test roles table
    try {
      const roleCount = await prisma.roles.count();
      console.log(`✅ Roles table accessible. Count: ${roleCount}`);
      
      // Test role schema
      const sampleRole = await prisma.roles.findFirst();
      console.log('✅ Sample role:', sampleRole);
      
    } catch (roleError) {
      console.log('❌ Roles table error:', roleError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

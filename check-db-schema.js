const { PrismaClient } = require('@prisma/client');

async function checkDatabaseSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking actual database schema...');
    
    // Use raw SQL to check the table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'roles' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Columns in roles table:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseSchema();

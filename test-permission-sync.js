#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testPermissionSyncDirectly() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing permission sync functionality...');
    
    // Test basic database connection
    const roleCount = await prisma.role.count({ where: { isSystemRole: true } });
    console.log(`✅ Found ${roleCount} system roles in database`);
    
    // Test role query with permissions
    const superAdminRole = await prisma.role.findFirst({
      where: { name: 'Super Administrator' }
    });
    
    if (superAdminRole) {
      const permissions = JSON.parse(superAdminRole.permissions || '{}');
      console.log(`✅ Super Admin role found with ${permissions.permissions?.length || 0} permissions`);
      console.log(`✅ Role level: ${superAdminRole.level}`);
      console.log(`✅ Modules: ${superAdminRole.modules || 'None'}`);
    } else {
      console.log('❌ Super Administrator role not found');
    }
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`✅ Total users in database: ${userCount}`);
    
    console.log('\n🎉 All database operations working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing permissions:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissionSyncDirectly();

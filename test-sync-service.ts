#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { PermissionSyncService } from './shared/lib/permission-sync.service';

const prisma = new PrismaClient();

async function testSyncService() {
  try {
    console.log('🔍 Testing PermissionSyncService...');
    
    // Test getSyncStatus
    console.log('📊 Getting sync status...');
    const status = await PermissionSyncService.getSyncStatus();
    
    console.log('✅ Sync Status Results:');
    console.log(`   - In Sync: ${status.inSync}`);
    console.log(`   - Module Roles: ${status.differences.roleCount.module}`);
    console.log(`   - Database Roles: ${status.differences.roleCount.database}`);
    console.log(`   - Missing Roles: ${status.differences.missingRoles.length}`);
    console.log(`   - Extra Roles: ${status.differences.extraRoles.length}`);
    console.log(`   - Out of Sync Roles: ${status.differences.outOfSyncRoles.length}`);
    
    if (status.differences.missingRoles.length > 0) {
      console.log(`   - Missing: ${status.differences.missingRoles.join(', ')}`);
    }
    
    if (status.differences.extraRoles.length > 0) {
      console.log(`   - Extra: ${status.differences.extraRoles.join(', ')}`);
    }
    
    if (status.differences.outOfSyncRoles.length > 0) {
      console.log(`   - Out of Sync: ${status.differences.outOfSyncRoles.join(', ')}`);
    }
    
    // Test auto-sync
    console.log('\n🤖 Testing auto-sync...');
    await PermissionSyncService.autoSync();
    console.log('✅ Auto-sync completed successfully');
    
    console.log('\n🎉 All PermissionSyncService tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing sync service:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testSyncService().catch(console.error);

// Test the sync service directly within the site environment
import { NextRequest } from 'next/server';
import PermissionSyncService from '../../../shared/lib/permission-sync.service';

async function testSyncServiceInSite() {
  try {
    console.log('🔍 Testing sync service within site environment...');
    
    // Test getSyncStatus
    const status = await PermissionSyncService.getSyncStatus();
    console.log('✅ Sync Status:', JSON.stringify(status, null, 2));
    
    return { success: true, status };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

testSyncServiceInSite().then(result => {
  console.log('Final result:', result);
  process.exit(result.success ? 0 : 1);
});

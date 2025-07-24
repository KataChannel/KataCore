// ============================================================================
// PERMISSION AUTO-SYNC STARTUP HOOK
// ============================================================================
// Automatically syncs permissions on application startup

import { PermissionSyncService } from '../../../../shared/lib/permission-sync.service';

// ============================================================================
// STARTUP PERMISSION SYNC
// ============================================================================

/**
 * Initialize permission sync on application startup
 */
export async function initializePermissionSync() {
  try {
    console.log('🔄 [STARTUP] Initializing permission synchronization...');
    
    // Check if we should run auto-sync
    const shouldAutoSync = process.env.AUTO_SYNC_PERMISSIONS !== 'false';
    
    if (!shouldAutoSync) {
      console.log('⏭️ [STARTUP] Auto-sync disabled via environment variable');
      return;
    }
    
    // Run auto-sync (only syncs if needed)
    await PermissionSyncService.autoSync();
    
    console.log('✅ [STARTUP] Permission sync initialization completed');
    
  } catch (error) {
    console.error('❌ [STARTUP] Permission sync initialization failed:', error);
    
    // Don't fail the entire application startup for sync issues
    // This ensures the app can still start even if sync fails
  }
}

/**
 * Get permission sync status for health checks
 */
export async function getPermissionSyncHealth() {
  try {
    const status = await PermissionSyncService.getSyncStatus();
    
    return {
      healthy: status.inSync,
      status: status.inSync ? 'in-sync' : 'out-of-sync',
      lastCheck: new Date().toISOString(),
      differences: status.differences
    };
    
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      lastCheck: new Date().toISOString(),
      error: String(error)
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default initializePermissionSync;

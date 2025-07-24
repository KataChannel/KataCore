// ============================================================================
// PERMISSION SYNC API
// ============================================================================
// API endpoints for permission synchronization management

import { NextRequest, NextResponse } from 'next/server';
import PermissionSyncService, { getPermissionStats } from '@/lib/permission-sync.service';

/**
 * GET /api/admin/sync-permissions
 * Get sync status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'status':
        const status = await PermissionSyncService.getSyncStatus();
        return NextResponse.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString(),
        });
        
      case 'stats':
        const stats = await getPermissionStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString(),
        });
        
      default:
        // Default: return both status and stats
        const [syncStatus, permissionStats] = await Promise.all([
          PermissionSyncService.getSyncStatus(),
          getPermissionStats()
        ]);
        
        return NextResponse.json({
          success: true,
          data: {
            status: syncStatus,
            stats: permissionStats
          },
          timestamp: new Date().toISOString(),
        });
    }
    
  } catch (error: any) {
    console.error('❌ Sync status API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/sync-permissions
 * Perform permission synchronization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roleId, force = false } = body;
    
    // Validate in production
    if (process.env.NODE_ENV === 'production' && !force) {
      return NextResponse.json({
        success: false,
        message: 'Sync requires force=true in production',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }
    
    switch (action) {
      case 'sync-all':
        console.log('🔄 Starting full permission sync...');
        const syncResult = await PermissionSyncService.syncAllPermissions();
        
        return NextResponse.json({
          success: syncResult.success,
          message: syncResult.message,
          data: {
            changes: syncResult.changes,
            errors: syncResult.errors
          },
          timestamp: new Date().toISOString(),
        }, { status: syncResult.success ? 200 : 500 });
        
      case 'validate-role':
        if (!roleId) {
          return NextResponse.json({
            success: false,
            message: 'roleId is required for role validation',
            timestamp: new Date().toISOString(),
          }, { status: 400 });
        }
        
        console.log(`🔍 Validating role: ${roleId}`);
        const validation = await PermissionSyncService.validateRole(roleId);
        
        return NextResponse.json({
          success: true,
          data: validation,
          timestamp: new Date().toISOString(),
        });
        
      case 'auto-sync':
        console.log('🤖 Running auto-sync...');
        await PermissionSyncService.autoSync();
        
        return NextResponse.json({
          success: true,
          message: 'Auto-sync completed',
          timestamp: new Date().toISOString(),
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: sync-all, validate-role, or auto-sync',
          timestamp: new Date().toISOString(),
        }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('❌ Sync API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Sync operation failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/sync-permissions
 * Update specific role from module definition
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId, force = false } = body;
    
    if (!roleId) {
      return NextResponse.json({
        success: false,
        message: 'roleId is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    // Validate in production
    if (process.env.NODE_ENV === 'production' && !force) {
      return NextResponse.json({
        success: false,
        message: 'Role update requires force=true in production',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }
    
    console.log(`🔄 Updating role: ${roleId}`);
    
    // First validate the role
    const validation = await PermissionSyncService.validateRole(roleId);
    
    if (validation.valid) {
      return NextResponse.json({
        success: true,
        message: 'Role is already in sync',
        data: validation,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Perform sync for this specific role
    const syncResult = await PermissionSyncService.syncAllPermissions();
    
    // Re-validate to confirm sync
    const newValidation = await PermissionSyncService.validateRole(roleId);
    
    return NextResponse.json({
      success: newValidation.valid,
      message: newValidation.valid ? 'Role synchronized successfully' : 'Role sync failed',
      data: {
        beforeSync: validation,
        afterSync: newValidation,
        syncResult: syncResult
      },
      timestamp: new Date().toISOString(),
    }, { status: newValidation.valid ? 200 : 500 });
    
  } catch (error: any) {
    console.error('❌ Role update API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Role update failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

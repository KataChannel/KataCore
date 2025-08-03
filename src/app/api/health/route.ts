import { NextRequest, NextResponse } from 'next/server';
import { getPermissionSyncHealth } from '../../../lib/auth/permission-startup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSync = searchParams.get('sync') === 'true';
    
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
    
    // Include permission sync status if requested
    if (includeSync) {
      try {
        const syncHealth = await getPermissionSyncHealth();
        health.permissionSync = syncHealth;
      } catch (error) {
        health.permissionSync = {
          healthy: false,
          status: 'error',
          error: String(error)
        };
      }
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

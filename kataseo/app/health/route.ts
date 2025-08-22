import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/query-optimizer'

export async function GET() {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseHealth()
    
    // Check basic application health
    const appHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    // Overall health status
    const isHealthy = dbHealth.status === 'healthy'
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks: {
        database: dbHealth,
        application: appHealth
      }
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

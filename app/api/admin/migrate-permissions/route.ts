// ============================================================================
// MODULES PERMISSIONS MIGRATION API
// ============================================================================
// API endpoint to migrate modules-permissions.ts data to database

import { NextRequest, NextResponse } from 'next/server';
import runModulesPermissionsMigration from '../../../../../prisma/seed/archive/modules-permissions-migration';

export async function GET() {
  try {
    console.log('🚀 Starting modules permissions migration via API...');
    
    const result = await runModulesPermissionsMigration();
    
    return NextResponse.json({
      success: true,
      message: 'Modules permissions migration completed successfully',
      data: result,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Migration API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { force = false } = await request.json();
    
    console.log('🚀 Starting forced modules permissions migration...');
    
    // Add validation for production environment
    if (process.env.NODE_ENV === 'production' && !force) {
      return NextResponse.json({
        success: false,
        message: 'Migration requires force=true in production',
        timestamp: new Date().toISOString(),
      }, { status: 403 });
    }
    
    const result = await runModulesPermissionsMigration();
    
    return NextResponse.json({
      success: true,
      message: 'Forced modules permissions migration completed',
      data: result,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('❌ Forced migration API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Forced migration failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

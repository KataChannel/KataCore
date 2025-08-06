// Simple test API route to debug the 500 error
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test API called');
    return NextResponse.json({ 
      success: true, 
      message: 'Basic test API works',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Test API failed',
      stack: error.stack 
    }, { status: 500 });
  }
}

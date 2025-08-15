import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to check if stream errors are fixed
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Facebook sync API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      success: true,
      message: 'POST request received',
      body: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

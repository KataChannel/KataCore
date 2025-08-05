import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'Facebook auth endpoint is accessible',
    timestamp: new Date().toISOString(),
    env: {
      hasAppId: !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
      apiVersion: process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION
    }
  });
}

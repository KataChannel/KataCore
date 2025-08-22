import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shortToken, appId, appSecret } = await request.json();

    if (!shortToken || !appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: shortToken, appId, appSecret'
      }, { status: 400 });
    }

    // Exchange short-lived token for long-lived token
    const exchangeUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token');
    exchangeUrl.searchParams.append('grant_type', 'fb_exchange_token');
    exchangeUrl.searchParams.append('client_id', appId);
    exchangeUrl.searchParams.append('client_secret', appSecret);
    exchangeUrl.searchParams.append('fb_exchange_token', shortToken);

    console.log('🔄 Exchanging short-lived token for long-lived token...');

    const response = await fetch(exchangeUrl.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.error?.message || 'Token exchange failed',
        details: data.error?.type || 'Unknown error'
      }, { status: 400 });
    }

    console.log('✅ Successfully exchanged for long-lived token');

    return NextResponse.json({
      success: true,
      longLivedToken: data.access_token,
      expiresIn: data.expires_in || 5184000, // 60 days default
      tokenType: data.token_type || 'bearer'
    });

  } catch (error: any) {
    console.error('Token exchange error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

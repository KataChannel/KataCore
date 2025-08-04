// ============================================================================
// AFFILIATE API ROUTES - TRACKING
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';

// GET /api/affiliate/track/[code] - Track affiliate link click
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { searchParams } = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Extract tracking parameters
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_content = searchParams.get('utm_content');
    const utm_term = searchParams.get('utm_term');

    // For now, simulate tracking - implement actual service method later
    const trackingData = {
      code,
      timestamp: new Date(),
      userAgent,
      referer,
      ip,
      utmParams: {
        source: utm_source,
        medium: utm_medium,
        campaign: utm_campaign,
        content: utm_content,
        term: utm_term,
      },
    };

    console.log('Affiliate link clicked:', trackingData);

    // Mock link lookup - in real implementation, find the actual destination URL
    const destinationUrl = 'https://example.com/product/123';

    // Record the click (mock for now)
    // await affiliateService.trackClick(code, trackingData);

    // Redirect to destination
    return NextResponse.redirect(destinationUrl);
  } catch (error: any) {
    console.error('Track link error:', error);
    
    // Fallback redirect to main site
    return NextResponse.redirect('https://example.com');
  }
}

// POST /api/affiliate/track/conversion - Track conversion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      affiliateCode, 
      orderId, 
      orderValue, 
      currency = 'USD',
      customerEmail,
      products = [],
      metadata = {} 
    } = body;

    if (!affiliateCode || !orderId || !orderValue) {
      return NextResponse.json(
        { success: false, error: 'Affiliate code, order ID, and order value are required' },
        { status: 400 }
      );
    }

    // For now, simulate conversion tracking - implement actual service method later
    const conversionData = {
      affiliateCode,
      orderId,
      orderValue: parseFloat(orderValue),
      currency,
      customerEmail,
      products,
      metadata,
      timestamp: new Date(),
    };

    console.log('Conversion tracked:', conversionData);

    // Mock conversion processing
    const commission = {
      id: Math.random().toString(36).substr(2, 9),
      amount: orderValue * 0.05, // 5% commission example
      currency,
      status: 'PENDING',
      orderId,
      conversionDate: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: {
        tracked: true,
        commission,
      },
    });
  } catch (error: any) {
    console.error('Track conversion error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

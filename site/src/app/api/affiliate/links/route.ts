// ============================================================================
// AFFILIATE API ROUTES - LINKS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

const createLinkSchema = z.object({
  name: z.string().min(1),
  targetUrl: z.string().url(),
  type: z.enum(['PRODUCT', 'CATEGORY', 'HOMEPAGE', 'LANDING', 'CUSTOM']),
  campaignId: z.string().optional(),
  customParams: z.record(z.string()).optional(),
  expiresAt: z.string().transform(str => new Date(str)).optional(),
});

// GET /api/affiliate/links - List affiliate links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    
    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock data - implement actual service method later
    const links = [
      {
        id: '1',
        name: 'Homepage Link',
        shortCode: 'ABC123',
        fullUrl: 'https://yoursite.com/aff/ABC123',
        targetUrl: 'https://yoursite.com',
        type: 'HOMEPAGE',
        clickCount: 150,
        conversionCount: 8,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: links,
    });
  } catch (error: any) {
    console.error('Get links error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/links - Create affiliate link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLinkSchema.parse(body);
    const { affiliateId, ...linkData } = body;

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    const link = await affiliateService.createLink(affiliateId, linkData);

    return NextResponse.json({
      success: true,
      data: link,
    });
  } catch (error: any) {
    console.error('Create link error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// AFFILIATE API ROUTES - REFERRALS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

const referralCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  campaignId: z.string().optional(),
  customData: z.record(z.any()).optional(),
});

// GET /api/affiliate/referrals - List referrals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock data - implement actual service method later
    const referrals = [
      {
        id: '1',
        affiliateId,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0123',
        status: 'CONVERTED',
        source: 'social_media',
        registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        convertedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        totalOrders: 3,
        totalOrderValue: 456.78,
        commissionEarned: 22.84,
      },
      {
        id: '2',
        affiliateId,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0456',
        status: 'REGISTERED',
        source: 'email_campaign',
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        totalOrders: 0,
        totalOrderValue: 0,
        commissionEarned: 0,
      },
      {
        id: '3',
        affiliateId,
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        status: 'PENDING',
        source: 'direct_link',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        totalOrders: 0,
        totalOrderValue: 0,
        commissionEarned: 0,
      },
    ];

    const filteredReferrals = status 
      ? referrals.filter(r => r.status === status.toUpperCase())
      : referrals;

    return NextResponse.json({
      success: true,
      data: {
        referrals: filteredReferrals,
        total: filteredReferrals.length,
        pages: Math.ceil(filteredReferrals.length / limit),
        summary: {
          totalReferrals: referrals.length,
          pendingReferrals: referrals.filter(r => r.status === 'PENDING').length,
          registeredReferrals: referrals.filter(r => r.status === 'REGISTERED').length,
          convertedReferrals: referrals.filter(r => r.status === 'CONVERTED').length,
          totalCommissions: referrals.reduce((sum, r) => sum + r.commissionEarned, 0),
        },
      },
    });
  } catch (error: any) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/referrals - Create referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = referralCreateSchema.parse(body);
    const { affiliateId } = body;

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // For now, create mock referral - implement actual service method later
    const referral = {
      id: Math.random().toString(36).substr(2, 9),
      affiliateId,
      ...validatedData,
      status: 'PENDING',
      registeredAt: new Date(),
      totalOrders: 0,
      totalOrderValue: 0,
      commissionEarned: 0,
    };

    return NextResponse.json({
      success: true,
      data: referral,
    });
  } catch (error: any) {
    console.error('Create referral error:', error);
    
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

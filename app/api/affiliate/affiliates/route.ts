// ============================================================================
// AFFILIATE API ROUTES - MAIN ROUTER
// ============================================================================
// RESTful API endpoints for affiliate management

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

// Validation schemas
const createAffiliateSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  promotionMethods: z.array(z.string()).optional(),
  expectedTraffic: z.number().optional(),
  referralSource: z.string().optional(),
  notes: z.string().optional(),
});

const updateAffiliateSchema = z.object({
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'REJECTED']).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

// GET /api/affiliate/affiliates - List affiliates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.getAll('status');
    const tier = searchParams.getAll('tier');
    const search = searchParams.get('search') || '';
    const minEarnings = searchParams.get('minEarnings') ? parseFloat(searchParams.get('minEarnings')!) : undefined;
    const maxEarnings = searchParams.get('maxEarnings') ? parseFloat(searchParams.get('maxEarnings')!) : undefined;
    
    const dateRangeStart = searchParams.get('dateStart');
    const dateRangeEnd = searchParams.get('dateEnd');
    
    const filter: any = {
      search,
      minEarnings,
      maxEarnings,
    };
    
    if (status.length > 0) filter.status = status;
    if (tier.length > 0) filter.tier = tier;
    if (dateRangeStart && dateRangeEnd) {
      filter.dateRange = {
        start: new Date(dateRangeStart),
        end: new Date(dateRangeEnd),
      };
    }

    const result = await affiliateService.listAffiliates(filter, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get affiliates error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/affiliates - Create affiliate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAffiliateSchema.parse(body);

    const affiliate = await affiliateService.createAffiliate(validatedData);

    return NextResponse.json({
      success: true,
      data: affiliate,
    });
  } catch (error: any) {
    console.error('Create affiliate error:', error);
    
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

// ============================================================================
// AFFILIATE API ROUTES - INDIVIDUAL AFFILIATE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

const updateAffiliateSchema = z.object({
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'REJECTED']).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

// GET /api/affiliate/affiliates/[id] - Get single affiliate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const affiliate = await affiliateService.getAffiliate(params.id);

    if (!affiliate) {
      return NextResponse.json(
        { success: false, error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: affiliate,
    });
  } catch (error: any) {
    console.error('Get affiliate error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/affiliate/affiliates/[id] - Update affiliate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateAffiliateSchema.parse(body);

    const affiliate = await affiliateService.updateAffiliate(params.id, validatedData);

    return NextResponse.json({
      success: true,
      data: affiliate,
    });
  } catch (error: any) {
    console.error('Update affiliate error:', error);
    
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

// DELETE /api/affiliate/affiliates/[id] - Delete/terminate affiliate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const affiliate = await affiliateService.updateAffiliate(params.id, {
      status: 'TERMINATED',
      notes: 'Account terminated',
    });

    return NextResponse.json({
      success: true,
      data: affiliate,
    });
  } catch (error: any) {
    console.error('Delete affiliate error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

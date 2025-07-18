// ============================================================================
// AFFILIATE API ROUTES - COMMISSIONS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';

// GET /api/affiliate/commissions - List commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.getAll('status');
    const type = searchParams.getAll('type');
    const affiliateId = searchParams.get('affiliateId') || undefined;
    const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined;
    
    const dateRangeStart = searchParams.get('dateStart');
    const dateRangeEnd = searchParams.get('dateEnd');
    
    const filter: any = {
      affiliateId,
      minAmount,
      maxAmount,
    };
    
    if (status.length > 0) filter.status = status;
    if (type.length > 0) filter.type = type;
    if (dateRangeStart && dateRangeEnd) {
      filter.dateRange = {
        start: new Date(dateRangeStart),
        end: new Date(dateRangeEnd),
      };
    }

    const result = await affiliateService.listCommissions(filter, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

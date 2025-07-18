// ============================================================================
// AFFILIATE API ROUTES - WITHDRAWALS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

const withdrawalRequestSchema = z.object({
  amount: z.number().min(1),
  method: z.enum(['BANK_TRANSFER', 'PAYPAL', 'CRYPTOCURRENCY', 'CHECK', 'WIRE_TRANSFER']),
  bankDetails: z.object({
    accountHolderName: z.string(),
    bankName: z.string(),
    accountNumber: z.string(),
    routingNumber: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional(),
    country: z.string(),
  }).optional(),
  paypalEmail: z.string().email().optional(),
  cryptoAddress: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/affiliate/withdrawals - List withdrawals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock data - implement actual service method later
    const withdrawals = [
      {
        id: '1',
        amount: 250.00,
        currency: 'USD',
        method: 'PAYPAL',
        status: 'COMPLETED',
        netAmount: 246.25,
        processingFee: 3.75,
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        amount: 500.00,
        currency: 'USD',
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        netAmount: 490.00,
        processingFee: 10.00,
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        total: withdrawals.length,
        pages: 1,
      },
    });
  } catch (error: any) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/withdrawals - Request withdrawal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = withdrawalRequestSchema.parse(body);
    const { affiliateId } = body;

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: 'Affiliate ID is required' },
        { status: 400 }
      );
    }

    const withdrawal = await affiliateService.requestWithdrawal(affiliateId, validatedData);

    return NextResponse.json({
      success: true,
      data: withdrawal,
    });
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    
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

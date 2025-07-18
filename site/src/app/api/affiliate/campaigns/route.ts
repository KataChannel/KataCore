// ============================================================================
// AFFILIATE API ROUTES - CAMPAIGNS
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/services/affiliate.service';
import { z } from 'zod';

const campaignCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionValue: z.number().min(0),
  targetAudience: z.string().optional(),
  budget: z.number().min(0).optional(),
  maxParticipants: z.number().min(1).optional(),
  requiresApproval: z.boolean().default(false),
  materials: z.array(z.object({
    type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'LINK']),
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })).optional(),
  restrictions: z.array(z.string()).optional(),
});

// GET /api/affiliate/campaigns - List campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const affiliateId = searchParams.get('affiliateId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // For now, return mock data - implement actual service method later
    const campaigns = [
      {
        id: '1',
        name: 'Summer Sale 2024',
        description: 'Promote our summer collection with special discounts',
        status: 'ACTIVE',
        commissionType: 'PERCENTAGE',
        commissionValue: 15.0,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        participantCount: 45,
        maxParticipants: 100,
        totalCommissions: 2450.75,
        clickCount: 1250,
        conversionCount: 89,
        conversionRate: 7.12,
      },
      {
        id: '2',
        name: 'Back to School Campaign',
        description: 'Target students and parents for school supplies',
        status: 'DRAFT',
        commissionType: 'FIXED',
        commissionValue: 25.0,
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-09-30'),
        participantCount: 0,
        maxParticipants: 50,
        totalCommissions: 0,
        clickCount: 0,
        conversionCount: 0,
        conversionRate: 0,
      },
    ];

    const filteredCampaigns = status 
      ? campaigns.filter(c => c.status === status.toUpperCase())
      : campaigns;

    return NextResponse.json({
      success: true,
      data: {
        campaigns: filteredCampaigns,
        total: filteredCampaigns.length,
        pages: Math.ceil(filteredCampaigns.length / limit),
      },
    });
  } catch (error: any) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/campaigns - Create campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = campaignCreateSchema.parse(body);

    // For now, create mock campaign - implement actual service method later
    const campaign = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      status: 'DRAFT',
      participantCount: 0,
      totalCommissions: 0,
      clickCount: 0,
      conversionCount: 0,
      conversionRate: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    
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

/**
 * ============================================================================
 * AFFILIATE API ROUTES - REGISTRATION
 * ============================================================================
 * API endpoint for affiliate registration and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AffiliateTier, AffiliateStatus } from '@/types/affiliate';
import crypto from 'crypto';

function generateAffiliateCode(displayName: string): string {
  const sanitized = displayName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${sanitized.slice(0, 4)}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, referralCode } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already an affiliate
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'User is already an affiliate' },
        { status: 400 }
      );
    }

    // Generate unique affiliate code
    const code = generateAffiliateCode(user.displayName);

    // Create affiliate
    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        code,
        tier: AffiliateTier.BRONZE,
        status: AffiliateStatus.PENDING,
        totalEarnings: 0,
        pendingEarnings: 0,
        totalReferrals: 0,
        totalClicks: 0,
        conversionRate: 0
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      affiliate,
      message: 'Affiliate registered successfully'
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register affiliate' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true
          }
        },
        links: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        commissions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Get affiliate error:', error);
    return NextResponse.json(
      { error: 'Failed to get affiliate data' },
      { status: 500 }
    );
  }
}

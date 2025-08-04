/**
 * ============================================================================
 * AFFILIATE SERVICE - SIMPLIFIED WORKING VERSION
 * ============================================================================
 * Basic affiliate management service that works with the current schema
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { 
  AffiliateTier, 
  AffiliateStatus,
  CommissionStatus,
  WithdrawalStatus,
  WithdrawalMethod
} from '@/types/affiliate';

export class AffiliateService {
  /**
   * Register a new affiliate
   */
  async registerAffiliate(userId: string, referralCode?: string) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if already an affiliate
      const existingAffiliate = await prisma.affiliate.findUnique({
        where: { userId }
      });

      if (existingAffiliate) {
        throw new Error('User is already an affiliate');
      }

      // Generate unique affiliate code
      const code = this.generateAffiliateCode(user.displayName);

      // Create affiliate
      const affiliate = await prisma.affiliate.create({
        data: {
          userId,
          code,
          tier: AffiliateTier.BRONZE,
          status: AffiliateStatus.PENDING,
          joinedAt: new Date(),
          lastActiveAt: new Date(),
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

      return {
        success: true,
        affiliate,
        message: 'Affiliate registered successfully'
      };
    } catch (error) {
      console.error('Affiliate registration error:', error);
      throw error;
    }
  }

  /**
   * Get affiliate by user ID
   */
  async getAffiliateByUserId(userId: string) {
    return await prisma.affiliate.findUnique({
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
  }

  /**
   * Get affiliate by code
   */
  async getAffiliateByCode(code: string) {
    return await prisma.affiliate.findUnique({
      where: { code },
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
  }

  /**
   * Create affiliate link
   */
  async createAffiliateLink(affiliateId: string, data: {
    title: string;
    originalUrl: string;
    type: string;
    category?: string;
    description?: string;
  }) {
    const shortCode = this.generateShortCode();
    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL}/aff/${shortCode}`;

    return await prisma.affiliateLink.create({
      data: {
        affiliateId,
        title: data.title,
        originalUrl: data.originalUrl,
        shortCode,
        fullUrl,
        type: data.type,
        category: data.category,
        description: data.description,
        isActive: true,
        clicks: 0,
        conversions: 0,
        revenue: 0
      }
    });
  }

  /**
   * Track click on affiliate link
   */
  async trackClick(shortCode: string, ipAddress: string, userAgent: string) {
    const link = await prisma.affiliateLink.findUnique({
      where: { shortCode },
      include: { affiliate: true }
    });

    if (!link || !link.isActive) {
      throw new Error('Link not found or inactive');
    }

    // Create click record
    const click = await prisma.affiliateClick.create({
      data: {
        linkId: link.id,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        isUnique: true // Simplified logic
      }
    });

    // Update link click count
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } }
    });

    // Update affiliate click count
    await prisma.affiliate.update({
      where: { id: link.affiliateId },
      data: { clickCount: { increment: 1 } }
    });

    return {
      redirectUrl: link.originalUrl,
      clickId: click.id
    };
  }

  /**
   * Generate performance metrics
   */
  async getPerformanceMetrics(affiliateId: string, timeRange = '30d') {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        links: true,
        commissions: true,
        clicks: {
          include: { link: true }
        }
      }
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Calculate metrics
    const totalClicks = affiliate.clickCount;
    const totalConversions = affiliate.conversionCount;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      totalClicks,
      uniqueClicks: totalClicks, // Simplified
      conversions: totalConversions,
      conversionRate,
      totalSales: affiliate.totalEarnings / (affiliate.commissionRate || 0.05),
      totalCommissions: affiliate.totalCommissions,
      availableBalance: affiliate.currentBalance,
      pendingCommissions: 0, // Would need to calculate from pending commissions
      monthlyStats: [], // Would need to implement monthly aggregation
      topPerformingLinks: affiliate.links.slice(0, 5).map(link => ({
        linkId: link.id,
        name: link.title,
        clicks: link.clicks,
        conversions: link.conversions,
        revenue: link.revenue
      }))
    };
  }

  /**
   * Generate unique affiliate code
   */
  private generateAffiliateCode(displayName: string): string {
    const sanitized = displayName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${sanitized.slice(0, 4)}${random}`;
  }

  /**
   * Generate short code for links
   */
  private generateShortCode(): string {
    return crypto.randomBytes(4).toString('hex');
  }
}

export const affiliateService = new AffiliateService();
export default affiliateService;

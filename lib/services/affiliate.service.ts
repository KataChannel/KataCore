// ============================================================================
// AFFILIATE SERVICE - CORE BUSINESS LOGIC
// ============================================================================
// Comprehensive service layer for affiliate management

import { prisma } from '@/lib/prisma';
import { 
  Affiliate, 
  AffiliateReferral, 
  AffiliateCommission, 
  AffiliateWithdrawal,
  AffiliateLink,
  AffiliateCampaign,
  AffiliateActivity,
  CreateAffiliateRequest,
  UpdateAffiliateRequest,
  CreateLinkRequest,
  WithdrawalRequest,
  AffiliateFilter,
  CommissionFilter,
  AffiliateTier,
  AffiliateStatus,
  CommissionType,
  CommissionStatus,
  WithdrawalStatus,
  ActivityType
} from '@/types/affiliate';

export class AffiliateService {
  
  // ============================================================================
  // AFFILIATE MANAGEMENT
  // ============================================================================
  
  /**
   * Create a new affiliate
   */
  async createAffiliate(data: CreateAffiliateRequest): Promise<Affiliate> {
    const affiliateCode = await this.generateUniqueAffiliateCode();
    
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: data.userId!,
        affiliateCode,
        tier: AffiliateTier.BRONZE,
        status: data.userId ? AffiliateStatus.ACTIVE : AffiliateStatus.PENDING,
        commissionRate: await this.getDefaultCommissionRate(),
        notes: data.notes,
      },
      include: {
        user: true,
      },
    });

    // Log activity
    await this.logActivity(affiliate.id, ActivityType.REGISTRATION, 'Affiliate registered');

    return affiliate;
  }

  /**
   * Update affiliate information
   */
  async updateAffiliate(id: string, data: UpdateAffiliateRequest): Promise<Affiliate> {
    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        ...data,
        lastActivityAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Log tier upgrade if applicable
    if (data.tier && data.tier !== affiliate.tier) {
      await this.logActivity(id, ActivityType.TIER_UPGRADE, `Upgraded to ${data.tier} tier`);
    }

    return affiliate;
  }

  /**
   * Get affiliate by ID
   */
  async getAffiliate(id: string): Promise<Affiliate | null> {
    return prisma.affiliate.findUnique({
      where: { id },
      include: {
        user: true,
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        withdrawals: {
          orderBy: { requestedAt: 'desc' },
          take: 5,
        },
        links: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  /**
   * Get affiliate by user ID
   */
  async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    return prisma.affiliate.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  /**
   * Get affiliate by code
   */
  async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    return prisma.affiliate.findUnique({
      where: { affiliateCode: code },
      include: {
        user: true,
      },
    });
  }

  /**
   * List affiliates with filtering
   */
  async listAffiliates(
    filter: AffiliateFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ affiliates: Affiliate[]; total: number; pages: number }> {
    const where: any = {};

    if (filter.status?.length) {
      where.status = { in: filter.status };
    }

    if (filter.tier?.length) {
      where.tier = { in: filter.tier };
    }

    if (filter.dateRange) {
      where.joinedAt = {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end,
      };
    }

    if (filter.minEarnings !== undefined) {
      where.totalEarnings = { gte: filter.minEarnings };
    }

    if (filter.maxEarnings !== undefined) {
      where.totalEarnings = { ...where.totalEarnings, lte: filter.maxEarnings };
    }

    if (filter.search) {
      where.OR = [
        { affiliateCode: { contains: filter.search, mode: 'insensitive' } },
        { user: { email: { contains: filter.search, mode: 'insensitive' } } },
        { user: { displayName: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        include: {
          user: true,
          _count: {
            select: {
              referrals: true,
              commissions: true,
              withdrawals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliate.count({ where }),
    ]);

    return {
      affiliates,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Approve affiliate
   */
  async approveAffiliate(id: string): Promise<Affiliate> {
    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        status: AffiliateStatus.ACTIVE,
        approvedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    await this.logActivity(id, ActivityType.PROFILE_UPDATE, 'Affiliate approved');
    
    return affiliate;
  }

  /**
   * Suspend affiliate
   */
  async suspendAffiliate(id: string, reason?: string): Promise<Affiliate> {
    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        status: AffiliateStatus.SUSPENDED,
        suspendedAt: new Date(),
        notes: reason,
      },
      include: {
        user: true,
      },
    });

    await this.logActivity(id, ActivityType.PROFILE_UPDATE, `Affiliate suspended: ${reason || 'No reason provided'}`);
    
    return affiliate;
  }

  // ============================================================================
  // REFERRAL MANAGEMENT
  // ============================================================================

  /**
   * Track a referral
   */
  async trackReferral(
    affiliateCode: string,
    email: string,
    userData?: Partial<AffiliateReferral>
  ): Promise<AffiliateReferral> {
    const affiliate = await this.getAffiliateByCode(affiliateCode);
    if (!affiliate) {
      throw new Error('Invalid affiliate code');
    }

    const referral = await prisma.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        email,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        phone: userData?.phone,
        source: userData?.source || 'DIRECT_LINK',
        ipAddress: userData?.ipAddress,
        userAgent: userData?.userAgent,
        referrerUrl: userData?.referrerUrl,
        landingPage: userData?.landingPage,
        utmSource: userData?.utmSource,
        utmMedium: userData?.utmMedium,
        utmCampaign: userData?.utmCampaign,
        utmTerm: userData?.utmTerm,
        utmContent: userData?.utmContent,
        customData: userData?.customData,
      },
      include: {
        affiliate: {
          include: { user: true },
        },
      },
    });

    // Update affiliate referral count
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        referralCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    });

    await this.logActivity(affiliate.id, ActivityType.REFERRAL, `New referral: ${email}`);

    return referral;
  }

  /**
   * Convert a referral (when they make a purchase/signup)
   */
  async convertReferral(
    referralId: string,
    conversionData: {
      type: string;
      value?: number;
      userId?: string;
    }
  ): Promise<AffiliateCommission> {
    const referral = await prisma.affiliateReferral.findUnique({
      where: { id: referralId },
      include: { affiliate: true },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    // Update referral
    await prisma.affiliateReferral.update({
      where: { id: referralId },
      data: {
        status: 'CONVERTED',
        conversionType: conversionData.type,
        conversionValue: conversionData.value,
        convertedAt: new Date(),
        referredUserId: conversionData.userId,
      },
    });

    // Create commission
    const commissionAmount = this.calculateCommission(
      conversionData.value || 0,
      referral.affiliate.commissionRate
    );

    const commission = await this.createCommission({
      affiliateId: referral.affiliateId,
      referralId: referralId,
      type: CommissionType.REFERRAL,
      amount: commissionAmount,
      rate: referral.affiliate.commissionRate,
      baseAmount: conversionData.value || 0,
      tier: referral.affiliate.tier,
      description: `Referral conversion: ${conversionData.type}`,
    });

    // Update affiliate stats
    await this.updateAffiliateStats(referral.affiliateId);

    return commission;
  }

  // ============================================================================
  // COMMISSION MANAGEMENT
  // ============================================================================

  /**
   * Create a commission
   */
  async createCommission(data: {
    affiliateId: string;
    referralId?: string;
    orderId?: string;
    type: CommissionType;
    amount: number;
    rate: number;
    baseAmount: number;
    tier: AffiliateTier;
    description?: string;
    metadata?: any;
  }): Promise<AffiliateCommission> {
    const commission = await prisma.affiliateCommission.create({
      data: {
        ...data,
        currency: 'USD',
        status: CommissionStatus.PENDING,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: {
        affiliate: { include: { user: true } },
        referral: true,
      },
    });

    // Update affiliate balance
    await prisma.affiliate.update({
      where: { id: data.affiliateId },
      data: {
        totalEarnings: { increment: data.amount },
        availableBalance: { increment: data.amount },
        lastActivityAt: new Date(),
      },
    });

    await this.logActivity(
      data.affiliateId,
      ActivityType.COMMISSION_EARNED,
      `Earned $${data.amount.toFixed(2)} commission`
    );

    return commission;
  }

  /**
   * Approve commission
   */
  async approveCommission(id: string): Promise<AffiliateCommission> {
    return prisma.affiliateCommission.update({
      where: { id },
      data: {
        status: CommissionStatus.APPROVED,
        processedAt: new Date(),
      },
      include: {
        affiliate: { include: { user: true } },
      },
    });
  }

  /**
   * List commissions with filtering
   */
  async listCommissions(
    filter: CommissionFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ commissions: AffiliateCommission[]; total: number; pages: number }> {
    const where: any = {};

    if (filter.status?.length) {
      where.status = { in: filter.status };
    }

    if (filter.type?.length) {
      where.type = { in: filter.type };
    }

    if (filter.affiliateId) {
      where.affiliateId = filter.affiliateId;
    }

    if (filter.dateRange) {
      where.createdAt = {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end,
      };
    }

    if (filter.minAmount !== undefined) {
      where.amount = { gte: filter.minAmount };
    }

    if (filter.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: filter.maxAmount };
    }

    const [commissions, total] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where,
        include: {
          affiliate: { include: { user: true } },
          referral: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateCommission.count({ where }),
    ]);

    return {
      commissions,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // ============================================================================
  // LINK MANAGEMENT
  // ============================================================================

  /**
   * Create affiliate link
   */
  async createLink(affiliateId: string, data: CreateLinkRequest): Promise<AffiliateLink> {
    const shortCode = await this.generateUniqueShortCode();
    const fullUrl = this.buildTrackingUrl(shortCode, data.targetUrl, data.customParams);

    const link = await prisma.affiliateLink.create({
      data: {
        affiliateId,
        name: data.name,
        url: data.targetUrl,
        shortCode,
        fullUrl,
        targetUrl: data.targetUrl,
        type: data.type,
        campaignId: data.campaignId,
        expiresAt: data.expiresAt,
        customParams: data.customParams,
      },
      include: {
        affiliate: { include: { user: true } },
      },
    });

    await this.logActivity(affiliateId, ActivityType.LINK_CREATION, `Created link: ${data.name}`);

    return link;
  }

  /**
   * Track link click
   */
  async trackClick(
    shortCode: string,
    clickData: {
      ipAddress?: string;
      userAgent?: string;
      referer?: string;
      country?: string;
      city?: string;
      device?: string;
      browser?: string;
      os?: string;
    }
  ): Promise<{ link: AffiliateLink; redirectUrl: string }> {
    const link = await prisma.affiliateLink.findUnique({
      where: { shortCode },
      include: { affiliate: true },
    });

    if (!link || !link.isActive) {
      throw new Error('Invalid or inactive link');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new Error('Link has expired');
    }

    // Record click
    await prisma.affiliateLinkClick.create({
      data: {
        linkId: link.id,
        ...clickData,
      },
    });

    // Update link stats
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: {
        clickCount: { increment: 1 },
        lastClickAt: new Date(),
      },
    });

    // Update affiliate activity
    await prisma.affiliate.update({
      where: { id: link.affiliateId },
      data: {
        lastActivityAt: new Date(),
      },
    });

    return {
      link,
      redirectUrl: link.targetUrl,
    };
  }

  // ============================================================================
  // WITHDRAWAL MANAGEMENT
  // ============================================================================

  /**
   * Request withdrawal
   */
  async requestWithdrawal(affiliateId: string, data: WithdrawalRequest): Promise<AffiliateWithdrawal> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    if (affiliate.availableBalance < data.amount) {
      throw new Error('Insufficient balance');
    }

    const settings = await this.getAffiliateSettings();
    if (data.amount < settings.minimumPayout) {
      throw new Error(`Minimum withdrawal amount is ${settings.minimumPayout}`);
    }

    const processingFee = this.calculateWithdrawalFee(data.amount, data.method);
    const netAmount = data.amount - processingFee;

    const withdrawal = await prisma.affiliateWithdrawal.create({
      data: {
        affiliateId,
        amount: data.amount,
        currency: 'USD',
        method: data.method,
        processingFee,
        netAmount,
        bankDetails: data.bankDetails,
        paypalEmail: data.paypalEmail,
        cryptoAddress: data.cryptoAddress,
        description: data.description,
      },
      include: {
        affiliate: { include: { user: true } },
      },
    });

    // Update affiliate balance
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        availableBalance: { decrement: data.amount },
      },
    });

    await this.logActivity(
      affiliateId,
      ActivityType.WITHDRAWAL_REQUEST,
      `Requested withdrawal of $${data.amount.toFixed(2)}`
    );

    return withdrawal;
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(id: string, status: WithdrawalStatus, adminNotes?: string): Promise<AffiliateWithdrawal> {
    const withdrawal = await prisma.affiliateWithdrawal.findUnique({
      where: { id },
      include: { affiliate: true },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    const updateData: any = {
      status,
      adminNotes,
      processedAt: new Date(),
    };

    if (status === WithdrawalStatus.COMPLETED) {
      updateData.completedAt = new Date();
      // Update affiliate total withdrawn
      await prisma.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          totalWithdrawn: { increment: withdrawal.amount },
        },
      });
    } else if (status === WithdrawalStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = adminNotes;
      // Refund to affiliate balance
      await prisma.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          availableBalance: { increment: withdrawal.amount },
        },
      });
    }

    return prisma.affiliateWithdrawal.update({
      where: { id },
      data: updateData,
      include: {
        affiliate: { include: { user: true } },
      },
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique affiliate code
   */
  private async generateUniqueAffiliateCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    do {
      code = this.generateRandomCode(8);
      const existing = await prisma.affiliate.findUnique({
        where: { affiliateCode: code },
      });
      isUnique = !existing;
    } while (!isUnique);

    return code;
  }

  /**
   * Generate unique short code for links
   */
  private async generateUniqueShortCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    do {
      code = this.generateRandomCode(6);
      const existing = await prisma.affiliateLink.findUnique({
        where: { shortCode: code },
      });
      isUnique = !existing;
    } while (!isUnique);

    return code;
  }

  /**
   * Generate random code
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Calculate commission amount
   */
  private calculateCommission(baseAmount: number, rate: number): number {
    return Number((baseAmount * rate).toFixed(2));
  }

  /**
   * Calculate withdrawal fee
   */
  private calculateWithdrawalFee(amount: number, method: string): number {
    const feeRates = {
      BANK_TRANSFER: 0.02, // 2%
      PAYPAL: 0.015, // 1.5%
      CRYPTOCURRENCY: 0.01, // 1%
      CHECK: 5, // $5 flat fee
      WIRE_TRANSFER: 25, // $25 flat fee
    };

    const rate = feeRates[method as keyof typeof feeRates] || 0;
    
    if (method === 'CHECK' || method === 'WIRE_TRANSFER') {
      return rate; // Flat fee
    }
    
    return Number((amount * rate).toFixed(2)); // Percentage fee
  }

  /**
   * Build tracking URL
   */
  private buildTrackingUrl(shortCode: string, targetUrl: string, customParams?: Record<string, string>): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let trackingUrl = `${baseUrl}/aff/${shortCode}`;
    
    if (customParams && Object.keys(customParams).length > 0) {
      const params = new URLSearchParams(customParams);
      trackingUrl += `?${params.toString()}`;
    }
    
    return trackingUrl;
  }

  /**
   * Update affiliate statistics
   */
  private async updateAffiliateStats(affiliateId: string): Promise<void> {
    const [referralCount, totalSales, commissionSum] = await Promise.all([
      prisma.affiliateReferral.count({
        where: { affiliateId, status: 'CONVERTED' },
      }),
      prisma.affiliateReferral.aggregate({
        where: { affiliateId, status: 'CONVERTED' },
        _sum: { conversionValue: true },
      }),
      prisma.affiliateCommission.aggregate({
        where: { affiliateId, status: { in: ['APPROVED', 'PAID'] } },
        _sum: { amount: true },
      }),
    ]);

    const conversionRate = referralCount > 0 
      ? Number(((referralCount / await this.getTotalReferrals(affiliateId)) * 100).toFixed(2))
      : 0;

    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        referralCount,
        totalSales: totalSales._sum.conversionValue || 0,
        totalEarnings: commissionSum._sum.amount || 0,
        conversionRate,
        lastActivityAt: new Date(),
      },
    });
  }

  /**
   * Get total referrals for an affiliate
   */
  private async getTotalReferrals(affiliateId: string): Promise<number> {
    return prisma.affiliateReferral.count({
      where: { affiliateId },
    });
  }

  /**
   * Log affiliate activity
   */
  private async logActivity(
    affiliateId: string,
    type: ActivityType,
    description: string,
    metadata?: any
  ): Promise<void> {
    await prisma.affiliateActivity.create({
      data: {
        affiliateId,
        type,
        description,
        metadata,
      },
    });
  }

  /**
   * Get default commission rate
   */
  private async getDefaultCommissionRate(): Promise<number> {
    const settings = await this.getAffiliateSettings();
    return settings.defaultCommissionRate;
  }

  /**
   * Get affiliate settings
   */
  private async getAffiliateSettings(): Promise<any> {
    let settings = await prisma.affiliateSettings.findFirst();
    
    if (!settings) {
      // Create default settings
      settings = await prisma.affiliateSettings.create({
        data: {
          minimumPayout: 50,
          currency: 'USD',
          payoutSchedule: 'MONTHLY',
          cookieDuration: 30,
          defaultCommissionRate: 0.05,
          autoApproval: false,
          requiresApproval: true,
        },
      });
    }
    
    return settings;
  }
}

export const affiliateService = new AffiliateService();

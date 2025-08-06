/**
 * ============================================================================
 * AFFILIATE SERVICE - SENIOR LEVEL IMPLEMENTATION
 * ============================================================================
 * Comprehensive affiliate management service with advanced features
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { 
  AffiliateTier, 
  AffiliateStatus, 
  CommissionType, 
  CommissionStatus,
  WithdrawalStatus,
  WithdrawalMethod,
  ActivityType,
  ReferralStatus,
  ConversionType,
  LinkType
} from '@/types/affiliate';

export interface AffiliateRegistrationData {
  userId: string;
  businessName?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  taxId?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  marketingExperience?: string;
  expectedTraffic?: string;
  marketingMethods?: string[];
  referralSource?: string;
  agreeToTerms: boolean;
}

export interface CommissionCalculationResult {
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tierBonus?: number;
  performanceBonus?: number;
  totalCommission: number;
  currency: string;
}

export interface AffiliatePerformanceMetrics {
  totalClicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  totalSales: number;
  totalCommissions: number;
  availableBalance: number;
  pendingCommissions: number;
  monthlyStats: {
    month: string;
    clicks: number;
    conversions: number;
    sales: number;
    commissions: number;
  }[];
  topPerformingLinks: Array<{
    linkId: string;
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface WithdrawalRequest {
  affiliateId: string;
  amount: number;
  method: WithdrawalMethod;
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountHolderName: string;
  };
  paypalEmail?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  description?: string;
}

export interface LinkGenerationOptions {
  targetUrl: string;
  name: string;
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  customParams?: Record<string, string>;
  expiresAt?: Date;
}

class AffiliateService {
  // ============================================================================
  // AFFILIATE REGISTRATION & MANAGEMENT
  // ============================================================================

  /**
   * Register new affiliate
   */
  async registerAffiliate(data: AffiliateRegistrationData) {
    try {
      // Validate user exists and isn't already an affiliate
      const user = await prisma.users.findUnique({
        where: { id: data.userId },
        include: { affiliates: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.affiliates) {
        throw new Error('User is already an affiliate');
      }

      // Generate unique affiliate code
      const affiliateCode = await this.generateUniqueAffiliateCode(user.displayName);

      // Get affiliate settings for default values
      const settings = await this.getAffiliateSettings();

      // Create affiliate record
      const affiliate = await prisma.affiliates.create({
        data: {
          userId: data.userId,
          affiliateCode,
          businessName: data.businessName,
          website: data.website,
          socialMedia: data.socialMedia || {},
          taxId: data.taxId,
          status: settings.autoApproval ? AffiliateStatus.ACTIVE : AffiliateStatus.PENDING,
          commissionRate: settings.defaultCommissionRate,
          approvedAt: settings.autoApproval ? new Date() : null,
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              displayName: true,
              phone: true,
            }
          }
        }
      });

      // Log registration activity
      await this.logActivity(affiliate.id, ActivityType.REGISTRATION, 'Affiliate registered');

      // Send welcome email (implement separately)
      await this.sendWelcomeEmail(affiliate);

      return affiliate;
    } catch (error:any) {
      throw new Error(`Failed to register affiliate: ${error.message}`);
    }
  }

  /**
   * Generate unique affiliate code
   */
  private async generateUniqueAffiliateCode(displayName: string): Promise<string> {
    const baseCode = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8)
      .padEnd(4, Math.random().toString(36).substring(2, 6));

    let code = baseCode;
    let counter = 1;

    while (await prisma.affiliate.findUnique({ where: { affiliateCode: code } })) {
      code = `${baseCode}${counter}`;
      counter++;
    }

    return code.toUpperCase();
  }

  /**
   * Approve affiliate application
   */
  async approveAffiliate(affiliateId: string, approvedBy: string, notes?: string) {
    try {
      const affiliate = await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          status: AffiliateStatus.ACTIVE,
          approvedAt: new Date(),
          approvedBy,
          adminNotes: notes,
        },
        include: {
          user: {
            select: {
              email: true,
              displayName: true,
            }
          }
        }
      });

      // Log approval activity
      await this.logActivity(affiliateId, ActivityType.TIER_UPGRADE, 'Affiliate approved');

      // Send approval email
      await this.sendApprovalEmail(affiliate);

      return affiliate;
    } catch (error) {
      throw new Error(`Failed to approve affiliate: ${error.message}`);
    }
  }

  /**
   * Suspend affiliate
   */
  async suspendAffiliate(affiliateId: string, reason: string, suspendedBy: string) {
    try {
      const affiliate = await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          status: AffiliateStatus.SUSPENDED,
          suspendedAt: new Date(),
          adminNotes: reason,
        }
      });

      // Deactivate all affiliate links
      await prisma.affiliateLink.updateMany({
        where: { affiliateId },
        data: { isActive: false }
      });

      // Log suspension activity
      await this.logActivity(affiliateId, ActivityType.SUSPENSION, `Suspended: ${reason}`);

      return affiliate;
    } catch (error) {
      throw new Error(`Failed to suspend affiliate: ${error.message}`);
    }
  }

  // ============================================================================
  // LINK GENERATION & TRACKING
  // ============================================================================

  /**
   * Generate affiliate tracking link
   */
  async generateAffiliateLink(affiliateId: string, options: LinkGenerationOptions) {
    try {
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId }
      });

      if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
        throw new Error('Affiliate not found or not active');
      }

      // Generate unique short code
      const shortCode = await this.generateUniqueShortCode();

      // Build tracking URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}/ref/${shortCode}`;

      // Build target URL with UTM parameters
      const targetUrl = this.buildTrackingUrl(options.targetUrl, {
        utm_source: options.utmSource || 'affiliate',
        utm_medium: options.utmMedium || 'referral',
        utm_campaign: options.utmCampaign || affiliate.affiliateCode,
        utm_term: options.utmTerm,
        utm_content: options.utmContent,
        ...options.customParams,
        ref: affiliate.affiliateCode,
      });

      // Create affiliate link record
      const link = await prisma.affiliateLink.create({
        data: {
          affiliateId,
          name: options.name,
          url: options.targetUrl,
          shortCode,
          fullUrl,
          targetUrl,
          type: this.determineLinkType(options.targetUrl),
          campaignId: options.campaignId,
          utmSource: options.utmSource,
          utmMedium: options.utmMedium,
          utmCampaign: options.utmCampaign,
          utmTerm: options.utmTerm,
          utmContent: options.utmContent,
          customParams: options.customParams || {},
          expiresAt: options.expiresAt,
        }
      });

      // Log link creation activity
      await this.logActivity(affiliateId, ActivityType.LINK_CREATION, `Created link: ${options.name}`);

      return link;
    } catch (error) {
      throw new Error(`Failed to generate affiliate link: ${error.message}`);
    }
  }

  /**
   * Track link click
   */
  async trackLinkClick(shortCode: string, request: Request) {
    try {
      // Find affiliate link
      const link = await prisma.affiliateLink.findUnique({
        where: { shortCode },
        include: { affiliate: true }
      });

      if (!link || !link.isActive) {
        throw new Error('Link not found or inactive');
      }

      // Check if link is expired
      if (link.expiresAt && new Date() > link.expiresAt) {
        throw new Error('Link has expired');
      }

      // Extract tracking data from request
      const trackingData = await this.extractTrackingData(request);

      // Create click record
      const click = await prisma.affiliateLinkClick.create({
        data: {
          linkId: link.id,
          ...trackingData,
          clickedAt: new Date(),
        }
      });

      // Update link click count
      await prisma.affiliateLink.update({
        where: { id: link.id },
        data: {
          clickCount: { increment: 1 },
          lastClickAt: new Date(),
        }
      });

      // Update affiliate last activity
      await prisma.affiliate.update({
        where: { id: link.affiliateId },
        data: { lastActivityAt: new Date() }
      });

      // Set referral cookie
      const cookieValue = this.generateReferralCookie(link.affiliate.affiliateCode, click.id);
      
      return {
        redirectUrl: link.targetUrl,
        cookieValue,
        clickId: click.id,
      };
    } catch (error) {
      throw new Error(`Failed to track link click: ${error.message}`);
    }
  }

  // ============================================================================
  // CONVERSION TRACKING & COMMISSION CALCULATION
  // ============================================================================

  /**
   * Track conversion and calculate commission
   */
  async trackConversion(
    userId: string,
    conversionType: ConversionType,
    conversionValue: number,
    orderId?: string,
    metadata?: any
  ) {
    try {
      // Find user's referral record
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredBy: true, referralCookie: true, referralExpiry: true }
      });

      if (!user?.referredBy || !user.referralCookie) {
        return null; // No referral tracking
      }

      // Check if referral is still valid
      if (user.referralExpiry && new Date() > user.referralExpiry) {
        return null; // Referral expired
      }

      // Find affiliate by code
      const affiliate = await prisma.affiliate.findUnique({
        where: { affiliateCode: user.referredBy },
        include: { user: { select: { id: true, email: true, displayName: true } } }
      });

      if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
        return null; // Affiliate not found or inactive
      }

      // Find the referral record
      let referral = await prisma.affiliateReferral.findFirst({
        where: {
          affiliateId: affiliate.id,
          referredUserId: userId,
          status: { in: [ReferralStatus.PENDING, ReferralStatus.CONFIRMED] }
        }
      });

      // Create referral if it doesn't exist
      if (!referral) {
        referral = await prisma.affiliateReferral.create({
          data: {
            affiliateId: affiliate.id,
            referredUserId: userId,
            email: user.email || '',
            status: ReferralStatus.CONFIRMED,
            source: this.determineReferralSource(user.referralCookie),
          }
        });
      }

      // Calculate commission
      const commissionResult = await this.calculateCommission(
        affiliate,
        conversionType,
        conversionValue
      );

      // Create commission record
      const commission = await prisma.affiliateCommission.create({
        data: {
          affiliateId: affiliate.id,
          referralId: referral.id,
          orderId,
          type: this.mapConversionToCommissionType(conversionType),
          amount: commissionResult.totalCommission,
          rate: commissionResult.commissionRate,
          baseAmount: conversionValue,
          status: CommissionStatus.PENDING,
          tier: affiliate.tier,
          description: `${conversionType} commission`,
          metadata: {
            ...metadata,
            conversionType,
            tierBonus: commissionResult.tierBonus,
            performanceBonus: commissionResult.performanceBonus,
          },
          dueDate: this.calculateCommissionDueDate(),
        }
      });

      // Update referral status and commission amount
      await prisma.affiliateReferral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.CONVERTED,
          conversionType,
          conversionValue,
          commissionAmount: commissionResult.totalCommission,
          convertedAt: new Date(),
        }
      });

      // Update affiliate stats
      await this.updateAffiliateStats(affiliate.id, conversionValue, commissionResult.totalCommission);

      // Log conversion activity
      await this.logActivity(
        affiliate.id, 
        ActivityType.COMMISSION_EARNED, 
        `Earned $${commissionResult.totalCommission.toFixed(2)} from ${conversionType}`
      );

      return {
        commission,
        referral,
        affiliate,
        commissionResult,
      };
    } catch (error) {
      throw new Error(`Failed to track conversion: ${error.message}`);
    }
  }

  /**
   * Calculate commission based on affiliate tier and performance
   */
  private async calculateCommission(
    affiliate: any,
    conversionType: ConversionType,
    conversionValue: number
  ): Promise<CommissionCalculationResult> {
    // Base commission rate
    let commissionRate = affiliate.commissionRate;

    // Tier-based rate adjustments
    const tierMultipliers = {
      [AffiliateTier.BRONZE]: 1.0,
      [AffiliateTier.SILVER]: 1.1,
      [AffiliateTier.GOLD]: 1.25,
      [AffiliateTier.PLATINUM]: 1.4,
      [AffiliateTier.DIAMOND]: 1.6,
    };

    const tierMultiplier = tierMultipliers[affiliate.tier] || 1.0;
    commissionRate *= tierMultiplier;

    // Base commission
    const baseCommission = conversionValue * commissionRate;

    // Tier bonus (additional percentage for higher tiers)
    const tierBonusRates = {
      [AffiliateTier.BRONZE]: 0,
      [AffiliateTier.SILVER]: 0.005,
      [AffiliateTier.GOLD]: 0.01,
      [AffiliateTier.PLATINUM]: 0.02,
      [AffiliateTier.DIAMOND]: 0.03,
    };

    const tierBonus = conversionValue * (tierBonusRates[affiliate.tier] || 0);

    // Performance bonus (based on monthly performance)
    const performanceBonus = await this.calculatePerformanceBonus(affiliate.id, conversionValue);

    const totalCommission = baseCommission + tierBonus + performanceBonus;

    return {
      baseAmount: conversionValue,
      commissionRate,
      commissionAmount: baseCommission,
      tierBonus,
      performanceBonus,
      totalCommission,
      currency: 'USD',
    };
  }

  /**
   * Calculate performance bonus based on monthly targets
   */
  private async calculatePerformanceBonus(affiliateId: string, conversionValue: number): Promise<number> {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Get monthly performance
    const monthlyStats = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId,
        createdAt: { gte: startOfMonth },
        status: { in: [CommissionStatus.PENDING, CommissionStatus.APPROVED, CommissionStatus.PAID] }
      },
      _sum: { baseAmount: true }
    });

    const monthlyRevenue = (monthlyStats._sum.baseAmount || 0) + conversionValue;

    // Performance thresholds and bonuses
    const performanceTiers = [
      { threshold: 10000, bonus: 0.01 },  // 1% bonus for $10k+
      { threshold: 25000, bonus: 0.02 },  // 2% bonus for $25k+
      { threshold: 50000, bonus: 0.03 },  // 3% bonus for $50k+
      { threshold: 100000, bonus: 0.05 }, // 5% bonus for $100k+
    ];

    let bonusRate = 0;
    for (const tier of performanceTiers.reverse()) {
      if (monthlyRevenue >= tier.threshold) {
        bonusRate = tier.bonus;
        break;
      }
    }

    return conversionValue * bonusRate;
  }

  // ============================================================================
  // WITHDRAWAL MANAGEMENT
  // ============================================================================

  /**
   * Request withdrawal
   */
  async requestWithdrawal(data: WithdrawalRequest) {
    try {
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: data.affiliateId }
      });

      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      if (affiliate.status !== AffiliateStatus.ACTIVE) {
        throw new Error('Affiliate account is not active');
      }

      if (data.amount > affiliate.availableBalance) {
        throw new Error('Insufficient balance');
      }

      const settings = await this.getAffiliateSettings();
      if (data.amount < settings.minimumPayout) {
        throw new Error(`Minimum withdrawal amount is $${settings.minimumPayout}`);
      }

      // Calculate fees
      const processingFee = this.calculateWithdrawalFee(data.amount, data.method);
      const netAmount = data.amount - processingFee;

      // Create withdrawal request
      const withdrawal = await prisma.affiliateWithdrawal.create({
        data: {
          affiliateId: data.affiliateId,
          amount: data.amount,
          method: data.method,
          processingFee,
          netAmount,
          bankDetails: data.bankDetails,
          paypalEmail: data.paypalEmail,
          cryptoAddress: data.cryptoAddress,
          cryptoNetwork: data.cryptoNetwork,
          description: data.description,
          status: WithdrawalStatus.PENDING,
        }
      });

      // Update affiliate balance (reserve funds)
      await prisma.affiliate.update({
        where: { id: data.affiliateId },
        data: {
          availableBalance: { decrement: data.amount }
        }
      });

      // Log withdrawal request
      await this.logActivity(
        data.affiliateId,
        ActivityType.WITHDRAWAL_REQUEST,
        `Requested withdrawal of $${data.amount} via ${data.method}`
      );

      return withdrawal;
    } catch (error) {
      throw new Error(`Failed to request withdrawal: ${error.message}`);
    }
  }

  /**
   * Process withdrawal (admin function)
   */
  async processWithdrawal(withdrawalId: string, processedBy: string, adminNotes?: string) {
    try {
      const withdrawal = await prisma.affiliateWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.PROCESSING,
          processedAt: new Date(),
          processedBy,
          adminNotes,
        },
        include: { affiliate: true }
      });

      // Here you would integrate with payment processors
      // For now, we'll mark as completed immediately
      await this.completeWithdrawal(withdrawalId, 'SYSTEM_AUTO');

      return withdrawal;
    } catch (error) {
      throw new Error(`Failed to process withdrawal: ${error.message}`);
    }
  }

  /**
   * Complete withdrawal
   */
  async completeWithdrawal(withdrawalId: string, paymentReference: string) {
    try {
      const withdrawal = await prisma.affiliateWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: { affiliate: true }
      });

      // Update affiliate total withdrawn
      await prisma.affiliate.update({
        where: { id: withdrawal.affiliateId },
        data: {
          totalWithdrawn: { increment: withdrawal.amount }
        }
      });

      // Log completion
      await this.logActivity(
        withdrawal.affiliateId,
        ActivityType.WITHDRAWAL_COMPLETED,
        `Withdrawal completed: $${withdrawal.amount}`
      );

      return withdrawal;
    } catch (error) {
      throw new Error(`Failed to complete withdrawal: ${error.message}`);
    }
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS
  // ============================================================================

  /**
   * Get affiliate performance metrics
   */
  async getAffiliatePerformance(
    affiliateId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<AffiliatePerformanceMetrics> {
    try {
      const dateFilter = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };

      // Get click statistics
      const clickStats = await prisma.affiliateLinkClick.aggregate({
        where: {
          link: { affiliateId },
          clickedAt: dateFilter,
        },
        _count: { id: true },
        _sum: { conversionValue: true },
      });

      // Get unique clicks
      const uniqueClicks = await prisma.affiliateLinkClick.groupBy({
        by: ['ipAddress'],
        where: {
          link: { affiliateId },
          clickedAt: dateFilter,
        },
        _count: { id: true },
      });

      // Get conversion statistics
      const conversionStats = await prisma.affiliateReferral.aggregate({
        where: {
          affiliateId,
          status: ReferralStatus.CONVERTED,
          convertedAt: dateFilter,
        },
        _count: { id: true },
        _sum: { conversionValue: true },
      });

      // Get commission statistics
      const commissionStats = await prisma.affiliateCommission.aggregate({
        where: {
          affiliateId,
          createdAt: dateFilter,
        },
        _sum: { amount: true },
      });

      // Get pending commissions
      const pendingCommissions = await prisma.affiliateCommission.aggregate({
        where: {
          affiliateId,
          status: CommissionStatus.PENDING,
        },
        _sum: { amount: true },
      });

      // Get affiliate current balance
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
        select: { availableBalance: true },
      });

      // Get monthly breakdown
      const monthlyStats = await this.getMonthlyPerformanceBreakdown(affiliateId, startDate, endDate);

      // Get top performing links
      const topLinks = await this.getTopPerformingLinks(affiliateId, 5);

      const totalClicks = clickStats._count.id || 0;
      const totalUniqueClicks = uniqueClicks.length;
      const conversions = conversionStats._count.id || 0;
      const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;

      return {
        totalClicks,
        uniqueClicks: totalUniqueClicks,
        conversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalSales: conversionStats._sum.conversionValue || 0,
        totalCommissions: commissionStats._sum.amount || 0,
        availableBalance: affiliate?.availableBalance || 0,
        pendingCommissions: pendingCommissions._sum.amount || 0,
        monthlyStats,
        topPerformingLinks: topLinks,
      };
    } catch (error) {
      throw new Error(`Failed to get affiliate performance: ${error.message}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique short code for links
   */
  private async generateUniqueShortCode(): Promise<string> {
    let shortCode: string;
    let isUnique = false;

    while (!isUnique) {
      shortCode = crypto.randomBytes(4).toString('hex').toLowerCase();
      const existing = await prisma.affiliateLink.findUnique({
        where: { shortCode }
      });
      isUnique = !existing;
    }

    return shortCode!;
  }

  /**
   * Build tracking URL with parameters
   */
  private buildTrackingUrl(baseUrl: string, params: Record<string, string | undefined>): string {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  /**
   * Extract tracking data from request
   */
  private async extractTrackingData(request: Request) {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || '';

    // Here you could add more sophisticated tracking
    // like device detection, geolocation, etc.

    return {
      ipAddress,
      userAgent,
      referer,
      // Add more tracking data as needed
    };
  }

  /**
   * Generate referral cookie
   */
  private generateReferralCookie(affiliateCode: string, clickId: string): string {
    const data = {
      code: affiliateCode,
      clickId,
      timestamp: Date.now(),
    };
    
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Log affiliate activity
   */
  private async logActivity(affiliateId: string, type: ActivityType, description: string, metadata?: any) {
    try {
      await prisma.affiliateActivity.create({
        data: {
          affiliateId,
          type,
          description,
          metadata,
        }
      });
    } catch (error) {
      console.error('Failed to log affiliate activity:', error);
    }
  }

  /**
   * Get affiliate settings
   */
  private async getAffiliateSettings() {
    let settings = await prisma.affiliateSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.affiliateSettings.create({
        data: {
          minimumPayout: 50,
          currency: 'USD',
          defaultCommissionRate: 0.05,
          autoApproval: false,
          requiresApproval: true,
        }
      });
    }

    return settings;
  }

  /**
   * Calculate withdrawal fee
   */
  private calculateWithdrawalFee(amount: number, method: WithdrawalMethod): number {
    const feeRates = {
      [WithdrawalMethod.BANK_TRANSFER]: 0.02,      // 2%
      [WithdrawalMethod.PAYPAL]: 0.025,            // 2.5%
      [WithdrawalMethod.CRYPTOCURRENCY]: 0.01,     // 1%
      [WithdrawalMethod.CHECK]: 5,                 // $5 flat fee
      [WithdrawalMethod.WIRE_TRANSFER]: 25,        // $25 flat fee
      [WithdrawalMethod.DIGITAL_WALLET]: 0.015,    // 1.5%
    };

    const feeRate = feeRates[method] || 0.02;
    
    // For percentage-based fees
    if (feeRate < 1) {
      return Math.min(amount * feeRate, 100); // Cap at $100
    }
    
    // For flat fees
    return feeRate;
  }

  /**
   * Helper methods for type conversion and mapping
   */
  private determineLinkType(url: string) {
    // Simple link type determination logic
    if (url.includes('/product/')) return 'PRODUCT';
    if (url.includes('/category/')) return 'CATEGORY';
    if (url.includes('/landing/')) return 'LANDING';
    return 'CUSTOM';
  }

  private determineReferralSource(cookie: string) {
    // Analyze cookie to determine source
    return 'DIRECT_LINK'; // Simplified
  }

  private mapConversionToCommissionType(conversionType: ConversionType): CommissionType {
    const mapping = {
      [ConversionType.REGISTRATION]: CommissionType.LEAD,
      [ConversionType.PURCHASE]: CommissionType.SALE,
      [ConversionType.SUBSCRIPTION]: CommissionType.RECURRING,
      [ConversionType.LEAD]: CommissionType.LEAD,
      [ConversionType.DOWNLOAD]: CommissionType.LEAD,
      [ConversionType.SIGNUP]: CommissionType.LEAD,
      [ConversionType.CUSTOM]: CommissionType.REFERRAL,
    };

    return mapping[conversionType] || CommissionType.REFERRAL;
  }

  private calculateCommissionDueDate(): Date {
    // Commissions are due 30 days after creation
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  }

  private async updateAffiliateStats(affiliateId: string, saleAmount: number, commissionAmount: number) {
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        totalSales: { increment: saleAmount },
        totalEarnings: { increment: commissionAmount },
        availableBalance: { increment: commissionAmount },
        referralCount: { increment: 1 },
        lastActivityAt: new Date(),
      }
    });
  }

  /**
   * Get monthly performance breakdown
   */
  private async getMonthlyPerformanceBreakdown(affiliateId: string, startDate?: Date, endDate?: Date) {
    // Implementation for monthly breakdown
    // This would involve complex date grouping and aggregation
    return []; // Simplified for now
  }

  /**
   * Get top performing links
   */
  private async getTopPerformingLinks(affiliateId: string, limit: number) {
    const links = await prisma.affiliateLink.findMany({
      where: { affiliateId },
      orderBy: { conversionCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        clickCount: true,
        conversionCount: true,
        revenue: true,
      }
    });

    return links.map(link => ({
      linkId: link.id,
      name: link.name,
      clicks: link.clickCount,
      conversions: link.conversionCount,
      revenue: link.revenue,
    }));
  }

  /**
   * Send welcome email (placeholder)
   */
  private async sendWelcomeEmail(affiliate: any) {
    // Implement email sending logic
    console.log(`Sending welcome email to ${affiliate.user.email}`);
  }

  /**
   * Send approval email (placeholder)
   */
  private async sendApprovalEmail(affiliate: any) {
    // Implement email sending logic
    console.log(`Sending approval email to ${affiliate.user.email}`);
  }
}

export { AffiliateService };
export const affiliateService = new AffiliateService();
export default affiliateService;

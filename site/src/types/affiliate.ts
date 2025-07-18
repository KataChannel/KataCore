// ============================================================================
// AFFILIATE SYSTEM TYPES
// ============================================================================
// Comprehensive type definitions for the affiliate management system

export interface Affiliate {
  id: string;
  userId: string;
  affiliateCode: string;
  tier: AffiliateTier;
  status: AffiliateStatus;
  commissionRate: number;
  totalEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  referralCount: number;
  totalSales: number;
  conversionRate: number;
  joinedAt: Date;
  lastActivityAt: Date;
  approvedAt?: Date;
  suspendedAt?: Date;
  terminatedAt?: Date;
  notes?: string;
  
  // Relations
  user?: User;
  referrals?: AffiliateReferral[];
  commissions?: AffiliateCommission[];
  withdrawals?: AffiliateWithdrawal[];
  links?: AffiliateLink[];
  campaigns?: AffiliateCampaign[];
  activities?: AffiliateActivity[];
  
  // Analytics
  analytics?: AffiliateAnalytics;
  performance?: AffiliatePerformance;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referredUserId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source: ReferralSource;
  status: ReferralStatus;
  conversionType?: ConversionType;
  conversionValue?: number;
  commissionAmount?: number;
  commissionPaid: boolean;
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  landingPage?: string;
  utm?: UtmParams;
  customData?: Record<string, any>;
  createdAt: Date;
  convertedAt?: Date;
  
  // Relations
  affiliate?: Affiliate;
  referredUser?: User;
  commission?: AffiliateCommission;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId?: string;
  orderId?: string;
  type: CommissionType;
  amount: number;
  rate: number;
  baseAmount: number;
  currency: string;
  status: CommissionStatus;
  tier: AffiliateTier;
  description?: string;
  metadata?: Record<string, any>;
  processedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  dueDate?: Date;
  
  // Relations
  affiliate?: Affiliate;
  referral?: AffiliateReferral;
  withdrawal?: AffiliateWithdrawal;
}

export interface AffiliateWithdrawal {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  processingFee?: number;
  netAmount: number;
  bankDetails?: BankDetails;
  paypalEmail?: string;
  cryptoAddress?: string;
  description?: string;
  adminNotes?: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Relations
  affiliate?: Affiliate;
  commissions?: AffiliateCommission[];
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  name: string;
  url: string;
  shortCode: string;
  fullUrl: string;
  targetUrl: string;
  type: LinkType;
  campaignId?: string;
  isActive: boolean;
  clickCount: number;
  conversionCount: number;
  lastClickAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
  
  // Tracking
  utm?: UtmParams;
  customParams?: Record<string, string>;
  
  // Relations
  affiliate?: Affiliate;
  campaign?: AffiliateCampaign;
  clicks?: AffiliateLinkClick[];
}

export interface AffiliateLinkClick {
  id: string;
  linkId: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  converted: boolean;
  conversionValue?: number;
  clickedAt: Date;
  convertedAt?: Date;
  
  // Relations
  link?: AffiliateLink;
}

export interface AffiliateCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  commissionRate?: number;
  bonusRate?: number;
  targetType: TargetType;
  targetValue?: number;
  budget?: number;
  spent: number;
  startDate: Date;
  endDate?: Date;
  terms?: string;
  materials?: CampaignMaterial[];
  
  // Tracking
  participantCount: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  
  // Relations
  affiliates?: Affiliate[];
  links?: AffiliateLink[];
  banners?: AffiliateBanner[];
}

export interface AffiliateBanner {
  id: string;
  campaignId?: string;
  name: string;
  type: BannerType;
  size: BannerSize;
  imageUrl: string;
  clickUrl: string;
  altText?: string;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  createdAt: Date;
  
  // Relations
  campaign?: AffiliateCampaign;
}

export interface AffiliateActivity {
  id: string;
  affiliateId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  
  // Relations
  affiliate?: Affiliate;
}

export interface AffiliateAnalytics {
  affiliateId: string;
  period: AnalyticsPeriod;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commissions: number;
  avgOrderValue: number;
  topCountries: CountryStats[];
  topSources: SourceStats[];
  deviceBreakdown: DeviceStats;
  timeSeriesData: TimeSeriesData[];
  
  // Relations
  affiliate?: Affiliate;
}

export interface AffiliatePerformance {
  affiliateId: string;
  rank: number;
  percentile: number;
  score: number;
  trends: PerformanceTrends;
  benchmarks: PerformanceBenchmarks;
  recommendations: string[];
  
  // Relations
  affiliate?: Affiliate;
}

export interface AffiliateTierConfig {
  tier: AffiliateTier;
  name: string;
  description: string;
  requirements: TierRequirements;
  benefits: TierBenefits;
  commissionRates: CommissionRates;
  bonuses: TierBonus[];
  color: string;
  icon: string;
}

export interface AffiliateSettings {
  id: string;
  minimumPayout: number;
  currency: string;
  payoutSchedule: PayoutSchedule;
  cookieDuration: number;
  defaultCommissionRate: number;
  tierConfigs: AffiliateTierConfig[];
  withdrawalMethods: WithdrawalMethod[];
  autoApproval: boolean;
  requiresApproval: boolean;
  termsAndConditions: string;
  emailTemplates: EmailTemplate[];
  integrations: IntegrationConfig[];
  trackingConfig: TrackingConfig;
}

// Enums and constants
export enum AffiliateTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

export enum AffiliateStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  REJECTED = 'REJECTED'
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CONVERTED = 'CONVERTED',
  CANCELLED = 'CANCELLED'
}

export enum ReferralSource {
  DIRECT_LINK = 'DIRECT_LINK',
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  BANNER = 'BANNER',
  COUPON = 'COUPON',
  API = 'API',
  OTHER = 'OTHER'
}

export enum ConversionType {
  REGISTRATION = 'REGISTRATION',
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  LEAD = 'LEAD',
  CUSTOM = 'CUSTOM'
}

export enum CommissionType {
  REFERRAL = 'REFERRAL',
  SALE = 'SALE',
  LEAD = 'LEAD',
  RECURRING = 'RECURRING',
  BONUS = 'BONUS',
  OVERRIDE = 'OVERRIDE'
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum WithdrawalMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  CHECK = 'CHECK',
  WIRE_TRANSFER = 'WIRE_TRANSFER'
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum LinkType {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  HOMEPAGE = 'HOMEPAGE',
  LANDING = 'LANDING',
  CUSTOM = 'CUSTOM'
}

export enum CampaignType {
  STANDARD = 'STANDARD',
  SEASONAL = 'SEASONAL',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  LIMITED_TIME = 'LIMITED_TIME',
  TIER_SPECIFIC = 'TIER_SPECIFIC'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED'
}

export enum TargetType {
  SALES = 'SALES',
  LEADS = 'LEADS',
  CLICKS = 'CLICKS',
  REGISTRATIONS = 'REGISTRATIONS'
}

export enum BannerType {
  STATIC = 'STATIC',
  ANIMATED = 'ANIMATED',
  VIDEO = 'VIDEO',
  INTERACTIVE = 'INTERACTIVE'
}

export enum BannerSize {
  LEADERBOARD = '728x90',
  BANNER = '468x60',
  SKYSCRAPER = '160x600',
  RECTANGLE = '300x250',
  SQUARE = '250x250',
  BUTTON = '125x125',
  MOBILE_BANNER = '320x50'
}

export enum ActivityType {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  LINK_CREATION = 'LINK_CREATION',
  REFERRAL = 'REFERRAL',
  COMMISSION_EARNED = 'COMMISSION_EARNED',
  WITHDRAWAL_REQUEST = 'WITHDRAWAL_REQUEST',
  TIER_UPGRADE = 'TIER_UPGRADE',
  CAMPAIGN_JOIN = 'CAMPAIGN_JOIN',
  PROFILE_UPDATE = 'PROFILE_UPDATE'
}

export enum AnalyticsPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM'
}

export enum PayoutSchedule {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ON_DEMAND = 'ON_DEMAND'
}

// Helper interfaces
export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  country: string;
}

export interface CampaignMaterial {
  type: 'banner' | 'email' | 'social' | 'text';
  title: string;
  description?: string;
  url: string;
  size?: string;
}

export interface CountryStats {
  country: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface SourceStats {
  source: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface TimeSeriesData {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commissions: number;
}

export interface PerformanceTrends {
  clickTrend: number; // percentage change
  conversionTrend: number;
  revenueTrend: number;
  commissionTrend: number;
}

export interface PerformanceBenchmarks {
  avgConversionRate: number;
  avgCommissionRate: number;
  avgOrderValue: number;
  topPerformerRate: number;
}

export interface TierRequirements {
  minimumSales?: number;
  minimumReferrals?: number;
  minimumRevenue?: number;
  timeFrame?: number; // days
}

export interface TierBenefits {
  commissionBonus: number; // percentage
  prioritySupport: boolean;
  customLinks: number;
  analyticsAccess: boolean;
  campaignAccess: boolean[];
}

export interface CommissionRates {
  base: number;
  recurring?: number;
  bonus?: number;
  override?: number;
}

export interface TierBonus {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  conditions?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface IntegrationConfig {
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface TrackingConfig {
  trackClicks: boolean;
  trackConversions: boolean;
  trackRevenue: boolean;
  cookieDuration: number;
  fingerprintTracking: boolean;
  crossDeviceTracking: boolean;
}

// API Request/Response types
export interface CreateAffiliateRequest {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  website?: string;
  promotionMethods?: string[];
  expectedTraffic?: number;
  referralSource?: string;
  notes?: string;
}

export interface UpdateAffiliateRequest {
  tier?: AffiliateTier;
  status?: AffiliateStatus;
  commissionRate?: number;
  notes?: string;
}

export interface CreateLinkRequest {
  name: string;
  targetUrl: string;
  type: LinkType;
  campaignId?: string;
  customParams?: Record<string, string>;
  expiresAt?: Date;
}

export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  bankDetails?: BankDetails;
  paypalEmail?: string;
  cryptoAddress?: string;
  description?: string;
}

export interface AffiliateStatsResponse {
  totalEarnings: number;
  availableBalance: number;
  pendingCommissions: number;
  totalReferrals: number;
  conversionRate: number;
  clickCount: number;
  recentActivity: AffiliateActivity[];
  performanceData: AffiliateAnalytics;
}

// Dashboard and UI types
export interface AffiliateDashboardData {
  affiliate: Affiliate;
  stats: AffiliateStatsResponse;
  recentCommissions: AffiliateCommission[];
  topLinks: AffiliateLink[];
  activeCampaigns: AffiliateCampaign[];
  notifications: AffiliateNotification[];
}

export interface AffiliateNotification {
  id: string;
  type: 'commission' | 'withdrawal' | 'tier' | 'campaign' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Filter and search types
export interface AffiliateFilter {
  status?: AffiliateStatus[];
  tier?: AffiliateTier[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minEarnings?: number;
  maxEarnings?: number;
  search?: string;
}

export interface CommissionFilter {
  status?: CommissionStatus[];
  type?: CommissionType[];
  affiliateId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minAmount?: number;
  maxAmount?: number;
}

// Import base types if available
interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  // Add other user properties as needed
}

/**
 * ============================================================================
 * AFFILIATE DASHBOARD - MAIN COMPONENT
 * ============================================================================
 * Comprehensive affiliate dashboard with performance metrics and management
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  LinkIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  PlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  AffiliateTier,
  AffiliateStatus,
  AffiliatePerformanceMetrics 
} from '@/types/affiliate';

// Import tab components
import { OverviewTab } from './tabs/OverviewTab';
import { LinksTab } from './tabs/LinksTab';
import { CommissionsTab } from './tabs/CommissionsTab';
import { WithdrawalsTab } from './tabs/WithdrawalsTab';
import { ReportsTab } from './tabs/ReportsTab';

interface AffiliateData {
  id: string;
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
  joinedAt: string;
  lastActivityAt: string;
  user: {
    displayName: string;
    email: string;
    avatar?: string;
  };
}

export function AffiliateDashboard() {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<AffiliatePerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAffiliateData: AffiliateData = {
      id: 'aff_123',
      affiliateCode: 'JOHN2024',
      tier: AffiliateTier.GOLD,
      status: AffiliateStatus.ACTIVE,
      commissionRate: 0.08,
      totalEarnings: 15420.50,
      totalWithdrawn: 12000.00,
      availableBalance: 3420.50,
      referralCount: 127,
      totalSales: 192756.25,
      conversionRate: 3.2,
      joinedAt: '2024-01-15T08:00:00Z',
      lastActivityAt: '2024-07-19T14:30:00Z',
      user: {
        displayName: 'John Affiliate',
        email: 'john@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Affiliate&background=3b82f6&color=fff'
      }
    };

    const mockPerformanceMetrics: AffiliatePerformanceMetrics = {
      totalClicks: 4850,
      uniqueClicks: 3920,
      conversions: 127,
      conversionRate: 3.2,
      totalSales: 192756.25,
      totalCommissions: 15420.50,
      availableBalance: 3420.50,
      pendingCommissions: 890.25,
      monthlyStats: [
        { month: '2024-01', clicks: 320, conversions: 8, sales: 12450, commissions: 996 },
        { month: '2024-02', clicks: 410, conversions: 12, sales: 18320, commissions: 1466 },
        { month: '2024-03', clicks: 520, conversions: 15, sales: 22890, commissions: 1831 },
        { month: '2024-04', clicks: 680, conversions: 18, sales: 28500, commissions: 2280 },
        { month: '2024-05', clicks: 750, conversions: 22, sales: 34200, commissions: 2736 },
        { month: '2024-06', clicks: 890, conversions: 28, sales: 42150, commissions: 3372 },
        { month: '2024-07', clicks: 1280, conversions: 24, sales: 34246, commissions: 2740 }
      ],
      topPerformingLinks: [
        { linkId: '1', name: 'Homepage Banner', clicks: 1250, conversions: 32, revenue: 48000 },
        { linkId: '2', name: 'Product Category', clicks: 890, conversions: 28, revenue: 36800 },
        { linkId: '3', name: 'Social Media Post', clicks: 750, conversions: 19, revenue: 28500 },
        { linkId: '4', name: 'Email Campaign', clicks: 650, conversions: 15, revenue: 22100 },
        { linkId: '5', name: 'Blog Review', clicks: 480, conversions: 12, revenue: 18200 }
      ]
    };

    setTimeout(() => {
      setAffiliateData(mockAffiliateData);
      setPerformanceMetrics(mockPerformanceMetrics);
      setIsLoading(false);
    }, 1000);
  }, [selectedTimeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTierColor = (tier: AffiliateTier) => {
    const colors = {
      [AffiliateTier.BRONZE]: 'text-amber-600 bg-amber-50',
      [AffiliateTier.SILVER]: 'text-gray-600 bg-gray-50',
      [AffiliateTier.GOLD]: 'text-yellow-600 bg-yellow-50',
      [AffiliateTier.PLATINUM]: 'text-purple-600 bg-purple-50',
      [AffiliateTier.DIAMOND]: 'text-blue-600 bg-blue-50'
    };
    return colors[tier] || colors[AffiliateTier.BRONZE];
  };

  const getStatusColor = (status: AffiliateStatus) => {
    const colors = {
      [AffiliateStatus.ACTIVE]: 'text-green-600 bg-green-50',
      [AffiliateStatus.PENDING]: 'text-yellow-600 bg-yellow-50',
      [AffiliateStatus.SUSPENDED]: 'text-red-600 bg-red-50',
      [AffiliateStatus.TERMINATED]: 'text-gray-600 bg-gray-50',
      [AffiliateStatus.REJECTED]: 'text-red-600 bg-red-50'
    };
    return colors[status] || colors[AffiliateStatus.PENDING];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!affiliateData || !performanceMetrics) {
    return (
      <div className="text-center py-12">
        <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy dữ liệu</h3>
        <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              className="h-16 w-16 rounded-full"
              src={affiliateData.user.avatar}
              alt={affiliateData.user.displayName}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chào mừng, {affiliateData.user.displayName}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  Mã affiliate: <span className="font-mono font-medium">{affiliateData.affiliateCode}</span>
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTierColor(affiliateData.tier)}`}>
                  {affiliateData.tier}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(affiliateData.status)}`}>
                  {affiliateData.status === AffiliateStatus.ACTIVE ? 'Hoạt động' : affiliateData.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Tạo link mới
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
              <ShareIcon className="h-4 w-4 mr-2 inline" />
              Chia sẻ
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Số dư khả dụng"
          value={formatCurrency(affiliateData.availableBalance)}
          icon={BanknotesIcon}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          trend="+12.5%"
          trendUp={true}
        />
        
        <MetricCard
          title="Tổng thu nhập"
          value={formatCurrency(affiliateData.totalEarnings)}
          icon={CurrencyDollarIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          trend="+8.2%"
          trendUp={true}
        />
        
        <MetricCard
          title="Tổng giới thiệu"
          value={formatNumber(affiliateData.referralCount)}
          icon={UserGroupIcon}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
          trend="+15.3%"
          trendUp={true}
        />
        
        <MetricCard
          title="Tỷ lệ chuyển đổi"
          value={formatPercentage(affiliateData.conversionRate)}
          icon={ArrowTrendingUpIcon}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          trend="+2.1%"
          trendUp={true}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Tổng quan', icon: ChartBarIcon },
              { id: 'links', name: 'Liên kết', icon: LinkIcon },
              { id: 'commissions', name: 'Hoa hồng', icon: CurrencyDollarIcon },
              { id: 'withdrawals', name: 'Rút tiền', icon: BanknotesIcon },
              { id: 'reports', name: 'Báo cáo', icon: ClipboardDocumentListIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              performanceMetrics={performanceMetrics}
              selectedTimeRange={selectedTimeRange}
              onTimeRangeChange={setSelectedTimeRange}
            />
          )}
          
          {activeTab === 'links' && (
            <LinksTab affiliateId={affiliateData.id} />
          )}
          
          {activeTab === 'commissions' && (
            <CommissionsTab affiliateId={affiliateData.id} />
          )}
          
          {activeTab === 'withdrawals' && (
            <WithdrawalsTab 
              affiliateId={affiliateData.id}
              availableBalance={affiliateData.availableBalance}
            />
          )}
          
          {activeTab === 'reports' && (
            <ReportsTab 
              affiliateId={affiliateData.id}
              performanceMetrics={performanceMetrics}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({ title, value, icon: Icon, iconColor, bgColor, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`${bgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

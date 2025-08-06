/**
 * ============================================================================
 * OVERVIEW TAB - AFFILIATE DASHBOARD
 * ============================================================================
 * Performance overview and analytics for affiliate dashboard
 */

'use client';

import React from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  totalClicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  totalSales: number;
  totalCommissions: number;
  availableBalance: number;
  pendingCommissions: number;
  monthlyStats: Array<{
    month: string;
    clicks: number;
    conversions: number;
    sales: number;
    commissions: number;
  }>;
  topPerformingLinks: Array<{
    linkId: string;
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

interface OverviewTabProps {
  performanceMetrics: PerformanceMetrics;
  selectedTimeRange: string;
  onTimeRangeChange: (timeRange: string) => void;
}

export function OverviewTab({ performanceMetrics, selectedTimeRange, onTimeRangeChange }: OverviewTabProps) {
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

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Tổng quan hiệu suất</h3>
        <select
          value={selectedTimeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">7 ngày qua</option>
          <option value="30d">30 ngày qua</option>
          <option value="90d">3 tháng qua</option>
          <option value="1y">1 năm qua</option>
        </select>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CursorArrowRaysIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Tổng lượt click</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(performanceMetrics.totalClicks)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Chuyển đổi</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(performanceMetrics.conversions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-bold text-purple-900">{performanceMetrics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Doanh thu</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(performanceMetrics.totalSales)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất theo tháng</h4>
        <div className="grid grid-cols-7 gap-4">
          {performanceMetrics.monthlyStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {(() => {
                  const parts = stat.month.split('-');
                  return parts.length >= 2 && parts[1] && parts[0]
                    ? `${parts[1]}/${parts[0].slice(2)}`
                    : stat.month;
                })()}
              </div>
              <div className="bg-blue-100 rounded-lg p-3 space-y-1">
                <div className="text-xs text-gray-600">Click: {formatNumber(stat.clicks)}</div>
                <div className="text-xs text-gray-600">CV: {stat.conversions}</div>
                <div className="text-xs font-medium text-blue-600">{formatCurrency(stat.commissions)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Liên kết hiệu suất cao</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên liên kết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt click
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyển đổi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ CV
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceMetrics.topPerformingLinks.map((link) => {
                const conversionRate = link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0;
                return (
                  <tr key={link.linkId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{link.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(link.clicks)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.conversions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(link.revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${conversionRate >= 3 ? 'text-green-600' : conversionRate >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {conversionRate.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-3">💡 Gợi ý tối ưu hiệu suất</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Tập trung vào các liên kết có tỷ lệ chuyển đổi cao nhất</p>
          <p>• Chia sẻ nội dung vào thời điểm có lượng truy cập cao</p>
          <p>• Sử dụng các banner và tài liệu marketing được cung cấp</p>
          <p>• Theo dõi xu hướng theo mùa để tối ưu chiến lược</p>
        </div>
      </div>
    </div>
  );
}

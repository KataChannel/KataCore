/**
 * ============================================================================
 * REPORTS TAB - AFFILIATE DASHBOARD
 * ============================================================================
 * Analytics and reporting interface for affiliate performance
 */

'use client';

import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  period: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commissions: number;
  epc: number; // Earnings per click
  ctr: number; // Click-through rate
}

interface TopPerformer {
  type: 'link' | 'product' | 'country' | 'referrer';
  name: string;
  value: number;
  metric: string;
  change: number;
}

interface ReportsTabProps {
  reportData: ReportData[];
  topPerformers: TopPerformer[];
  onExportReport: (filters: any) => void;
  onGenerateAdvancedReport: (config: any) => void;
}

export function ReportsTab({ reportData, topPerformers, onExportReport, onGenerateAdvancedReport }: ReportsTabProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const timeframeOptions = [
    { value: '7d', label: '7 ngày qua' },
    { value: '30d', label: '30 ngày qua' },
    { value: '90d', label: '3 tháng qua' },
    { value: '1y', label: '1 năm qua' },
    { value: 'custom', label: 'Tùy chọn' }
  ];

  const metricOptions = [
    { value: 'revenue', label: 'Doanh thu', icon: CurrencyDollarIcon },
    { value: 'clicks', label: 'Lượt click', icon: EyeIcon },
    { value: 'conversions', label: 'Chuyển đổi', icon: UserGroupIcon },
    { value: 'commissions', label: 'Hoa hồng', icon: CurrencyDollarIcon }
  ];

  const getCurrentPeriodData = () => {
    return reportData[reportData.length - 1] || {
      period: '',
      clicks: 0,
      uniqueClicks: 0,
      conversions: 0,
      conversionRate: 0,
      revenue: 0,
      commissions: 0,
      epc: 0,
      ctr: 0
    };
  };

  const getPreviousPeriodData = () => {
    return reportData[reportData.length - 2] || getCurrentPeriodData();
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

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

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const currentData = getCurrentPeriodData();
  const previousData = getPreviousPeriodData();

  const performanceMetrics = [
    {
      label: 'Tổng doanh thu',
      current: currentData.revenue,
      previous: previousData.revenue,
      format: formatCurrency,
      icon: CurrencyDollarIcon
    },
    {
      label: 'Lượt click',
      current: currentData.clicks,
      previous: previousData.clicks,
      format: formatNumber,
      icon: EyeIcon
    },
    {
      label: 'Chuyển đổi',
      current: currentData.conversions,
      previous: previousData.conversions,
      format: formatNumber,
      icon: UserGroupIcon
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      current: currentData.conversionRate,
      previous: previousData.conversionRate,
      format: formatPercentage,
      icon: ChartBarIcon
    }
  ];

  const handleExportReport = () => {
    const filters = {
      timeframe: selectedTimeframe,
      metric: selectedMetric,
      comparison: comparisonPeriod
    };
    onExportReport(filters);
  };

  const getTopPerformerIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'product':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'country':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'referrer':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <ChartBarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Khung thời gian</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chỉ số chính</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">So sánh với</label>
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="previous">Kỳ trước</option>
                <option value="last_year">Cùng kỳ năm trước</option>
                <option value="none">Không so sánh</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Bộ lọc nâng cao
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nguồn traffic</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">Tất cả nguồn</option>
                  <option value="direct">Trực tiếp</option>
                  <option value="social">Mạng xã hội</option>
                  <option value="email">Email</option>
                  <option value="search">Tìm kiếm</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục sản phẩm</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">Tất cả danh mục</option>
                  <option value="electronics">Điện tử</option>
                  <option value="fashion">Thời trang</option>
                  <option value="home">Nhà cửa</option>
                  <option value="health">Sức khỏe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quốc gia</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">Tất cả quốc gia</option>
                  <option value="VN">Việt Nam</option>
                  <option value="US">Hoa Kỳ</option>
                  <option value="SG">Singapore</option>
                  <option value="TH">Thái Lan</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const IconComponent = metric.icon;
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.format(metric.current)}</p>
                  </div>
                </div>
              </div>
              {comparisonPeriod !== 'none' && (
                <div className="mt-4 flex items-center">
                  {getChangeIcon(change)}
                  <span className={`ml-1 text-sm font-medium ${getChangeColor(change)}`}>
                    {formatPercentage(Math.abs(change))} {change >= 0 ? 'tăng' : 'giảm'}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">so với kỳ trước</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-medium text-gray-900">Biểu đồ hiệu suất</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Simple chart representation */}
        <div className="space-y-4">
          {reportData.slice(-7).map((data, index) => {
            const maxValue = Math.max(...reportData.map(d => d[selectedMetric as keyof ReportData] as number));
            const percentage = maxValue > 0 ? ((data[selectedMetric as keyof ReportData] as number) / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-xs text-gray-500 text-right">
                  {data.period}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {selectedMetric === 'revenue' || selectedMetric === 'commissions'
                      ? formatCurrency(data[selectedMetric as keyof ReportData] as number)
                      : formatNumber(data[selectedMetric as keyof ReportData] as number)
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top liên kết hiệu suất cao</h4>
          <div className="space-y-3">
            {topPerformers.filter(p => p.type === 'link').slice(0, 5).map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getTopPerformerIcon(performer.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500">{performer.metric}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {performer.metric.includes('$') ? formatCurrency(performer.value) : formatNumber(performer.value)}
                  </p>
                  <div className="flex items-center">
                    {getChangeIcon(performer.change)}
                    <span className={`text-xs ${getChangeColor(performer.change)}`}>
                      {formatPercentage(Math.abs(performer.change))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Phân tích khác</h4>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Insights quan trọng</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tỷ lệ chuyển đổi cao nhất vào cuối tuần</li>
                <li>• Sản phẩm điện tử có EPC cao nhất</li>
                <li>• Traffic từ social media tăng 15%</li>
                <li>• Mobile chiếm 68% tổng lượt click</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Cần chú ý</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Một số liên kết có tỷ lệ chuyển đổi thấp</li>
                <li>• Cần tối ưu nội dung cho mobile</li>
                <li>• Theo dõi xu hướng mua sắm mùa lễ</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="text-sm font-medium text-green-900 mb-2">🎯 Gợi ý tối ưu</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Tập trung vào các sản phẩm trending</li>
                <li>• Tăng cường marketing vào giờ vàng</li>
                <li>• Sử dụng content video để tăng engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Bảng phân tích chi tiết</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CR %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPC
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.slice(-10).map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(data.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(data.uniqueClicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(data.conversions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(data.conversionRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.epc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

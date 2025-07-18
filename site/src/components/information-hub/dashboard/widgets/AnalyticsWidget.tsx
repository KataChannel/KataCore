'use client';

import React from 'react';
import { ChartBarIcon, TrendingUpIcon } from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';

interface AnalyticsWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function AnalyticsWidget({ widget, isEditMode }: AnalyticsWidgetProps) {
  // Mock data - in real app, this would come from API
  const analytics = {
    totalViews: 1247,
    viewsGrowth: 12.5,
    totalTickets: 23,
    ticketsGrowth: -5.2,
    activeUsers: 89,
    usersGrowth: 8.1,
    completionRate: 87.3,
    completionGrowth: 3.2,
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center text-xs ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <TrendingUpIcon className={`h-3 w-3 mr-1 ${
          isPositive ? '' : 'transform rotate-180'
        }`} />
        {Math.abs(growth)}%
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Thống kê</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Lượt xem</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalViews.toLocaleString()}</p>
            </div>
            {formatGrowth(analytics.viewsGrowth)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Tickets</p>
              <p className="text-2xl font-bold text-green-900">{analytics.totalTickets}</p>
            </div>
            {formatGrowth(analytics.ticketsGrowth)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Người dùng</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.activeUsers}</p>
            </div>
            {formatGrowth(analytics.usersGrowth)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Hoàn thành</p>
              <p className="text-2xl font-bold text-orange-900">{analytics.completionRate}%</p>
            </div>
            {formatGrowth(analytics.completionGrowth)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Xem báo cáo chi tiết →
        </button>
      </div>
    </div>
  );
}

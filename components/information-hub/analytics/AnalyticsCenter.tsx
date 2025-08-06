'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnalyticsCenterProps {
  className?: string;
}

export function AnalyticsCenter({ className }: AnalyticsCenterProps) {
  const [timeRange, setTimeRange] = useState('7d');

  const reports = [
    {
      id: '1',
      name: 'Báo cáo hoạt động Information Hub',
      description: 'Thống kê số lượng thông báo, ticket, lượt xem hướng dẫn',
      type: 'hub-activity',
      lastGenerated: new Date('2024-12-19T08:00:00'),
      format: 'pdf'
    },
    {
      id: '2',
      name: 'Phân tích sử dụng Training',
      description: 'Báo cáo về khóa học phổ biến và tiến độ học tập',
      type: 'training-analytics',
      lastGenerated: new Date('2024-12-18T14:30:00'),
      format: 'excel'
    }
  ];

  const stats = [
    { label: 'Thông báo đã gửi', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Ticket đã giải quyết', value: '89', change: '+5%', trend: 'up' },
    { label: 'Lượt xem hướng dẫn', value: '2,567', change: '-3%', trend: 'down' },
    { label: 'Học viên hoàn thành khóa học', value: '156', change: '+25%', trend: 'up' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
          <p className="text-gray-600 mt-1">
            Phân tích hoạt động và xuất báo cáo chi tiết
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentArrowDownIcon className="h-5 w-5" />
            Báo cáo có sẵn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Tạo lần cuối: {report.lastGenerated.toLocaleDateString('vi-VN')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {report.format.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Xuất báo cáo
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Biểu đồ hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Biểu đồ phân tích sẽ được hiển thị tại đây</p>
            <p className="text-sm text-gray-500 mt-2">
              Tích hợp với Chart.js hoặc D3.js để hiển thị dữ liệu trực quan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

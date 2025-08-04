'use client';

import React from 'react';
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// Dashboard Stats Component
const DashboardStats = () => {
  const stats = [
    {
      name: 'Tổng nhân viên',
      value: '124',
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
    },
    {
      name: 'Phòng ban',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Dự án đang chạy',
      value: '16',
      change: '+4',
      changeType: 'increase',
      icon: BriefcaseIcon,
    },
    {
      name: 'Hiệu suất TB',
      value: '94.5%',
      change: '+2.1%',
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <stat.icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 ml-2">từ tháng trước</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      name: 'Thêm nhân viên',
      description: 'Tạo hồ sơ nhân viên mới',
      icon: PlusIcon,
      href: '/admin/hr/employees/new',
      color: 'bg-blue-500',
    },
    {
      name: 'Xem báo cáo',
      description: 'Kiểm tra báo cáo hiệu suất',
      icon: EyeIcon,
      href: '/admin/hr/reports',
      color: 'bg-green-500',
    },
    {
      name: 'Quản lý phân quyền',
      description: 'Cài đặt quyền truy cập',
      icon: CogIcon,
      href: '/admin/permissions',
      color: 'bg-purple-500',
    },
    {
      name: 'Phân tích dữ liệu',
      description: 'Xem thống kê chi tiết',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  {action.name}
                </p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      action: 'đã tạo hồ sơ nhân viên mới',
      target: 'Trần Thị B',
      time: '2 giờ trước',
      avatar: 'A',
    },
    {
      id: 2,
      user: 'Lê Văn C',
      action: 'đã cập nhật thông tin phòng ban',
      target: 'IT Department',
      time: '4 giờ trước',
      avatar: 'C',
    },
    {
      id: 3,
      user: 'Phạm Thị D',
      action: 'đã phê duyệt yêu cầu nghỉ phép',
      target: 'Hoàng Văn E',
      time: '6 giờ trước',
      avatar: 'D',
    },
    {
      id: 4,
      user: 'Trần Văn F',
      action: 'đã tạo báo cáo hiệu suất',
      target: 'Q4 2024',
      time: '1 ngày trước',
      avatar: 'F',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{activity.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href="/admin/activity"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Xem tất cả hoạt động →
        </a>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
  const { user, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.displayName || user?.firstName || 'Admin'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Đây là tổng quan về hệ thống quản lý của bạn
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity />
          
          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Hoạt động
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Server</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Hoạt động
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Cảnh báo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

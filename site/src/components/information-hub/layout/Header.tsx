'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useInformationHub } from '@/providers/InformationHubProvider';

export function InformationHubHeader() {
  const pathname = usePathname();
  const { unreadCount } = useInformationHub();

  // Get page title based on pathname
  const getPageTitle = () => {
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1] || 'information-hub';
    
    const titles: Record<string, string> = {
      'information-hub': 'Dashboard cá nhân hóa',
      'notifications': 'Thông báo',
      'changelog': 'Nhật ký thay đổi',
      'support': 'Hỗ trợ nội bộ',
      'guides': 'Hướng dẫn sử dụng',
      'training': 'Đào tạo',
      'analytics': 'Báo cáo & Phân tích',
      'tasks': 'Quản lý Tác vụ',
      'community': 'Cộng đồng nội bộ',
    };

    return titles[lastSegment] || 'Information Hub';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Trung tâm thông tin và hỗ trợ tổ chức
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
            <Cog6ToothIcon className="h-6 w-6" />
          </button>

          {/* User Profile */}
          <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
            <UserCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

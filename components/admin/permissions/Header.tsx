'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useResponsive } from '@/hooks';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, subtitle }) => {
  const pathname = usePathname();
  const { isMobile } = useResponsive();

  // Get page title based on current route
  const getPageInfo = () => {
    if (title && subtitle) {
      return { title, subtitle };
    }

    const routes: Record<string, { title: string; subtitle: string }> = {
      '/admin/permissions': {
        title: 'Dashboard',
        subtitle: 'Tổng quan hệ thống phân quyền'
      },
      '/admin/permissions/menus': {
        title: 'Quản lý Menu',
        subtitle: 'Cấu trúc menu và phân quyền truy cập'
      },
      '/admin/permissions/users': {
        title: 'Quản lý Users',
        subtitle: 'Tạo, chỉnh sửa và quản lý người dùng'
      },
      '/admin/permissions/roles': {
        title: 'Quản lý Roles',
        subtitle: 'Phân quyền và vai trò hệ thống'
      },
      '/admin/permissions/user-roles': {
        title: 'Phân quyền User-Role',
        subtitle: 'Gán vai trò cho người dùng'
      },
      '/admin/permissions/graphql': {
        title: 'GraphQL API',
        subtitle: 'Quản lý GraphQL API và monitoring'
      },
      '/admin/permissions/graphql-demo': {
        title: 'GraphQL Demo',
        subtitle: 'Interactive GraphQL Demo và testing'
      },
    };

    return routes[pathname] || {
      title: 'Admin Panel',
      subtitle: 'Quản lý hệ thống'
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Page Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                {pageInfo.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <SunIcon className="h-5 w-5 dark:hidden" />
              <MoonIcon className="h-5 w-5 hidden dark:block" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden sm:block text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UsersIcon, 
  ShieldCheckIcon,
  KeyIcon,
  HomeIcon,
  Bars3Icon,
  BoltIcon,
  BeakerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PermissionsLayoutProps {
  children: React.ReactNode;
}

const PermissionsLayout: React.FC<PermissionsLayoutProps> = ({ children }) => {
  const pathname = usePathname();

    const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/permissions',
      icon: HomeIcon,
      description: 'Tổng quan hệ thống'
    },
    {
      name: 'GraphQL API',
      href: '/admin/permissions/graphql',
      icon: BoltIcon,
      description: 'GraphQL API Dashboard'
    },
    {
      name: 'GraphQL Demo',
      href: '/admin/permissions/graphql-demo',
      icon: BeakerIcon,
      description: 'Interactive GraphQL Demo'
    },
    {
      name: 'Quản lý Users',
      href: '/admin/permissions/users',
      icon: UsersIcon,
      description: 'Tạo, sửa, xóa users'
    },
    {
      name: 'Quản lý Roles',
      href: '/admin/permissions/roles',
      icon: ShieldCheckIcon,
      description: 'Phân quyền vai trò'
    },
    {
      name: 'Quản lý Menu',
      href: '/admin/permissions/menus',
      icon: Bars3Icon,
      description: 'Cấu trúc menu hệ thống'
    },
    {
      name: 'Phân quyền User-Role',
      href: '/admin/permissions/user-roles',
      icon: KeyIcon,
      description: 'Gán role cho users'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quản lý Phân quyền
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Quản lý người dùng, vai trò và quyền truy cập hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-start px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-l-lg`}
                  >
                    <Icon className="mr-4 h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-150`}
                  >
                    <Icon className="mr-2 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsLayout;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UsersIcon, 
  CogIcon,
  ShieldCheckIcon,
  KeyIcon 
} from '@heroicons/react/24/outline';

interface PermissionsLayoutProps {
  children: React.ReactNode;
}

const PermissionsLayout: React.FC<PermissionsLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Vai trò',
      href: '/admin/permissions/roles',
      icon: UsersIcon,
      current: pathname === '/admin/permissions/roles',
    },
    {
      name: 'Quyền Menu',
      href: '/admin/permissions/menus',
      icon: CogIcon,
      current: pathname === '/admin/permissions/menus',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quản lý Phân quyền
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-blue-100 dark:bg-blue-900 border-r-4 border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium transition-colors duration-150`}
                  >
                    <Icon
                      className={`${
                        item.current
                          ? 'text-blue-500 dark:text-blue-300'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PermissionsLayout;

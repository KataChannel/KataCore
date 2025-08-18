'use client';

import React, { useState } from 'react';
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
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useResponsive } from '@/hooks';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/permissions',
    icon: HomeIcon,
    description: 'Tổng quan hệ thống',
  },
  {
    name: 'Quản lý Menu',
    href: '/admin/permissions/menus',
    icon: Bars3Icon,
    description: 'Cấu trúc menu & phân quyền',
    badge: 'New',
  },
  {
    name: 'Quản lý Users',
    href: '/admin/permissions/users',
    icon: UsersIcon,
    description: 'Tạo, sửa, xóa users',
  },
  {
    name: 'Quản lý Roles',
    href: '/admin/permissions/roles',
    icon: ShieldCheckIcon,
    description: 'Phân quyền vai trò',
  },
  {
    name: 'Phân quyền User-Role',
    href: '/admin/permissions/user-roles',
    icon: KeyIcon,
    description: 'Gán role cho users',
  },
  {
    name: 'GraphQL API',
    href: '/admin/permissions/graphql',
    icon: BoltIcon,
    description: 'GraphQL API Dashboard',
  },
  {
    name: 'GraphQL Demo',
    href: '/admin/permissions/graphql-demo',
    icon: BeakerIcon,
    description: 'Interactive GraphQL Demo',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { isMobile } = useResponsive();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-30 
          ${isMobile 
            ? `transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-80`
            : `${isCollapsed ? 'w-16' : 'w-80'} transition-all duration-300`
          }
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Phân quyền
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            </div>
          )}
          
          {isMobile ? (
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? onToggle : undefined}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${isCollapsed && !isMobile ? 'justify-center' : ''}
                `}
                title={isCollapsed && !isMobile ? item.name : ''}
              >
                <Icon className={`h-6 w-6 flex-shrink-0 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                
                {(!isCollapsed || isMobile) && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {(!isCollapsed || isMobile) && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <div>Kata Admin v2.0</div>
              <div className="mt-1">© 2025 TazaGroup</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

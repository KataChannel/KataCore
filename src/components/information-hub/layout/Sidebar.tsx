'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  BellIcon, 
  ClockIcon, 
  LifebuoyIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CheckIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { INFORMATION_HUB_MODULES } from '@/types/information-hub';
import { useInformationHub } from '@/providers/InformationHubProvider';

const iconMap = {
  dashboard: HomeIcon,
  bell: BellIcon,
  history: ClockIcon,
  support: LifebuoyIcon,
  book: BookOpenIcon,
  'graduation-cap': AcademicCapIcon,
  'chart-bar': ChartBarIcon,
  'check-square': CheckIcon,
  users: UsersIcon,
};

export function InformationHubSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { unreadCount } = useInformationHub();

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Information Hub</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {INFORMATION_HUB_MODULES.filter(module => module.isEnabled).map((module) => {
          const Icon = iconMap[module.icon as keyof typeof iconMap] || HomeIcon;
          const isActive = pathname === module.path;
          const showBadge = module.id === 'notifications' && unreadCount > 0;

          return (
            <Link
              key={module.id}
              href={module.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{module.name}</span>
                  {showBadge && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute left-8 top-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Trung tâm thông tin</p>
            <p className="text-xs text-gray-600">
              Quản lý thông tin và hỗ trợ toàn diện cho tổ chức
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

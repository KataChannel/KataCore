'use client';

import React from 'react';
import { BellIcon, ClockIcon } from '@heroicons/react/24/outline';
import { DashboardWidget } from '@/types/information-hub';
import { useInformationHub } from '@/providers/InformationHubProvider';

interface NotificationWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
}

export function NotificationWidget({ widget, isEditMode }: NotificationWidgetProps) {
  const { notifications } = useInformationHub();
  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Thông báo</h3>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {unreadCount} mới
          </span>
        )}
      </div>

      <div className="space-y-3">
        {recentNotifications.length > 0 ? (
          recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border-l-4 ${
                notification.isRead
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    notification.isRead ? 'text-gray-700' : 'text-gray-900'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center text-xs text-gray-400 ml-2">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <BellIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Không có thông báo nào</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Xem tất cả thông báo →
        </button>
      </div>
    </div>
  );
}

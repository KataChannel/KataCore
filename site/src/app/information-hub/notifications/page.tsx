'use client';

import React from 'react';
import { NotificationCenter } from '@/components/information-hub/notifications/NotificationCenter';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
      </div>
      <NotificationCenter />
    </div>
  );
}

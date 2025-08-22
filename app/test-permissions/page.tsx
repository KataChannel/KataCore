'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

export default function TestPermissions() {
  const { hasPermission, isLoading, userRole, userLevel } = usePermissions();

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Permission Test</h2>
      <div className="space-y-2">
        <p>User Role: {userRole || 'Not loaded'}</p>
        <p>User Level: {userLevel || 'Not loaded'}</p>
        <p>Can Config Facebook: {hasPermission('admin.social.facebook.config') ? 'Yes' : 'No'}</p>
        <p>Can Sync Facebook: {hasPermission('admin.social.facebook.sync') ? 'Yes' : 'No'}</p>
        <p>Can View Users: {hasPermission('admin.social.facebook.users') ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

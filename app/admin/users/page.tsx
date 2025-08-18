'use client';

import React from 'react';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Quản lý người dùng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý tài khoản người dùng, phân quyền và cài đặt hệ thống
        </p>
      </div>
      
      <AdminUserManagement />
    </div>
  );
}

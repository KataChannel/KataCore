'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/auth';

interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  displayName: string;
  avatar?: string;
  provider: string;
  isActive: boolean;
  isVerified: boolean;
  role: {
    id: string;
    name: string;
    level: number;
  };
  createdAt: string;
  lastLoginAt?: string;
  socialAccounts?: {
    provider: string;
    providerId: string;
    email?: string;
  }[];
}

interface Role {
  id: string;
  name: string;
  level: number;
  description?: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    provider: '',
    role: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { hasPermission } = useUnifiedAuth();

  // Check permissions
  const canManageUsers = hasPermission('manage', 'users');
  const canViewUsers = hasPermission('read', 'users');

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers();
      fetchRoles();
    }
  }, [canViewUsers, pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.provider && { provider: filters.provider }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    if (!canManageUsers) {
      setError('Bạn không có quyền thực hiện hành động này');
      return;
    }

    try {
      let response;
      
      switch (action) {
        case 'toggle-status':
          response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
          break;

        case 'update-role':
          response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roleId: data.roleId }),
          });
          break;

        case 'reset-password':
          response = await fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
          break;

        case 'unlink-social':
          response = await fetch(`/api/admin/users/${userId}/unlink-social`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ provider: data.provider }),
          });
          break;

        default:
          throw new Error('Invalid action');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }

      // Refresh users list
      await fetchUsers();
      setShowUserModal(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      email: '📧',
      phone: '📱',
      google: '🌐',
      facebook: '👥',
      apple: '🍎',
      microsoft: '🔷',
    };
    return icons[provider as keyof typeof icons] || '👤';
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      phone: 'bg-green-100 text-green-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      apple: 'bg-gray-100 text-gray-800',
      microsoft: 'bg-blue-100 text-blue-800',
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!canViewUsers) {
    return (
      <div className="unified-card text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Truy cập bị từ chối</h2>
        <p className="text-text-secondary">Bạn không có quyền xem danh sách người dùng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Quản lý người dùng</h1>
        {canManageUsers && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
            className="unified-button accent"
          >
            + Thêm người dùng
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="unified-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="unified-input"
            />
          </div>
          <div>
            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="unified-input"
            >
              <option value="">Tất cả nhà cung cấp</option>
              <option value="email">Email</option>
              <option value="phone">Điện thoại</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="apple">Apple</option>
              <option value="microsoft">Microsoft</option>
            </select>
          </div>
          <div>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="unified-input"
            >
              <option value="">Tất cả vai trò</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="unified-input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="unified-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Đăng nhập cuối
                  </th>
                  {canManageUsers && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-background-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.displayName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-accent font-medium">
                                {user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary">
                            {user.displayName}
                          </div>
                          {user.username && (
                            <div className="text-sm text-text-secondary">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        {user.email && <div>📧 {user.email}</div>}
                        {user.phone && <div>📱 {user.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(user.provider)}`}>
                          {getProviderIcon(user.provider)} {user.provider}
                        </span>
                        {user.socialAccounts?.map((account, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(account.provider)}`}
                          >
                            {getProviderIcon(account.provider)} {account.provider}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? '✅ Hoạt động' : '❌ Không hoạt động'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN')
                        : 'Chưa bao giờ'
                      }
                    </td>
                    {canManageUsers && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-accent hover:text-accent/80 mr-3"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleUserAction('toggle-status', user.id)}
                          className={`${
                            user.isActive 
                              ? 'text-red-600 hover:text-red-500' 
                              : 'text-green-600 hover:text-green-500'
                          }`}
                        >
                          {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-background-secondary px-4 py-3 flex items-center justify-between border-t border-border">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="unified-button secondary"
              >
                Trước
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="unified-button secondary"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Hiển thị{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}trong{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}kết quả
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.page
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-text-primary">
                  {selectedUser ? 'Chi tiết người dùng' : 'Thêm người dùng mới'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    {selectedUser.avatar ? (
                      <img
                        className="h-16 w-16 rounded-full"
                        src={selectedUser.avatar}
                        alt={selectedUser.displayName}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent font-medium text-xl">
                          {selectedUser.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-text-primary">
                        {selectedUser.displayName}
                      </h4>
                      <p className="text-text-secondary">ID: {selectedUser.id}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h5 className="font-medium text-text-primary mb-2">Thông tin liên hệ</h5>
                    <div className="bg-background-secondary rounded-lg p-4 space-y-2">
                      {selectedUser.email && (
                        <div className="flex items-center gap-2">
                          <span>📧</span>
                          <span>{selectedUser.email}</span>
                        </div>
                      )}
                      {selectedUser.phone && (
                        <div className="flex items-center gap-2">
                          <span>📱</span>
                          <span>{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.username && (
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>@{selectedUser.username}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Accounts */}
                  {selectedUser.socialAccounts && selectedUser.socialAccounts.length > 0 && (
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">Tài khoản liên kết</h5>
                      <div className="space-y-2">
                        {selectedUser.socialAccounts.map((account, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-background-secondary rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getProviderIcon(account.provider)}</span>
                              <div>
                                <div className="font-medium">{account.provider}</div>
                                {account.email && (
                                  <div className="text-sm text-text-secondary">{account.email}</div>
                                )}
                              </div>
                            </div>
                            {canManageUsers && (
                              <button
                                onClick={() => handleUserAction('unlink-social', selectedUser.id, { provider: account.provider })}
                                className="text-red-600 hover:text-red-500 text-sm"
                              >
                                Hủy liên kết
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Role Management */}
                  {canManageUsers && (
                    <div>
                      <h5 className="font-medium text-text-primary mb-2">Vai trò</h5>
                      <div className="flex items-center gap-3">
                        <select
                          defaultValue={selectedUser.role.id}
                          onChange={(e) => handleUserAction('update-role', selectedUser.id, { roleId: e.target.value })}
                          className="unified-input flex-1"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.name} (Level {role.level})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {canManageUsers && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleUserAction('toggle-status', selectedUser.id)}
                        className={`unified-button ${
                          selectedUser.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {selectedUser.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleUserAction('reset-password', selectedUser.id)}
                        className="unified-button secondary"
                      >
                        Đặt lại mật khẩu
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Add new user form would go here */}
                  <p className="text-text-secondary">Chức năng thêm người dùng sẽ được triển khai sau.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

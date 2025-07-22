'use client';
import React, { useState } from 'react';
import { UsersIcon, PencilIcon, TrashIcon, KeyIcon, EyeIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { User } from '../types';

interface UsersTabProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onViewPermissions?: (user: User) => void;
  canManage: boolean;
  currentUserId?: string; // To prevent self-deletion
}

const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  onEdit, 
  onDelete,
  onToggleStatus,
  onResetPassword,
  onViewPermissions,
  canManage,
  currentUserId 
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'displayName' | 'email' | 'role' | 'lastLoginAt'>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'displayName':
        aValue = a.displayName?.toLowerCase() || '';
        bValue = b.displayName?.toLowerCase() || '';
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'role':
        aValue = a.role?.name?.toLowerCase() || '';
        bValue = b.role?.name?.toLowerCase() || '';
        break;
      case 'lastLoginAt':
        aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getRoleBadgeColor = (roleLevel: number) => {
    if (roleLevel >= 10) return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'; // Super Admin
    if (roleLevel >= 9) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'; // System Admin
    if (roleLevel >= 7) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'; // Manager
    if (roleLevel >= 5) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'; // Supervisor
    if (roleLevel >= 3) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'; // Staff
    return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'; // Basic
  };

  const canDeleteUser = (user: User) => {
    return canManage && 
           user.id !== currentUserId && 
           user.role?.level < 10; // Prevent deleting super admin
  };

  const canModifyUser = (user: User) => {
    return canManage && user.role?.level < 10; // Can modify non-super-admin users
  };

  const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return 'Never';
    
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Users will appear here once they are created
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {canManage && selectedUsers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Bulk status toggle logic here
                      setSelectedUsers([]);
                    }}
                    className="px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {canManage && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('displayName')}
                  >
                    <div className="flex items-center gap-1">
                      User
                      {sortField === 'displayName' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role & Level
                      {sortField === 'role' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    <div className="flex items-center gap-1">
                      Last Login
                      {sortField === 'lastLoginAt' && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`}
                            alt={user.displayName || user.email}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.displayName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.username && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(user.role?.level || 0)}`}>
                          {user.role?.name || 'No Role'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Level {user.role?.level || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            user.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.isVerified && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {user.role?.permissions ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {(() => {
                                const permissions = user.role.permissions;
                                if (typeof permissions === 'string') {
                                  try {
                                    const parsed = JSON.parse(permissions);
                                    return parsed.permissions?.length || 0;
                                  } catch {
                                    return 0;
                                  }
                                } else if (Array.isArray(permissions)) {
                                  return permissions.length;
                                } else if (permissions && typeof permissions === 'object') {
                                  return permissions.permissions?.length || 0;
                                }
                                return 0;
                              })()} permissions
                            </span>
                            {onViewPermissions && (
                              <button
                                onClick={() => onViewPermissions(user)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <EyeIcon className="h-3 w-3" />
                                View Details
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        <span>{formatLastLogin(user.lastLoginAt)}</span>
                        {user.lastLoginAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(user.lastLoginAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {canModifyUser(user) && (
                            <>
                              <button
                                onClick={() => onEdit(user)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Edit User Role"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              
                              {onToggleStatus && (
                                <button
                                  onClick={() => onToggleStatus(user)}
                                  className={`p-1 rounded-md transition-colors ${
                                    user.isActive
                                      ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                      : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  }`}
                                  title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  {user.isActive ? (
                                    <LockClosedIcon className="h-4 w-4" />
                                  ) : (
                                    <LockOpenIcon className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              {onResetPassword && (
                                <button
                                  onClick={() => onResetPassword(user)}
                                  className="text-purple-600 hover:text-purple-700 p-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                  title="Reset Password"
                                >
                                  <KeyIcon className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}

                          {canDeleteUser(user) && onDelete && (
                            <button
                              onClick={() => onDelete(user)}
                              className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete User"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
            {selectedUsers.length > 0 && (
              <span>
                {selectedUsers.length} selected
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTab;

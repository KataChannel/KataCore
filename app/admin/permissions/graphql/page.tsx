'use client';

import { useState } from 'react';
import { useDashboardStats, useRefreshCache } from '@/hooks/graphql';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  Bars3Icon, 
  KeyIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function PermissionsDashboardGraphQL() {
  const { data: stats, loading, error, refetch } = useDashboardStats();
  const refreshCache = useRefreshCache();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      refreshCache();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">Error loading dashboard</div>
          <div className="text-red-400 text-sm mt-2">{error.message}</div>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Permissions Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions with GraphQL API
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors mt-4 sm:mt-0"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <p className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></p>
                ) : (
                  stats?.dashboardStats?.usersCount || 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats?.dashboardStats?.rolesCount || 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bars3Icon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats?.dashboardStats?.menuItemsCount || 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <KeyIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats?.dashboardStats?.permissionsCount || 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/permissions/users"
            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">Create User</span>
          </a>
          
          <a
            href="/admin/permissions/roles"
            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-700 dark:text-green-300 font-medium">Create Role</span>
          </a>
          
          <a
            href="/admin/permissions/menus"
            className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 text-purple-600" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">Create Menu</span>
          </a>
          
          <a
            href="/admin/permissions/user-roles"
            className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
          >
            <KeyIcon className="h-5 w-5 text-orange-600" />
            <span className="text-orange-700 dark:text-orange-300 font-medium">Assign Roles</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          GraphQL API Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 dark:text-green-300 font-medium">
                GraphQL Endpoint
              </span>
            </div>
            <span className="text-green-600 text-sm">Connected</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 dark:text-green-300 font-medium">
                Apollo Client
              </span>
            </div>
            <span className="text-green-600 text-sm">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                DataLoader Cache
              </span>
            </div>
            <span className="text-blue-600 text-sm">Optimized</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Real-time Updates
              </span>
            </div>
            <span className="text-purple-600 text-sm">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

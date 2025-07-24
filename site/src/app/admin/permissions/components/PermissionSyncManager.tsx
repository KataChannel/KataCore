// ============================================================================
// PERMISSION SYNC MANAGEMENT COMPONENT
// ============================================================================
// Admin interface for managing permission synchronization

'use client';
import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface SyncStatus {
  inSync: boolean;
  differences: {
    roleCount: { module: number; database: number };
    outOfSyncRoles: string[];
    missingRoles: string[];
    extraRoles: string[];
  };
}

interface PermissionStats {
  totalRoles: number;
  totalPermissions: number;
  totalUsers: number;
  roleStats: Array<{
    name: string;
    level: number;
    userCount: number;
    permissionCount: number;
    moduleCount: number;
    modules: string[];
  }>;
}

interface SyncResult {
  success: boolean;
  message: string;
  changes: {
    rolesAdded: number;
    rolesUpdated: number;
    rolesRemoved: number;
    permissionsUpdated: number;
  };
  errors: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PermissionSyncManager: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    loadData();
  }, []);

  // ========================================================================
  // DATA LOADING
  // ========================================================================

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sync-permissions');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data.status);
        setStats(data.data.stats);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to load sync data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // SYNC OPERATIONS
  // ========================================================================

  const performSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/admin/sync-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync-all',
          force: process.env.NODE_ENV === 'production'
        }),
      });
      
      const data = await response.json();
      setSyncResult(data.data || data);
      setLastSync(new Date());
      
      // Reload data after sync
      await loadData();
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult({
        success: false,
        message: `Sync failed: ${error}`,
        changes: { rolesAdded: 0, rolesUpdated: 0, rolesRemoved: 0, permissionsUpdated: 0 },
        errors: [String(error)]
      });
    } finally {
      setSyncing(false);
    }
  };

  const runAutoSync = async () => {
    setSyncing(true);
    
    try {
      const response = await fetch('/api/admin/sync-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto-sync' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        await loadData();
      }
      
    } catch (error) {
      console.error('Auto-sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderSyncStatus = () => {
    if (!status) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Sync Status
          </h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            status.inSync 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {status.inSync ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4" />
            )}
            {status.inSync ? 'In Sync' : 'Out of Sync'}
          </div>
        </div>

        {!status.inSync && (
          <div className="space-y-3">
            {status.differences.missingRoles.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Missing Roles ({status.differences.missingRoles.length})
                </h4>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {status.differences.missingRoles.join(', ')}
                </div>
              </div>
            )}

            {status.differences.outOfSyncRoles.length > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Out of Sync Roles ({status.differences.outOfSyncRoles.length})
                </h4>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  {status.differences.outOfSyncRoles.join(', ')}
                </div>
              </div>
            )}

            {status.differences.extraRoles.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Extra Roles ({status.differences.extraRoles.length})
                </h4>
                <div className="text-sm text-red-700 dark:text-red-300">
                  {status.differences.extraRoles.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Permission Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalRoles}</div>
            <div className="text-sm text-blue-500">Total Roles</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.totalPermissions}</div>
            <div className="text-sm text-green-500">Total Permissions</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
            <div className="text-sm text-purple-500">Active Users</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Level
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Users
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Permissions
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Modules
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.roleStats.map((role, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {role.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {role.level}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {role.userCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {role.permissionCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {role.modules.slice(0, 3).map((module, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {module}
                        </span>
                      ))}
                      {role.modules.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                          +{role.modules.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSyncResult = () => {
    if (!syncResult) return null;

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
        syncResult.success 
          ? 'border-green-500' 
          : 'border-red-500'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          {syncResult.success ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Sync Result
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">{syncResult.message}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{syncResult.changes.rolesAdded}</div>
            <div className="text-sm text-gray-500">Added</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{syncResult.changes.rolesUpdated}</div>
            <div className="text-sm text-gray-500">Updated</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{syncResult.changes.rolesRemoved}</div>
            <div className="text-sm text-gray-500">Removed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{syncResult.changes.permissionsUpdated}</div>
            <div className="text-sm text-gray-500">Permissions</div>
          </div>
        </div>

        {syncResult.errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {syncResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading sync data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Permission Synchronization
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage synchronization between modules-permissions.ts and database
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSync && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              Last sync: {lastSync.toLocaleTimeString()}
            </div>
          )}
          
          <button
            onClick={runAutoSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            Auto Sync
          </button>
          
          <button
            onClick={performSync}
            disabled={syncing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {syncing ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-4 w-4" />
            )}
            Force Sync
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {renderSyncResult()}

      {/* Sync Status */}
      {renderSyncStatus()}

      {/* Permission Stats */}
      {renderStats()}
    </div>
  );
};

export default PermissionSyncManager;

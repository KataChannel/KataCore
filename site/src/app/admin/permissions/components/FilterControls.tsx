'use client';
import React from 'react';
import { MagnifyingGlassIcon, PlusIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { TabType } from '../types';

interface FilterControlsProps {
  activeTab: TabType;
  searchTerm: string;
  moduleFilter: string;
  statusFilter: string;
  availableModules: string[];
  onSearchChange: (value: string) => void;
  onModuleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  // New props for user management
  onCreateUser?: () => void;
  onCreateRole?: () => void;
  onCreatePermission?: () => void;
  canManage?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  activeTab,
  searchTerm,
  moduleFilter,
  statusFilter,
  availableModules,
  onSearchChange,
  onModuleFilterChange,
  onStatusFilterChange,
  onCreateUser,
  onCreateRole,
  onCreatePermission,
  canManage = true,
}) => {
  const getCreateButtonConfig = () => {
    switch (activeTab) {
      case 'users':
        return {
          label: 'Add User',
          icon: UserGroupIcon,
          onClick: onCreateUser,
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'roles':
        return {
          label: 'Add Role',
          icon: ShieldCheckIcon,
          onClick: onCreateRole,
          color: 'bg-green-600 hover:bg-green-700',
        };
      case 'permissions':
        return {
          label: 'Add Permission',
          icon: PlusIcon,
          onClick: onCreatePermission,
          color: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return null;
    }
  };

  const createButtonConfig = getCreateButtonConfig();

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Module Filter - Only for roles and permissions */}
          {(activeTab === 'roles' || activeTab === 'permissions') && (
            <div className="sm:w-48">
              <select
                value={moduleFilter}
                onChange={(e) => onModuleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Modules</option>
                {availableModules.map((module) => (
                  <option key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="sm:w-32">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Create Button */}
          {createButtonConfig && canManage && (
            <div className="sm:w-auto">
              <button
                onClick={createButtonConfig.onClick}
                className={`w-full sm:w-auto px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${createButtonConfig.color} focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <createButtonConfig.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{createButtonConfig.label}</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar for Users Tab */}
      {activeTab === 'users' && canManage && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onStatusFilterChange('active')}
            >
              Active Users
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onStatusFilterChange('inactive')}
            >
              Inactive Users
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onStatusFilterChange('all')}
            >
              All Users
            </button>
          </div>
        </div>
      )}

      {/* Role Level Filter for Roles Tab */}
      {activeTab === 'roles' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filter by Role Level:</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              onClick={() => onModuleFilterChange('admin')}
            >
              Admin Roles (Level 3+)
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              onClick={() => onModuleFilterChange('manager')}
            >
              Manager Roles (Level 5+)
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              onClick={() => onModuleFilterChange('super')}
            >
              Super Admin (Level 10)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;

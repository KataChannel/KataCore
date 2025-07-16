'use client';
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
}) => {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        {(activeTab === 'roles' || activeTab === 'permissions') && (
          <div className="sm:w-48">
            <select
              value={moduleFilter}
              onChange={(e) => onModuleFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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

        <div className="sm:w-32">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;

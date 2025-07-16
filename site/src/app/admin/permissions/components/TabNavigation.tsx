'use client';
import React from 'react';
import {
  UserGroupIcon,
  UsersIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'roles', label: 'Roles', icon: UserGroupIcon },
    { key: 'users', label: 'Users', icon: UsersIcon },
    { key: 'permissions', label: 'Permissions', icon: KeyIcon },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="h-5 w-5 inline mr-2" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;

'use client';
import React from 'react';
import {
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface PermissionHeaderProps {
  canManageRoles: boolean;
  onCreateRole: () => void;
}

const PermissionHeader: React.FC<PermissionHeaderProps> = ({ canManageRoles, onCreateRole }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              Permissions Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage roles, permissions, and user access controls
            </p>
          </div>
          <div className="flex space-x-3">
            {canManageRoles && (
              <button
                onClick={onCreateRole}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionHeader;

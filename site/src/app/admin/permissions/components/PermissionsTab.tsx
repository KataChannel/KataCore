'use client';
import React from 'react';
import { KeyIcon, CogIcon } from '@heroicons/react/24/outline';
import { Permission } from '../types';

interface PermissionsTabProps {
  permissions: Permission[];
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({ permissions }) => {
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module || 'System';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {Object.keys(groupedPermissions).length === 0 ? (
        <div className="text-center py-12">
          <KeyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No permissions found</p>
        </div>
      ) : (
        Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
          <div key={module} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              {module.charAt(0).toUpperCase() + module.slice(1)} Module
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                {modulePermissions.length} permissions
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {modulePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {permission.name}
                    </h4>
                    <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                      {permission.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {permission.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    Resource: {permission.resource}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PermissionsTab;

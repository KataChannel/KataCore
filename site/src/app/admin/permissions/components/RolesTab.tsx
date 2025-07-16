'use client';
import React from 'react';
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Role } from '../types';

interface RolesTabProps {
  roles: Role[];
  onEdit: (role?: Role) => void;
  onDelete: (roleId: string) => void;
  canManage: boolean;
}

const RolesTab: React.FC<RolesTabProps> = ({ roles, onEdit, onDelete, canManage }) => {
  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No roles found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    {role.name}
                    {role.isSystemRole && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        System
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {role.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Level {role.level} • {role.userCount} users
                  </div>
                </div>
                {canManage && (
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit role"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => onDelete(role.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete role"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {role.modules.slice(0, 3).map((module) => (
                  <span
                    key={module}
                    className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                  >
                    {module}
                  </span>
                ))}
                {role.modules.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    +{role.modules.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {role.permissions.length} permissions
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesTab;

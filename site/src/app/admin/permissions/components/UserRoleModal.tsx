'use client';
import React from 'react';
import { User, Role, UserForm } from '../types';

interface UserRoleModalProps {
  user: User;
  roles: Role[];
  form: UserForm;
  onChange: (form: UserForm) => void;
  onSave: () => void;
  onClose: () => void;
}

const UserRoleModal: React.FC<UserRoleModalProps> = ({ 
  user, 
  roles, 
  form, 
  onChange, 
  onSave, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Update User Role
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Change role for {user.displayName}
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Role
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.role.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Level {user.role.level}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Role
              </label>
              <select
                value={form.roleId}
                onChange={(e) => onChange({ ...form, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} (Level {role.level})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!form.roleId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRoleModal;

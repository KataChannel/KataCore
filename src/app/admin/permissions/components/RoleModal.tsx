'use client';
import React, { useState, useEffect } from 'react';
import { Role, Permission, RoleForm } from '../types';

interface RoleModalProps {
  role: Role | null;
  form: RoleForm;
  onChange: (form: RoleForm) => void;
  onSave: () => void;
  onClose: () => void;
  permissions: Permission[];
  modules: string[];
}

const RoleModal: React.FC<RoleModalProps> = ({ 
  role, 
  form, 
  onChange, 
  onSave, 
  onClose, 
  permissions, 
  modules 
}) => {
  // Ensure selectedPermissions is always an array
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    Array.isArray(form.permissions) ? form.permissions : []
  );
  const [selectedModules, setSelectedModules] = useState<string[]>(
    Array.isArray(form.modules) ? form.modules : []
  );

  // Update state when form changes externally
  useEffect(() => {
    setSelectedPermissions(Array.isArray(form.permissions) ? form.permissions : []);
    setSelectedModules(Array.isArray(form.modules) ? form.modules : []);
  }, [form.permissions, form.modules]);

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    
    setSelectedPermissions(newPermissions);
    onChange({ ...form, permissions: newPermissions });
  };

  const handleModuleToggle = (module: string) => {
    const newModules = selectedModules.includes(module)
      ? selectedModules.filter(m => m !== module)
      : [...selectedModules, module];
    
    setSelectedModules(newModules);
    onChange({ ...form, modules: newModules });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {role ? 'Edit Role' : 'Create New Role'}
          </h3>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter role name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.level}
                  onChange={(e) => onChange({ ...form, level: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => onChange({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter role description"
              />
            </div>

            {/* Modules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modules Access
              </label>
              <div className="grid gap-2 md:grid-cols-3">
                {modules.map((module) => (
                  <label key={module} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module)}
                      onChange={() => handleModuleToggle(module)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {module}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {permission.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                      {permission.module}
                    </span>
                  </label>
                ))}
              </div>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {role ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;

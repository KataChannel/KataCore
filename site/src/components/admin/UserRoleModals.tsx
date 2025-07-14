'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Types
interface User {
  id: string;
  email: string;
  phone?: string;
  username?: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  role: {
    id: string;
    name: string;
    description: string;
  };
  systemRole?: {
    id: string;
    name: string;
    level: number;
    modules: string[];
  };
  createdAt?: string;
  lastLoginAt?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  level: number;
  modules: string[];
  isSystemRole: boolean;
}

interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description: string;
  module: string;
}

// Props
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  roles: Role[];
  onSave: (userData: any) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
  permissions: Permission[];
  modules: string[];
  onSave: (roleData: any) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

// User Modal Component
export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  roles,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    isActive: true,
    isVerified: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
        displayName: user.displayName || '',
        password: '',
        confirmPassword: '',
        roleId: user.role.id || '',
        isActive: user.isActive,
        isVerified: user.isVerified,
      });
    } else {
      setFormData({
        email: '',
        phone: '',
        username: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        isActive: true,
        isVerified: false,
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    if (mode === 'create' || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = { ...formData };
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Create User' : mode === 'edit' ? 'Edit User' : 'View User'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.displayName ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isReadOnly}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isReadOnly}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isReadOnly}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isReadOnly}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.roleId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isReadOnly}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
            )}
          </div>

          {/* Password */}
          {(mode === 'create' || mode === 'edit') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {mode === 'create' ? 'Password *' : 'New Password (leave blank to keep current)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {mode === 'create' ? 'Confirm Password *' : 'Confirm New Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Status toggles */}
          {mode !== 'view' && (
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900">
                  Verified User
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Modal Component
export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  role,
  permissions,
  modules,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1,
    modules: [] as string[],
    permissions: [] as string[],
    isSystemRole: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    if (role && mode !== 'create') {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        level: role.level || 1,
        modules: role.modules || [],
        permissions: role.permissions || [],
        isSystemRole: role.isSystemRole || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        level: 1,
        modules: [],
        permissions: [],
        isSystemRole: false,
      });
    }
    setErrors({});
  }, [role, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.level < 1 || formData.level > 10) {
      newErrors.level = 'Level must be between 1 and 10';
    }

    if (formData.modules.length === 0) {
      newErrors.modules = 'At least one module must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (module: string) => {
    if (formData.modules.includes(module)) {
      setFormData({
        ...formData,
        modules: formData.modules.filter(m => m !== module)
      });
    } else {
      setFormData({
        ...formData,
        modules: [...formData.modules, module]
      });
    }
  };

  const handlePermissionToggle = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    }
  };

  const filteredPermissions = selectedModule === 'all' 
    ? permissions 
    : permissions.filter(p => p.module === selectedModule);

  const isReadOnly = mode === 'view' || formData.isSystemRole;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            {mode === 'create' ? 'Create Role' : mode === 'edit' ? 'Edit Role' : 'View Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {formData.isSystemRole && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  This is a system role and cannot be modified. You can view its configuration but changes are not allowed.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isReadOnly}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isReadOnly}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Permission Level (1-10) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.level ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isReadOnly}
                />
                {errors.level && (
                  <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Higher levels have more permissions. Level 10 = Super Admin.
                </p>
              </div>
            </div>

            {/* Module Access */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Module Access</h4>
              
              <div className="grid grid-cols-2 gap-2">
                {modules.map((module) => (
                  <div key={module} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`module-${module}`}
                      checked={formData.modules.includes(module)}
                      onChange={() => handleModuleToggle(module)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      disabled={isReadOnly}
                    />
                    <label htmlFor={`module-${module}`} className="ml-2 block text-sm text-gray-900 capitalize">
                      {module}
                    </label>
                  </div>
                ))}
              </div>
              {errors.modules && (
                <p className="mt-1 text-sm text-red-600">{errors.modules}</p>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Permissions</h4>
            
            {/* Module filter */}
            <div className="mb-4">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Modules</option>
                {modules.map((module) => (
                  <option key={module} value={module} className="capitalize">
                    {module}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`perm-${permission.id}`}
                      checked={formData.permissions.includes(`${permission.action}:${permission.resource}`)}
                      onChange={() => handlePermissionToggle(`${permission.action}:${permission.resource}`)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      disabled={isReadOnly}
                    />
                    <div className="ml-2">
                      <label htmlFor={`perm-${permission.id}`} className="block text-sm font-medium text-gray-900">
                        {permission.name}
                      </label>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && !formData.isSystemRole && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Update Role'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

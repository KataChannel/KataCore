'use client';
import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
// Temporary debug import
import debugAuthentication from '@/lib/debug-auth';
import {
  CogIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { FilterControls } from './components';
import PermissionSyncManager from './components/PermissionSyncManager';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  level: number;
  modules: string[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role: {
    id: string;
    name: string;
    level: number;
  };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// Types
interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description: string;
  module: string;
}

const PermissionManagementPage: React.FC = () => {
  const { user, hasPermission, hasMinimumRoleLevel } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions' | 'sync'>('roles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    modules: [] as string[],
    level: 1,
  });

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    roleId: '',
    permissions: [] as string[],
  });

  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permission checks with debug logging
  const hasManagePermissions = hasPermission('manage', 'permissions');
  const hasMinRoleLevel = hasMinimumRoleLevel(5);
  
  // Test direct permission service creation with user data
  useEffect(() => {
    if (user) {
      try {
        const testService = require('@/lib/auth/permission-validator').createSafePermissionService(user);
      } catch (error) {
      }
    }
  }, [user]);
  
  const canManagePermissions = hasManagePermissions || hasMinRoleLevel;
  const canManageRoles = hasPermission('manage', 'roles') || hasMinimumRoleLevel(5);
  const canManageUsers = hasPermission('manage', 'users') || hasMinimumRoleLevel(5);

  // Load data
  useEffect(() => {
    if (canManagePermissions) {
      loadRoles();
      loadUsers();
      loadPermissions();
    }
  }, [canManagePermissions]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log(response);
      
      if (!response.ok) {
        throw new Error('Failed to load roles');
      }

      const data = await response.json();
      setRoles(data.roles || []);
      setAvailableModules(data.modules || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(roleForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }

      await loadRoles();
      setShowRoleModal(false);
      resetRoleForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          ...roleForm,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      await loadRoles();
      setShowRoleModal(false);
      setSelectedRole(null);
      resetRoleForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/admin/roles?roleId=${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      await loadRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          roleId: userForm.roleId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      await loadUsers();
      setShowUserModal(false);
      setSelectedUser(null);
      resetUserForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      modules: [],
      level: 1,
    });
  };

  const resetUserForm = () => {
    setUserForm({
      roleId: '',
      permissions: [],
    });
  };

  const openRoleModal = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setRoleForm({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        modules: role.modules,
        level: role.level,
      });
    } else {
      setSelectedRole(null);
      resetRoleForm();
    }
    setShowRoleModal(true);
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      roleId: user.role.id,
      permissions: [],
    });
    setShowUserModal(true);
  };

  // Filter functions
  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !moduleFilter || role.modules.includes(moduleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    
    return matchesSearch && matchesModule && matchesStatus;
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !moduleFilter || permission.module === moduleFilter;
    
    return matchesSearch && matchesModule;
  });

  if (!canManagePermissions) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You don't have permission to access the permissions management system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
                  onClick={() => openRoleModal()}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {['roles', 'users', 'permissions', 'sync'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'roles' && <UserGroupIcon className="h-5 w-5 inline mr-2" />}
                  {tab === 'users' && <UsersIcon className="h-5 w-5 inline mr-2" />}
                  {tab === 'permissions' && <KeyIcon className="h-5 w-5 inline mr-2" />}
                  {tab === 'sync' && <ArrowPathIcon className="h-5 w-5 inline mr-2" />}
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          {activeTab !== 'sync' && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <FilterControls
                activeTab={activeTab}
                searchTerm={searchTerm}
                moduleFilter={moduleFilter}
                statusFilter={statusFilter}
                availableModules={availableModules}
                onSearchChange={setSearchTerm}
                onModuleFilterChange={setModuleFilter}
                onStatusFilterChange={setStatusFilter}
                onCreateUser={() => setShowUserModal(true)}
                onCreateRole={() => openRoleModal()}
                onCreatePermission={() => {}}
                canManage={activeTab === 'roles' ? canManageRoles : activeTab === 'users' ? canManageUsers : canManagePermissions}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    if (activeTab === 'roles') loadRoles();
                    else if (activeTab === 'users') loadUsers();
                    else loadPermissions();
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'roles' && <RolesTab 
                  roles={filteredRoles}
                  onEdit={openRoleModal}
                  onDelete={handleDeleteRole}
                  canManage={canManageRoles}
                />}
                {activeTab === 'users' && <UsersTab 
                  users={filteredUsers}
                  onEdit={openUserModal}
                  canManage={canManageUsers}
                />}
                {activeTab === 'permissions' && <PermissionsTab 
                  permissions={filteredPermissions}
                />}
                {activeTab === 'sync' && <PermissionSyncManager />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRoleModal && (
        <RoleModal
          role={selectedRole}
          form={roleForm}
          onChange={setRoleForm}
          onSave={selectedRole ? handleUpdateRole : handleCreateRole}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedRole(null);
            resetRoleForm();
          }}
          permissions={permissions}
          modules={availableModules}
        />
      )}

      {showUserModal && selectedUser && (
        <UserRoleModal
          user={selectedUser}
          roles={roles}
          form={userForm}
          onChange={setUserForm}
          onSave={handleUpdateUserRole}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
            resetUserForm();
          }}
        />
      )}
    </div>
  );
};

// Tab Components
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

interface UsersTabProps {
  users: User[];
  onEdit: (user: User) => void;
  canManage: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onEdit, canManage }) => {
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                {canManage && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {user.role.name} (Level {user.role.level})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        user.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit Role
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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

// Modal Components
interface RoleModalProps {
  role: Role | null;
  form: any;
  onChange: (form: any) => void;
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

interface UserRoleModalProps {
  user: User;
  roles: Role[];
  form: any;
  onChange: (form: any) => void;
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

export default PermissionManagementPage;

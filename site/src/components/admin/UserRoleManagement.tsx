// Comprehensive User & Role Management Component
'use client';

import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon,
  KeyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

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
    permissions: string[];
  };
  systemRole?: {
    id: string;
    name: string;
    description: string;
    level: number;
    modules: string[];
    permissions: any[];
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department?: {
      id: string;
      name: string;
    };
    position?: {
      id: string;
      title: string;
    };
  };
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  systemRole?: {
    id: string;
    name: string;
    description: string;
    level: number;
    modules: string[];
    permissions: any[];
  };
  level: number;
  modules: string[];
  isSystemRole: boolean;
  createdAt?: string;
}

interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description: string;
  module: string;
}

export default function UserRoleManagement() {
  // State management
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'user' | 'role';
    id: string;
    name: string;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [currentPage, searchTerm, statusFilter, roleFilter, moduleFilter]);

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        module: moduleFilter,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalItems(data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load roles
  const loadRoles = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        search: searchTerm,
        module: moduleFilter,
      });

      const response = await fetch(`/api/admin/roles?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load roles');
      }

      const data = await response.json();
      setRoles(data.roles);
      setPermissions(data.availablePermissions);
      setModules(data.modules);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter users based on current filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;

    const matchesModule =
      moduleFilter === 'all' || (user.systemRole && user.systemRole.modules.includes(moduleFilter));

    return matchesSearch && matchesStatus && matchesRole && matchesModule;
  });

  // Filter roles based on current filters
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === 'all' || role.modules.includes(moduleFilter);

    const matchesLevel =
      levelFilter === 'all' ||
      (levelFilter === 'low' && role.level <= 3) ||
      (levelFilter === 'medium' && role.level > 3 && role.level <= 7) ||
      (levelFilter === 'high' && role.level > 7);

    return matchesSearch && matchesModule && matchesLevel;
  });

  // Handle user actions
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteTarget({ type: 'user', id: user.id, name: user.displayName });
    setShowDeleteModal(true);
  };

  // Handle role actions
  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteTarget({ type: 'role', id: role.id, name: role.name });
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const endpoint =
        deleteTarget.type === 'user'
          ? `/api/admin/users?userId=${deleteTarget.id}`
          : `/api/admin/roles?roleId=${deleteTarget.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${deleteTarget.type}`);
      }

      if (deleteTarget.type === 'user') {
        loadUsers();
      } else {
        loadRoles();
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Get module badge color
  const getModuleBadgeColor = (module: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-blue-100 text-blue-800',
      crm: 'bg-green-100 text-green-800',
      inventory: 'bg-orange-100 text-orange-800',
      finance: 'bg-yellow-100 text-yellow-800',
      hrm: 'bg-purple-100 text-purple-800',
      projects: 'bg-indigo-100 text-indigo-800',
      manufacturing: 'bg-gray-100 text-gray-800',
      marketing: 'bg-pink-100 text-pink-800',
      support: 'bg-teal-100 text-teal-800',
      analytics: 'bg-violet-100 text-violet-800',
      ecommerce: 'bg-emerald-100 text-emerald-800',
      system: 'bg-red-100 text-red-800',
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  // Get role level badge
  const getRoleLevelBadge = (level: number) => {
    if (level >= 9) return 'bg-red-100 text-red-800 border-red-200';
    if (level >= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (level >= 5) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRoleLevelText = (level: number) => {
    if (level >= 9) return 'Admin';
    if (level >= 7) return 'Manager';
    if (level >= 5) return 'Senior';
    return 'Staff';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage users, roles, and permissions across all modules
              </p>
            </div>
            <div className="flex space-x-3">
              {activeTab === 'users' && (
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add User
                </button>
              )}
              {activeTab === 'roles' && (
                <button
                  onClick={handleCreateRole}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Role
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'users', name: 'Users', icon: UserGroupIcon, count: users.length },
              { id: 'roles', name: 'Roles', icon: ShieldCheckIcon, count: roles.length },
              { id: 'permissions', name: 'Permissions', icon: KeyIcon, count: permissions.length },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-900 hidden sm:inline-block py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={`Search ${activeTab}...`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Module Filter */}
              <div className="sm:w-48">
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">All Modules</option>
                  {modules.map((module) => (
                    <option key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter (for users tab) */}
              {activeTab === 'users' && (
                <div className="sm:w-48">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Level Filter (for roles tab) */}
              {activeTab === 'roles' && (
                <div className="sm:w-48">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="low">Staff (1-3)</option>
                    <option value="medium">Manager (4-7)</option>
                    <option value="high">Admin (8-10)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <XMarkIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'users' && (
          <UsersTable
            users={filteredUsers}
            roles={roles}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            getModuleBadgeColor={getModuleBadgeColor}
            getRoleLevelBadge={getRoleLevelBadge}
            getRoleLevelText={getRoleLevelText}
          />
        )}

        {activeTab === 'roles' && (
          <RolesTable
            roles={filteredRoles}
            loading={loading}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            getModuleBadgeColor={getModuleBadgeColor}
            getRoleLevelBadge={getRoleLevelBadge}
            getRoleLevelText={getRoleLevelText}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsTable
            permissions={permissions}
            modules={modules}
            getModuleBadgeColor={getModuleBadgeColor}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <DeleteConfirmationModal
          target={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

// Users Table Component
const UsersTable: React.FC<{
  users: User[];
  roles: Role[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  getModuleBadgeColor: (module: string) => string;
  getRoleLevelBadge: (level: number) => string;
  getRoleLevelText: (level: number) => string;
}> = ({
  users,
  roles,
  loading,
  onEdit,
  onDelete,
  getModuleBadgeColor,
  getRoleLevelBadge,
  getRoleLevelText,
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.username && (
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.role.name}</div>
                    {user.systemRole && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleLevelBadge(user.systemRole.level)}`}
                      >
                        Level {user.systemRole.level} - {getRoleLevelText(user.systemRole.level)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.systemRole?.modules.slice(0, 3).map((module) => (
                      <span
                        key={module}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleBadgeColor(module)}`}
                      >
                        {module}
                      </span>
                    ))}
                    {user.systemRole && user.systemRole.modules.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{user.systemRole.modules.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {user.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.employee?.department ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.employee.department.name}
                      </div>
                      {user.employee.position && (
                        <div className="text-sm text-gray-500">{user.employee.position.title}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
        </div>
      )}
    </div>
  );
};

// Roles Table Component
const RolesTable: React.FC<{
  roles: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  getModuleBadgeColor: (module: string) => string;
  getRoleLevelBadge: (level: number) => string;
  getRoleLevelText: (level: number) => string;
}> = ({
  roles,
  loading,
  onEdit,
  onDelete,
  getModuleBadgeColor,
  getRoleLevelBadge,
  getRoleLevelText,
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level & Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleLevelBadge(role.level)}`}
                    >
                      Level {role.level} - {getRoleLevelText(role.level)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isSystemRole
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {role.isSystemRole ? 'System Role' : 'Custom Role'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.modules.slice(0, 3).map((module) => (
                      <span
                        key={module}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleBadgeColor(module)}`}
                      >
                        {module}
                      </span>
                    ))}
                    {role.modules.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{role.modules.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{role.permissions.length} permissions</div>
                  <div className="text-sm text-gray-500">
                    {role.systemRole?.permissions.length || role.permissions.length} total
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {role.userCount} users
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {!role.isSystemRole && role.userCount === 0 && (
                      <button
                        onClick={() => onDelete(role)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
        </div>
      )}
    </div>
  );
};

// Permissions Table Component
const PermissionsTable: React.FC<{
  permissions: Permission[];
  modules: string[];
  getModuleBadgeColor: (module: string) => string;
}> = ({ permissions, modules, getModuleBadgeColor }) => {
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const filteredPermissions =
    selectedModule === 'all' ? permissions : permissions.filter((p) => p.module === selectedModule);

  const groupedPermissions = filteredPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-6">
      {/* Module Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedModule('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedModule === 'all'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Modules ({permissions.length})
          </button>
          {modules.map((module) => {
            const count = permissions.filter((p) => p.module === module).length;
            return (
              <button
                key={module}
                onClick={() => setSelectedModule(module)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedModule === module
                    ? getModuleBadgeColor(module)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {module.charAt(0).toUpperCase() + module.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions by Module */}
      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
        <div key={module} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getModuleBadgeColor(module)}`}
              >
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </span>
              <span className="ml-3 text-sm text-gray-500">
                {modulePermissions.length} permissions
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {modulePermissions.map((permission) => (
              <div key={permission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                    <p className="text-sm text-gray-500">{permission.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {permission.action}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {permission.resource}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredPermissions.length === 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No permissions available for the selected module.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal: React.FC<{
  target: { type: 'user' | 'role'; id: string; name: string };
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ target, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete {target.type}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the {target.type} "{target.name}"? This action
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

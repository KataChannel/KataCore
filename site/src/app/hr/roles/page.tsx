'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  UsersIcon,
  KeyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: 'employee' | 'department' | 'attendance' | 'leave' | 'payroll' | 'reports' | 'settings';
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

// Mock data for permissions
const allPermissions: Permission[] = [
  // Employee Management
  { id: 'emp_read', name: 'View Employees', resource: 'employee', action: 'read', description: 'View employee information', category: 'employee' },
  { id: 'emp_create', name: 'Create Employees', resource: 'employee', action: 'create', description: 'Add new employees', category: 'employee' },
  { id: 'emp_update', name: 'Update Employees', resource: 'employee', action: 'update', description: 'Edit employee information', category: 'employee' },
  { id: 'emp_delete', name: 'Delete Employees', resource: 'employee', action: 'delete', description: 'Remove employees', category: 'employee' },
  
  // Department Management
  { id: 'dept_read', name: 'View Departments', resource: 'department', action: 'read', description: 'View department information', category: 'department' },
  { id: 'dept_create', name: 'Create Departments', resource: 'department', action: 'create', description: 'Add new departments', category: 'department' },
  { id: 'dept_update', name: 'Update Departments', resource: 'department', action: 'update', description: 'Edit department information', category: 'department' },
  { id: 'dept_delete', name: 'Delete Departments', resource: 'department', action: 'delete', description: 'Remove departments', category: 'department' },
  
  // Attendance Management
  { id: 'att_read', name: 'View Attendance', resource: 'attendance', action: 'read', description: 'View attendance records', category: 'attendance' },
  { id: 'att_create', name: 'Record Attendance', resource: 'attendance', action: 'create', description: 'Record attendance', category: 'attendance' },
  { id: 'att_update', name: 'Update Attendance', resource: 'attendance', action: 'update', description: 'Edit attendance records', category: 'attendance' },
  { id: 'att_delete', name: 'Delete Attendance', resource: 'attendance', action: 'delete', description: 'Remove attendance records', category: 'attendance' },
  
  // Leave Management
  { id: 'leave_read', name: 'View Leave Requests', resource: 'leave', action: 'read', description: 'View leave requests', category: 'leave' },
  { id: 'leave_create', name: 'Create Leave Requests', resource: 'leave', action: 'create', description: 'Submit leave requests', category: 'leave' },
  { id: 'leave_approve', name: 'Approve Leave', resource: 'leave', action: 'approve', description: 'Approve leave requests', category: 'leave' },
  { id: 'leave_reject', name: 'Reject Leave', resource: 'leave', action: 'reject', description: 'Reject leave requests', category: 'leave' },
  
  // Payroll Management
  { id: 'payroll_read', name: 'View Payroll', resource: 'payroll', action: 'read', description: 'View payroll information', category: 'payroll' },
  { id: 'payroll_create', name: 'Create Payroll', resource: 'payroll', action: 'create', description: 'Create payroll entries', category: 'payroll' },
  { id: 'payroll_update', name: 'Update Payroll', resource: 'payroll', action: 'update', description: 'Edit payroll information', category: 'payroll' },
  { id: 'payroll_delete', name: 'Delete Payroll', resource: 'payroll', action: 'delete', description: 'Remove payroll entries', category: 'payroll' },
  
  // Reports
  { id: 'reports_read', name: 'View Reports', resource: 'reports', action: 'read', description: 'View system reports', category: 'reports' },
  { id: 'reports_export', name: 'Export Reports', resource: 'reports', action: 'export', description: 'Export reports to files', category: 'reports' },
  
  // Settings
  { id: 'settings_read', name: 'View Settings', resource: 'settings', action: 'read', description: 'View system settings', category: 'settings' },
  { id: 'settings_update', name: 'Update Settings', resource: 'settings', action: 'update', description: 'Modify system settings', category: 'settings' },
];

// Mock data for roles
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'HR Administrator',
    description: 'Full access to all HR functions',
    level: 5,
    permissions: allPermissions,
    userCount: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    name: 'HR Manager',
    description: 'Management level access to HR functions',
    level: 4,
    permissions: allPermissions.filter(p => !['emp_delete', 'dept_delete', 'settings_update'].includes(p.id)),
    userCount: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'HR Specialist',
    description: 'Standard HR operations access',
    level: 3,
    permissions: allPermissions.filter(p => ['emp_read', 'emp_create', 'emp_update', 'dept_read', 'att_read', 'att_create', 'att_update', 'leave_read', 'leave_create', 'payroll_read', 'reports_read'].includes(p.id)),
    userCount: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z',
  },
  {
    id: '4',
    name: 'Department Manager',
    description: 'Department-level HR access',
    level: 3,
    permissions: allPermissions.filter(p => ['emp_read', 'emp_update', 'att_read', 'att_update', 'leave_read', 'leave_approve', 'leave_reject', 'reports_read'].includes(p.id)),
    userCount: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T09:00:00Z',
  },
  {
    id: '5',
    name: 'Employee',
    description: 'Basic employee self-service access',
    level: 1,
    permissions: allPermissions.filter(p => ['emp_read', 'att_read', 'leave_read', 'leave_create'].includes(p.id)),
    userCount: 150,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock data for users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    department: 'IT',
    role: mockRoles[0],
    isActive: true,
    lastLogin: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'HR Manager',
    email: 'hr.manager@company.com',
    department: 'HR',
    role: mockRoles[1],
    isActive: true,
    lastLogin: '2024-01-15T10:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    role: mockRoles[4],
    isActive: true,
    lastLogin: '2024-01-15T09:45:00Z',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    role: mockRoles[3],
    isActive: true,
    lastLogin: '2024-01-15T11:20:00Z',
    createdAt: '2024-01-08T00:00:00Z',
  },
  {
    id: '5',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    department: 'Sales',
    role: mockRoles[2],
    isActive: false,
    lastLogin: '2024-01-10T16:30:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

const categoryIcons = {
  employee: UserIcon,
  department: BuildingOfficeIcon,
  attendance: ClockIcon,
  leave: CalendarIcon,
  payroll: CurrencyDollarIcon,
  reports: DocumentTextIcon,
  settings: Cog6ToothIcon,
};

const categoryColors = {
  employee: 'bg-blue-50 text-blue-700 border-blue-200',
  department: 'bg-green-50 text-green-700 border-green-200',
  attendance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  leave: 'bg-purple-50 text-purple-700 border-purple-200',
  payroll: 'bg-red-50 text-red-700 border-red-200',
  reports: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  settings: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'role' | 'user', id: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort data
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setDeleteTarget({ type: 'role', id: roleId });
    setShowDeleteModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteTarget({ type: 'user', id: userId });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'role') {
      setRoles(roles.filter(r => r.id !== deleteTarget.id));
    } else {
      setUsers(users.filter(u => u.id !== deleteTarget.id));
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let aValue = a[sortBy as keyof Role];
    let bValue = b[sortBy as keyof Role];

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy as keyof User];
    let bValue = b[sortBy as keyof User];

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600">Manage user roles, permissions, and access control</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateUser}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
            <button
              onClick={handleCreateRole}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Roles ({roles.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <KeyIcon className="h-4 w-4 mr-2" />
              Permissions ({allPermissions.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              Users ({users.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {activeTab === 'users' && (
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Roles ({sortedRoles.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Role Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center">
                      Level
                      {sortBy === 'level' && (
                        sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Level {role.level}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-800 text-xs font-medium">
                            {role.level}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.permissions.length} permissions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.userCount} users
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
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
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {Object.entries(
            allPermissions.reduce((acc, permission) => {
              if (!acc[permission.category]) acc[permission.category] = [];
              acc[permission.category].push(permission);
              return acc;
            }, {} as Record<string, Permission[]>)
          ).map(([category, permissions]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-gray-400 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {category} Management
                    </h3>
                    <span className="ml-3 text-sm text-gray-500">
                      {permissions.length} permissions
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className={`p-4 border rounded-lg ${categoryColors[category as keyof typeof categoryColors]}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {permission.name}
                            </h4>
                            <p className="text-xs mt-1 opacity-75">
                              {permission.description}
                            </p>
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                {permission.action}
                              </span>
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                {permission.resource}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({sortedUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      User
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete {deleteTarget?.type === 'role' ? 'Role' : 'User'}
              </h3>
              <div className="mt-4 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Permission {
  action: string;
  resource: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[] | string; // Can be array of objects or JSON string
  level: number;
  isSystemRole: boolean;
  modules: any[] | string; // Can be array or JSON string
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  _count?: {
    users: number;
  };
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
    level: 1,
    modules: '',
  });

  // Helper function to format permissions for display
  const formatPermissions = (permissions: Permission[] | string): string => {
    if (!permissions) return 'Không có';
    
    if (typeof permissions === 'string') {
      try {
        const parsed = JSON.parse(permissions);
        if (Array.isArray(parsed)) {
          return parsed.map((p: Permission) => `${p.action}:${p.resource}`).join(', ');
        }
        return permissions;
      } catch {
        return permissions;
      }
    }
    
    if (Array.isArray(permissions)) {
      return permissions.map((p: Permission) => `${p.action}:${p.resource}`).join(', ');
    }
    
    return 'Không có';
  };

  // Helper function to format modules for display
  const formatModules = (modules: any[] | string): string => {
    if (!modules) return '';
    
    if (typeof modules === 'string') {
      try {
        const parsed = JSON.parse(modules);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        return modules;
      } catch {
        return modules;
      }
    }
    
    if (Array.isArray(modules)) {
      return modules.join(', ');
    }
    
    return '';
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      console.log('Loaded roles:', data);
      
      setRoles(data.roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingRole 
        ? `/api/admin/roles/${editingRole.id}` 
        : '/api/admin/roles';
      
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadRoles();
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({
          name: '',
          description: '',
          permissions: '',
          level: 1,
          modules: '',
        });
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    
    // Convert permissions to string format for editing
    let permissionsString = '';
    if (typeof role.permissions === 'string') {
      permissionsString = role.permissions;
    } else if (Array.isArray(role.permissions)) {
      permissionsString = JSON.stringify(role.permissions);
    }
    
    // Convert modules to string format for editing
    let modulesString = '';
    if (typeof role.modules === 'string') {
      modulesString = role.modules;
    } else if (Array.isArray(role.modules)) {
      modulesString = JSON.stringify(role.modules);
    }
    
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: permissionsString,
      level: role.level,
      modules: modulesString,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && ((role.userCount && role.userCount > 0) || (role._count?.users && role._count.users > 0))) {
      alert('Không thể xóa vai trò đang được sử dụng bởi người dùng.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: '',
      level: 1,
      modules: '',
    });
    setIsModalOpen(true);
  };

  const getLevelColor = (level: number) => {
    if (level >= 9) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level >= 7) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (level >= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (level >= 3) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Vai trò
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý các vai trò người dùng và quyền hạn trong hệ thống
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Thêm Vai trò
        </button>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        {role.isSystemRole ? (
                          <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(role.level)}`}>
                          Level {role.level}
                        </span>
                        {role.isSystemRole && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Hệ thống
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {(role.userCount !== undefined ? role.userCount : role._count?.users) ? 
                          `${role.userCount || role._count?.users} người dùng` : '0 người dùng'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Permissions Preview */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Quyền:</strong> {formatPermissions(role.permissions)}
                  </div>
                  {role.modules && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <strong>Modules:</strong> {formatModules(role.modules)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingRole ? 'Chỉnh sửa Vai trò' : 'Thêm Vai trò Mới'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên vai trò *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cấp độ (1-10) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quyền hạn *
                  </label>
                  <textarea
                    required
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    placeholder="Ví dụ: read:user,write:user,admin:system"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Modules
                  </label>
                  <input
                    type="text"
                    value={formData.modules}
                    onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
                    placeholder="Ví dụ: admin,hrm,crm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingRole ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;

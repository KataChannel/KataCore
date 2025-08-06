'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  title: string;
  titleVi: string;
  path: string;
  icon: string;
  permission: string;
  sortOrder: number;
  isActive: boolean;
  children?: MenuItem[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
}

interface RoleMenuPermission {
  id: string;
  roleId: string;
  menuItemId: string;
  canView: boolean;
  canAccess: boolean;
  menuItem: MenuItem;
  role: Role;
}

const RoleMenuPermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<Record<string, RoleMenuPermission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load roles
      const rolesResponse = await fetch('/api/admin/roles');
      const rolesData = await rolesResponse.json();
      setRoles(rolesData);

      // Load all menu items
      const menuResponse = await fetch('/api/admin/menu-items');
      const menuData = await menuResponse.json();
      setMenuItems(menuData);

      // Load permissions for each role
      const permissionsData: Record<string, RoleMenuPermission[]> = {};
      for (const role of rolesData) {
        const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${role.id}`);
        const permData = await permResponse.json();
        permissionsData[role.id] = permData;
      }
      setPermissions(permissionsData);

      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0].id);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (roleId: string, menuItemId: string, type: 'view' | 'access', value: boolean) => {
    try {
      setSaving(true);

      const currentPermission = permissions[roleId]?.find(p => p.menuItemId === menuItemId);
      
      const response = await fetch('/api/admin/role-menu-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId,
          menuItemId,
          canView: type === 'view' ? value : currentPermission?.canView ?? true,
          canAccess: type === 'access' ? value : currentPermission?.canAccess ?? true,
        }),
      });

      if (response.ok) {
        // Reload permissions for this role
        const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${roleId}`);
        const permData = await permResponse.json();
        setPermissions(prev => ({
          ...prev,
          [roleId]: permData,
        }));
      }

    } catch (error) {
      console.error('Error updating permission:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleMenuExpansion = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const getPermissionForMenuItem = (roleId: string, menuItemId: string) => {
    return permissions[roleId]?.find(p => p.menuItemId === menuItemId);
  };

  const renderMenuItem = (menuItem: MenuItem, level = 0) => {
    const hasChildren = menuItem.children && menuItem.children.length > 0;
    const isExpanded = expandedMenus.has(menuItem.id);
    const permission = getPermissionForMenuItem(selectedRole, menuItem.id);

    return (
      <div key={menuItem.id}>
        <div
          className={`flex items-center p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 ${
            level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''
          }`}
        >
          {/* Menu Info */}
          <div className="flex items-center flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleMenuExpansion(menuItem.id)}
                className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            )}
            
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-2xl">{getIconForName(menuItem.icon)}</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {menuItem.titleVi || menuItem.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {menuItem.path}
                </div>
                {menuItem.permission && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {menuItem.permission}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="flex items-center space-x-4">
            {/* Can View */}
            <div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4 text-gray-500" />
              <button
                onClick={() => updatePermission(selectedRole, menuItem.id, 'view', !permission?.canView)}
                disabled={saving}
                className={`p-1 rounded ${
                  permission?.canView
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {permission?.canView ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <XMarkIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Can Access */}
            <div className="flex items-center space-x-2">
              <KeyIcon className="h-4 w-4 text-gray-500" />
              <button
                onClick={() => updatePermission(selectedRole, menuItem.id, 'access', !permission?.canAccess)}
                disabled={saving}
                className={`p-1 rounded ${
                  permission?.canAccess
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {permission?.canAccess ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <XMarkIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {menuItem.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getIconForName = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'home': '🏠',
      'users': '👥',
      'user': '👤',
      'building-office': '🏢',
      'chart-bar': '📊',
      'computer-desktop': '💻',
      'cog': '⚙️',
      'briefcase': '💼',
      'clock': '🕐',
      'calendar': '📅',
      'currency-dollar': '💰',
      'document-text': '📄',
      'swatch': '🎨',
      'bell': '🔔',
    };
    return iconMap[iconName] || '📄';
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Quản lý Quyền Truy cập Menu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý quyền hiển thị và truy cập menu cho từng vai trò người dùng
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chọn Vai trò
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name} (Level {role.level})
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chú thích:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Có thể xem menu</span>
          </div>
          <div className="flex items-center space-x-2">
            <KeyIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Có thể truy cập</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Được phép</span>
          </div>
          <div className="flex items-center space-x-2">
            <XMarkIcon className="h-4 w-4 text-red-600" />
            <span className="text-gray-600 dark:text-gray-400">Không được phép</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Menu Items
            </h3>
            {saving && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Đang lưu...
              </div>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {menuItems.map(menuItem => renderMenuItem(menuItem))}
        </div>
      </div>
    </div>
  );
};

export default RoleMenuPermissionsManager;

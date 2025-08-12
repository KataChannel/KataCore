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
  parentId?: string;
  children?: MenuItem[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions?: any;
}

interface RoleMenuPermission {
  id: string;
  roleId: string;
  menuItemId: string;
  canView: boolean;
  canAccess: boolean;
  menuItem?: MenuItem;
  role?: Role;
}

const RoleMenuPermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<Record<string, RoleMenuPermission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Reload permissions when role changes
  useEffect(() => {
    if (selectedRole && roles.length > 0) {
      // Ensure permissions are loaded for the selected role
      const roleExists = roles.find(r => r.id === selectedRole);
      if (roleExists && !permissions[selectedRole]) {
        loadPermissionsForRole(selectedRole);
      }
    }
  }, [selectedRole, roles]);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Load permissions for a specific role
  const loadPermissionsForRole = async (roleId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${roleId}`, { headers });
      
      if (permResponse.ok) {
        const permData = await permResponse.json();
        
        let rolePermissions: RoleMenuPermission[] = [];
        if (Array.isArray(permData)) {
          rolePermissions = permData;
        } else if (permData?.permissions && Array.isArray(permData.permissions)) {
          rolePermissions = permData.permissions;
        } else if (permData?.data && Array.isArray(permData.data)) {
          rolePermissions = permData.data;
        }
        
        setPermissions(prev => ({
          ...prev,
          [roleId]: rolePermissions,
        }));
      }
    } catch (error) {
      console.warn(`Error loading permissions for role ${roleId}:`, error);
    }
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get auth token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load roles with enhanced error handling
      try {
        console.log('Loading roles...');
        const rolesResponse = await fetch('/api/admin/roles', { headers });
        
        if (!rolesResponse.ok) {
          if (rolesResponse.status === 401) {
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return;
          }
          if (rolesResponse.status === 403) {
            setError('Bạn không có quyền truy cập chức năng này.');
            return;
          }
          throw new Error(`HTTP ${rolesResponse.status}: ${rolesResponse.statusText}`);
        }
        
        const rolesResponseData = await rolesResponse.json();
        console.log('Roles response:', rolesResponseData);
        
        // Handle different response formats
        let rolesData: Role[] = [];
        if (Array.isArray(rolesResponseData)) {
          rolesData = rolesResponseData;
        } else if (rolesResponseData?.roles && Array.isArray(rolesResponseData.roles)) {
          rolesData = rolesResponseData.roles;
        } else if (rolesResponseData?.data && Array.isArray(rolesResponseData.data)) {
          rolesData = rolesResponseData.data;
        } else if (rolesResponseData?.success && rolesResponseData?.roles) {
          rolesData = rolesResponseData.roles;
        }
        
        if (!Array.isArray(rolesData) || rolesData.length === 0) {
          console.warn('No roles found, using fallback roles');
          rolesData = [
            { id: 'super_admin', name: 'Super Administrator', description: 'Full system access', level: 10 },
            { id: 'admin', name: 'Administrator', description: 'Admin access', level: 9 },
            { id: 'manager', name: 'Manager', description: 'Manager access', level: 5 },
            { id: 'user', name: 'User', description: 'Basic user access', level: 1 }
          ];
        }
        
        console.log('Final roles data:', rolesData);
        setRoles(rolesData);
        
        // Set default selected role
        if (rolesData.length > 0 && rolesData[0] && !selectedRole) {
          setSelectedRole(rolesData[0].id);
        }
        
      } catch (rolesError) {
        console.error('Error loading roles:', rolesError);
        setError(`Lỗi tải danh sách vai trò: ${rolesError instanceof Error ? rolesError.message : 'Unknown error'}`);
        return;
      }

      // Load menu items with enhanced error handling
      try {
        console.log('Loading menu items...');
        const menuResponse = await fetch('/api/admin/menu-items?adminView=true', { headers });
        
        if (!menuResponse.ok) {
          throw new Error(`HTTP ${menuResponse.status}: ${menuResponse.statusText}`);
        }
        
        const menuData = await menuResponse.json();
        console.log('Menu items response:', menuData);
        
        // Handle different response formats
        let menuItemsData: MenuItem[] = [];
        if (Array.isArray(menuData)) {
          menuItemsData = menuData;
        } else if (menuData?.menuItems && Array.isArray(menuData.menuItems)) {
          menuItemsData = menuData.menuItems;
        } else if (menuData?.data && Array.isArray(menuData.data)) {
          menuItemsData = menuData.data;
        }
        
        console.log('Final menu items data:', menuItemsData);
        setMenuItems(menuItemsData);
        
      } catch (menuError) {
        console.error('Error loading menu items:', menuError);
        setError(`Lỗi tải danh sách menu: ${menuError instanceof Error ? menuError.message : 'Unknown error'}`);
        return;
      }

      // Load permissions for all roles
      await loadAllPermissions(headers);

    } catch (error) {
      console.error('Error in loadData:', error);
      setError(`Lỗi tải dữ liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPermissions = async (headers: Record<string, string>) => {
    try {
      const permissionsData: Record<string, RoleMenuPermission[]> = {};
      
      for (const role of roles) {
        try {
          console.log(`Loading permissions for role: ${role.name} (${role.id})`);
          const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${role.id}`, { headers });
          
          if (permResponse.ok) {
            const permData = await permResponse.json();
            console.log(`Permissions for ${role.name}:`, permData);
            
            // Handle different response formats
            if (Array.isArray(permData)) {
              permissionsData[role.id] = permData;
            } else if (permData?.permissions && Array.isArray(permData.permissions)) {
              permissionsData[role.id] = permData.permissions;
            } else if (permData?.data && Array.isArray(permData.data)) {
              permissionsData[role.id] = permData.data;
            } else {
              console.warn(`Unexpected permissions format for ${role.name}:`, permData);
              permissionsData[role.id] = [];
            }
          } else {
            console.warn(`Failed to load permissions for role ${role.name}: ${permResponse.status}`);
            permissionsData[role.id] = [];
          }
        } catch (permError) {
          console.warn(`Error loading permissions for role ${role.name}:`, permError);
          permissionsData[role.id] = [];
        }
      }
      
      console.log('All permissions loaded:', permissionsData);
      setPermissions(permissionsData);
      
    } catch (error) {
      console.error('Error loading permissions:', error);
      setError(`Lỗi tải quyền: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updatePermission = async (roleId: string, menuItemId: string, type: 'view' | 'access', value: boolean) => {
    try {
      setSaving(true);
      setError('');

      // Get auth token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const currentPermission = permissions[roleId]?.find(p => p.menuItemId === menuItemId);
      
      const requestData = {
        roleId,
        menuItemId,
        canView: type === 'view' ? value : currentPermission?.canView ?? true,
        canAccess: type === 'access' ? value : currentPermission?.canAccess ?? true,
      };

      console.log('Updating permission:', requestData);
      
      const response = await fetch('/api/admin/role-menu-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Permission update result:', result);

      // Reload permissions for this role to ensure data consistency
      const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (permResponse.ok) {
        const permData = await permResponse.json();
        console.log('Refreshed permissions:', permData);
        
        // Handle different response formats
        let updatedPermissions: RoleMenuPermission[] = [];
        if (Array.isArray(permData)) {
          updatedPermissions = permData;
        } else if (permData?.permissions && Array.isArray(permData.permissions)) {
          updatedPermissions = permData.permissions;
        } else if (permData?.data && Array.isArray(permData.data)) {
          updatedPermissions = permData.data;
        }
        
        setPermissions(prev => ({
          ...prev,
          [roleId]: updatedPermissions,
        }));
        
        setSuccessMessage('Cập nhật quyền thành công!');
      } else {
        console.warn('Failed to refresh permissions after update');
        // If refresh fails, manually update the local state
        const updatedPermissions = [...(permissions[roleId] || [])];
        const existingIndex = updatedPermissions.findIndex(p => p.menuItemId === menuItemId);
        
        if (existingIndex >= 0 && updatedPermissions[existingIndex]) {
          const existing = updatedPermissions[existingIndex];
          updatedPermissions[existingIndex] = {
            ...existing,
            [type === 'view' ? 'canView' : 'canAccess']: value,
          };
        } else {
          const newPermission: RoleMenuPermission = {
            id: `${roleId}_${menuItemId}`,
            roleId,
            menuItemId,
            canView: type === 'view' ? value : true,
            canAccess: type === 'access' ? value : true,
          };
          updatedPermissions.push(newPermission);
        }
        
        setPermissions(prev => ({
          ...prev,
          [roleId]: updatedPermissions,
        }));
        
        setSuccessMessage('Cập nhật quyền thành công!');
      }

    } catch (error) {
      console.error('Error updating permission:', error);
      setError(`Lỗi cập nhật quyền: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Role Selector and Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn Vai trò
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
          </div>
          
          {/* Current role info */}
          {selectedRole && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                const currentRole = roles.find(r => r.id === selectedRole);
                const permCount = permissions[selectedRole]?.length || 0;
                return (
                  <div>
                    <div><strong>Vai trò:</strong> {currentRole?.name}</div>
                    <div><strong>Quyền đã cấp:</strong> {permCount} menu</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tải...
            </>
          ) : (
            <>
              🔄 Làm mới
            </>
          )}
        </button>
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Menu Items
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tổng cộng: {menuItems.length} menu
                {selectedRole && (() => {
                  const permCount = permissions[selectedRole]?.length || 0;
                  const canViewCount = permissions[selectedRole]?.filter(p => p.canView).length || 0;
                  const canAccessCount = permissions[selectedRole]?.filter(p => p.canAccess).length || 0;
                  return ` • Đã cấp quyền: ${permCount} • Có thể xem: ${canViewCount} • Có thể truy cập: ${canAccessCount}`;
                })()}
              </p>
            </div>
            {saving && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Đang lưu...
              </div>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {menuItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">📂</div>
              <p>Không có menu items nào được tìm thấy.</p>
              <button
                onClick={loadData}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔄 Thử lại
              </button>
            </div>
          ) : (
            menuItems.map(menuItem => renderMenuItem(menuItem))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleMenuPermissionsManager;

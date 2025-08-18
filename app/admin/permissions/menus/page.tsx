'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon as CloseIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  TableCellsIcon,
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

// Form data interface for menu creation/editing
interface MenuFormData {
  title: string;
  titleVi: string;
  path: string;
  icon: string;
  permission: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

const RoleMenuPermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<Record<string, RoleMenuPermission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // CRUD states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    title: '',
    titleVi: '',
    path: '',
    icon: '',
    permission: '',
    parentId: '',
    sortOrder: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filtered and sorted menu items
  const filteredMenuItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.titleVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.permission.toLowerCase().includes(searchTerm.toLowerCase());

      // Active filter
      const activeMatch = filterActive === 'all' || 
        (filterActive === 'active' && item.isActive) ||
        (filterActive === 'inactive' && !item.isActive);

      return searchMatch && activeMatch;
    });

    // Sort by sortOrder and then by title
    return filtered.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return (a.titleVi || a.title).localeCompare(b.titleVi || b.title);
    });
  }, [menuItems, searchTerm, filterActive]);

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

  // CRUD Functions
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Tên menu là bắt buộc';
    if (!formData.titleVi.trim()) errors.titleVi = 'Tên tiếng Việt là bắt buộc';
    if (!formData.path.trim()) errors.path = 'Đường dẫn là bắt buộc';
    if (!formData.icon.trim()) errors.icon = 'Icon là bắt buộc';
    if (!formData.permission.trim()) errors.permission = 'Permission là bắt buộc';

    // Validate path format
    if (formData.path && !formData.path.startsWith('/')) {
      errors.path = 'Đường dẫn phải bắt đầu bằng "/"';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleVi: '',
      path: '',
      icon: '',
      permission: '',
      parentId: '',
      sortOrder: 0,
      isActive: true,
    });
    setFormErrors({});
    setEditingMenu(null);
  };

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, menuId: string) => {
    e.dataTransfer.setData('text/plain', menuId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetMenuId: string) => {
    e.preventDefault();
    const draggedMenuId = e.dataTransfer.getData('text/plain');
    
    if (draggedMenuId === targetMenuId) return;

    const draggedMenu = menuItems.find(m => m.id === draggedMenuId);
    const targetMenu = menuItems.find(m => m.id === targetMenuId);
    
    if (!draggedMenu || !targetMenu) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      // Reorder the items
      const newSortOrder = targetMenu.sortOrder;
      const oldSortOrder = draggedMenu.sortOrder;
      
      // Update the dragged item's sort order
      const response = await fetch(`/api/admin/menu-items/${draggedMenuId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...draggedMenu,
          sortOrder: newSortOrder
        })
      });

      if (response.ok) {
        // Adjust other items' sort orders if needed
        const updatedMenuItems = menuItems.map(item => {
          if (item.id === draggedMenuId) {
            return { ...item, sortOrder: newSortOrder };
          } else if (oldSortOrder < newSortOrder && item.sortOrder > oldSortOrder && item.sortOrder <= newSortOrder) {
            return { ...item, sortOrder: item.sortOrder - 1 };
          } else if (oldSortOrder > newSortOrder && item.sortOrder >= newSortOrder && item.sortOrder < oldSortOrder) {
            return { ...item, sortOrder: item.sortOrder + 1 };
          }
          return item;
        });

        setMenuItems(updatedMenuItems);
        setSuccessMessage('Đã cập nhật thứ tự menu');
      } else {
        throw new Error('Failed to update menu order');
      }
    } catch (error) {
      console.error('Error reordering menu:', error);
      setError('Lỗi khi cập nhật thứ tự menu');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMenu = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditMenu = (menu: MenuItem) => {
    setFormData({
      title: menu.title,
      titleVi: menu.titleVi,
      path: menu.path,
      icon: menu.icon,
      permission: menu.permission,
      parentId: menu.parentId || '',
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
    });
    setEditingMenu(menu);
    setShowEditModal(true);
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const apiData = {
        ...formData,
        parentId: formData.parentId || null,
      };

      if (editingMenu) {
        // Update existing menu
        const response = await fetch('/api/admin/menu-items', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id: editingMenu.id, ...apiData }),
        });

        if (!response.ok) {
          throw new Error('Cập nhật menu thất bại');
        }

        setSuccessMessage('Cập nhật menu thành công!');
        setShowEditModal(false);
      } else {
        // Create new menu
        const response = await fetch('/api/admin/menu-items', {
          method: 'POST',
          headers,
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          throw new Error('Tạo menu thất bại');
        }

        setSuccessMessage('Tạo menu thành công!');
        setShowCreateModal(false);

        // Auto-grant full permissions for admin roles
        const newMenu = await response.json();
        await grantAdminPermissions(newMenu.id);
      }

      // Reload data
      await loadData();
      resetForm();

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menuId: string, menuTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa menu "${menuTitle}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`/api/admin/menu-items?id=${menuId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Xóa menu thất bại');
      }

      setSuccessMessage('Xóa menu thành công!');
      await loadData();

    } catch (error) {
      console.error('Error deleting menu:', error);
      setError(`Lỗi xóa menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Auto-grant admin permissions for new menus
  const grantAdminPermissions = async (menuId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Get admin roles (level >= 8)
      const adminRoles = roles.filter(role => role.level >= 8);

      for (const role of adminRoles) {
        await fetch('/api/admin/role-menu-permissions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            roleId: role.id,
            menuItemId: menuId,
            canView: true,
            canAccess: true,
          }),
        });
      }

      console.log(`Auto-granted permissions for menu ${menuId} to ${adminRoles.length} admin roles`);
    } catch (error) {
      console.warn('Failed to auto-grant admin permissions:', error);
    }
  };

  const renderMenuItem = (menuItem: MenuItem, level = 0) => {
    const hasChildren = menuItem.children && menuItem.children.length > 0;
    const isExpanded = expandedMenus.has(menuItem.id);
    const permission = getPermissionForMenuItem(selectedRole, menuItem.id);

    return (
      <div key={menuItem.id}>
        <div
          className={`flex items-center p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-move ${
            level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, menuItem.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, menuItem.id)}
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
              <div className="text-lg">{getIconForName(menuItem.icon)}</div>
              <div className="flex-1">
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
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    menuItem.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {menuItem.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    #{menuItem.sortOrder}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions - only show when permissions panel is visible */}
          {showPermissions && selectedRole && (
            <div className="flex items-center space-x-4 mr-4">
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
          )}

          {/* CRUD Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEditMenu(menuItem)}
              className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors"
              title="Chỉnh sửa menu"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteMenu(menuItem.id, menuItem.title)}
              className="p-1 rounded text-red-600 hover:bg-red-100 transition-colors"
              title="Xóa menu"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
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

  // Table view renderer
  const renderTableView = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Bars3Icon className="h-4 w-4" />
                    <span>Menu</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Đường dẫn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                {showPermissions && selectedRole && (
                  <>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>Xem</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-1">
                        <KeyIcon className="h-4 w-4" />
                        <span>Truy cập</span>
                      </div>
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMenuItems.map((menuItem, index) => {
                const permission = getPermissionForMenuItem(selectedRole, menuItem.id);
                return (
                  <tr
                    key={menuItem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, menuItem.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, menuItem.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{getIconForName(menuItem.icon)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {menuItem.titleVi || menuItem.title}
                          </div>
                          {menuItem.title !== menuItem.titleVi && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {menuItem.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {menuItem.path}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                      <code className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">
                        {menuItem.permission}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700">
                        {menuItem.sortOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        menuItem.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {menuItem.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    {showPermissions && selectedRole && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => updatePermission(selectedRole, menuItem.id, 'view', !permission?.canView)}
                            disabled={saving}
                            className={`p-2 rounded-lg transition-colors ${
                              permission?.canView
                                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {permission?.canView ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : (
                              <XMarkIcon className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => updatePermission(selectedRole, menuItem.id, 'access', !permission?.canAccess)}
                            disabled={saving}
                            className={`p-2 rounded-lg transition-colors ${
                              permission?.canAccess
                                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {permission?.canAccess ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : (
                              <XMarkIcon className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditMenu(menuItem)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Chỉnh sửa menu"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menuItem.id, menuItem.title)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Xóa menu"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không có menu items nào được tìm thấy.</p>
          </div>
        )}
      </div>
    );
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

      {/* Enhanced Controls Section */}
      <div className="mb-6 space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    viewMode === 'table' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <TableCellsIcon className="h-4 w-4" />
                  <span>Bảng</span>
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    viewMode === 'tree' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Bars3Icon className="h-4 w-4" />
                  <span>Cây</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-2 ${
                showPermissions
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>{showPermissions ? 'Ẩn phân quyền' : 'Hiện phân quyền'}</span>
            </button>
            
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>

            <button
              onClick={handleCreateMenu}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Tạo Menu Mới</span>
            </button>
          </div>
        </div>

        {/* Role Selector (only shown when permissions are visible) */}
        {showPermissions && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn Vai trò để phân quyền
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">-- Chọn vai trò --</option>
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
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Hiển thị {filteredMenuItems.length} / {menuItems.length} menu items
        {searchTerm && (
          <span className="ml-2">
            • Tìm kiếm: "<strong>{searchTerm}</strong>"
          </span>
        )}
      </div>

      {/* Legend - only show when permissions are visible */}
      {showPermissions && (
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
            <div className="flex items-center space-x-2">
              <Bars3Icon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Kéo thả để sắp xếp</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Display */}
      {viewMode === 'table' ? (
        // Table View
        renderTableView()
      ) : (
        // Tree View
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Menu Structure
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tổng cộng: {menuItems.length} menu
                  {selectedRole && showPermissions && (() => {
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
            {filteredMenuItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📂</div>
                <p>Không có menu items nào được tìm thấy.</p>
                {searchTerm ? (
                  <div className="mt-2">
                    <p className="text-sm">Thử tìm kiếm với từ khóa khác hoặc</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      xóa bộ lọc tìm kiếm
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loadData}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    🔄 Thử lại
                  </button>
                )}
              </div>
            ) : (
              filteredMenuItems.map(menuItem => renderMenuItem(menuItem))
            )}
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tạo Menu Mới
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên Menu (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Dashboard"
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên Menu (Tiếng Việt) *
                    </label>
                    <input
                      type="text"
                      value={formData.titleVi}
                      onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Bảng điều khiển"
                    />
                    {formErrors.titleVi && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.titleVi}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đường dẫn *
                  </label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="/admin/dashboard"
                  />
                  {formErrors.path && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.path}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon *
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="HomeIcon"
                    />
                    {formErrors.icon && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.icon}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Permission *
                    </label>
                    <input
                      type="text"
                      value={formData.permission}
                      onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="read:dashboard"
                    />
                    {formErrors.permission && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.permission}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Menu Cha
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">-- Không có menu cha --</option>
                      {menuItems.filter(m => !m.parentId).map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.titleVi || menu.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thứ tự sắp xếp
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Kích hoạt menu</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Tạo Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chỉnh sửa Menu
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên Menu (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên Menu (Tiếng Việt) *
                    </label>
                    <input
                      type="text"
                      value={formData.titleVi}
                      onChange={(e) => setFormData({ ...formData, titleVi: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {formErrors.titleVi && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.titleVi}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đường dẫn *
                  </label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formErrors.path && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.path}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon *
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {formErrors.icon && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.icon}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Permission *
                    </label>
                    <input
                      type="text"
                      value={formData.permission}
                      onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {formErrors.permission && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.permission}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Menu Cha
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">-- Không có menu cha --</option>
                      {menuItems.filter(m => !m.parentId && m.id !== editingMenu?.id).map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.titleVi || menu.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thứ tự sắp xếp
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Kích hoạt menu</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Menu'}
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

export default RoleMenuPermissionsManager;

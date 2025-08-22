import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  titleVi: string;
  path: string;
  icon: string;
  permission: string;
  sortOrder: number;
  isActive: boolean;
  canAccess: boolean;
  children?: MenuItem[];
}

interface UseMenuItemsOptions {
  userId?: string | undefined;
  roleId?: string | undefined;
}

export const useMenuItems = (options: UseMenuItemsOptions = {}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // For admin view, get all menu items
      if (options.userId || options.roleId) {
        if (options.userId) params.append('userId', options.userId);
        if (options.roleId) params.append('roleId', options.roleId);
      } else {
        // Fallback to admin view to get all menu items
        params.append('adminView', 'true');
      }

      const response = await fetch(`/api/admin/menu-items?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch menu items, even without user credentials (will use adminView)
    fetchMenuItems();
  }, [options.userId, options.roleId]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};

// Icon mapping utility
export const getIconComponent = (iconName: string) => {
  // This will be used in the admin layout to convert string icons back to components
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

// Hook to load dynamic menu items from database
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/lib/auth';

interface MenuItem {
  id: string;
  title: string;
  titleVi?: string;
  path: string;
  icon: string;
  permission?: string;
  sortOrder: number;
  children?: MenuItem[];
}

interface MenuHookReturn {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCRMMenus: () => MenuItem | undefined;
  getSocialMenus: () => MenuItem | undefined;
  getMenusByCategory: (category: string) => MenuItem[];
}

export function useMenuItems(options?: { userId?: string; roleId?: string; adminView?: boolean }): MenuHookReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUnifiedAuth();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user && !options?.userId && !options?.roleId) {
        setMenuItems([]);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (options?.adminView) {
        params.append('adminView', 'true');
      } else if (options?.roleId) {
        params.append('roleId', options.roleId);
      } else if (options?.userId) {
        params.append('userId', options.userId);
      } else if (user?.roleId) {
        params.append('roleId', user.roleId);
      }

      // Fetch menu items for current user's role
      const response = await fetch(`/api/admin/menu-items?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data to match expected structure
      const transformedMenus = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        titleVi: item.titleVi,
        path: item.path,
        icon: item.icon,
        permission: item.permission,
        sortOrder: item.sortOrder,
        children: item.children?.map((child: any) => ({
          id: child.id,
          title: child.title,
          titleVi: child.titleVi,
          path: child.path,
          icon: child.icon,
          permission: child.permission,
          sortOrder: child.sortOrder,
        })) || []
      }));

      // Sort by sortOrder
      transformedMenus.sort((a: MenuItem, b: MenuItem) => a.sortOrder - b.sortOrder);
      transformedMenus.forEach((menu: MenuItem) => {
        if (menu.children) {
          menu.children.sort((a: MenuItem, b: MenuItem) => a.sortOrder - b.sortOrder);
        }
      });

      setMenuItems(transformedMenus);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
      
      // Fallback to empty array on error
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [user?.roleId, options?.userId, options?.roleId, options?.adminView]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
    getCRMMenus: () => {
      return menuItems.find(item => 
        item.title.toLowerCase() === 'crm' || 
        item.titleVi?.toLowerCase() === 'crm'
      );
    },
    getSocialMenus: () => {
      return menuItems.find(item => 
        item.title.toLowerCase() === 'social media' || 
        item.titleVi?.toLowerCase().includes('mạng xã hội')
      );
    },
    getMenusByCategory: (category: string) => {
      return menuItems.filter(item => 
        item.title.toLowerCase().includes(category.toLowerCase()) ||
        item.titleVi?.toLowerCase().includes(category.toLowerCase())
      );
    },
  };
}

// Helper function to get icon component from string name
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  CogIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SwatchIcon,
  BellIcon,
  UserIcon,
  // Social media icons
  ShareIcon,
  HashtagIcon,
  PhotoIcon,
  CameraIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export const iconMapping = {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  CogIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SwatchIcon,
  BellIcon,
  UserIcon,
  // Social media icons
  ShareIcon,
  HashtagIcon,
  PhotoIcon,
  CameraIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
};

export function getIconComponent(iconName: string) {
  return iconMapping[iconName as keyof typeof iconMapping] || HomeIcon;
}

'use client';

import { useState, useEffect } from 'react';

interface PermissionHookReturn {
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  userRole: string | null;
  userLevel: number | null;
}

export function usePermissions(): PermissionHookReturn {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number | null>(null);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Get current user from API (avoid direct authService import)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Get user info from API instead of authService
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        setIsLoading(false);
        return;
      }

      const user = await userResponse.json();
      
      if (!user || !user.role) {
        setIsLoading(false);
        return;
      }

      setUserRole(user.role.name);
      setUserLevel(user.role.level || 0);

      // Get user's menu permissions
      const response = await fetch(`/api/admin/role-menu-permissions?roleId=${user.roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userPermissions: string[] = [];
        
        if (Array.isArray(data)) {
          data.forEach((roleMenu: any) => {
            if (roleMenu.canAccess && roleMenu.menuItem) {
              userPermissions.push(roleMenu.menuItem.permission);
            }
          });
        }

        setPermissions(userPermissions);
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (userLevel && userLevel >= 10) {
      return true;
    }

    // Admin level (9) has most permissions except dev tools
    if (userLevel && userLevel >= 9 && !permission.includes('dev')) {
      return true;
    }

    // Check specific permission
    return permissions.includes(permission);
  };

  return {
    hasPermission,
    isLoading,
    userRole,
    userLevel
  };
}

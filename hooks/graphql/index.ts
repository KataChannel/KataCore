import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_USERS, 
  GET_USER, 
  GET_ROLES, 
  GET_ROLE,
  GET_MENU_ITEMS,
  GET_MENU_TREE,
  GET_ROLE_MENU_PERMISSIONS,
  GET_DASHBOARD_STATS
} from '@/lib/apollo/queries';
import {
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
  CREATE_ROLE_MENU_PERMISSION,
  UPDATE_ROLE_MENU_PERMISSION,
  DELETE_ROLE_MENU_PERMISSION,
  BULK_UPDATE_ROLE_MENU_PERMISSIONS
} from '@/lib/apollo/mutations';

// User Hooks
export function useUsers(options?: {
  skip?: number;
  take?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}) {
  return useQuery(GET_USERS, {
    variables: options,
    notifyOnNetworkStatusChange: true,
  });
}

export function useUser(id: string) {
  return useQuery(GET_USER, {
    variables: { id },
    skip: !id,
  });
}

export function useCreateUser() {
  return useMutation(CREATE_USER, {
    refetchQueries: [GET_USERS, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

export function useUpdateUser() {
  return useMutation(UPDATE_USER, {
    refetchQueries: [GET_USERS],
  });
}

export function useDeleteUser() {
  return useMutation(DELETE_USER, {
    refetchQueries: [GET_USERS, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

// Role Hooks
export function useRoles(options?: {
  skip?: number;
  take?: number;
  search?: string;
  isSystemRole?: boolean;
}) {
  return useQuery(GET_ROLES, {
    variables: options,
    notifyOnNetworkStatusChange: true,
  });
}

export function useRole(id: string) {
  return useQuery(GET_ROLE, {
    variables: { id },
    skip: !id,
  });
}

export function useCreateRole() {
  return useMutation(CREATE_ROLE, {
    refetchQueries: [GET_ROLES, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

export function useUpdateRole() {
  return useMutation(UPDATE_ROLE, {
    refetchQueries: [GET_ROLES],
  });
}

export function useDeleteRole() {
  return useMutation(DELETE_ROLE, {
    refetchQueries: [GET_ROLES, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

// Menu Item Hooks
export function useMenuItems(options?: {
  skip?: number;
  take?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
}) {
  return useQuery(GET_MENU_ITEMS, {
    variables: options,
    notifyOnNetworkStatusChange: true,
  });
}

export function useMenuTree(options?: {
  roleId?: string;
  isActive?: boolean;
}) {
  return useQuery(GET_MENU_TREE, {
    variables: options,
  });
}

export function useCreateMenuItem() {
  return useMutation(CREATE_MENU_ITEM, {
    refetchQueries: [GET_MENU_ITEMS, GET_MENU_TREE, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

export function useUpdateMenuItem() {
  return useMutation(UPDATE_MENU_ITEM, {
    refetchQueries: [GET_MENU_ITEMS, GET_MENU_TREE],
  });
}

export function useDeleteMenuItem() {
  return useMutation(DELETE_MENU_ITEM, {
    refetchQueries: [GET_MENU_ITEMS, GET_MENU_TREE, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

// Permission Hooks
export function useRoleMenuPermissions(options?: {
  roleId?: string;
  menuItemId?: string;
  canView?: boolean;
  canAccess?: boolean;
}) {
  return useQuery(GET_ROLE_MENU_PERMISSIONS, {
    variables: options,
    notifyOnNetworkStatusChange: true,
  });
}

export function useCreateRoleMenuPermission() {
  return useMutation(CREATE_ROLE_MENU_PERMISSION, {
    refetchQueries: [GET_ROLE_MENU_PERMISSIONS, GET_ROLE],
  });
}

export function useUpdateRoleMenuPermission() {
  return useMutation(UPDATE_ROLE_MENU_PERMISSION, {
    refetchQueries: [GET_ROLE_MENU_PERMISSIONS, GET_ROLE],
  });
}

export function useDeleteRoleMenuPermission() {
  return useMutation(DELETE_ROLE_MENU_PERMISSION, {
    refetchQueries: [GET_ROLE_MENU_PERMISSIONS, GET_ROLE],
  });
}

export function useBulkUpdateRoleMenuPermissions() {
  return useMutation(BULK_UPDATE_ROLE_MENU_PERMISSIONS, {
    refetchQueries: [GET_ROLE_MENU_PERMISSIONS, GET_ROLE, GET_DASHBOARD_STATS],
    awaitRefetchQueries: true,
  });
}

// Dashboard Hook
export function useDashboardStats() {
  return useQuery(GET_DASHBOARD_STATS, {
    pollInterval: 30000, // Poll every 30 seconds
  });
}

// Utility Hooks
export function useRefreshCache() {
  const client = useApolloClient();
  
  const refreshCache = () => {
    client.refetchQueries({
      include: 'active',
    });
  };
  
  return refreshCache;
}

export function useClearCache() {
  const client = useApolloClient();
  
  const clearCache = () => {
    client.cache.reset();
  };
  
  return clearCache;
}

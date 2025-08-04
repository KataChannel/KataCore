'use client';
import { useState, useEffect } from 'react';
import { Role, User, Permission, RoleForm, UserForm } from '../types';

export const usePermissionData = (canManagePermissions: boolean) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    if (canManagePermissions) {
      loadRoles();
      loadUsers();
      loadPermissions();
    }
  }, [canManagePermissions]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load roles');
      }

      const data = await response.json();
      setRoles(data.roles || []);
      setAvailableModules(data.modules || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refetchData = () => {
    setError(null);
    loadRoles();
    loadUsers();
    loadPermissions();
  };

  return {
    loading,
    error,
    roles,
    users,
    permissions,
    availableModules,
    setError,
    loadRoles,
    loadUsers,
    loadPermissions,
    refetchData,
  };
};

export const useRoleOperations = (loadRoles: () => Promise<void>, setError: (error: string) => void) => {
  const handleCreateRole = async (roleForm: RoleForm) => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(roleForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }

      await loadRoles();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const handleUpdateRole = async (selectedRole: Role, roleForm: RoleForm) => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          roleId: selectedRole.id,
          ...roleForm,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      await loadRoles();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return false;

    try {
      const response = await fetch(`/api/admin/roles?roleId=${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      await loadRoles();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
  };
};

export const useUserOperations = (loadUsers: () => Promise<void>, setError: (error: string) => void) => {
  const handleUpdateUserRole = async (selectedUser: User, userForm: UserForm) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          roleId: userForm.roleId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      await loadUsers();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    handleUpdateUserRole,
  };
};

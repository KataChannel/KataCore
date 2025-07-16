import { Role, User, Permission } from '../types';

export const filterRoles = (
  roles: Role[], 
  searchTerm: string, 
  moduleFilter: string, 
  statusFilter: string
) => {
  return roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !moduleFilter || role.modules.includes(moduleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    
    return matchesSearch && matchesModule && matchesStatus;
  });
};

export const filterUsers = (
  users: User[], 
  searchTerm: string, 
  statusFilter: string
) => {
  return users.filter((user) => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });
};

export const filterPermissions = (
  permissions: Permission[], 
  searchTerm: string, 
  moduleFilter: string
) => {
  return permissions.filter((permission) => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !moduleFilter || permission.module === moduleFilter;
    
    return matchesSearch && matchesModule;
  });
};

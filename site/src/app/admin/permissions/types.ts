export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  level: number;
  modules: string[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface User {
  avatar: string;
  username: any;
  isVerified: any;
  id: string;
  email: string;
  displayName: string;
  role: {
    permissions: any;
    id: string;
    name: string;
    level: number;
  };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description: string;
  module: string;
}

export interface RoleForm {
  name: string;
  description: string;
  permissions: string[];
  modules: string[];
  level: number;
}

export interface UserForm {
  roleId: string;
  permissions: string[];
}

export type TabType = 'roles' | 'users' | 'permissions';

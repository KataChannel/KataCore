import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { 
  createUserLoader, 
  createRoleLoader, 
  createMenuLoader, 
  createPermissionLoader,
  createUserRolesLoader,
  createRolePermissionsLoader
} from './dataloaders';

export interface Context {
  prisma: PrismaClient;
  dataloaders: {
    userById: DataLoader<string, any>;
    roleById: DataLoader<string, any>;
    menuById: DataLoader<string, any>;
    permissionById: DataLoader<string, any>;
    userRoles: DataLoader<string, any[]>;
    rolePermissions: DataLoader<string, any[]>;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function createContext(prisma: PrismaClient, user?: Context['user']): Context {
  return {
    prisma,
    dataloaders: {
      userById: createUserLoader(prisma),
      roleById: createRoleLoader(prisma),
      menuById: createMenuLoader(prisma),
      permissionById: createPermissionLoader(prisma),
      userRoles: createUserRolesLoader(prisma),
      rolePermissions: createRolePermissionsLoader(prisma),
    },
    user,
  };
}

import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export const createUserLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.users.findMany({
      where: { id: { in: [...ids] } },
      include: {
        roles: true,
        conversations_conversations_createdByIdTousers: true,
        _count: {
          select: {
            conversations_conversations_createdByIdTousers: true,
            messages: true
          }
        }
      }
    });
    
    return ids.map(id => users.find(user => user.id === id));
  });

export const createRoleLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const roles = await prisma.roles.findMany({
      where: { id: { in: [...ids] } },
      include: {
        role_menu_items: {
          include: {
            menuItem: true
          }
        },
        users: true,
        _count: {
          select: {
            users: true,
            role_menu_items: true
          }
        }
      }
    });
    
    return ids.map(id => roles.find(role => role.id === id));
  });

export const createMenuLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const menus = await prisma.menu_items.findMany({
      where: { id: { in: [...ids] } },
      include: {
        parent: true,
        children: true,
        role_menu_items: {
          include: {
            role: true
          }
        },
        _count: {
          select: {
            children: true,
            role_menu_items: true
          }
        }
      }
    });
    
    return ids.map(id => menus.find(menu => menu.id === id));
  });

export const createPermissionLoader = (prisma: PrismaClient) =>
  new DataLoader(async (ids: readonly string[]) => {
    const permissions = await prisma.role_menu_items.findMany({
      where: { id: { in: [...ids] } },
      include: {
        role: true,
        menuItem: true
      }
    });
    
    return ids.map(id => permissions.find((permission: any) => permission.id === id));
  });

export const createUserRolesLoader = (prisma: PrismaClient) =>
  new DataLoader(async (userIds: readonly string[]) => {
    // Since users have direct roleId relationship, we get roles directly
    const users = await prisma.users.findMany({
      where: { id: { in: [...userIds] } },
      include: {
        roles: {
          include: {
            role_menu_items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });
    
    return userIds.map(userId => {
      const user = users.find(u => u.id === userId);
      return user ? [user.roles] : [];
    });
  });

export const createRolePermissionsLoader = (prisma: PrismaClient) =>
  new DataLoader(async (roleIds: readonly string[]) => {
    const rolePermissions = await prisma.role_menu_items.findMany({
      where: { roleId: { in: [...roleIds] } },
      include: {
        menuItem: true,
        role: true
      }
    });
    
    return roleIds.map(roleId => 
      rolePermissions.filter((rp: any) => rp.roleId === roleId)
    );
  });

import { queryType, objectType, arg, nonNull, list, stringArg, intArg, booleanArg } from 'nexus';
import { transformFields } from '../utils/field-transformer';

export const Query = queryType({
  definition(t) {
    // Users queries
    t.list.field('users', {
      type: 'User',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        roleId: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, roleId, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { displayName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (roleId) {
          where.roleId = roleId;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.users.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('user', {
      type: 'User',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.dataloaders.userById.load(args.id);
      }
    });

    t.int('usersCount', {
      args: {
        search: stringArg(),
        roleId: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx) => {
        const { search, roleId, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { displayName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (roleId) {
          where.roleId = roleId;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.users.count({ where });
      }
    });

    // Roles queries
    t.list.field('roles', {
      type: 'Role',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        isSystemRole: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, isSystemRole } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (isSystemRole !== undefined) {
          where.isSystemRole = isSystemRole;
        }
        
        return ctx.prisma.roles.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { level: 'asc' },
          ...fields
        });
      }
    });

    t.field('role', {
      type: 'Role',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.dataloaders.roleById.load(args.id);
      }
    });

    // Menu items queries
    t.list.field('menuItems', {
      type: 'MenuItem',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        parentId: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, parentId, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (parentId !== undefined) {
          where.parentId = parentId;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.menu_items.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.field('menuItem', {
      type: 'MenuItem',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.dataloaders.menuById.load(args.id);
      }
    });

    // Menu tree (hierarchical structure)
    t.list.field('menuTree', {
      type: 'MenuItem',
      args: {
        roleId: stringArg(),
        isActive: booleanArg({ default: true }),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { roleId, isActive } = args;
        
        const where: any = {
          parentId: null, // Root level menus
        };
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        const menuItems = await ctx.prisma.menu_items.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
        
        // If roleId is provided, filter by permissions
        if (roleId) {
          // This would require recursive permission checking
          // For now, return all menus (permission filtering can be done client-side)
        }
        
        return menuItems;
      }
    });

    // Role permissions queries
    t.list.field('roleMenuPermissions', {
      type: 'RoleMenuPermission',
      args: {
        roleId: stringArg(),
        menuItemId: stringArg(),
        canView: booleanArg(),
        canAccess: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { roleId, menuItemId, canView, canAccess } = args;
        
        const where: any = {};
        
        if (roleId) {
          where.roleId = roleId;
        }
        
        if (menuItemId) {
          where.menuItemId = menuItemId;
        }
        
        if (canView !== undefined) {
          where.canView = canView;
        }
        
        if (canAccess !== undefined) {
          where.canAccess = canAccess;
        }
        
        return ctx.prisma.role_menu_items.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Dashboard/Stats queries
    t.field('dashboardStats', {
      type: 'DashboardStats',
      resolve: async (_parent, _args, ctx) => {
        const [usersCount, rolesCount, menuItemsCount, permissionsCount] = await Promise.all([
          ctx.prisma.users.count(),
          ctx.prisma.roles.count(),
          ctx.prisma.menu_items.count(),
          ctx.prisma.role_menu_items.count(),
        ]);
        
        return {
          usersCount,
          rolesCount,
          menuItemsCount,
          permissionsCount,
        };
      }
    });
  }
});

// Dashboard stats type
export const DashboardStats = objectType({
  name: 'DashboardStats',
  definition(t) {
    t.nonNull.int('usersCount');
    t.nonNull.int('rolesCount');
    t.nonNull.int('menuItemsCount');
    t.nonNull.int('permissionsCount');
  }
});

import { objectType, extendType, arg, nonNull, list, stringArg, intArg, booleanArg } from 'nexus';
import { transformFields } from '../utils/field-transformer';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('id');
    t.string('email');
    t.string('username');
    t.string('phone');
    t.nonNull.string('displayName');
    t.string('avatar');
    t.string('bio');
    t.nonNull.string('status');
    t.nonNull.boolean('isVerified');
    t.nonNull.boolean('isActive');
    t.field('lastSeen', { type: 'DateTime' });
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });
    t.string('googleId');
    t.string('facebookId');
    t.string('appleId');
    t.nonNull.string('roleId');

    // Relations
    t.field('role', {
      type: 'Role',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.roleById.load(parent.roleId);
      }
    });

    t.list.field('userRoles', {
      type: 'Role',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.userRoles.load(parent.id);
      }
    });

    t.list.field('createdConversations', {
      type: 'Conversation',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.conversations.findMany({
          where: { createdById: parent.id },
          ...fields
        });
      }
    });

    t.int('conversationCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.conversations.count({
          where: { createdById: parent.id }
        });
      }
    });
  }
});

export const Role = objectType({
  name: 'Role',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('permissions');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });
    t.nonNull.boolean('isSystemRole');
    t.nonNull.int('level');
    t.string('modules');

    // Relations
    t.list.field('users', {
      type: 'User',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.users.findMany({
          where: { roleId: parent.id },
          ...fields
        });
      }
    });

    t.list.field('menuPermissions', {
      type: 'RoleMenuPermission',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.rolePermissions.load(parent.id);
      }
    });

    t.int('userCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.users.count({
          where: { roleId: parent.id }
        });
      }
    });
  }
});

export const MenuItem = objectType({
  name: 'MenuItem',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('description');
    t.string('url');
    t.string('icon');
    t.nonNull.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.string('parentId');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('parent', {
      type: 'MenuItem',
      resolve: async (parent, _args, ctx) => {
        if (!parent.parentId) return null;
        return ctx.dataloaders.menuById.load(parent.parentId);
      }
    });

    t.list.field('children', {
      type: 'MenuItem',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.menu_items.findMany({
          where: { parentId: parent.id },
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.list.field('rolePermissions', {
      type: 'RoleMenuPermission',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.role_menu_items.findMany({
          where: { menuItemId: parent.id },
          ...fields
        });
      }
    });

    t.int('childrenCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.menu_items.count({
          where: { parentId: parent.id }
        });
      }
    });
  }
});

export const RoleMenuPermission = objectType({
  name: 'RoleMenuPermission',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('roleId');
    t.nonNull.string('menuItemId');
    t.nonNull.boolean('canView');
    t.nonNull.boolean('canAccess');
    t.nonNull.field('createdAt', { type: 'DateTime' });

    // Relations
    t.field('role', {
      type: 'Role',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.roleById.load(parent.roleId);
      }
    });

    t.field('menuItem', {
      type: 'MenuItem',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.menuById.load(parent.menuItemId);
      }
    });
  }
});

export const Conversation = objectType({
  name: 'Conversation',
  definition(t) {
    t.nonNull.string('id');
    t.string('title');
    t.string('description');
    t.string('avatar');
    t.nonNull.string('type');
    t.nonNull.boolean('isPublic');
    t.nonNull.boolean('isArchived');
    t.field('lastActivity', { type: 'DateTime' });
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });
    t.nonNull.string('createdById');

    // Relations
    t.field('createdBy', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.userById.load(parent.createdById);
      }
    });
  }
});

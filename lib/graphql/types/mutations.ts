import { mutationType, arg, nonNull, list, stringArg, intArg, booleanArg, inputObjectType } from 'nexus';

// Input types for mutations
export const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.string('email');
    t.string('username');
    t.string('phone');
    t.nonNull.string('displayName');
    t.string('password');
    t.string('avatar');
    t.string('bio');
    t.nonNull.string('roleId');
  }
});

export const UserUpdateInput = inputObjectType({
  name: 'UserUpdateInput',
  definition(t) {
    t.string('email');
    t.string('username');
    t.string('phone');
    t.string('displayName');
    t.string('avatar');
    t.string('bio');
    t.string('roleId');
    t.boolean('isActive');
    t.boolean('isVerified');
  }
});

export const RoleCreateInput = inputObjectType({
  name: 'RoleCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('permissions');
    t.boolean('isSystemRole');
    t.int('level');
    t.string('modules');
  }
});

export const RoleUpdateInput = inputObjectType({
  name: 'RoleUpdateInput',
  definition(t) {
    t.string('name');
    t.string('description');
    t.string('permissions');
    t.boolean('isSystemRole');
    t.int('level');
    t.string('modules');
  }
});

export const MenuItemCreateInput = inputObjectType({
  name: 'MenuItemCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('description');
    t.string('url');
    t.string('icon');
    t.nonNull.int('sortOrder');
    t.string('parentId');
    t.boolean('isActive');
  }
});

export const MenuItemUpdateInput = inputObjectType({
  name: 'MenuItemUpdateInput',
  definition(t) {
    t.string('name');
    t.string('description');
    t.string('url');
    t.string('icon');
    t.int('sortOrder');
    t.string('parentId');
    t.boolean('isActive');
  }
});

export const RoleMenuPermissionCreateInput = inputObjectType({
  name: 'RoleMenuPermissionCreateInput',
  definition(t) {
    t.nonNull.string('roleId');
    t.nonNull.string('menuItemId');
    t.boolean('canView');
    t.boolean('canAccess');
  }
});

export const RoleMenuPermissionUpdateInput = inputObjectType({
  name: 'RoleMenuPermissionUpdateInput',
  definition(t) {
    t.boolean('canView');
    t.boolean('canAccess');
  }
});

// Reusable input type for menu permissions
export const MenuPermissionInput = inputObjectType({
  name: 'MenuPermissionInput',
  definition(t) {
    t.nonNull.string('menuItemId');
    t.boolean('canView');
    t.boolean('canAccess');
  }
});

export const Mutation = mutationType({
  definition(t) {
    // User mutations
    t.field('createUser', {
      type: 'User',
      args: {
        input: nonNull(arg({ type: 'UserCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        const { password, ...userData } = input;
        
        // Hash password if provided
        let hashedPassword;
        if (password) {
          const bcrypt = require('bcryptjs');
          hashedPassword = await bcrypt.hash(password, 12);
        }
        
        return ctx.prisma.users.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
          include: {
            roles: true,
          }
        });
      }
    });

    t.field('updateUser', {
      type: 'User',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'UserUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx) => {
        return ctx.prisma.users.update({
          where: { id },
          data: input,
          include: {
            roles: true,
          }
        });
      }
    });

    t.field('deleteUser', {
      type: 'User',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.users.delete({
          where: { id },
          include: {
            roles: true,
          }
        });
      }
    });

    // Role mutations
    t.field('createRole', {
      type: 'Role',
      args: {
        input: nonNull(arg({ type: 'RoleCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        return ctx.prisma.roles.create({
          data: {
            ...input,
            level: input.level || 10,
            isSystemRole: input.isSystemRole || false,
          },
          include: {
            users: true,
            role_menu_items: {
              include: {
                menuItem: true,
              }
            }
          }
        });
      }
    });

    t.field('updateRole', {
      type: 'Role',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'RoleUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx) => {
        return ctx.prisma.roles.update({
          where: { id },
          data: input,
          include: {
            users: true,
            role_menu_items: {
              include: {
                menuItem: true,
              }
            }
          }
        });
      }
    });

    t.field('deleteRole', {
      type: 'Role',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        // Check if role has users assigned
        const usersWithRole = await ctx.prisma.users.count({
          where: { roleId: id }
        });
        
        if (usersWithRole > 0) {
          throw new Error('Cannot delete role that has users assigned to it');
        }
        
        return ctx.prisma.roles.delete({
          where: { id },
          include: {
            users: true,
            role_menu_items: {
              include: {
                menuItem: true,
              }
            }
          }
        });
      }
    });

    // Menu item mutations
    t.field('createMenuItem', {
      type: 'MenuItem',
      args: {
        input: nonNull(arg({ type: 'MenuItemCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        return ctx.prisma.menu_items.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          include: {
            parent: true,
            children: true,
            role_menu_items: {
              include: {
                role: true,
              }
            }
          }
        });
      }
    });

    t.field('updateMenuItem', {
      type: 'MenuItem',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'MenuItemUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx) => {
        return ctx.prisma.menu_items.update({
          where: { id },
          data: input,
          include: {
            parent: true,
            children: true,
            role_menu_items: {
              include: {
                role: true,
              }
            }
          }
        });
      }
    });

    t.field('deleteMenuItem', {
      type: 'MenuItem',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        // Check if menu item has children
        const childrenCount = await ctx.prisma.menu_items.count({
          where: { parentId: id }
        });
        
        if (childrenCount > 0) {
          throw new Error('Cannot delete menu item that has child items');
        }
        
        return ctx.prisma.menu_items.delete({
          where: { id },
          include: {
            parent: true,
            children: true,
            role_menu_items: {
              include: {
                role: true,
              }
            }
          }
        });
      }
    });

    // Role menu permission mutations
    t.field('createRoleMenuPermission', {
      type: 'RoleMenuPermission',
      args: {
        input: nonNull(arg({ type: 'RoleMenuPermissionCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx) => {
        return ctx.prisma.role_menu_items.create({
          data: {
            ...input,
            canView: input.canView !== undefined ? input.canView : true,
            canAccess: input.canAccess !== undefined ? input.canAccess : true,
          },
          include: {
            role: true,
            menuItem: true,
          }
        });
      }
    });

    t.field('updateRoleMenuPermission', {
      type: 'RoleMenuPermission',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'RoleMenuPermissionUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx) => {
        return ctx.prisma.role_menu_items.update({
          where: { id },
          data: input,
          include: {
            role: true,
            menuItem: true,
          }
        });
      }
    });

    t.field('deleteRoleMenuPermission', {
      type: 'RoleMenuPermission',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.role_menu_items.delete({
          where: { id },
          include: {
            role: true,
            menuItem: true,
          }
        });
      }
    });

    // Bulk operations
    t.list.field('bulkCreateRoleMenuPermissions', {
      type: 'RoleMenuPermission',
      args: {
        inputs: nonNull(arg({ type: list(nonNull('RoleMenuPermissionCreateInput')) })),
      },
      resolve: async (_parent, { inputs }, ctx) => {
        const permissions = await Promise.all(
          inputs.map((input: any) =>
            ctx.prisma.role_menu_items.create({
              data: {
                ...input,
                canView: input.canView !== undefined ? input.canView : true,
                canAccess: input.canAccess !== undefined ? input.canAccess : true,
              },
              include: {
                role: true,
                menuItem: true,
              }
            })
          )
        );
        
        return permissions;
      }
    });

    t.field('bulkUpdateRoleMenuPermissions', {
      type: 'String',
      args: {
        roleId: nonNull(stringArg()),
        menuPermissions: nonNull(arg({ 
          type: list(nonNull('MenuPermissionInput'))
        })),
      },
      resolve: async (_parent, { roleId, menuPermissions }, ctx) => {
        // Delete existing permissions for the role
        await ctx.prisma.role_menu_items.deleteMany({
          where: { roleId }
        });
        
        // Create new permissions
        if (menuPermissions.length > 0) {
          await ctx.prisma.role_menu_items.createMany({
            data: menuPermissions.map((perm: any) => ({
              roleId,
              menuItemId: perm.menuItemId,
              canView: perm.canView !== undefined ? perm.canView : true,
              canAccess: perm.canAccess !== undefined ? perm.canAccess : true,
            }))
          });
        }
        
        return 'Permissions updated successfully';
      }
    });
  }
});

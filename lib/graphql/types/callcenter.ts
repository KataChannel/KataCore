import { objectType, extendType, arg, nonNull, stringArg, intArg, booleanArg, inputObjectType } from 'nexus';
import { transformFields } from '../utils/field-transformer';

// Call Extension Types
export const CallExtension = objectType({
  name: 'CallExtension',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('extCode');
    t.string('password');
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('status');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.list.field('assignedUsers', {
      type: 'CallExtensionUser',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extension_users.findMany({
          where: { callExtensionId: parent.id },
          ...fields
        });
      }
    });

    t.int('assignedUsersCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.call_extension_users.count({
          where: { callExtensionId: parent.id }
        });
      }
    });
  }
});

export const CallExtensionUser = objectType({
  name: 'CallExtensionUser',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('userId');
    t.nonNull.string('callExtensionId');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.userById.load(parent.userId);
      }
    });

    t.field('callExtension', {
      type: 'CallExtension',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extensions.findUnique({
          where: { id: parent.callExtensionId },
          ...fields
        });
      }
    });
  }
});

export const CallHistoryOverview = objectType({
  name: 'CallHistoryOverview',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('direction');
    t.string('callerIdNumber');
    t.string('outboundCallerIdNumber');
    t.string('destinationNumber');
    t.string('startEpoch');
    t.string('endEpoch');
    t.string('answerEpoch');
    t.string('duration');
    t.string('billsec');
    t.string('sipHangupDisposition');
    t.string('recordPath');
    t.string('callStatus');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });
    t.nonNull.string('cdrId');
  }
});

// Input Types
export const CallExtensionCreateInput = inputObjectType({
  name: 'CallExtensionCreateInput',
  definition(t) {
    t.nonNull.string('extCode');
    t.string('password');
    t.nonNull.string('name');
    t.string('description');
    t.string('status');
  }
});

export const CallExtensionUpdateInput = inputObjectType({
  name: 'CallExtensionUpdateInput',
  definition(t) {
    t.string('extCode');
    t.string('password');
    t.string('name');
    t.string('description');
    t.string('status');
  }
});

export const CallExtensionUserCreateInput = inputObjectType({
  name: 'CallExtensionUserCreateInput',
  definition(t) {
    t.nonNull.string('userId');
    t.nonNull.string('callExtensionId');
    t.boolean('isActive');
  }
});

// Extend Queries
export const CallCenterQueries = extendType({
  type: 'Query',
  definition(t) {
    // Call Extensions
    t.list.field('callExtensions', {
      type: 'CallExtension',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        status: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, status } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { extCode: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (status) {
          where.status = status;
        }
        
        return ctx.prisma.call_extensions.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('callExtension', {
      type: 'CallExtension',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extensions.findUnique({
          where: { id },
          ...fields
        });
      }
    });

    // Call History
    t.list.field('callHistory', {
      type: 'CallHistoryOverview',
      args: {
        skip: intArg(),
        take: intArg(),
        direction: stringArg(),
        callStatus: stringArg(),
        startDate: stringArg(),
        endDate: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, direction, callStatus, startDate, endDate } = args;
        
        const where: any = {};
        
        if (direction) {
          where.direction = direction;
        }
        
        if (callStatus) {
          where.callStatus = callStatus;
        }
        
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) {
            where.createdAt.gte = new Date(startDate);
          }
          if (endDate) {
            where.createdAt.lte = new Date(endDate);
          }
        }
        
        return ctx.prisma.call_history_overview.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.int('callHistoryCount', {
      args: {
        direction: stringArg(),
        callStatus: stringArg(),
        startDate: stringArg(),
        endDate: stringArg(),
      },
      resolve: async (_parent, args, ctx) => {
        const { direction, callStatus, startDate, endDate } = args;
        
        const where: any = {};
        
        if (direction) {
          where.direction = direction;
        }
        
        if (callStatus) {
          where.callStatus = callStatus;
        }
        
        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) {
            where.createdAt.gte = new Date(startDate);
          }
          if (endDate) {
            where.createdAt.lte = new Date(endDate);
          }
        }
        
        return ctx.prisma.call_history_overview.count({ where });
      }
    });

    // Call Extension Users
    t.list.field('callExtensionUsers', {
      type: 'CallExtensionUser',
      args: {
        callExtensionId: stringArg(),
        userId: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { callExtensionId, userId, isActive } = args;
        
        const where: any = {};
        
        if (callExtensionId) {
          where.callExtensionId = callExtensionId;
        }
        
        if (userId) {
          where.userId = userId;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.call_extension_users.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });
  }
});

// Extend Mutations
export const CallCenterMutations = extendType({
  type: 'Mutation',
  definition(t) {
    // Call Extension Mutations
    t.field('createCallExtension', {
      type: 'CallExtension',
      args: {
        input: nonNull(arg({ type: 'CallExtensionCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extensions.create({
          data: {
            ...input,
            status: input.status || 'active',
          },
          ...fields
        });
      }
    });

    t.field('updateCallExtension', {
      type: 'CallExtension',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'CallExtensionUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extensions.update({
          where: { id },
          data: input,
          ...fields
        });
      }
    });

    t.field('deleteCallExtension', {
      type: 'CallExtension',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        
        // Delete associated call_extension_users first
        await ctx.prisma.call_extension_users.deleteMany({
          where: { callExtensionId: id }
        });
        
        return ctx.prisma.call_extensions.delete({
          where: { id },
          ...fields
        });
      }
    });

    // Call Extension User Mutations
    t.field('assignUserToCallExtension', {
      type: 'CallExtensionUser',
      args: {
        input: nonNull(arg({ type: 'CallExtensionUserCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extension_users.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    t.field('removeUserFromCallExtension', {
      type: 'CallExtensionUser',
      args: {
        userId: nonNull(stringArg()),
        callExtensionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { userId, callExtensionId }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extension_users.delete({
          where: { 
            userId_callExtensionId: { 
              userId, 
              callExtensionId 
            } 
          },
          ...fields
        });
      }
    });

    t.field('toggleCallExtensionUserStatus', {
      type: 'CallExtensionUser',
      args: {
        userId: nonNull(stringArg()),
        callExtensionId: nonNull(stringArg()),
        isActive: nonNull(booleanArg()),
      },
      resolve: async (_parent, { userId, callExtensionId, isActive }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.call_extension_users.update({
          where: { 
            userId_callExtensionId: { 
              userId, 
              callExtensionId 
            } 
          },
          data: { isActive },
          ...fields
        });
      }
    });
  }
});

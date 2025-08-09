import { objectType, extendType, arg, nonNull, stringArg, intArg, booleanArg, inputObjectType } from 'nexus';
import { transformFields } from '../utils/field-transformer';

// Social Media Types
export const SocialMediaAccount = objectType({
  name: 'SocialMediaAccount',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('platform');
    t.nonNull.string('accountName');
    t.string('accountId');
    t.string('accessToken');
    t.string('refreshToken');
    t.field('tokenExpiresAt', { type: 'DateTime' });
    t.nonNull.string('status');
    t.string('profilePicture');
    t.string('description');
    t.int('followersCount');
    t.int('followingCount');
    t.string('userId');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.userId) return null;
        return ctx.dataloaders.userById.load(parent.userId);
      }
    });

    t.list.field('posts', {
      type: 'SocialMediaPost',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.social_media_posts.findMany({
          where: { accountId: parent.id },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });
  }
});

export const SocialMediaPost = objectType({
  name: 'SocialMediaPost',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('accountId');
    t.string('platformPostId');
    t.nonNull.string('content');
    t.list.string('images');
    t.string('video');
    t.string('link');
    t.nonNull.string('status');
    t.field('scheduledAt', { type: 'DateTime' });
    t.field('publishedAt', { type: 'DateTime' });
    t.int('likes');
    t.int('comments');
    t.int('shares');
    t.int('views');
    t.string('hashtags');
    t.string('mentions');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('account', {
      type: 'SocialMediaAccount',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.social_media_accounts.findUnique({
          where: { id: parent.accountId },
          ...fields
        });
      }
    });
  }
});

export const Campaign = objectType({
  name: 'Campaign',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('type');
    t.nonNull.string('status');
    t.nonNull.field('startDate', { type: 'DateTime' });
    t.field('endDate', { type: 'DateTime' });
    t.float('budget');
    t.float('spent');
    t.string('targetAudience');
    t.string('objectives');
    t.string('managerId');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('manager', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.managerId) return null;
        return ctx.dataloaders.userById.load(parent.managerId);
      }
    });

    t.list.field('ads', {
      type: 'Advertisement',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.advertisements.findMany({
          where: { campaignId: parent.id },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.list.field('analytics', {
      type: 'CampaignAnalytics',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.campaign_analytics.findMany({
          where: { campaignId: parent.id },
          orderBy: { date: 'desc' },
          ...fields
        });
      }
    });
  }
});

export const Advertisement = objectType({
  name: 'Advertisement',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('campaignId');
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('type');
    t.nonNull.string('status');
    t.string('content');
    t.list.string('images');
    t.string('video');
    t.string('link');
    t.string('callToAction');
    t.string('targetAudience');
    t.float('budget');
    t.float('spent');
    t.int('impressions');
    t.int('clicks');
    t.int('conversions');
    t.float('ctr');
    t.float('cpc');
    t.float('cpm');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('campaign', {
      type: 'Campaign',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.campaigns.findUnique({
          where: { id: parent.campaignId },
          ...fields
        });
      }
    });
  }
});

export const CampaignAnalytics = objectType({
  name: 'CampaignAnalytics',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('campaignId');
    t.nonNull.field('date', { type: 'DateTime' });
    t.int('impressions');
    t.int('clicks');
    t.int('conversions');
    t.float('spent');
    t.float('revenue');
    t.float('ctr');
    t.float('cpc');
    t.float('cpm');
    t.float('roas');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('campaign', {
      type: 'Campaign',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.campaigns.findUnique({
          where: { id: parent.campaignId },
          ...fields
        });
      }
    });
  }
});

export const EmailTemplate = objectType({
  name: 'EmailTemplate',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('subject');
    t.string('content');
    t.string('htmlContent');
    t.nonNull.string('type');
    t.string('category');
    t.nonNull.boolean('isActive');
    t.string('createdBy');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('creator', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.createdBy) return null;
        return ctx.dataloaders.userById.load(parent.createdBy);
      }
    });
  }
});

export const EmailCampaign = objectType({
  name: 'EmailCampaign',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('subject');
    t.string('content');
    t.string('htmlContent');
    t.nonNull.string('status');
    t.string('templateId');
    t.string('audienceId');
    t.field('scheduledAt', { type: 'DateTime' });
    t.field('sentAt', { type: 'DateTime' });
    t.int('totalRecipients');
    t.int('delivered');
    t.int('opened');
    t.int('clicked');
    t.int('bounced');
    t.int('unsubscribed');
    t.string('createdBy');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('template', {
      type: 'EmailTemplate',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.templateId) return null;
        const fields = transformFields(info);
        return ctx.prisma.email_templates.findUnique({
          where: { id: parent.templateId },
          ...fields
        });
      }
    });

    t.field('creator', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.createdBy) return null;
        return ctx.dataloaders.userById.load(parent.createdBy);
      }
    });
  }
});

// Input Types
export const SocialMediaAccountCreateInput = inputObjectType({
  name: 'SocialMediaAccountCreateInput',
  definition(t) {
    t.nonNull.string('platform');
    t.nonNull.string('accountName');
    t.string('accountId');
    t.string('accessToken');
    t.string('refreshToken');
    t.field('tokenExpiresAt', { type: 'DateTime' });
    t.string('status');
    t.string('profilePicture');
    t.string('description');
    t.boolean('isActive');
  }
});

export const SocialMediaPostCreateInput = inputObjectType({
  name: 'SocialMediaPostCreateInput',
  definition(t) {
    t.nonNull.string('accountId');
    t.nonNull.string('content');
    t.list.string('images');
    t.string('video');
    t.string('link');
    t.field('scheduledAt', { type: 'DateTime' });
    t.string('hashtags');
    t.string('mentions');
  }
});

export const CampaignCreateInput = inputObjectType({
  name: 'CampaignCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('description');
    t.nonNull.string('type');
    t.nonNull.field('startDate', { type: 'DateTime' });
    t.field('endDate', { type: 'DateTime' });
    t.float('budget');
    t.string('targetAudience');
    t.string('objectives');
  }
});

export const EmailTemplateCreateInput = inputObjectType({
  name: 'EmailTemplateCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('subject');
    t.string('content');
    t.string('htmlContent');
    t.nonNull.string('type');
    t.string('category');
    t.boolean('isActive');
  }
});

export const EmailCampaignCreateInput = inputObjectType({
  name: 'EmailCampaignCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('subject');
    t.string('content');
    t.string('htmlContent');
    t.string('templateId');
    t.string('audienceId');
    t.field('scheduledAt', { type: 'DateTime' });
  }
});

// Extend Queries
export const SocialMarketingQueries = extendType({
  type: 'Query',
  definition(t) {
    // Social Media Accounts
    t.list.field('socialMediaAccounts', {
      type: 'SocialMediaAccount',
      args: {
        platform: stringArg(),
        status: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { platform, status, isActive } = args;
        
        const where: any = {};
        
        if (platform) {
          where.platform = platform;
        }
        
        if (status) {
          where.status = status;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.social_media_accounts.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Social Media Posts
    t.list.field('socialMediaPosts', {
      type: 'SocialMediaPost',
      args: {
        accountId: stringArg(),
        status: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { accountId, status, skip, take } = args;
        
        const where: any = {};
        
        if (accountId) {
          where.accountId = accountId;
        }
        
        if (status) {
          where.status = status;
        }
        
        return ctx.prisma.social_media_posts.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Campaigns
    t.list.field('campaigns', {
      type: 'Campaign',
      args: {
        type: stringArg(),
        status: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { type, status, skip, take } = args;
        
        const where: any = {};
        
        if (type) {
          where.type = type;
        }
        
        if (status) {
          where.status = status;
        }
        
        return ctx.prisma.campaigns.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Email Templates
    t.list.field('emailTemplates', {
      type: 'EmailTemplate',
      args: {
        type: stringArg(),
        category: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { type, category, isActive } = args;
        
        const where: any = {};
        
        if (type) {
          where.type = type;
        }
        
        if (category) {
          where.category = category;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.email_templates.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Email Campaigns
    t.list.field('emailCampaigns', {
      type: 'EmailCampaign',
      args: {
        status: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { status, skip, take } = args;
        
        const where: any = {};
        
        if (status) {
          where.status = status;
        }
        
        return ctx.prisma.email_campaigns.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });
  }
});

// Extend Mutations
export const SocialMarketingMutations = extendType({
  type: 'Mutation',
  definition(t) {
    // Social Media Account mutations
    t.field('createSocialMediaAccount', {
      type: 'SocialMediaAccount',
      args: {
        input: nonNull(arg({ type: 'SocialMediaAccountCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        return ctx.prisma.social_media_accounts.create({
          data: {
            ...input,
            userId: currentUser.id,
            status: input.status || 'active',
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    // Social Media Post mutations
    t.field('createSocialMediaPost', {
      type: 'SocialMediaPost',
      args: {
        input: nonNull(arg({ type: 'SocialMediaPostCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        
        return ctx.prisma.social_media_posts.create({
          data: {
            ...input,
            status: input.scheduledAt ? 'scheduled' : 'draft',
          },
          ...fields
        });
      }
    });

    t.field('publishSocialMediaPost', {
      type: 'SocialMediaPost',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        
        return ctx.prisma.social_media_posts.update({
          where: { id },
          data: { 
            status: 'published',
            publishedAt: new Date()
          },
          ...fields
        });
      }
    });

    // Campaign mutations
    t.field('createCampaign', {
      type: 'Campaign',
      args: {
        input: nonNull(arg({ type: 'CampaignCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        return ctx.prisma.campaigns.create({
          data: {
            ...input,
            managerId: currentUser.id,
            status: 'draft',
            spent: 0,
          },
          ...fields
        });
      }
    });

    // Email Template mutations
    t.field('createEmailTemplate', {
      type: 'EmailTemplate',
      args: {
        input: nonNull(arg({ type: 'EmailTemplateCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        return ctx.prisma.email_templates.create({
          data: {
            ...input,
            createdBy: currentUser.id,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    // Email Campaign mutations
    t.field('createEmailCampaign', {
      type: 'EmailCampaign',
      args: {
        input: nonNull(arg({ type: 'EmailCampaignCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        return ctx.prisma.email_campaigns.create({
          data: {
            ...input,
            createdBy: currentUser.id,
            status: input.scheduledAt ? 'scheduled' : 'draft',
            totalRecipients: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
          },
          ...fields
        });
      }
    });

    t.field('sendEmailCampaign', {
      type: 'EmailCampaign',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        
        return ctx.prisma.email_campaigns.update({
          where: { id },
          data: { 
            status: 'sent',
            sentAt: new Date()
          },
          ...fields
        });
      }
    });
  }
});

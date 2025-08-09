import { objectType, extendType, arg, nonNull, stringArg, intArg, booleanArg, inputObjectType } from 'nexus';
import { transformFields } from '../utils/field-transformer';

// Information Category Types
export const InformationCategory = objectType({
  name: 'InformationCategory',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('icon');
    t.string('color');
    t.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.list.field('articles', {
      type: 'InformationArticle',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.information_articles.findMany({
          where: { categoryId: parent.id },
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.int('articlesCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.information_articles.count({
          where: { categoryId: parent.id }
        });
      }
    });
  }
});

export const InformationArticle = objectType({
  name: 'InformationArticle',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('title');
    t.string('slug');
    t.string('excerpt');
    t.string('content');
    t.string('featuredImage');
    t.string('metaTitle');
    t.string('metaDescription');
    t.string('metaKeywords');
    t.nonNull.string('status');
    t.nonNull.string('visibility');
    t.field('publishedAt', { type: 'DateTime' });
    t.nonNull.string('authorId');
    t.string('categoryId');
    t.int('sortOrder');
    t.int('views');
    t.boolean('isFeatured');
    t.boolean('allowComments');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('author', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        return ctx.dataloaders.userById.load(parent.authorId);
      }
    });

    t.field('category', {
      type: 'InformationCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.categoryId) return null;
        const fields = transformFields(info);
        return ctx.prisma.information_categories.findUnique({
          where: { id: parent.categoryId },
          ...fields
        });
      }
    });

    t.list.field('tags', {
      type: 'InformationTag',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        const articleTags = await ctx.prisma.information_article_tags.findMany({
          where: { articleId: parent.id },
          include: { tag: true }
        });
        return articleTags.map(at => at.tag);
      }
    });

    t.list.field('comments', {
      type: 'InformationComment',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.information_comments.findMany({
          where: { 
            articleId: parent.id,
            status: 'approved'
          },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.int('commentsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.information_comments.count({
          where: { 
            articleId: parent.id,
            status: 'approved'
          }
        });
      }
    });
  }
});

export const InformationTag = objectType({
  name: 'InformationTag',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('color');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.int('articlesCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.information_article_tags.count({
          where: { tagId: parent.id }
        });
      }
    });
  }
});

export const InformationComment = objectType({
  name: 'InformationComment',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('articleId');
    t.string('authorId');
    t.string('authorName');
    t.string('authorEmail');
    t.nonNull.string('content');
    t.nonNull.string('status');
    t.string('parentId');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('article', {
      type: 'InformationArticle',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.information_articles.findUnique({
          where: { id: parent.articleId },
          ...fields
        });
      }
    });

    t.field('author', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.authorId) return null;
        return ctx.dataloaders.userById.load(parent.authorId);
      }
    });

    t.field('parent', {
      type: 'InformationComment',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.parentId) return null;
        const fields = transformFields(info);
        return ctx.prisma.information_comments.findUnique({
          where: { id: parent.parentId },
          ...fields
        });
      }
    });

    t.list.field('replies', {
      type: 'InformationComment',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.information_comments.findMany({
          where: { 
            parentId: parent.id,
            status: 'approved'
          },
          orderBy: { createdAt: 'asc' },
          ...fields
        });
      }
    });
  }
});

export const FAQ = objectType({
  name: 'FAQ',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('question');
    t.nonNull.string('answer');
    t.string('categoryId');
    t.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.int('views');
    t.int('helpful');
    t.int('notHelpful');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('category', {
      type: 'FAQCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.categoryId) return null;
        const fields = transformFields(info);
        return ctx.prisma.faq_categories.findUnique({
          where: { id: parent.categoryId },
          ...fields
        });
      }
    });
  }
});

export const FAQCategory = objectType({
  name: 'FAQCategory',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('description');
    t.string('icon');
    t.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.list.field('faqs', {
      type: 'FAQ',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.faqs.findMany({
          where: { categoryId: parent.id },
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.int('faqsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.faqs.count({
          where: { categoryId: parent.id }
        });
      }
    });
  }
});

export const Document = objectType({
  name: 'Document',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('title');
    t.string('description');
    t.nonNull.string('fileName');
    t.nonNull.string('filePath');
    t.string('fileType');
    t.int('fileSize');
    t.string('categoryId');
    t.string('uploadedBy');
    t.int('downloads');
    t.nonNull.boolean('isPublic');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('category', {
      type: 'DocumentCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.categoryId) return null;
        const fields = transformFields(info);
        return ctx.prisma.document_categories.findUnique({
          where: { id: parent.categoryId },
          ...fields
        });
      }
    });

    t.field('uploader', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.uploadedBy) return null;
        return ctx.dataloaders.userById.load(parent.uploadedBy);
      }
    });
  }
});

export const DocumentCategory = objectType({
  name: 'DocumentCategory',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('description');
    t.string('icon');
    t.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.list.field('documents', {
      type: 'Document',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.documents.findMany({
          where: { categoryId: parent.id },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.int('documentsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.documents.count({
          where: { categoryId: parent.id }
        });
      }
    });
  }
});

// Input Types
export const InformationCategoryCreateInput = inputObjectType({
  name: 'InformationCategoryCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('icon');
    t.string('color');
    t.int('sortOrder');
    t.boolean('isActive');
  }
});

export const InformationArticleCreateInput = inputObjectType({
  name: 'InformationArticleCreateInput',
  definition(t) {
    t.nonNull.string('title');
    t.string('slug');
    t.string('excerpt');
    t.string('content');
    t.string('featuredImage');
    t.string('metaTitle');
    t.string('metaDescription');
    t.string('metaKeywords');
    t.string('status');
    t.string('visibility');
    t.field('publishedAt', { type: 'DateTime' });
    t.string('categoryId');
    t.int('sortOrder');
    t.boolean('isFeatured');
    t.boolean('allowComments');
    t.list.string('tagIds');
  }
});

export const InformationCommentCreateInput = inputObjectType({
  name: 'InformationCommentCreateInput',
  definition(t) {
    t.nonNull.string('articleId');
    t.string('authorName');
    t.string('authorEmail');
    t.nonNull.string('content');
    t.string('parentId');
  }
});

export const FAQCreateInput = inputObjectType({
  name: 'FAQCreateInput',
  definition(t) {
    t.nonNull.string('question');
    t.nonNull.string('answer');
    t.string('categoryId');
    t.int('sortOrder');
    t.boolean('isActive');
  }
});

export const DocumentCreateInput = inputObjectType({
  name: 'DocumentCreateInput',
  definition(t) {
    t.nonNull.string('title');
    t.string('description');
    t.nonNull.string('fileName');
    t.nonNull.string('filePath');
    t.string('fileType');
    t.int('fileSize');
    t.string('categoryId');
    t.boolean('isPublic');
    t.boolean('isActive');
  }
});

// Extend Queries
export const InformationHubQueries = extendType({
  type: 'Query',
  definition(t) {
    // Information Categories
    t.list.field('informationCategories', {
      type: 'InformationCategory',
      args: {
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { isActive } = args;
        
        const where: any = {};
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.information_categories.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    // Information Articles
    t.list.field('informationArticles', {
      type: 'InformationArticle',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        categoryId: stringArg(),
        status: stringArg(),
        isFeatured: booleanArg(),
        tagId: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, categoryId, status, isFeatured, tagId } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (categoryId) {
          where.categoryId = categoryId;
        }
        
        if (status) {
          where.status = status;
        }
        
        if (isFeatured !== undefined) {
          where.isFeatured = isFeatured;
        }
        
        if (tagId) {
          where.tags = {
            some: {
              tagId: tagId
            }
          };
        }
        
        return ctx.prisma.information_articles.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('informationArticle', {
      type: 'InformationArticle',
      args: {
        id: stringArg(),
        slug: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { id, slug } = args;
        
        if (!id && !slug) {
          throw new Error('Either id or slug must be provided');
        }
        
        const where = id ? { id } : { slug };
        
        // Increment view count
        const article = await ctx.prisma.information_articles.findUnique({ where });
        if (article) {
          await ctx.prisma.information_articles.update({
            where,
            data: { views: { increment: 1 } }
          });
        }
        
        return ctx.prisma.information_articles.findUnique({
          where,
          ...fields
        });
      }
    });

    // FAQs
    t.list.field('faqs', {
      type: 'FAQ',
      args: {
        categoryId: stringArg(),
        search: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { categoryId, search, isActive } = args;
        
        const where: any = {};
        
        if (categoryId) {
          where.categoryId = categoryId;
        }
        
        if (search) {
          where.OR = [
            { question: { contains: search, mode: 'insensitive' } },
            { answer: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.faqs.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.list.field('faqCategories', {
      type: 'FAQCategory',
      args: {
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { isActive } = args;
        
        const where: any = {};
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.faq_categories.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    // Documents
    t.list.field('documents', {
      type: 'Document',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        categoryId: stringArg(),
        isPublic: booleanArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, categoryId, isPublic, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (categoryId) {
          where.categoryId = categoryId;
        }
        
        if (isPublic !== undefined) {
          where.isPublic = isPublic;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.documents.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.list.field('documentCategories', {
      type: 'DocumentCategory',
      args: {
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { isActive } = args;
        
        const where: any = {};
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.document_categories.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });
  }
});

// Extend Mutations
export const InformationHubMutations = extendType({
  type: 'Mutation',
  definition(t) {
    // Information Category mutations
    t.field('createInformationCategory', {
      type: 'InformationCategory',
      args: {
        input: nonNull(arg({ type: 'InformationCategoryCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.information_categories.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    // Information Article mutations
    t.field('createInformationArticle', {
      type: 'InformationArticle',
      args: {
        input: nonNull(arg({ type: 'InformationArticleCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const { tagIds, ...articleData } = input;
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        const article = await ctx.prisma.information_articles.create({
          data: {
            ...articleData,
            authorId: currentUser.id,
            status: articleData.status || 'draft',
            visibility: articleData.visibility || 'public',
            isFeatured: articleData.isFeatured !== undefined ? articleData.isFeatured : false,
            allowComments: articleData.allowComments !== undefined ? articleData.allowComments : true,
          },
          ...fields
        });

        // Handle tags
        if (tagIds && tagIds.length > 0) {
          await ctx.prisma.information_article_tags.createMany({
            data: tagIds.map((tagId: string) => ({
              articleId: article.id,
              tagId
            }))
          });
        }

        return article;
      }
    });

    // Information Comment mutations
    t.field('createInformationComment', {
      type: 'InformationComment',
      args: {
        input: nonNull(arg({ type: 'InformationCommentCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        return ctx.prisma.information_comments.create({
          data: {
            ...input,
            authorId: currentUser?.id || null,
            status: 'pending',
          },
          ...fields
        });
      }
    });

    // FAQ mutations
    t.field('createFAQ', {
      type: 'FAQ',
      args: {
        input: nonNull(arg({ type: 'FAQCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.faqs.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    t.field('markFAQHelpful', {
      type: 'FAQ',
      args: {
        id: nonNull(stringArg()),
        helpful: nonNull(booleanArg()),
      },
      resolve: async (_parent, { id, helpful }, ctx, info) => {
        const fields = transformFields(info);
        const updateData = helpful 
          ? { helpful: { increment: 1 } }
          : { notHelpful: { increment: 1 } };
        
        return ctx.prisma.faqs.update({
          where: { id },
          data: updateData,
          ...fields
        });
      }
    });

    // Document mutations
    t.field('createDocument', {
      type: 'Document',
      args: {
        input: nonNull(arg({ type: 'DocumentCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        if (!currentUser) {
          throw new Error('Authentication required');
        }
        
        return ctx.prisma.documents.create({
          data: {
            ...input,
            uploadedBy: currentUser.id,
            isPublic: input.isPublic !== undefined ? input.isPublic : false,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    t.field('downloadDocument', {
      type: 'Document',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.documents.update({
          where: { id },
          data: { downloads: { increment: 1 } },
          ...fields
        });
      }
    });
  }
});

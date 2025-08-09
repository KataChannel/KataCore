import { objectType, extendType, arg, nonNull, stringArg, intArg, booleanArg, inputObjectType } from 'nexus';
import { transformFields } from '../utils/field-transformer';

// Blog Category Types
export const BlogCategory = objectType({
  name: 'BlogCategory',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('image');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.list.field('posts', {
      type: 'BlogPost',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_posts.findMany({
          where: { categoryId: parent.id },
          ...fields
        });
      }
    });

    t.int('postsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.blog_posts.count({
          where: { categoryId: parent.id }
        });
      }
    });
  }
});

export const BlogPost = objectType({
  name: 'BlogPost',
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
    t.int('views');
    t.int('likes');
    t.boolean('allowComments');
    t.boolean('isFeatured');
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
      type: 'BlogCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.categoryId) return null;
        const fields = transformFields(info);
        return ctx.prisma.blog_categories.findUnique({
          where: { id: parent.categoryId },
          ...fields
        });
      }
    });

    t.list.field('tags', {
      type: 'BlogTag',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        const postTags = await ctx.prisma.blog_post_tags.findMany({
          where: { postId: parent.id },
          include: { tag: true }
        });
        return postTags.map(pt => pt.tag);
      }
    });

    t.list.field('comments', {
      type: 'BlogComment',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_comments.findMany({
          where: { 
            postId: parent.id,
            status: 'approved'
          },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.int('commentsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.blog_comments.count({
          where: { 
            postId: parent.id,
            status: 'approved'
          }
        });
      }
    });
  }
});

export const BlogTag = objectType({
  name: 'BlogTag',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('color');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.int('postsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.blog_post_tags.count({
          where: { tagId: parent.id }
        });
      }
    });
  }
});

export const BlogComment = objectType({
  name: 'BlogComment',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('postId');
    t.string('authorId');
    t.string('authorName');
    t.string('authorEmail');
    t.string('authorWebsite');
    t.nonNull.string('content');
    t.nonNull.string('status');
    t.string('parentId');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('post', {
      type: 'BlogPost',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_posts.findUnique({
          where: { id: parent.postId },
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
      type: 'BlogComment',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.parentId) return null;
        const fields = transformFields(info);
        return ctx.prisma.blog_comments.findUnique({
          where: { id: parent.parentId },
          ...fields
        });
      }
    });

    t.list.field('replies', {
      type: 'BlogComment',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_comments.findMany({
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

// Input Types
export const BlogCategoryCreateInput = inputObjectType({
  name: 'BlogCategoryCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('image');
    t.boolean('isActive');
  }
});

export const BlogCategoryUpdateInput = inputObjectType({
  name: 'BlogCategoryUpdateInput',
  definition(t) {
    t.string('name');
    t.string('slug');
    t.string('description');
    t.string('image');
    t.boolean('isActive');
  }
});

export const BlogPostCreateInput = inputObjectType({
  name: 'BlogPostCreateInput',
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
    t.boolean('allowComments');
    t.boolean('isFeatured');
    t.list.string('tagIds');
  }
});

export const BlogPostUpdateInput = inputObjectType({
  name: 'BlogPostUpdateInput',
  definition(t) {
    t.string('title');
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
    t.boolean('allowComments');
    t.boolean('isFeatured');
    t.list.string('tagIds');
  }
});

export const BlogTagCreateInput = inputObjectType({
  name: 'BlogTagCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('color');
    t.boolean('isActive');
  }
});

export const BlogCommentCreateInput = inputObjectType({
  name: 'BlogCommentCreateInput',
  definition(t) {
    t.nonNull.string('postId');
    t.string('authorName');
    t.string('authorEmail');
    t.string('authorWebsite');
    t.nonNull.string('content');
    t.string('parentId');
  }
});

// Extend Queries
export const BlogQueries = extendType({
  type: 'Query',
  definition(t) {
    // Blog Categories
    t.list.field('blogCategories', {
      type: 'BlogCategory',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.blog_categories.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('blogCategory', {
      type: 'BlogCategory',
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
        
        return ctx.prisma.blog_categories.findUnique({
          where,
          ...fields
        });
      }
    });

    // Blog Posts
    t.list.field('blogPosts', {
      type: 'BlogPost',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        status: stringArg(),
        categoryId: stringArg(),
        authorId: stringArg(),
        isFeatured: booleanArg(),
        tagId: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, status, categoryId, authorId, isFeatured, tagId } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (status) {
          where.status = status;
        }
        
        if (categoryId) {
          where.categoryId = categoryId;
        }
        
        if (authorId) {
          where.authorId = authorId;
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
        
        return ctx.prisma.blog_posts.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('blogPost', {
      type: 'BlogPost',
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
        const post = await ctx.prisma.blog_posts.findUnique({ where });
        if (post) {
          await ctx.prisma.blog_posts.update({
            where,
            data: { views: { increment: 1 } }
          });
        }
        
        return ctx.prisma.blog_posts.findUnique({
          where,
          ...fields
        });
      }
    });

    // Blog Tags
    t.list.field('blogTags', {
      type: 'BlogTag',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, search, isActive } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.blog_tags.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    // Blog Comments
    t.list.field('blogComments', {
      type: 'BlogComment',
      args: {
        postId: stringArg(),
        status: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { postId, status, skip, take } = args;
        
        const where: any = {};
        
        if (postId) {
          where.postId = postId;
        }
        
        if (status) {
          where.status = status;
        }
        
        return ctx.prisma.blog_comments.findMany({
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
export const BlogMutations = extendType({
  type: 'Mutation',
  definition(t) {
    // Blog Category Mutations
    t.field('createBlogCategory', {
      type: 'BlogCategory',
      args: {
        input: nonNull(arg({ type: 'BlogCategoryCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_categories.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    t.field('updateBlogCategory', {
      type: 'BlogCategory',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'BlogCategoryUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_categories.update({
          where: { id },
          data: input,
          ...fields
        });
      }
    });

    t.field('deleteBlogCategory', {
      type: 'BlogCategory',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_categories.delete({
          where: { id },
          ...fields
        });
      }
    });

    // Blog Post Mutations
    t.field('createBlogPost', {
      type: 'BlogPost',
      args: {
        input: nonNull(arg({ type: 'BlogPostCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const { tagIds, ...postData } = input;
        
        const post = await ctx.prisma.blog_posts.create({
          data: {
            ...postData,
            status: postData.status || 'draft',
            visibility: postData.visibility || 'public',
            allowComments: postData.allowComments !== undefined ? postData.allowComments : true,
            isFeatured: postData.isFeatured !== undefined ? postData.isFeatured : false,
          },
          ...fields
        });

        // Handle tags
        if (tagIds && tagIds.length > 0) {
          await ctx.prisma.blog_post_tags.createMany({
            data: tagIds.map((tagId: string) => ({
              postId: post.id,
              tagId
            }))
          });
        }

        return post;
      }
    });

    t.field('updateBlogPost', {
      type: 'BlogPost',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'BlogPostUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx, info) => {
        const fields = transformFields(info);
        const { tagIds, ...postData } = input;
        
        const post = await ctx.prisma.blog_posts.update({
          where: { id },
          data: postData,
          ...fields
        });

        // Handle tags update
        if (tagIds !== undefined) {
          // Remove existing tags
          await ctx.prisma.blog_post_tags.deleteMany({
            where: { postId: id }
          });

          // Add new tags
          if (tagIds.length > 0) {
            await ctx.prisma.blog_post_tags.createMany({
              data: tagIds.map((tagId: string) => ({
                postId: id,
                tagId
              }))
            });
          }
        }

        return post;
      }
    });

    t.field('deleteBlogPost', {
      type: 'BlogPost',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        
        // Delete related data
        await ctx.prisma.blog_post_tags.deleteMany({
          where: { postId: id }
        });
        
        await ctx.prisma.blog_comments.deleteMany({
          where: { postId: id }
        });
        
        return ctx.prisma.blog_posts.delete({
          where: { id },
          ...fields
        });
      }
    });

    // Blog Tag Mutations
    t.field('createBlogTag', {
      type: 'BlogTag',
      args: {
        input: nonNull(arg({ type: 'BlogTagCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_tags.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    // Blog Comment Mutations
    t.field('createBlogComment', {
      type: 'BlogComment',
      args: {
        input: nonNull(arg({ type: 'BlogCommentCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        
        // Get current user if authenticated
        const currentUser = ctx.user;
        
        return ctx.prisma.blog_comments.create({
          data: {
            ...input,
            authorId: currentUser?.id || null,
            status: 'pending', // Default to pending for moderation
          },
          ...fields
        });
      }
    });

    t.field('approveBlogComment', {
      type: 'BlogComment',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_comments.update({
          where: { id },
          data: { status: 'approved' },
          ...fields
        });
      }
    });

    t.field('rejectBlogComment', {
      type: 'BlogComment',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_comments.update({
          where: { id },
          data: { status: 'rejected' },
          ...fields
        });
      }
    });

    t.field('likeBlogPost', {
      type: 'BlogPost',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.blog_posts.update({
          where: { id },
          data: { likes: { increment: 1 } },
          ...fields
        });
      }
    });
  }
});

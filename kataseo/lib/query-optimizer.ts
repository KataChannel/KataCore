import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

// Optimized query builders with proper indexing
export class QueryOptimizer {
  
  // Efficient post queries with proper includes
  static async getOptimizedPosts(params: {
    page?: number
    limit?: number
    status?: 'DRAFT' | 'PUBLISHED'
    categorySlug?: string
    tagSlug?: string
    authorId?: string
    search?: string
    sortBy?: 'updatedAt' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      categorySlug,
      tagSlug,
      authorId,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = params

    const skip = (page - 1) * limit

    // Build where clause efficiently
    const where: Prisma.PostWhereInput = {}
    
    if (status) {
      where.status = status
    }
    
    if (categorySlug) {
      where.categories = {
        some: { slug: categorySlug }
      }
    }
    
    if (tagSlug) {
      where.tags = {
        some: { slug: tagSlug }
      }
    }
    
    if (authorId) {
      where.authorId = authorId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { metaDescription: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Optimized include - only fetch what's needed
    const include: Prisma.PostInclude = {
      author: {
        select: { id: true, email: true, role: true }
      },
      categories: {
        select: { id: true, name: true, slug: true }
      },
      tags: {
        select: { id: true, name: true, slug: true }
      },
      _count: {
        select: { media: true }
      }
    }

    // Execute optimized queries in parallel
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.post.count({ where })
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    }
  }

  // Optimized single post with related data
  static async getOptimizedPost(identifier: string, bySlug = false) {
    const where = bySlug ? { slug: identifier } : { id: identifier }
    
    return await prisma.post.findUnique({
      where,
      include: {
        author: {
          select: { id: true, email: true, role: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        },
        media: {
          select: { 
            id: true, 
            url: true, 
            altText: true, 
            filename: true,
            mimeType: true 
          },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    })
  }

  // Batch operations for better performance
  static async batchCreatePosts(posts: Array<Omit<Prisma.PostCreateInput, 'author'> & { authorId: string }>) {
    return await prisma.$transaction(
      posts.map(post => 
        prisma.post.create({
          data: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            canonicalUrl: post.canonicalUrl,
            status: post.status,
            author: { connect: { id: post.authorId } },
            categories: post.categories,
            tags: post.tags,
            media: post.media
          }
        })
      )
    )
  }

  // Efficient category/tag operations
  static async getOptimizedCategories(withCounts = false) {
    const include = withCounts ? {
      _count: { select: { posts: true } }
    } : undefined

    return await prisma.category.findMany({
      include,
      orderBy: { name: 'asc' }
    })
  }

  static async getOptimizedTags(withCounts = false) {
    const include = withCounts ? {
      _count: { select: { posts: true } }
    } : undefined

    return await prisma.tag.findMany({
      include,
      orderBy: { name: 'asc' }
    })
  }

  // Media queries with pagination
  static async getOptimizedMedia(params: {
    page?: number
    limit?: number
    mimeType?: string
    postId?: string
  }) {
    const { page = 1, limit = 20, mimeType, postId } = params
    const skip = (page - 1) * limit

    const where: Prisma.MediaWhereInput = {}
    
    if (mimeType) {
      where.mimeType = { startsWith: mimeType }
    }
    
    if (postId) {
      where.postId = postId
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, email: true }
          }
        }
      }),
      prisma.media.count({ where })
    ])

    return {
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Related posts with efficient querying
  static async getRelatedPosts(postId: string, limit = 5) {
    // Get current post's categories and tags
    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        categories: { select: { id: true } },
        tags: { select: { id: true } }
      }
    })

    if (!currentPost) return []

    const categoryIds = currentPost.categories.map(c => c.id)
    const tagIds = currentPost.tags.map(t => t.id)

    // Find posts with shared categories or tags
    return await prisma.post.findMany({
      where: {
        AND: [
          { id: { not: postId } },
          { status: 'PUBLISHED' },
          {
            OR: [
              { categories: { some: { id: { in: categoryIds } } } },
              { tags: { some: { id: { in: tagIds } } } }
            ]
          }
        ]
      },
      take: limit,
      include: {
        author: {
          select: { id: true, email: true, role: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }

  // User activity queries
  static async getUserActivity(userId: string, limit = 10) {
    const [posts, uploadedMedia] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true
        }
      }),
      prisma.media.findMany({
        where: { uploadedById: userId },
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          filename: true,
          originalName: true,
          uploadedAt: true
        }
      })
    ])

    return { posts, uploadedMedia }
  }

  // Search with full-text capabilities
  static async searchContent(query: string, params: {
    page?: number
    limit?: number
    status?: 'DRAFT' | 'PUBLISHED'
  }) {
    const { page = 1, limit = 10, status = 'PUBLISHED' } = params
    const skip = (page - 1) * limit

    // Use PostgreSQL full-text search if available
    // For now, using basic text search
    const where: Prisma.PostWhereInput = {
      status,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { metaDescription: { contains: query, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, email: true, role: true }
          },
          categories: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.post.count({ where })
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Analytics queries
  static async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const [
      totalPosts,
      publishedPosts,
      totalCategories,
      totalTags,
      totalMedia,
      recentPosts,
      activeUsers
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.media.count(),
      prisma.post.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.user.count({
        where: {
          posts: {
            some: { createdAt: { gte: startDate } }
          }
        }
      })
    ])

    return {
      totalPosts,
      publishedPosts,
      draftPosts: totalPosts - publishedPosts,
      totalCategories,
      totalTags,
      totalMedia,
      recentPosts,
      activeUsers,
      timeframe,
      generatedAt: new Date().toISOString()
    }
  }
}

// Database connection health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
}

// Query performance measurement
export function withQueryTiming<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  name: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = Date.now()
    try {
      const result = await queryFn(...args)
      const duration = Date.now() - start
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow query detected: ${name} took ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`Query failed: ${name} took ${duration}ms`, error)
      throw error
    }
  }) as T
}

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Cache configuration
const CACHE_TAGS = {
  posts: 'posts',
  categories: 'categories', 
  tags: 'tags',
  media: 'media',
  users: 'users',
  pages: 'pages',
  analytics: 'analytics',
} as const

const CACHE_DURATIONS = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 24 hours
} as const

// Cached data fetchers for posts/content
export const getCachedPosts = unstable_cache(
  async (page: number = 1, limit: number = 10, status?: 'DRAFT' | 'PUBLISHED') => {
    const skip = (page - 1) * limit
    
    const where = status ? { status } : {}
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, email: true, role: true }
          },
          categories: true,
          tags: true,
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
  },
  ['posts-list'],
  {
    tags: [CACHE_TAGS.posts],
    revalidate: CACHE_DURATIONS.medium,
  }
)

export const getCachedPost = unstable_cache(
  async (id: string) => {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, role: true }
        },
        categories: true,
        tags: true,
      }
    })
  },
  ['post-detail'],
  {
    tags: [CACHE_TAGS.posts],
    revalidate: CACHE_DURATIONS.long,
  }
)

export const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, email: true, role: true }
        },
        categories: true,
        tags: true,
      }
    })
  },
  ['post-by-slug'],
  {
    tags: [CACHE_TAGS.posts],
    revalidate: CACHE_DURATIONS.long,
  }
)

export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  },
  ['categories'],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: CACHE_DURATIONS.veryLong,
  }
)

export const getCachedTags = unstable_cache(
  async () => {
    return await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  },
  ['tags'],
  {
    tags: [CACHE_TAGS.tags],
    revalidate: CACHE_DURATIONS.veryLong,
  }
)

export const getCachedMedia = unstable_cache(
  async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit
    
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' }
      }),
      prisma.media.count()
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
  },
  ['media-list'],
  {
    tags: [CACHE_TAGS.media],
    revalidate: CACHE_DURATIONS.medium,
  }
)

export const getCachedPublishedPosts = unstable_cache(
  async (limit: number = 10) => {
    return await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      include: {
        author: {
          select: { id: true, email: true, role: true }
        },
        categories: true,
        tags: true,
      },
      orderBy: { updatedAt: 'desc' }
    })
  },
  ['published-posts'],
  {
    tags: [CACHE_TAGS.posts],
    revalidate: CACHE_DURATIONS.medium,
  }
)

export const getCachedPostsByCategory = unstable_cache(
  async (categorySlug: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          categories: {
            some: { slug: categorySlug }
          }
        },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, email: true, role: true }
          },
          categories: true,
          tags: true,
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          categories: {
            some: { slug: categorySlug }
          }
        }
      })
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
  },
  ['posts-by-category'],
  {
    tags: [CACHE_TAGS.posts, CACHE_TAGS.categories],
    revalidate: CACHE_DURATIONS.medium,
  }
)

export const getCachedPostsByTag = unstable_cache(
  async (tagSlug: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          tags: {
            some: { slug: tagSlug }
          }
        },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, email: true, role: true }
          },
          categories: true,
          tags: true,
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          tags: {
            some: { slug: tagSlug }
          }
        }
      })
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
  },
  ['posts-by-tag'],
  {
    tags: [CACHE_TAGS.posts, CACHE_TAGS.tags],
    revalidate: CACHE_DURATIONS.medium,
  }
)

// Cache invalidation utilities
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache')
  
  for (const tag of tags) {
    revalidateTag(tag)
  }
}

export const CacheUtils = {
  invalidatePosts: () => revalidateCache([CACHE_TAGS.posts]),
  invalidateCategories: () => revalidateCache([CACHE_TAGS.categories]),
  invalidateTags: () => revalidateCache([CACHE_TAGS.tags]),
  invalidateMedia: () => revalidateCache([CACHE_TAGS.media]),
  invalidateUsers: () => revalidateCache([CACHE_TAGS.users]),
  invalidatePages: () => revalidateCache([CACHE_TAGS.pages]),
  invalidateAnalytics: () => revalidateCache([CACHE_TAGS.analytics]),
  invalidateAll: () => revalidateCache(Object.values(CACHE_TAGS)),
}

// Cache statistics for monitoring
export function getCacheInfo() {
  return {
    tags: CACHE_TAGS,
    durations: CACHE_DURATIONS,
    strategy: 'ISR with tag-based invalidation',
    lastUpdated: new Date().toISOString(),
  }
}

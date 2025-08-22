import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { QueryOptimizer } from '@/lib/query-optimizer'

interface AnalyticsParams {
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year'
  startDate?: string
  endDate?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: AnalyticsParams = {
      timeframe: (searchParams.get('timeframe') as AnalyticsParams['timeframe']) || 'month',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined
    }

    const analytics = await generateAnalytics(params)
    
    return NextResponse.json({
      success: true,
      data: analytics,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analytics generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

async function generateAnalytics(params: AnalyticsParams) {
  const { timeframe, startDate, endDate } = params
  
  // Calculate date range
  const now = new Date()
  let start = new Date()
  let end = new Date()

  if (startDate && endDate) {
    start = new Date(startDate)
    end = new Date(endDate)
  } else {
    end = now
    switch (timeframe) {
      case 'day':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'quarter':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
    }
  }

  // Run analytics queries in parallel
  const [
    contentMetrics,
    userMetrics,
    performanceMetrics,
    growthMetrics,
    topContent,
    categoryMetrics,
    tagMetrics
  ] = await Promise.all([
    getContentMetrics(start, end),
    getUserMetrics(start, end),
    getPerformanceMetrics(start, end),
    getGrowthMetrics(timeframe, start, end),
    getTopContent(start, end),
    getCategoryMetrics(start, end),
    getTagMetrics(start, end)
  ])

  return {
    timeframe,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    overview: {
      content: contentMetrics,
      users: userMetrics,
      performance: performanceMetrics
    },
    growth: growthMetrics,
    topContent,
    categories: categoryMetrics,
    tags: tagMetrics
  }
}

async function getContentMetrics(start: Date, end: Date) {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    postsInPeriod,
    totalCategories,
    totalTags,
    totalMedia,
    mediaSize
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.media.count(),
    prisma.media.aggregate({
      _sum: { size: true }
    })
  ])

  return {
    total: {
      posts: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      categories: totalCategories,
      tags: totalTags,
      media: totalMedia
    },
    period: {
      newPosts: postsInPeriod,
      publishRate: totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0
    },
    storage: {
      totalMediaSize: mediaSize._sum.size || 0,
      averageFileSize: totalMedia > 0 ? (mediaSize._sum.size || 0) / totalMedia : 0
    }
  }
}

async function getUserMetrics(start: Date, end: Date) {
  const [
    totalUsers,
    activeUsers,
    newUsers,
    usersByRole
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        posts: {
          some: {
            updatedAt: { gte: start, lte: end }
          }
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })
  ])

  const roleDistribution = usersByRole.reduce((acc, group) => {
    acc[group.role] = group._count.id
    return acc
  }, {} as Record<string, number>)

  return {
    total: totalUsers,
    active: activeUsers,
    new: newUsers,
    roles: roleDistribution,
    activityRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
  }
}

async function getPerformanceMetrics(start: Date, end: Date) {
  // This would integrate with your performance monitoring system
  // For now, we'll return mock data or basic metrics
  const avgPostsPerDay = await prisma.post.count({
    where: {
      createdAt: { gte: start, lte: end }
    }
  })

  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    avgPostsPerDay: daysDiff > 0 ? avgPostsPerDay / daysDiff : 0,
    totalQueries: await getQueryCount(start, end),
    averageResponseTime: await getAverageResponseTime(),
    errorRate: await getErrorRate(start, end)
  }
}

async function getGrowthMetrics(timeframe: string, start: Date, end: Date) {
  // Calculate growth compared to previous period
  const periodLength = end.getTime() - start.getTime()
  const previousStart = new Date(start.getTime() - periodLength)
  const previousEnd = start

  const [
    currentPosts,
    previousPosts,
    currentUsers,
    previousUsers
  ] = await Promise.all([
    prisma.post.count({
      where: { createdAt: { gte: start, lte: end } }
    }),
    prisma.post.count({
      where: { createdAt: { gte: previousStart, lte: previousEnd } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: start, lte: end } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: previousStart, lte: previousEnd } }
    })
  ])

  const postGrowth = previousPosts > 0 ? 
    ((currentPosts - previousPosts) / previousPosts) * 100 : 
    currentPosts > 0 ? 100 : 0

  const userGrowth = previousUsers > 0 ? 
    ((currentUsers - previousUsers) / previousUsers) * 100 : 
    currentUsers > 0 ? 100 : 0

  return {
    posts: {
      current: currentPosts,
      previous: previousPosts,
      growth: postGrowth
    },
    users: {
      current: currentUsers,
      previous: previousUsers,
      growth: userGrowth
    }
  }
}

async function getTopContent(start: Date, end: Date) {
  // Most recent posts
  const recentPosts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      createdAt: { gte: start, lte: end }
    },
    include: {
      author: {
        select: { email: true }
      },
      categories: {
        select: { name: true }
      },
      _count: {
        select: { media: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Top categories by post count
  const topCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: { 
          posts: {
            where: {
              status: 'PUBLISHED',
              createdAt: { gte: start, lte: end }
            }
          }
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: 10
  })

  // Top tags by post count
  const topTags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { 
          posts: {
            where: {
              status: 'PUBLISHED',
              createdAt: { gte: start, lte: end }
            }
          }
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: 10
  })

  return {
    recentPosts,
    topCategories: topCategories.filter(cat => cat._count.posts > 0),
    topTags: topTags.filter(tag => tag._count.posts > 0)
  }
}

async function getCategoryMetrics(start: Date, end: Date) {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const postsInPeriod = await prisma.post.count({
        where: {
          categories: {
            some: { id: category.id }
          },
          createdAt: { gte: start, lte: end }
        }
      })

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        totalPosts: category._count.posts,
        postsInPeriod,
        growth: postsInPeriod
      }
    })
  )

  return categoryData.sort((a, b) => b.totalPosts - a.totalPosts)
}

async function getTagMetrics(start: Date, end: Date) {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  const tagData = await Promise.all(
    tags.map(async (tag) => {
      const postsInPeriod = await prisma.post.count({
        where: {
          tags: {
            some: { id: tag.id }
          },
          createdAt: { gte: start, lte: end }
        }
      })

      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        totalPosts: tag._count.posts,
        postsInPeriod,
        growth: postsInPeriod
      }
    })
  )

  return tagData.sort((a, b) => b.totalPosts - a.totalPosts)
}

// Helper functions for performance metrics
async function getQueryCount(start: Date, end: Date): Promise<number> {
  // This would integrate with your logging system
  // For now, return a mock value
  return Math.floor(Math.random() * 10000)
}

async function getAverageResponseTime(): Promise<number> {
  // This would integrate with your performance monitoring
  // For now, return a mock value
  return Math.floor(Math.random() * 200) + 50
}

async function getErrorRate(start: Date, end: Date): Promise<number> {
  // This would integrate with your error tracking
  // For now, return a mock value
  return Math.random() * 5
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AnalyticsData {
  overview: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    totalCategories: number
    totalTags: number
  }
  postsPerMonth: Array<{
    month: string
    published: number
    drafts: number
  }>
  topPosts: Array<{
    id: string
    title: string
    slug: string
    viewCount: number
    publishedAt: Date | null
  }>
  categoryStats: Array<{
    id: string
    name: string
    postCount: number
    totalViews: number
  }>
  tagStats: Array<{
    id: string
    name: string
    postCount: number
    totalViews: number
  }>
  authorStats: Array<{
    id: string
    displayName: string
    postCount: number
    totalViews: number
  }>
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '6m' // 1m, 3m, 6m, 1y, all
  const authorId = searchParams.get('authorId')

  try {
    const analytics = await generateAnalytics(period, authorId)
    
    return NextResponse.json({
      success: true,
      data: analytics,
      generatedAt: new Date().toISOString(),
      period
    })
  } catch (error) {
    console.error('Analytics generation failed:', error)
    return NextResponse.json(
      { error: 'Analytics generation failed' },
      { status: 500 }
    )
  }
}

async function generateAnalytics(period: string, authorId?: string | null): Promise<AnalyticsData> {
  const dateFilter = getDateFilter(period)
  const authorFilter = authorId ? { authorId } : {}
  
  // Overview stats
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalCategories,
    totalTags
  ] = await Promise.all([
    prisma.post.count({ where: authorFilter }),
    prisma.post.count({ where: { ...authorFilter, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { ...authorFilter, status: 'DRAFT' } }),
    prisma.post.aggregate({
      where: { ...authorFilter, status: 'PUBLISHED' },
      _sum: { viewCount: true }
    }).then(result => result._sum.viewCount || 0),
    prisma.category.count(),
    prisma.tag.count()
  ])

  // Posts per month
  const postsPerMonth = await getPostsPerMonth(dateFilter, authorFilter)
  
  // Top posts by views
  const topPosts = await prisma.post.findMany({
    where: {
      ...authorFilter,
      status: 'PUBLISHED',
      ...(dateFilter ? { publishedAt: dateFilter } : {})
    },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      publishedAt: true
    },
    orderBy: { viewCount: 'desc' },
    take: 10
  })

  // Category stats
  const categoryStats = await getCategoryStats(dateFilter, authorFilter)
  
  // Tag stats
  const tagStats = await getTagStats(dateFilter, authorFilter)
  
  // Author stats (if not filtering by specific author)
  const authorStats = authorId ? [] : await getAuthorStats(dateFilter)

  return {
    overview: {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalCategories,
      totalTags
    },
    postsPerMonth,
    topPosts,
    categoryStats,
    tagStats,
    authorStats
  }
}

function getDateFilter(period: string) {
  const now = new Date()
  let startDate: Date | null = null

  switch (period) {
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      break
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      break
    case '1y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
    case 'all':
    default:
      return null
  }

  return startDate ? { gte: startDate } : null
}

async function getPostsPerMonth(
  dateFilter: { gte: Date } | null,
  authorFilter: { authorId?: string }
) {
  const now = new Date()
  const months = []
  
  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    
    const monthFilter = {
      ...authorFilter,
      createdAt: {
        gte: date,
        lt: nextMonth
      }
    }

    const [published, drafts] = await Promise.all([
      prisma.post.count({
        where: { ...monthFilter, status: 'PUBLISHED' }
      }),
      prisma.post.count({
        where: { ...monthFilter, status: 'DRAFT' }
      })
    ])

    months.push({
      month: date.toISOString().substring(0, 7), // YYYY-MM format
      published,
      drafts
    })
  }

  return months
}

async function getCategoryStats(
  dateFilter: { gte: Date } | null,
  authorFilter: { authorId?: string }
) {
  // Get categories with post counts and view totals
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: {
          ...authorFilter,
          status: 'PUBLISHED',
          ...(dateFilter ? { publishedAt: dateFilter } : {})
        },
        select: {
          viewCount: true
        }
      }
    }
  })

  return categories
    .map(category => ({
      id: category.id,
      name: category.name,
      postCount: category.posts.length,
      totalViews: category.posts.reduce((sum, post) => sum + post.viewCount, 0)
    }))
    .filter(stat => stat.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)
}

async function getTagStats(
  dateFilter: { gte: Date } | null,
  authorFilter: { authorId?: string }
) {
  // Get tags with post counts and view totals
  const tags = await prisma.tag.findMany({
    include: {
      posts: {
        where: {
          ...authorFilter,
          status: 'PUBLISHED',
          ...(dateFilter ? { publishedAt: dateFilter } : {})
        },
        select: {
          viewCount: true
        }
      }
    }
  })

  return tags
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      postCount: tag.posts.length,
      totalViews: tag.posts.reduce((sum, post) => sum + post.viewCount, 0)
    }))
    .filter(stat => stat.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)
}

async function getAuthorStats(dateFilter: { gte: Date } | null) {
  // Get authors with post counts and view totals
  const authors = await prisma.users.findMany({
    include: {
      posts: {
        where: {
          status: 'PUBLISHED',
          ...(dateFilter ? { publishedAt: dateFilter } : {})
        },
        select: {
          viewCount: true
        }
      }
    }
  })

  return authors
    .map(author => ({
      id: author.id,
      displayName: author.displayName,
      postCount: author.posts.length,
      totalViews: author.posts.reduce((sum, post) => sum + post.viewCount, 0)
    }))
    .filter(stat => stat.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10)
}

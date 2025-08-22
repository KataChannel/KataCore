import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { QueryOptimizer } from '@/lib/query-optimizer'

interface SearchParams {
  q?: string
  type?: 'posts' | 'categories' | 'tags' | 'all'
  status?: 'DRAFT' | 'PUBLISHED'
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'date' | 'title'
  dateRange?: 'day' | 'week' | 'month' | 'year'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: SearchParams = {
      q: searchParams.get('q') || '',
      type: (searchParams.get('type') as SearchParams['type']) || 'all',
      status: (searchParams.get('status') as SearchParams['status']) || 'PUBLISHED',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as SearchParams['sortBy']) || 'relevance',
      dateRange: (searchParams.get('dateRange') as SearchParams['dateRange']) || undefined
    }

    if (!params.q || params.q.length < 2) {
      return NextResponse.json({
        results: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        message: 'Search query must be at least 2 characters'
      })
    }

    // Build date filter
    let dateFilter = undefined
    if (params.dateRange) {
      const now = new Date()
      const startDate = new Date()
      
      switch (params.dateRange) {
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
      
      dateFilter = { gte: startDate }
    }

    const results = await performSearch(params, dateFilter)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function performSearch(params: SearchParams, dateFilter?: any) {
  const { q, type, status, page = 1, limit = 10, sortBy } = params
  const skip = (page - 1) * limit

  // Search posts
  if (type === 'posts' || type === 'all') {
    const postResults = await searchPosts(q!, status, skip, limit, sortBy, dateFilter)
    
    if (type === 'posts') {
      return postResults
    }
    
    // If searching all, combine with other results
    const [categoryResults, tagResults] = await Promise.all([
      searchCategories(q!, skip, limit),
      searchTags(q!, skip, limit)
    ])
    
    return {
      results: {
        posts: postResults.posts,
        categories: categoryResults.categories,
        tags: tagResults.tags
      },
      pagination: postResults.pagination,
      total: {
        posts: postResults.pagination.total,
        categories: categoryResults.pagination.total,
        tags: tagResults.pagination.total
      }
    }
  }
  
  // Search specific type
  if (type === 'categories') {
    return await searchCategories(q!, skip, limit)
  }
  
  if (type === 'tags') {
    return await searchTags(q!, skip, limit)
  }
  
  return { results: [], pagination: { page, limit, total: 0, pages: 0 } }
}

async function searchPosts(
  query: string, 
  status?: 'DRAFT' | 'PUBLISHED', 
  skip: number = 0, 
  limit: number = 10,
  sortBy: string = 'relevance',
  dateFilter?: any
) {
  // Build where clause for full-text search
  const where = {
    AND: [
      status ? { status } : {},
      dateFilter ? { createdAt: dateFilter } : {},
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { excerpt: { contains: query, mode: 'insensitive' as const } },
          { metaDescription: { contains: query, mode: 'insensitive' as const } },
          {
            categories: {
              some: {
                name: { contains: query, mode: 'insensitive' as const }
              }
            }
          },
          {
            tags: {
              some: {
                name: { contains: query, mode: 'insensitive' as const }
              }
            }
          }
        ]
      }
    ]
  }

  // Determine sort order
  let orderBy: any = { updatedAt: 'desc' }
  if (sortBy === 'date') {
    orderBy = { createdAt: 'desc' }
  } else if (sortBy === 'title') {
    orderBy = { title: 'asc' }
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
        },
        _count: {
          select: { media: true }
        }
      },
      orderBy
    }),
    prisma.post.count({ where })
  ])

  // Add relevance scoring for search results
  const postsWithScore = posts.map(post => {
    let relevanceScore = 0
    const searchTerm = query.toLowerCase()
    
    // Title matches get highest score
    if (post.title.toLowerCase().includes(searchTerm)) {
      relevanceScore += 10
    }
    
    // Exact title match gets bonus
    if (post.title.toLowerCase() === searchTerm) {
      relevanceScore += 20
    }
    
    // Excerpt matches
    if (post.excerpt?.toLowerCase().includes(searchTerm)) {
      relevanceScore += 5
    }
    
    // Meta description matches
    if (post.metaDescription?.toLowerCase().includes(searchTerm)) {
      relevanceScore += 3
    }
    
    // Category matches
    if (post.categories.some(cat => cat.name.toLowerCase().includes(searchTerm))) {
      relevanceScore += 7
    }
    
    // Tag matches
    if (post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))) {
      relevanceScore += 4
    }

    return {
      ...post,
      relevanceScore,
      searchHighlights: generateHighlights(post, searchTerm)
    }
  })

  // Sort by relevance if requested
  if (sortBy === 'relevance') {
    postsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  return {
    posts: postsWithScore,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

async function searchCategories(query: string, skip: number, limit: number) {
  const where = {
    name: { contains: query, mode: 'insensitive' as const }
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.category.count({ where })
  ])

  return {
    categories,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

async function searchTags(query: string, skip: number, limit: number) {
  const where = {
    name: { contains: query, mode: 'insensitive' as const }
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.tag.count({ where })
  ])

  return {
    tags,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

function generateHighlights(post: any, searchTerm: string) {
  const highlights: string[] = []
  const term = searchTerm.toLowerCase()
  
  // Title highlight
  if (post.title.toLowerCase().includes(term)) {
    highlights.push(highlightText(post.title, searchTerm))
  }
  
  // Excerpt highlight
  if (post.excerpt?.toLowerCase().includes(term)) {
    highlights.push(highlightText(post.excerpt, searchTerm, 150))
  }
  
  return highlights
}

function highlightText(text: string, searchTerm: string, maxLength: number = 200): string {
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  let highlighted = text.replace(regex, '<mark>$1</mark>')
  
  if (highlighted.length > maxLength) {
    const termIndex = highlighted.toLowerCase().indexOf(searchTerm.toLowerCase())
    const start = Math.max(0, termIndex - maxLength / 2)
    const end = Math.min(highlighted.length, start + maxLength)
    highlighted = '...' + highlighted.substring(start, end) + '...'
  }
  
  return highlighted
}

// Search suggestions endpoint
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get search suggestions from popular terms
    const suggestions = await getSearchSuggestions(query)
    
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

async function getSearchSuggestions(query: string): Promise<string[]> {
  const suggestions: Set<string> = new Set()
  
  // Get matching post titles
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      title: { contains: query, mode: 'insensitive' }
    },
    select: { title: true },
    take: 5
  })
  
  posts.forEach(post => {
    suggestions.add(post.title)
  })
  
  // Get matching categories
  const categories = await prisma.category.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' }
    },
    select: { name: true },
    take: 3
  })
  
  categories.forEach(category => {
    suggestions.add(category.name)
  })
  
  // Get matching tags
  const tags = await prisma.tag.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' }
    },
    select: { name: true },
    take: 3
  })
  
  tags.forEach(tag => {
    suggestions.add(tag.name)
  })
  
  return Array.from(suggestions).slice(0, 10)
}

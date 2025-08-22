import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SearchFilters {
  categories?: string[]
  tags?: string[]
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  author?: string
  dateFrom?: string
  dateTo?: string
}

interface SearchResult {
  id: string
  title: string
  excerpt: string
  slug: string
  publishedAt: Date | null
  updatedAt: Date
  categories: { id: string; name: string }[]
  tags: { id: string; name: string }[]
  author: { id: string; displayName: string }
  relevanceScore?: number
}

interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  filters: SearchFilters
  searchTerm?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50)
  const skip = (page - 1) * pageSize

  // Parse filters
  const filters: SearchFilters = {
    categories: searchParams.get('categories')?.split(',').filter(Boolean),
    tags: searchParams.get('tags')?.split(',').filter(Boolean),
    status: (searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') || undefined,
    author: searchParams.get('author') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  }

  try {
    const { results, totalCount } = await searchPosts(query, filters, skip, pageSize)
    
    const response: SearchResponse = {
      results,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      filters,
      searchTerm: query || undefined
    }

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function searchPosts(
  query: string,
  filters: SearchFilters,
  skip: number,
  take: number
): Promise<{ results: SearchResult[]; totalCount: number }> {
  
  // Build where clause
  const whereClause: any = {}

  // Text search
  if (query.trim()) {
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } },
      { metaDescription: { contains: query, mode: 'insensitive' } }
    ]
  }

  // Status filter
  if (filters.status) {
    whereClause.status = filters.status
  } else {
    // Default to published posts only
    whereClause.status = 'PUBLISHED'
  }

  // Author filter
  if (filters.author) {
    whereClause.authorId = filters.author
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    whereClause.publishedAt = {}
    if (filters.dateFrom) {
      whereClause.publishedAt.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      whereClause.publishedAt.lte = new Date(filters.dateTo)
    }
  }

  // Categories filter
  if (filters.categories && filters.categories.length > 0) {
    whereClause.categories = {
      some: {
        id: { in: filters.categories }
      }
    }
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    whereClause.tags = {
      some: {
        id: { in: filters.tags }
      }
    }
  }

  // Execute search with count
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      include: {
        categories: {
          select: { id: true, name: true }
        },
        tags: {
          select: { id: true, name: true }
        },
        author: {
          select: { id: true, displayName: true }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      skip,
      take
    }),
    prisma.post.count({ where: whereClause })
  ])

  // Calculate relevance scores for text search
  const results: SearchResult[] = posts.map(post => {
    const result: SearchResult = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || generateExcerpt(post.content),
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      categories: post.categories,
      tags: post.tags,
      author: post.author
    }

    // Calculate relevance score if there's a search query
    if (query.trim()) {
      result.relevanceScore = calculateRelevanceScore(post, query)
    }

    return result
  })

  // Sort by relevance if there's a search query
  if (query.trim()) {
    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  }

  return { results, totalCount }
}

function calculateRelevanceScore(post: any, query: string): number {
  const searchTerm = query.toLowerCase()
  let score = 0

  // Title matches (highest weight)
  if (post.title?.toLowerCase().includes(searchTerm)) {
    score += 10
    // Exact title match gets bonus
    if (post.title.toLowerCase() === searchTerm) {
      score += 20
    }
  }

  // Excerpt matches
  if (post.excerpt?.toLowerCase().includes(searchTerm)) {
    score += 5
  }

  // Meta description matches
  if (post.metaDescription?.toLowerCase().includes(searchTerm)) {
    score += 3
  }

  // Content matches (lower weight due to potential for many matches)
  const contentText = extractTextFromContent(post.content)
  const contentMatches = (contentText.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length
  score += Math.min(contentMatches * 0.5, 5) // Cap content score contribution

  // Category name matches
  if (post.categories?.some((cat: any) => cat.name.toLowerCase().includes(searchTerm))) {
    score += 3
  }

  // Tag name matches
  if (post.tags?.some((tag: any) => tag.name.toLowerCase().includes(searchTerm))) {
    score += 2
  }

  return score
}

function generateExcerpt(content: any, maxLength: number = 160): string {
  const text = extractTextFromContent(content)
  if (text.length <= maxLength) {
    return text
  }
  
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

function extractTextFromContent(content: any): string {
  if (!content || !Array.isArray(content)) {
    return ''
  }
  
  return content
    .map((block: any) => {
      if (block.type === 'paragraph' && block.content?.text) {
        return block.content.text
      }
      if (block.type === 'heading' && block.content?.text) {
        return block.content.text
      }
      return ''
    })
    .filter(text => text.length > 0)
    .join(' ')
}

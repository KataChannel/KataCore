import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50)
  const skip = (page - 1) * pageSize
  
  const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null
  const authorId = searchParams.get('authorId')
  const categoryId = searchParams.get('categoryId')
  const tagId = searchParams.get('tagId')
  const search = searchParams.get('search')

  try {
    // Build where clause
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (authorId) {
      whereClause.authorId = authorId
    }

    if (categoryId) {
      whereClause.categories = {
        some: { id: categoryId }
      }
    }

    if (tagId) {
      whereClause.tags = {
        some: { id: tagId }
      }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, displayName: true, avatar: true }
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
        orderBy: [
          { updatedAt: 'desc' }
        ],
        skip,
        take: pageSize
      }),
      prisma.post.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      canonicalUrl,
      featuredImage,
      status = 'DRAFT',
      authorId,
      categoryIds = [],
      tagIds = []
    } = body

    // Validate required fields
    if (!title || !authorId) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(title)

    // Check if slug is unique
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this URL slug already exists' },
        { status: 400 }
      )
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        metaTitle,
        metaDescription,
        canonicalUrl,
        featuredImage,
        status,
        authorId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        categories: {
          connect: categoryIds.map((id: string) => ({ id }))
        },
        tags: {
          connect: tagIds.map((id: string) => ({ id }))
        }
      },
      include: {
        author: {
          select: { id: true, displayName: true, avatar: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

import { NextRequest, NextResponse } from 'next/server'
import { Block } from '@/types/editor'

// Mock database for content
let mockContent: Record<string, {
  id: string
  title: string
  slug: string
  blocks: Block[]
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  meta: {
    description?: string
    keywords?: string[]
    ogImage?: string
  }
}> = {}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get single content by ID or slug
    if (id || slug) {
      const content = Object.values(mockContent).find(c => 
        c.id === id || c.slug === slug
      )
      
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ content })
    }

    // Get all content with filters
    let contents = Object.values(mockContent)

    // Apply status filter
    if (status && status !== 'all') {
      contents = contents.filter(c => c.status === status)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      contents = contents.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.slug.toLowerCase().includes(searchLower) ||
        c.meta.description?.toLowerCase().includes(searchLower) ||
        c.blocks.some(block => 
          block.content.toLowerCase().includes(searchLower)
        )
      )
    }

    // Sort by updatedAt (newest first)
    contents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Apply pagination
    const paginatedContents = contents.slice(offset, offset + limit)

    return NextResponse.json({
      contents: paginatedContents,
      total: contents.length,
      hasMore: offset + limit < contents.length
    })

  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, blocks, status = 'draft', meta = {} } = body

    if (!title || !slug || !blocks) {
      return NextResponse.json(
        { error: 'Title, slug, and blocks are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingContent = Object.values(mockContent).find(c => c.slug === slug)
    if (existingContent) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Create new content
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const newContent = {
      id,
      title,
      slug,
      blocks,
      status,
      createdAt: now,
      updatedAt: now,
      meta
    }

    mockContent[id] = newContent

    return NextResponse.json({
      success: true,
      content: newContent,
      message: 'Content created successfully'
    })

  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, blocks, status, meta } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const existingContent = mockContent[id]
    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it conflicts
    if (slug && slug !== existingContent.slug) {
      const conflictingContent = Object.values(mockContent).find(c => 
        c.slug === slug && c.id !== id
      )
      if (conflictingContent) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update content
    const updatedContent = {
      ...existingContent,
      ...(title && { title }),
      ...(slug && { slug }),
      ...(blocks && { blocks }),
      ...(status && { status }),
      ...(meta && { meta: { ...existingContent.meta, ...meta } }),
      updatedAt: new Date().toISOString()
    }

    mockContent[id] = updatedContent

    return NextResponse.json({
      success: true,
      content: updatedContent,
      message: 'Content updated successfully'
    })

  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const existingContent = mockContent[id]
    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    delete mockContent[id]

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    })

  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

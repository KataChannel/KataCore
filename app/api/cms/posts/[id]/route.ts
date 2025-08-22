import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
        media: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            url: true,
            altText: true,
            mimeType: true,
            size: true,
            width: true,
            height: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
      status,
      categoryIds = [],
      tagIds = []
    } = body

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check slug uniqueness if slug is being changed
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this URL slug already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      canonicalUrl,
      featuredImage,
      status
    }

    // Set publishedAt if publishing for the first time
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    // Update the post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...updateData,
        categories: {
          set: [], // Clear existing
          connect: categoryIds.map((id: string) => ({ id }))
        },
        tags: {
          set: [], // Clear existing
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
        },
        media: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            url: true,
            altText: true,
            mimeType: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete the post (related media will be handled by cascade rules)
    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

// Increment view count
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'increment-views') {
      const post = await prisma.post.update({
        where: { id: params.id },
        data: {
          viewCount: {
            increment: 1
          }
        },
        select: {
          id: true,
          viewCount: true
        }
      })

      return NextResponse.json({
        success: true,
        data: post
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

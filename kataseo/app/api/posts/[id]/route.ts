import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// Schema for updating posts
const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'heading', 'embed', 'code']),
    content: z.string().optional(),
    html: z.string().optional(),
    url: z.string().optional(),
    altText: z.string().optional(),
    level: z.number().min(1).max(6).optional(),
    embedUrl: z.string().optional(),
    embedType: z.enum(['youtube', 'vimeo', 'iframe']).optional(),
    language: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  })).optional(),
  metaTitle: z.string().max(60, 'Meta title must be 60 characters or less').optional(),
  metaDescription: z.string().max(160, 'Meta description must be 160 characters or less').optional(),
  status: z.enum(['draft', 'published']).optional(),
  categories: z.array(z.string()).optional(),
})

// GET /api/posts/[id] - Get single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        categories: true,
        tags: true,
        media: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Transform the response for frontend
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      canonicalUrl: post.canonicalUrl,
      content: typeof post.content === 'string' 
        ? JSON.parse(post.content) 
        : post.content || [],
      categories: post.categories,
      tags: post.tags,
      status: post.status, // Keep original format for PostEditor
      author: post.author,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id] - Update post by ID (for PostEditor)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If slug is being updated, check if it's already taken by another post
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findFirst({
        where: {
          slug: body.slug,
          id: { not: id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.content !== undefined) updateData.content = body.content
    if (body.seoTitle !== undefined) updateData.metaTitle = body.seoTitle
    if (body.seoDescription !== undefined) updateData.metaDescription = body.seoDescription
    if (body.canonicalUrl !== undefined) updateData.canonicalUrl = body.canonicalUrl
    if (body.status !== undefined) {
      updateData.status = body.status === 'published' ? 'PUBLISHED' : 'DRAFT'
    }

    // Handle category updates
    if (body.categoryId !== undefined) {
      if (body.categoryId) {
        // Set new category (replace existing)
        updateData.categories = {
          set: [{ id: body.categoryId }]
        }
      } else {
        // Remove all categories
        updateData.categories = {
          set: []
        }
      }
    }

    // Handle tag updates
    if (body.tagIds !== undefined) {
      if (body.tagIds && body.tagIds.length > 0) {
        updateData.tags = {
          set: body.tagIds.map((id: string) => ({ id }))
        }
      } else {
        // Remove all tags
        updateData.tags = {
          set: []
        }
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Error updating post:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title is being updated
    const updateData: Prisma.PostUpdateInput = {}
    
    // Copy basic fields
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.content) updateData.content = JSON.stringify(validatedData.content)
    if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDescription !== undefined) updateData.metaDescription = validatedData.metaDescription
    if (validatedData.status) {
      // Map frontend status to database enum
      updateData.status = validatedData.status === 'published' ? 'PUBLISHED' : 'DRAFT'
    }
    
    if (validatedData.title) {
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      updateData.slug = `${slug}-${Date.now()}`
    }

    // Handle category updates by name
    if (validatedData.categories !== undefined) {
      // First, find or create categories by name
      const categoryConnections = validatedData.categories.map(categoryName => {
        const slug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        
        return {
          where: { name: categoryName },
          create: { 
            name: categoryName,
            slug: `${slug}-${Date.now()}`
          }
        }
      })
      
      updateData.categories = {
        set: [],
        connectOrCreate: categoryConnections
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        categories: true,
        tags: true,
        media: true,
      },
    })

    // Transform response for frontend
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      content: typeof post.content === 'string' 
        ? JSON.parse(post.content) 
        : post.content || [],
      categories: post.categories.map(cat => cat.name),
      status: post.status.toLowerCase(), // Convert to frontend format
      author: post.author,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (hardDelete) {
      // Hard delete - permanently remove from database
      await prisma.post.delete({
        where: { id },
      })
    } else {
      // Soft delete - just update status to indicate deletion
      await prisma.post.update({
        where: { id },
        data: {
          status: 'DRAFT', // You might want to add a DELETED status to the enum
        },
      })
    }

    return NextResponse.json(
      { message: hardDelete ? 'Post permanently deleted' : 'Post deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

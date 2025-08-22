import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { minioClient, bucketName } from '@/lib/minio'
import { z } from 'zod'

// Schema for media update
const mediaUpdateSchema = z.object({
  altText: z.string().optional(),
})

// GET /api/media/[id] - Get single media file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(media)

  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// PATCH /api/media/[id] - Update media file
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate the request body
    const validatedData = mediaUpdateSchema.parse(body)

    // Check if media exists
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    })

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Update the media record
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        altText: validatedData.altText
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedMedia)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get media record first to get filename
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        filename: true
      }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete file from MinIO
    try {
      await minioClient.removeObject(bucketName, media.filename)
    } catch (error) {
      console.error(`Failed to delete file ${media.filename} from MinIO:`, error)
      // Continue with database deletion even if MinIO deletion fails
    }

    // Delete record from database
    await prisma.media.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Media deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}

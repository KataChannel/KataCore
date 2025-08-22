import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { minioClient, bucketName, ensureBucketExists } from '@/lib/minio'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types and sizes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/avi', 'video/ogg']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Schema for media query
const mediaQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(['all', 'image', 'video', 'document']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  postId: z.string().optional(),
})

// Schema for media upload (simplified - no required postId)
const mediaUploadSchema = z.object({
  altText: z.string().optional(),
  postId: z.string().optional(),
})

// GET /api/media - Get media files with search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = mediaQuerySchema.parse({
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      postId: searchParams.get('postId'),
    })

    // Build where clause for search
    const where: Prisma.MediaWhereInput = {}
    
    if (query.search) {
      where.OR = [
        { filename: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    // Type filter
    if (query.type !== 'all') {
      if (query.type === 'image') {
        where.mimeType = { in: ALLOWED_IMAGE_TYPES }
      } else if (query.type === 'video') {
        where.mimeType = { in: ALLOWED_VIDEO_TYPES }
      } else if (query.type === 'document') {
        where.mimeType = { in: ALLOWED_DOCUMENT_TYPES }
      }
    }

    // If postId is specified, only return media for that post
    if (query.postId) {
      where.postId = query.postId
    }

    const skip = (query.page - 1) * query.limit
    
    const media = await prisma.media.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      skip,
      take: query.limit
    })

    return NextResponse.json(media)

  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload media files
export async function POST(request: NextRequest) {
  try {
    await ensureBucketExists()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const altText = formData.get('altText') as string
    const postId = formData.get('postId') as string | null

    if (!files.length) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadResults = []

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed` },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const uniqueFilename = `${uuidv4()}.${fileExtension}`

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Upload to MinIO
      await minioClient.putObject(
        bucketName,
        uniqueFilename,
        buffer,
        file.size,
        {
          'Content-Type': file.type,
          'X-Original-Name': file.name
        }
      )

      // Save metadata to database
      const mediaRecord = await prisma.media.create({
        data: {
          filename: uniqueFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${bucketName}/${uniqueFilename}`,
          uploadedById: '1', // TODO: Get from auth
          altText: altText || null,
          postId: postId || null
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

      uploadResults.push(mediaRecord)
    }

    return NextResponse.json(uploadResults)

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

// DELETE /api/media - Bulk delete media files
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No media IDs provided' },
        { status: 400 }
      )
    }

    // Get media records to find filenames
    const mediaRecords = await prisma.media.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        filename: true
      }
    })

    // Delete files from MinIO
    for (const record of mediaRecords) {
      try {
        await minioClient.removeObject(bucketName, record.filename)
      } catch (error) {
        console.error(`Failed to delete file ${record.filename} from MinIO:`, error)
      }
    }

    // Delete records from database
    await prisma.media.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({
      message: `Successfully deleted ${mediaRecords.length} media files`
    })

  } catch (error) {
    console.error('Error deleting media files:', error)
    return NextResponse.json(
      { error: 'Failed to delete media files' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { MediaFile } from '@/types/editor'

// Create upload directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/media')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const uploadedFiles: MediaFile[] = []

    for (const file of files) {
      if (!file.name || file.size === 0) {
        continue
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed` },
          { status: 400 }
        )
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 10MB' },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const ext = path.extname(file.name)
      const baseName = path.basename(file.name, ext)
      const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_')
      const fileName = `${timestamp}_${sanitizedBaseName}${ext}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      // Save file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create media file object
      const mediaFile: MediaFile = {
        id: `media_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        url: `/uploads/media/${fileName}`,
        filename: fileName,
        originalName: file.name,
        type: file.type,
        size: file.size,
        altText: '',
        caption: '',
        uploadedAt: new Date().toISOString(),
        tags: []
      }

      uploadedFiles.push(mediaFile)
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This is a mock implementation
    // In a real app, you would fetch from a database
    const mockFiles: MediaFile[] = [
      {
        id: 'media_1',
        url: '/uploads/media/sample1.jpg',
        filename: 'sample1.jpg',
        originalName: 'Beautiful Landscape.jpg',
        type: 'image/jpeg',
        size: 245760,
        altText: 'Beautiful mountain landscape',
        caption: 'A stunning view of the mountains',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        tags: ['landscape', 'nature', 'mountains']
      },
      {
        id: 'media_2',
        url: '/uploads/media/sample2.png',
        filename: 'sample2.png',
        originalName: 'UI Screenshot.png',
        type: 'image/png',
        size: 512000,
        altText: 'User interface screenshot',
        caption: 'Dashboard overview screen',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        tags: ['ui', 'screenshot', 'dashboard']
      },
      {
        id: 'media_3',
        url: '/uploads/media/sample3.gif',
        filename: 'sample3.gif',
        originalName: 'Animation.gif',
        type: 'image/gif',
        size: 1024000,
        altText: 'Loading animation',
        caption: 'Smooth loading spinner',
        uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        tags: ['animation', 'loading', 'spinner']
      }
    ]

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredFiles = mockFiles

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredFiles = filteredFiles.filter(file =>
        file.originalName.toLowerCase().includes(searchLower) ||
        file.altText?.toLowerCase().includes(searchLower) ||
        file.caption?.toLowerCase().includes(searchLower) ||
        file.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply type filter
    if (type && type !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.type.startsWith(type))
    }

    // Apply tag filter
    if (tag) {
      filteredFiles = filteredFiles.filter(file => file.tags.includes(tag))
    }

    // Apply pagination
    const paginatedFiles = filteredFiles.slice(offset, offset + limit)

    return NextResponse.json({
      files: paginatedFiles,
      total: filteredFiles.length,
      hasMore: offset + limit < filteredFiles.length
    })

  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

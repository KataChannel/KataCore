import { NextRequest, NextResponse } from 'next/server'

// Mock database for SEO data
let mockSeoData: Record<string, {
  id: string
  path: string
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  robots?: string
  structuredData?: Record<string, any>
  createdAt: string
  updatedAt: string
}> = {
  // Sample SEO data
  'seo_1': {
    id: 'seo_1',
    path: '/',
    title: 'TazaGroup - Home',
    description: 'Welcome to TazaGroup - Your trusted partner in business solutions',
    keywords: ['business', 'solutions', 'tazagroup', 'services'],
    ogTitle: 'TazaGroup - Home',
    ogDescription: 'Welcome to TazaGroup - Your trusted partner in business solutions',
    ogImage: '/images/og-home.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: 'https://app.tazagroup.vn/',
    robots: 'index, follow',
    structuredData: {
      '@type': 'Organization',
      name: 'TazaGroup',
      url: 'https://app.tazagroup.vn'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const path = searchParams.get('path')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get single SEO data by ID or path
    if (id || path) {
      const seoData = Object.values(mockSeoData).find(s => 
        s.id === id || s.path === path
      )
      
      if (!seoData) {
        return NextResponse.json(
          { error: 'SEO data not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ seoData })
    }

    // Get all SEO data with filters
    let seoEntries = Object.values(mockSeoData)

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      seoEntries = seoEntries.filter(s =>
        s.path.toLowerCase().includes(searchLower) ||
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      )
    }

    // Sort by updatedAt (newest first)
    seoEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Apply pagination
    const paginatedEntries = seoEntries.slice(offset, offset + limit)

    return NextResponse.json({
      seoEntries: paginatedEntries,
      total: seoEntries.length,
      hasMore: offset + limit < seoEntries.length
    })

  } catch (error) {
    console.error('SEO fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      path,
      title,
      description,
      keywords = [],
      ogTitle,
      ogDescription,
      ogImage,
      ogType = 'website',
      twitterCard = 'summary',
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonical,
      robots = 'index, follow',
      structuredData
    } = body

    if (!path || !title || !description) {
      return NextResponse.json(
        { error: 'Path, title, and description are required' },
        { status: 400 }
      )
    }

    // Check if path already exists
    const existingSeoData = Object.values(mockSeoData).find(s => s.path === path)
    if (existingSeoData) {
      return NextResponse.json(
        { error: 'SEO data for this path already exists' },
        { status: 409 }
      )
    }

    // Create new SEO data
    const id = `seo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const newSeoData = {
      id,
      path,
      title,
      description,
      keywords,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage,
      ogType,
      twitterCard,
      twitterTitle: twitterTitle || title,
      twitterDescription: twitterDescription || description,
      twitterImage: twitterImage || ogImage,
      canonical,
      robots,
      structuredData,
      createdAt: now,
      updatedAt: now
    }

    mockSeoData[id] = newSeoData

    return NextResponse.json({
      success: true,
      seoData: newSeoData,
      message: 'SEO data created successfully'
    })

  } catch (error) {
    console.error('SEO creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'SEO data ID is required' },
        { status: 400 }
      )
    }

    const existingSeoData = mockSeoData[id]
    if (!existingSeoData) {
      return NextResponse.json(
        { error: 'SEO data not found' },
        { status: 404 }
      )
    }

    // Check if path is being changed and if it conflicts
    if (updates.path && updates.path !== existingSeoData.path) {
      const conflictingSeoData = Object.values(mockSeoData).find(s => 
        s.path === updates.path && s.id !== id
      )
      if (conflictingSeoData) {
        return NextResponse.json(
          { error: 'SEO data for this path already exists' },
          { status: 409 }
        )
      }
    }

    // Update SEO data
    const updatedSeoData = {
      ...existingSeoData,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    mockSeoData[id] = updatedSeoData

    return NextResponse.json({
      success: true,
      seoData: updatedSeoData,
      message: 'SEO data updated successfully'
    })

  } catch (error) {
    console.error('SEO update error:', error)
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
        { error: 'SEO data ID is required' },
        { status: 400 }
      )
    }

    const existingSeoData = mockSeoData[id]
    if (!existingSeoData) {
      return NextResponse.json(
        { error: 'SEO data not found' },
        { status: 404 }
      )
    }

    delete mockSeoData[id]

    return NextResponse.json({
      success: true,
      message: 'SEO data deleted successfully'
    })

  } catch (error) {
    console.error('SEO deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

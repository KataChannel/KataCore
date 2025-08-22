import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SEOAnalysis {
  score: number
  issues: SEOIssue[]
  recommendations: SEORecommendation[]
  summary: SEOSummary
}

interface SEOIssue {
  type: 'critical' | 'warning' | 'info'
  category: 'meta' | 'content' | 'technical' | 'performance'
  title: string
  description: string
  fix: string
}

interface SEORecommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  implementation: string
}

interface SEOSummary {
  metaScore: number
  contentScore: number
  technicalScore: number
  performanceScore: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  const url = searchParams.get('url')

  if (!postId && !url) {
    return NextResponse.json(
      { error: 'Post ID or URL is required' },
      { status: 400 }
    )
  }

  try {
    let post = null
    
    if (postId) {
      post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          categories: true,
          tags: true,
          media: true
        }
      })
    } else if (url) {
      // For external URL analysis (future feature)
      return NextResponse.json(
        { error: 'External URL analysis not yet implemented' },
        { status: 501 }
      )
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const analysis = await analyzeSEO(post)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      analyzedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('SEO analysis failed:', error)
    return NextResponse.json(
      { error: 'SEO analysis failed' },
      { status: 500 }
    )
  }
}

async function analyzeSEO(post: any): Promise<SEOAnalysis> {
  const issues: SEOIssue[] = []
  const recommendations: SEORecommendation[] = []
  
  // Meta Analysis (30% weight)
  const metaScore = analyzeMetaTags(post, issues, recommendations)
  
  // Content Analysis (30% weight)
  const contentScore = analyzeContent(post, issues, recommendations)
  
  // Technical Analysis (25% weight)
  const technicalScore = analyzeTechnical(post, issues, recommendations)
  
  // Performance Analysis (15% weight)
  const performanceScore = analyzePerformance(post, issues, recommendations)
  
  // Calculate overall score with weights
  const overallScore = Math.round(
    (metaScore * 0.3) + 
    (contentScore * 0.3) + 
    (technicalScore * 0.25) + 
    (performanceScore * 0.15)
  )
  
  return {
    score: overallScore,
    issues,
    recommendations,
    summary: {
      metaScore,
      contentScore,
      technicalScore,
      performanceScore
    }
  }
}

function analyzeMetaTags(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100
  
  // Title Analysis
  if (!post.title) {
    issues.push({
      type: 'critical',
      category: 'meta',
      title: 'Missing Title',
      description: 'Post title is required for SEO',
      fix: 'Add a descriptive title to your post'
    })
    score -= 20
  } else {
    if (post.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'meta',
        title: 'Title Too Short',
        description: `Title is ${post.title.length} characters. Optimal length is 30-60 characters`,
        fix: 'Expand the title to be more descriptive'
      })
      score -= 10
    } else if (post.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'meta',
        title: 'Title Too Long',
        description: `Title is ${post.title.length} characters. Optimal length is 30-60 characters`,
        fix: 'Shorten the title to fit within 60 characters'
      })
      score -= 10
    }
  }

  // Meta Title Analysis
  if (!post.metaTitle) {
    recommendations.push({
      priority: 'medium',
      category: 'meta',
      title: 'Add Meta Title',
      description: 'A custom meta title can improve search engine visibility',
      implementation: 'Add a meta title that differs from the post title'
    })
    score -= 5
  } else if (post.metaTitle.length > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      title: 'Meta Title Too Long',
      description: `Meta title is ${post.metaTitle.length} characters`,
      fix: 'Keep meta title under 60 characters'
    })
    score -= 8
  }

  // Meta Description Analysis
  if (!post.metaDescription) {
    issues.push({
      type: 'warning',
      category: 'meta',
      title: 'Missing Meta Description',
      description: 'Meta description helps with search engine rankings',
      fix: 'Add a compelling meta description (150-160 characters)'
    })
    score -= 15
  } else {
    if (post.metaDescription.length < 120) {
      issues.push({
        type: 'info',
        category: 'meta',
        title: 'Meta Description Too Short',
        description: `Meta description is ${post.metaDescription.length} characters`,
        fix: 'Expand meta description to 150-160 characters'
      })
      score -= 5
    } else if (post.metaDescription.length > 160) {
      issues.push({
        type: 'warning',
        category: 'meta',
        title: 'Meta Description Too Long',
        description: `Meta description is ${post.metaDescription.length} characters`,
        fix: 'Shorten meta description to under 160 characters'
      })
      score -= 10
    }
  }

  // Excerpt Analysis
  if (!post.excerpt) {
    recommendations.push({
      priority: 'low',
      category: 'meta',
      title: 'Add Excerpt',
      description: 'An excerpt helps with content discovery and social sharing',
      implementation: 'Add a brief excerpt summarizing the post content'
    })
    score -= 3
  }

  return Math.max(0, score)
}

function analyzeContent(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100
  
  const content = extractTextFromContent(post.content)
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
  
  // Word Count Analysis
  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      category: 'content',
      title: 'Content Too Short',
      description: `Content has ${wordCount} words. Aim for at least 300 words`,
      fix: 'Expand your content to provide more value to readers'
    })
    score -= 15
  } else if (wordCount > 2000) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Consider Breaking Up Long Content',
      description: `Content has ${wordCount} words. Very long articles might benefit from being split`,
      implementation: 'Consider breaking into multiple posts or adding subheadings'
    })
  }

  // Heading Structure Analysis
  const headings = extractHeadingsFromContent(post.content)
  if (headings.length === 0) {
    issues.push({
      type: 'warning',
      category: 'content',
      title: 'No Headings Found',
      description: 'Content lacks heading structure',
      fix: 'Add H2, H3 headings to structure your content'
    })
    score -= 10
  }

  // Category Analysis
  if (!post.categories || post.categories.length === 0) {
    recommendations.push({
      priority: 'medium',
      category: 'content',
      title: 'Add Categories',
      description: 'Categories help organize content and improve navigation',
      implementation: 'Assign relevant categories to this post'
    })
    score -= 5
  }

  // Tags Analysis
  if (!post.tags || post.tags.length === 0) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Add Tags',
      description: 'Tags help with content discovery and SEO',
      implementation: 'Add relevant tags to describe the post topics'
    })
    score -= 3
  }

  return Math.max(0, score)
}

function analyzeTechnical(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100

  // Slug Analysis
  if (!post.slug) {
    issues.push({
      type: 'critical',
      category: 'technical',
      title: 'Missing URL Slug',
      description: 'Post needs a URL slug for proper indexing',
      fix: 'Generate a SEO-friendly URL slug'
    })
    score -= 20
  } else {
    if (post.slug.length > 75) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'URL Slug Too Long',
        description: `Slug is ${post.slug.length} characters. Keep under 75 characters`,
        fix: 'Shorten the URL slug'
      })
      score -= 8
    }
    if (!/^[a-z0-9-]+$/.test(post.slug)) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Invalid Slug Format',
        description: 'Slug contains invalid characters',
        fix: 'Use only lowercase letters, numbers, and hyphens'
      })
      score -= 10
    }
  }

  // Canonical URL
  if (!post.canonicalUrl) {
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      title: 'Add Canonical URL',
      description: 'Canonical URLs help prevent duplicate content issues',
      implementation: 'Set the canonical URL for this post'
    })
    score -= 5
  }

  // Featured Image
  if (!post.featuredImage) {
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      title: 'Add Featured Image',
      description: 'Featured images improve social sharing and user engagement',
      implementation: 'Upload a high-quality featured image'
    })
    score -= 8
  }

  // Image Alt Text Analysis
  if (post.media && post.media.length > 0) {
    const imagesWithoutAlt = post.media.filter((media: any) => 
      media.mimeType.startsWith('image/') && !media.altText
    )
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Missing Image Alt Text',
        description: `${imagesWithoutAlt.length} images missing alt text`,
        fix: 'Add descriptive alt text to all images'
      })
      score -= 10
    }
  }

  return Math.max(0, score)
}

function analyzePerformance(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100

  const content = extractTextFromContent(post.content)
  
  // Reading Time Estimation
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  
  if (readingTime > 15) {
    recommendations.push({
      priority: 'low',
      category: 'performance',
      title: 'Long Reading Time',
      description: `Estimated reading time is ${readingTime} minutes`,
      implementation: 'Consider adding a table of contents or breaking into sections'
    })
    score -= 5
  }

  // Content Structure
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
  const averageParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
  
  if (averageParagraphLength > 500) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Long Paragraphs',
      description: 'Consider breaking up long paragraphs for better readability',
      implementation: 'Split long paragraphs into shorter, more digestible chunks'
    })
    score -= 8
  }

  return Math.max(0, score)
}

// Utility functions
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

function extractHeadingsFromContent(content: any): string[] {
  if (!content || !Array.isArray(content)) {
    return []
  }
  
  return content
    .filter((block: any) => block.type === 'heading')
    .map((block: any) => block.content?.text || '')
    .filter(text => text.length > 0)
}

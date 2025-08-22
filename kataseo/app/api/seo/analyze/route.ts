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
  
  // Meta Analysis
  const metaAnalysis = analyzeMetaTags(post, issues, recommendations)
  
  // Content Analysis
  const contentAnalysis = analyzeContent(post, issues, recommendations)
  
  // Technical Analysis
  const technicalAnalysis = analyzeTechnical(post, issues, recommendations)
  
  // Performance Analysis
  const performanceAnalysis = analyzePerformance(post, issues, recommendations)
  
  // Calculate overall score
  const summary: SEOSummary = {
    metaScore: metaAnalysis,
    contentScore: contentAnalysis,
    technicalScore: technicalAnalysis,
    performanceScore: performanceAnalysis
  }
  
  const overallScore = Math.round(
    (summary.metaScore + summary.contentScore + summary.technicalScore + summary.performanceScore) / 4
  )

  return {
    score: overallScore,
    issues: issues.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1 }
      return priority[b.type] - priority[a.type]
    }),
    recommendations: recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 }
      return priority[b.priority] - priority[a.priority]
    }),
    summary
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
      description: 'Post has no title',
      fix: 'Add a descriptive title to the post'
    })
    score -= 30
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

  // Canonical URL
  if (!post.canonicalUrl) {
    recommendations.push({
      priority: 'medium',
      category: 'technical',
      title: 'Add Canonical URL',
      description: 'Canonical URLs help prevent duplicate content issues',
      implementation: 'Set the canonical URL for this post'
    })
  }

  return Math.max(0, score)
}

function analyzeContent(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100
  
  // Content length analysis
  const contentText = extractTextFromContent(post.content)
  const wordCount = contentText.split(/\s+/).length
  
  if (wordCount < 300) {
    issues.push({
      type: 'warning',
      category: 'content',
      title: 'Content Too Short',
      description: `Post has ${wordCount} words. Aim for at least 300 words`,
      fix: 'Expand the content with more detailed information'
    })
    score -= 20
  } else if (wordCount > 2000) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Consider Breaking Up Long Content',
      description: `Post has ${wordCount} words. Consider breaking into multiple posts`,
      implementation: 'Split content into a series or add section headers'
    })
  }

  // Heading structure analysis
  const headings = extractHeadings(post.content)
  if (headings.h1.length === 0) {
    issues.push({
      type: 'warning',
      category: 'content',
      title: 'Missing H1 Heading',
      description: 'Content should have at least one H1 heading',
      fix: 'Add an H1 heading to structure your content'
    })
    score -= 15
  } else if (headings.h1.length > 1) {
    issues.push({
      type: 'info',
      category: 'content',
      title: 'Multiple H1 Headings',
      description: 'Multiple H1 headings found. Consider using H2-H6 for subheadings',
      fix: 'Use only one H1 heading and structure subheadings with H2-H6'
    })
    score -= 5
  }

  if (headings.h2.length === 0 && wordCount > 500) {
    recommendations.push({
      priority: 'medium',
      category: 'content',
      title: 'Add H2 Subheadings',
      description: 'Longer content benefits from H2 subheadings for better structure',
      implementation: 'Break content into sections with H2 headings'
    })
    score -= 5
  }

  // Keyword analysis (simplified)
  const titleWords = post.title.toLowerCase().split(/\s+/)
  const titleKeywords = titleWords.filter((word: string) => word.length > 3)
  
  if (titleKeywords.length > 0) {
    const keywordDensity = calculateKeywordDensity(contentText, titleKeywords[0])
    
    if (keywordDensity < 0.5) {
      recommendations.push({
        priority: 'medium',
        category: 'content',
        title: 'Improve Keyword Usage',
        description: `Primary keyword "${titleKeywords[0]}" appears rarely in content`,
        implementation: 'Naturally include the primary keyword in the content'
      })
      score -= 10
    } else if (keywordDensity > 3) {
      issues.push({
        type: 'warning',
        category: 'content',
        title: 'Keyword Over-optimization',
        description: `Keyword "${titleKeywords[0]}" may be overused (${keywordDensity.toFixed(1)}% density)`,
        fix: 'Reduce keyword repetition to avoid over-optimization'
      })
      score -= 15
    }
  }

  // Categories and tags
  if (post.categories.length === 0) {
    issues.push({
      type: 'info',
      category: 'content',
      title: 'No Categories',
      description: 'Post is not assigned to any categories',
      fix: 'Assign the post to relevant categories'
    })
    score -= 5
  }

  if (post.tags.length === 0) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Add Tags',
      description: 'Tags help with content organization and discovery',
      implementation: 'Add relevant tags to the post'
    })
    score -= 3
  } else if (post.tags.length > 10) {
    issues.push({
      type: 'info',
      category: 'content',
      title: 'Too Many Tags',
      description: `Post has ${post.tags.length} tags. Consider reducing to 5-10 relevant tags`,
      fix: 'Remove less relevant tags and keep only the most important ones'
    })
    score -= 5
  }

  return Math.max(0, score)
}

function analyzeTechnical(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100

  // Slug analysis
  if (!post.slug) {
    issues.push({
      type: 'critical',
      category: 'technical',
      title: 'Missing Slug',
      description: 'Post has no URL slug',
      fix: 'Generate a SEO-friendly slug'
    })
    score -= 25
  } else {
    if (post.slug.length > 100) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Slug Too Long',
        description: `Slug is ${post.slug.length} characters. Keep under 100 characters`,
        fix: 'Shorten the URL slug'
      })
      score -= 10
    }

    if (!/^[a-z0-9-]+$/.test(post.slug)) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Non-SEO Friendly Slug',
        description: 'Slug contains uppercase letters or special characters',
        fix: 'Use only lowercase letters, numbers, and hyphens in slug'
      })
      score -= 10
    }
  }

  // Image optimization
  if (post.media && post.media.length > 0) {
    const imagesWithoutAlt = post.media.filter((media: any) => !media.altText)
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Images Missing Alt Text',
        description: `${imagesWithoutAlt.length} images are missing alt text`,
        fix: 'Add descriptive alt text to all images'
      })
      score -= 15
    }

    // Check for large images
    const largeImages = post.media.filter((media: any) => media.size > 1024 * 1024) // > 1MB
    
    if (largeImages.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Optimize Large Images',
        description: `${largeImages.length} images are larger than 1MB`,
        implementation: 'Compress images and use modern formats like WebP'
      })
      score -= 5
    }
  } else {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Consider Adding Images',
      description: 'Visual content can improve engagement and SEO',
      implementation: 'Add relevant images to illustrate the content'
    })
  }

  return Math.max(0, score)
}

function analyzePerformance(post: any, issues: SEOIssue[], recommendations: SEORecommendation[]): number {
  let score = 100

  // Content structure for performance
  const contentText = extractTextFromContent(post.content)
  const paragraphs = contentText.split('\n\n').filter((p: string) => p.trim().length > 0)
  
  if (paragraphs.some(p => p.length > 500)) {
    recommendations.push({
      priority: 'low',
      category: 'performance',
      title: 'Break Up Long Paragraphs',
      description: 'Some paragraphs are very long and may hurt readability',
      implementation: 'Split long paragraphs into shorter, more digestible chunks'
    })
    score -= 5
  }

  // Estimated reading time
  const readingTime = Math.ceil(contentText.split(/\s+/).length / 200) // 200 words per minute
  
  if (readingTime > 15) {
    recommendations.push({
      priority: 'low',
      category: 'content',
      title: 'Long Reading Time',
      description: `Estimated reading time is ${readingTime} minutes`,
      implementation: 'Consider adding a table of contents or breaking into multiple posts'
    })
  }

  return Math.max(0, score)
}

// Utility functions
function extractTextFromContent(content: any): string {
  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '')
  }
  
  if (typeof content === 'object' && content !== null) {
    // Handle JSON content (block editor format)
    return JSON.stringify(content).replace(/[{}[\],"]/g, ' ')
  }
  
  return ''
}

function extractHeadings(content: any): { h1: string[], h2: string[], h3: string[], h4: string[], h5: string[], h6: string[] } {
  const headings: { h1: string[], h2: string[], h3: string[], h4: string[], h5: string[], h6: string[] } = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] }
  
  if (typeof content === 'string') {
    const htmlContent = content
    
    for (let i = 1; i <= 6; i++) {
      const regex = new RegExp(`<h${i}[^>]*>(.*?)</h${i}>`, 'gi')
      let match
      
      while ((match = regex.exec(htmlContent)) !== null) {
        headings[`h${i}` as keyof typeof headings].push(match[1].replace(/<[^>]*>/g, ''))
      }
    }
  }
  
  return headings
}

function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const keywordCount = words.filter((word: string) => word.includes(keyword.toLowerCase())).length
  
  return words.length > 0 ? (keywordCount / words.length) * 100 : 0
}

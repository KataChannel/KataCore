import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react'

// Block content type definitions
interface BlockData {
  text?: string
  content?: string
  url?: string
  width?: number
  height?: number
  alt?: string
  altText?: string
  code?: string
  language?: string
  level?: number
}

interface Block {
  id: string
  type: 'text' | 'heading' | 'image' | 'code' | 'embed'
  data: BlockData
}

interface Props {
  params: { slug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/${post.slug}`

  // Extract first image from content blocks for OpenGraph
  const contentBlocks = Array.isArray(post.content) ? (post.content as unknown as Block[]) : []
  const firstImage = contentBlocks
    .find((block: Block) => block.type === 'image')?.data?.url

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || extractTextFromContent(contentBlocks).slice(0, 160),
    keywords: post.tags.map(tag => tag.name).join(', '),
    authors: [{ name: post.author.email }],
    creator: post.author.email,
    publisher: 'KataSEO',
    
    // OpenGraph
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || extractTextFromContent(contentBlocks).slice(0, 160),
      url: postUrl,
      siteName: 'KataSEO',
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.email],
      tags: post.tags.map(tag => tag.name),
      ...(firstImage && {
        images: [{
          url: firstImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg'
        }]
      })
    },

    // Twitter Card
    twitter: {
      card: firstImage ? 'summary_large_image' : 'summary',
      title: post.metaTitle || post.title,
      description: post.metaDescription || extractTextFromContent(contentBlocks).slice(0, 160),
      creator: `@${post.author.email.split('@')[0]}`,
      ...(firstImage && {
        images: [firstImage]
      })
    },

    // Additional SEO
    alternates: {
      canonical: postUrl
    },
    robots: {
      index: post.status === 'PUBLISHED',
      follow: post.status === 'PUBLISHED',
      googleBot: {
        index: post.status === 'PUBLISHED',
        follow: post.status === 'PUBLISHED',
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
    take: 100 // Limit for build performance
  })

  return posts.map((post) => ({
    slug: post.slug
  }))
}

// Get post data
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
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

  return post
}

// Get related posts
async function getRelatedPosts(postId: string, tags: string[], limit = 3) {
  if (tags.length === 0) return []

  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: postId },
      status: 'PUBLISHED',
      tags: {
        some: {
          id: { in: tags }
        }
      }
    },
    include: {
      author: {
        select: {
          email: true
        }
      },
      tags: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })

  return relatedPosts
}

// Extract text content from blocks for meta description
function extractTextFromContent(blocks: Block[]): string {
  const textBlocks = blocks
    .filter(block => block.type === 'text' || block.type === 'heading')
    .map(block => block.data?.text || block.data?.content || '')
    .join(' ')
  
  return textBlocks.replace(/<[^>]*>/g, '').trim()
}

// Render block content
function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case 'text':
      return (
        <div 
          key={index}
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
        />
      )
    
    case 'heading':
      const level = Math.min(Math.max(block.data.level || 1, 1), 6)
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      return (
        <HeadingTag 
          key={index}
          className={`font-bold mb-4 ${
            level === 1 ? 'text-4xl' :
            level === 2 ? 'text-3xl' :
            level === 3 ? 'text-2xl' :
            level === 4 ? 'text-xl' :
            level === 5 ? 'text-lg' : 'text-base'
          }`}
        >
          {block.data.text || block.data.content || ''}
        </HeadingTag>
      )
    
    case 'image':
      if (!block.data.url) return null
      return (
        <figure key={index} className="mb-8">
          <Image
            src={block.data.url}
            alt={block.data.altText || block.data.alt || ''}
            width={800}
            height={600}
            className="w-full h-auto rounded-lg shadow-md"
            priority={index === 0}
          />
          {block.data.altText && (
            <figcaption className="text-sm text-gray-600 text-center mt-2">
              {block.data.altText}
            </figcaption>
          )}
        </figure>
      )
    
    case 'embed':
      if (!block.data.url) return null
      if (block.data.url.includes('youtube.com') || block.data.url.includes('youtu.be')) {
        const videoId = block.data.url.includes('youtu.be') 
          ? block.data.url.split('/').pop()
          : new URL(block.data.url).searchParams.get('v')
        
        return (
          <div key={index} className="mb-8">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        )
      }
      return null
    
    case 'code':
      return (
        <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
          <code className={`language-${block.data.language || 'text'}`}>
            {block.data.code}
          </code>
        </pre>
      )
    
    default:
      return null
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug)

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  const contentBlocks = Array.isArray(post.content) ? (post.content as unknown as Block[]) : []
  const tagIds = post.tags.map(tag => tag.id)
  const relatedPosts = await getRelatedPosts(post.id, tagIds)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || extractTextFromContent(contentBlocks).slice(0, 160),
    author: {
      '@type': 'Person',
      name: post.author.email
    },
    publisher: {
      '@type': 'Organization',
      name: 'KataSEO'
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${post.slug}`,
    keywords: post.tags.map(tag => tag.name).join(', '),
    articleSection: post.categories.map(cat => cat.name).join(', ')
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.createdAt.toString()}>
                  {formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true,
                    locale: vi 
                  })}
                </time>
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="mt-6 flex flex-wrap gap-4">
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map(category => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-lg max-w-none">
            {contentBlocks.map((block, index) => renderBlock(block, index))}
          </div>
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <article key={relatedPost.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link href={`/${relatedPost.slug}`} className="hover:text-blue-600 transition-colors">
                          {relatedPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {extractTextFromContent(Array.isArray(relatedPost.content) ? (relatedPost.content as unknown as Block[]) : []).slice(0, 100)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedPost.author.email}</span>
                        <time dateTime={relatedPost.createdAt.toString()}>
                          {formatDistanceToNow(new Date(relatedPost.createdAt), { locale: vi })}
                        </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}

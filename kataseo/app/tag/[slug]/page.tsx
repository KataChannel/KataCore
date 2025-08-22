import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, User, Tag as TagIcon, ArrowLeft, Hash } from 'lucide-react'

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

// Generate metadata for tag pages
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tag = await getTag(params.slug)

  if (!tag) {
    return {
      title: 'Tag Not Found',
      description: 'The requested tag could not be found.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const tagUrl = `${baseUrl}/tag/${tag.slug}`

  return {
    title: `#${tag.name} - KataSEO Blog`,
    description: `Tất cả bài viết được gắn tag ${tag.name}. Khám phá những kiến thức chuyên sâu và tips hữu ích.`,
    keywords: `${tag.name}, SEO, Digital Marketing, Blog`,
    
    openGraph: {
      title: `#${tag.name} - KataSEO Blog`,
      description: `Tất cả bài viết được gắn tag ${tag.name}. Khám phá những kiến thức chuyên sâu và tips hữu ích.`,
      url: tagUrl,
      siteName: 'KataSEO',
      type: 'website'
    },

    twitter: {
      card: 'summary',
      title: `#${tag.name} - KataSEO Blog`,
      description: `Tất cả bài viết được gắn tag ${tag.name}. Khám phá những kiến thức chuyên sâu và tips hữu ích.`,
    },

    alternates: {
      canonical: tagUrl
    },

    robots: {
      index: true,
      follow: true
    }
  }
}

// Generate static params for tags
export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          status: 'PUBLISHED'
        }
      }
    },
    select: { slug: true }
  })

  return tags.map((tag) => ({
    slug: tag.slug
  }))
}

// Get tag and posts
async function getTag(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          posts: {
            where: { status: 'PUBLISHED' }
          }
        }
      }
    }
  })

  return tag
}

// Extract text from post content for preview
function extractTextFromContent(blocks: Block[]): string {
  const textBlocks = blocks
    .filter(block => block.type === 'text' || block.type === 'heading')
    .map(block => block.data?.text || '')
    .join(' ')
  
  return textBlocks.replace(/<[^>]*>/g, '').trim()
}

// Get first image from post content
function getFirstImage(blocks: Block[]): string | null {
  const imageBlock = blocks.find(block => block.type === 'image')
  return imageBlock?.data?.url || null
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag(params.slug)

  if (!tag) {
    notFound()
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${tag.name} - KataSEO Blog`,
    description: `Tất cả bài viết được gắn tag ${tag.name}`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tag/${tag.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tag._count.posts,
      itemListElement: tag.posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: post.title,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${post.slug}`,
          datePublished: post.createdAt,
          dateModified: post.updatedAt
        }
      }))
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  KataSEO
                </Link>
                <p className="text-gray-600 mt-1">Blog về SEO và Digital Marketing</p>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">Trang chủ</Link>
                <Link href="/admin" className="text-gray-700 hover:text-gray-900 transition-colors">Admin</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Tag Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Trở về trang chủ
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <Hash className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  #{tag.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {tag._count.posts} bài viết
                </p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 max-w-3xl">
              Tất cả bài viết được gắn tag #{tag.name}. Khám phá những nội dung 
              liên quan và tips hữu ích trong chủ đề này.
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {tag.posts.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có bài viết nào với tag #{tag.name}
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy quay lại sau để xem những bài viết mới nhất.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Xem tất cả bài viết
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tag.posts.map(post => {
                const contentBlocks = Array.isArray(post.content) ? (post.content as unknown as Block[]) : []
                const excerpt = extractTextFromContent(contentBlocks)
                const firstImage = getFirstImage(contentBlocks)
                
                return (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {firstImage && (
                      <div className="aspect-video relative">
                        <Image
                          src={firstImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.slice(0, 2).map(category => (
                          <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link href={`/${post.slug}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {excerpt.slice(0, 150)}{excerpt.length > 150 ? '...' : ''}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author.email.split('@')[0]}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.createdAt.toString()}>
                              {formatDistanceToNow(new Date(post.createdAt), { 
                                addSuffix: true,
                                locale: vi 
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                      
                      {post.tags.length > 1 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {post.tags.filter(t => t.id !== tag.id).slice(0, 3).map(postTag => (
                              <Link
                                key={postTag.id}
                                href={`/tag/${postTag.slug}`}
                                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                #{postTag.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar, User, Tag, Search } from 'lucide-react'

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

// Homepage metadata
export const metadata: Metadata = {
  title: 'KataSEO - Blog về SEO và Digital Marketing',
  description: 'Khám phá những kiến thức về SEO, Digital Marketing và phát triển website. Blog chuyên sâu với các bài viết chất lượng cao.',
  keywords: 'SEO, Digital Marketing, Website Development, Content Marketing, Online Marketing',
  authors: [{ name: 'KataSEO Team' }],
  creator: 'KataSEO',
  publisher: 'KataSEO',
  
  openGraph: {
    title: 'KataSEO - Blog về SEO và Digital Marketing',
    description: 'Khám phá những kiến thức về SEO, Digital Marketing và phát triển website.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'KataSEO',
    type: 'website',
    locale: 'vi_VN'
  },

  twitter: {
    card: 'summary_large_image',
    title: 'KataSEO - Blog về SEO và Digital Marketing',
    description: 'Khám phá những kiến thức về SEO, Digital Marketing và phát triển website.',
  },

  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

// Get published posts
async function getPosts() {
  const posts = await prisma.post.findMany({
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
    },
    take: 20
  })

  return posts
}

// Get featured categories
async function getFeaturedCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: { status: 'PUBLISHED' }
          }
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: 6
  })

  return categories
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

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getPosts(),
    getFeaturedCategories()
  ])

  // JSON-LD structured data for homepage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KataSEO',
    description: 'Blog về SEO và Digital Marketing',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
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
                <h1 className="text-3xl font-bold text-gray-900">KataSEO</h1>
                <p className="text-gray-600 mt-1">Blog về SEO và Digital Marketing</p>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-blue-600 font-medium">Trang chủ</Link>
                <Link href="/admin" className="text-gray-700 hover:text-gray-900 transition-colors">Admin</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Khám phá thế giới SEO
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Những kiến thức chuyên sâu về SEO, Digital Marketing và phát triển website để giúp bạn thành công trong thế giới online.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm bài viết..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-900"
                    />
                  </div>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-r-lg transition-colors">
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Chủ đề nổi bật</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    {category._count.posts} bài viết
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Bài viết mới nhất</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-600 mb-6">Hãy bắt đầu viết bài viết đầu tiên của bạn!</p>
              <Link
                href="/admin/posts/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Tạo bài viết
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => {
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
                      
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <Link
                                key={tag.id}
                                href={`/tag/${tag.slug}`}
                                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                #{tag.name}
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

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white text-lg font-semibold mb-4">KataSEO</h3>
                <p className="text-gray-400">
                  Blog chuyên về SEO và Digital Marketing, giúp bạn phát triển online business thành công.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Chủ đề</h4>
                <ul className="space-y-2">
                  {categories.slice(0, 4).map(category => (
                    <li key={category.id}>
                      <Link href={`/category/${category.slug}`} className="hover:text-white transition-colors">
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Liên kết</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
                  <li><Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link></li>
                  <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Thông tin</h4>
                <p className="text-gray-400 text-sm">
                  © 2025 KataSEO. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

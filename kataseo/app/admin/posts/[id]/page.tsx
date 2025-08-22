'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostEditor } from '@/components/admin/posts/PostEditor'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { RequirePermission } from '@/components/auth/ProtectedRoute'
import { Block } from '@/types/editor'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: Block[]
  status: 'DRAFT' | 'PUBLISHED'
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  categories: { id: string; name: string }[]
  tags: { id: string; name: string }[]
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const postId = params.id as string

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found')
            return
          }
          throw new Error('Failed to fetch post')
        }

        const data = await response.json()
        setPost(data)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
          <button
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Post not found</div>
          <button
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  return (
    <RequirePermission permissions={['posts:update']}>
      <AdminLayout>
        <PostEditor
          postId={postId}
          initialData={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: Array.isArray(post.content) ? post.content : [],
            category: post.categories[0],
            tags: post.tags,
            status: post.status.toLowerCase() as 'draft' | 'published',
            seoTitle: post.metaTitle,
            seoDescription: post.metaDescription,
            canonicalUrl: post.canonicalUrl
          }}
        />
      </AdminLayout>
    </RequirePermission>
  )
}

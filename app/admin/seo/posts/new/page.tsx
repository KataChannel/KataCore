'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SEOOptimization } from '@/components/seo'

export default function NewPostPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    featuredImage: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    categoryIds: [] as string[],
    tagIds: [] as string[]
  })
  
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    
    fetchUser();
  }, []);

  const handleSEOChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title // Auto-populate meta title
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('You must be logged in to create a post');
      return;
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/cms/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...formData,
          authorId: user.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Post created successfully:', result)
        router.push(`/admin/seo/posts`)
      } else {
        const error = await response.json()
        console.error('Failed to create post:', error)
        alert(`Failed to create post: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Network error occurred while creating post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!user ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user information...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
              <p className="text-gray-600 mt-1">Author: {user.displayName}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="url-slug"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /posts/{formData.slug}
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Write your content here..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content ? `${formData.content.split(/\s+/).length} words` : '0 words'}
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Brief summary of the post..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL..."
              />
            </div>

            {/* Categories */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <p className="text-sm text-gray-500">Category management will be added here</p>
            </div>

            {/* Tags */}
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <p className="text-sm text-gray-500">Tag management will be added here</p>
            </div>
          </div>
        </div>

        {/* SEO Optimization */}
        <div className="mt-8">
          <SEOOptimization
            content={{
              title: formData.title,
              description: formData.metaDescription,
              content: formData.content,
              slug: formData.slug
            }}
            onChange={handleSEOChange}
          />
        </div>
      </form>
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BlockEditor, EditorProvider, TagSelector, CategorySelector } from '../../editor'
import { Button, Input, Textarea } from '../../ui'
import { Block } from '../../../types/editor'

interface PostEditorProps {
  postId?: string
  initialData?: {
    title: string
    slug: string
    excerpt: string
    content: Block[]
    category?: { id: string; name: string }
    tags?: { id: string; name: string }[]
    status: 'draft' | 'published'
    seoTitle?: string
    seoDescription?: string
    canonicalUrl?: string
  }
}

export function PostEditor({ postId, initialData }: PostEditorProps) {
  const router = useRouter()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState<Block[]>(initialData?.content || [])
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft')
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '')
  
  // Categories and tags state
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category?.id || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map(tag => tag.id) || []
  )

  // Auto-generate slug from title
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    if (!postId) { // Only auto-generate for new posts
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(autoSlug)
    }
  }, [postId])

  // Handle content changes from editor
  const handleContentChange = useCallback((newContent: Block[]) => {
    setContent(newContent)
  }, [])

  // Save post (create or update)
  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!title.trim() || !slug.trim()) {
      alert('Title and slug are required')
      return
    }

    setIsLoading(true)
    
    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        status: publishStatus,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        categoryId: selectedCategory || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined
      }

      const url = postId ? `/api/posts/${postId}` : '/api/posts'
      const method = postId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save post')
      }

      const result = await response.json()
      
      // Redirect to posts list or edit page
      if (postId) {
        alert('Post updated successfully')
      } else {
        router.push(`/admin/posts/${result.id}`)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert(error instanceof Error ? error.message : 'Failed to save post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {postId ? 'Edit Post' : 'Create New Post'}
        </h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-slug"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version of the title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of the post"
                rows={3}
                className="w-full"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
            <BlockEditor
              blocks={content}
              onChange={handleContentChange}
              showPreview={true}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for search engines"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <Textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Description for search engines"
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/post"
                className="w-full"
              />
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories & Tags</h2>
            
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <CategorySelector
                selectedCategory={selectedCategory}
                onChange={setSelectedCategory}
                className="w-full"
              />
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                className="w-full"
              />
            </div>
          </div>

          {/* Post Status */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Draft</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface SEOOptimizationProps {
  content: {
    title?: string
    description?: string
    content?: string
    slug?: string
  }
  onChange: (field: string, value: string) => void
}

interface SEOSuggestion {
  field: string
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion: string
}

export default function SEOOptimization({ content, onChange }: SEOOptimizationProps) {
  const [suggestions, setSuggestions] = useState<SEOSuggestion[]>([])

  const analyzeContent = () => {
    const newSuggestions: SEOSuggestion[] = []

    // Title analysis
    if (!content.title) {
      newSuggestions.push({
        field: 'title',
        type: 'error',
        message: 'Title is required',
        suggestion: 'Add a compelling title for your content'
      })
    } else if (content.title.length < 30) {
      newSuggestions.push({
        field: 'title',
        type: 'warning',
        message: `Title is too short (${content.title.length} characters)`,
        suggestion: 'Optimal title length is 30-60 characters'
      })
    } else if (content.title.length > 60) {
      newSuggestions.push({
        field: 'title',
        type: 'warning',
        message: `Title is too long (${content.title.length} characters)`,
        suggestion: 'Keep title under 60 characters for better SEO'
      })
    }

    // Description analysis
    if (!content.description) {
      newSuggestions.push({
        field: 'description',
        type: 'warning',
        message: 'Meta description is missing',
        suggestion: 'Add a meta description to improve search visibility'
      })
    } else if (content.description.length < 120) {
      newSuggestions.push({
        field: 'description',
        type: 'info',
        message: `Description is short (${content.description.length} characters)`,
        suggestion: 'Optimal meta description length is 150-160 characters'
      })
    } else if (content.description.length > 160) {
      newSuggestions.push({
        field: 'description',
        type: 'warning',
        message: `Description is too long (${content.description.length} characters)`,
        suggestion: 'Keep meta description under 160 characters'
      })
    }

    // Slug analysis
    if (!content.slug) {
      newSuggestions.push({
        field: 'slug',
        type: 'error',
        message: 'URL slug is required',
        suggestion: 'Generate a SEO-friendly URL slug'
      })
    } else if (content.slug.length > 75) {
      newSuggestions.push({
        field: 'slug',
        type: 'warning',
        message: `URL slug is too long (${content.slug.length} characters)`,
        suggestion: 'Keep URL slug under 75 characters'
      })
    } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
      newSuggestions.push({
        field: 'slug',
        type: 'error',
        message: 'URL slug contains invalid characters',
        suggestion: 'Use only lowercase letters, numbers, and hyphens'
      })
    }

    // Content analysis
    if (content.content) {
      const wordCount = content.content.split(/\s+/).filter(word => word.length > 0).length
      
      if (wordCount < 300) {
        newSuggestions.push({
          field: 'content',
          type: 'warning',
          message: `Content is too short (${wordCount} words)`,
          suggestion: 'Aim for at least 300 words for better SEO'
        })
      }

      // Check for headings
      const hasHeadings = /<h[1-6]>/i.test(content.content)
      if (!hasHeadings) {
        newSuggestions.push({
          field: 'content',
          type: 'info',
          message: 'No headings found in content',
          suggestion: 'Add H2, H3 headings to structure your content'
        })
      }
    }

    setSuggestions(newSuggestions)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SEO Optimization</h3>
          <button
            onClick={analyzeContent}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Analyze SEO
          </button>
        </div>

        {/* SEO Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title {content.title && `(${content.title.length} characters)`}
            </label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Enter a compelling title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              Optimal: 30-60 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description {content.description && `(${content.description.length} characters)`}
            </label>
            <textarea
              value={content.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Enter a compelling meta description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              Optimal: 150-160 characters
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug {content.slug && `(${content.slug.length} characters)`}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={content.slug || ''}
                onChange={(e) => onChange('slug', e.target.value)}
                placeholder="url-friendly-slug"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (content.title) {
                    onChange('slug', generateSlug(content.title))
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Generate
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Use lowercase letters, numbers, and hyphens only
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Search Preview</h4>
          <div className="space-y-1">
            <div className="text-blue-600 text-lg font-medium">
              {content.title || 'Your title will appear here'}
            </div>
            <div className="text-green-700 text-sm">
              yoursite.com/{content.slug || 'your-url-slug'}
            </div>
            <div className="text-gray-600 text-sm">
              {content.description || 'Your meta description will appear here...'}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Suggestions</h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.message}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {suggestion.suggestion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Checklist */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Checklist</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!(content.title && content.title.length >= 30 && content.title.length <= 60)}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Title is 30-60 characters</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!(content.description && content.description.length >= 120 && content.description.length <= 160)}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Meta description is 120-160 characters</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!(content.slug && /^[a-z0-9-]+$/.test(content.slug) && content.slug.length <= 75)}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">URL slug is SEO-friendly</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!(content.content && content.content.split(/\s+/).length >= 300)}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Content has at least 300 words</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!(content.content && /<h[1-6]>/i.test(content.content))}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Content includes headings</span>
          </div>
        </div>
      </div>
    </div>
  )
}

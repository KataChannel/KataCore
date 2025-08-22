'use client'

import React, { useState, useEffect } from 'react'
import { Search, Save, RefreshCw, Globe, Image, Code, BarChart3, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface SEOData {
  id?: string
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
}

interface SEOMetaProps {
  initialData?: SEOData
  onSave?: (data: SEOData) => void
  readonly?: boolean
}

export function SEOMeta({ initialData, onSave, readonly = false }: SEOMetaProps) {
  const [seoData, setSeoData] = useState<SEOData>({
    path: '',
    title: '',
    description: '',
    keywords: [],
    ogType: 'website',
    twitterCard: 'summary',
    robots: 'index, follow',
    ...initialData
  })

  const [keywordInput, setKeywordInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [structuredDataInput, setStructuredDataInput] = useState('')
  const [previewMode, setPreviewMode] = useState<'google' | 'facebook' | 'twitter'>('google')

  useEffect(() => {
    if (initialData) {
      setSeoData(initialData)
      if (initialData.structuredData) {
        setStructuredDataInput(JSON.stringify(initialData.structuredData, null, 2))
      }
    }
  }, [initialData])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Parse structured data
      let parsedStructuredData = undefined
      if (structuredDataInput.trim()) {
        try {
          parsedStructuredData = JSON.parse(structuredDataInput)
        } catch (e) {
          alert('Invalid JSON in structured data')
          setLoading(false)
          return
        }
      }

      const dataToSave = {
        ...seoData,
        structuredData: parsedStructuredData
      }

      if (onSave) {
        onSave(dataToSave)
      } else {
        // Save via API
        const response = await fetch('/api/cms/seo', {
          method: seoData.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        })

        if (response.ok) {
          const result = await response.json()
          setSeoData(result.seoData)
          alert('SEO data saved successfully!')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Error saving SEO data')
    } finally {
      setLoading(false)
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData({
        ...seoData,
        keywords: [...seoData.keywords, keywordInput.trim()]
      })
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setSeoData({
      ...seoData,
      keywords: seoData.keywords.filter(k => k !== keyword)
    })
  }

  const analyzeContent = () => {
    // Mock SEO analysis
    const suggestions = []
    
    if (seoData.title.length < 30) {
      suggestions.push('Title is too short (recommended: 30-60 characters)')
    }
    if (seoData.title.length > 60) {
      suggestions.push('Title is too long (recommended: 30-60 characters)')
    }
    if (seoData.description.length < 120) {
      suggestions.push('Description is too short (recommended: 120-160 characters)')
    }
    if (seoData.description.length > 160) {
      suggestions.push('Description is too long (recommended: 120-160 characters)')
    }
    if (seoData.keywords.length < 3) {
      suggestions.push('Add more keywords (recommended: 3-10 keywords)')
    }
    
    alert(suggestions.length > 0 ? suggestions.join('\n') : 'SEO looks good!')
  }

  const renderPreview = () => {
    switch (previewMode) {
      case 'google':
        return (
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {seoData.title || 'Page Title'}
            </div>
            <div className="text-green-700 text-sm mt-1">
              {seoData.canonical || `https://example.com${seoData.path}`}
            </div>
            <div className="text-gray-600 text-sm mt-2">
              {seoData.description || 'Page description will appear here...'}
            </div>
          </div>
        )
      
      case 'facebook':
        return (
          <div className="border rounded-lg overflow-hidden bg-white max-w-md">
            {seoData.ogImage && (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <div className="font-medium text-gray-900">
                {seoData.ogTitle || seoData.title || 'Page Title'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {seoData.ogDescription || seoData.description || 'Page description...'}
              </div>
              <div className="text-gray-500 text-xs mt-2 uppercase">
                example.com
              </div>
            </div>
          </div>
        )
      
      case 'twitter':
        return (
          <div className="border rounded-lg overflow-hidden bg-white max-w-md">
            {seoData.twitterImage && (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <div className="font-medium text-gray-900">
                {seoData.twitterTitle || seoData.title || 'Page Title'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {seoData.twitterDescription || seoData.description || 'Page description...'}
              </div>
              <div className="text-gray-500 text-xs mt-2">
                example.com
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Meta Management</h1>
        <p className="text-gray-600">Configure SEO settings for optimal search engine visibility</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Basic SEO Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Path *
                </label>
                <Input
                  value={seoData.path}
                  onChange={(e) => setSeoData({ ...seoData, path: e.target.value })}
                  placeholder="/page-path"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title * ({seoData.title.length}/60)
                </label>
                <Input
                  value={seoData.title}
                  onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                  placeholder="Page title for search engines"
                  maxLength={60}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description * ({seoData.description.length}/160)
                </label>
                <Textarea
                  value={seoData.description}
                  onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                  placeholder="Page description for search engines"
                  maxLength={160}
                  rows={3}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add keyword"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    disabled={readonly}
                  />
                  <Button 
                    onClick={addKeyword} 
                    variant="outline"
                    disabled={readonly}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {keyword}
                      {!readonly && (
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Open Graph (Facebook)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Title
                </label>
                <Input
                  value={seoData.ogTitle || ''}
                  onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                  placeholder="Leave empty to use main title"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description
                </label>
                <Textarea
                  value={seoData.ogDescription || ''}
                  onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                  placeholder="Leave empty to use main description"
                  rows={2}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Image URL
                </label>
                <Input
                  value={seoData.ogImage || ''}
                  onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Type
                </label>
                <select
                  value={seoData.ogType || 'website'}
                  onChange={(e) => setSeoData({ ...seoData, ogType: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={readonly}
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="profile">Profile</option>
                </select>
              </div>
            </div>
          </div>

          {/* Twitter Cards */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Twitter Cards</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type
                </label>
                <select
                  value={seoData.twitterCard || 'summary'}
                  onChange={(e) => setSeoData({ ...seoData, twitterCard: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={readonly}
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Title
                </label>
                <Input
                  value={seoData.twitterTitle || ''}
                  onChange={(e) => setSeoData({ ...seoData, twitterTitle: e.target.value })}
                  placeholder="Leave empty to use main title"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Description
                </label>
                <Textarea
                  value={seoData.twitterDescription || ''}
                  onChange={(e) => setSeoData({ ...seoData, twitterDescription: e.target.value })}
                  placeholder="Leave empty to use main description"
                  rows={2}
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Image URL
                </label>
                <Input
                  value={seoData.twitterImage || ''}
                  onChange={(e) => setSeoData({ ...seoData, twitterImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  disabled={readonly}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <Input
                  value={seoData.canonical || ''}
                  onChange={(e) => setSeoData({ ...seoData, canonical: e.target.value })}
                  placeholder="https://example.com/page"
                  disabled={readonly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robots
                </label>
                <select
                  value={seoData.robots || 'index, follow'}
                  onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={readonly}
                >
                  <option value="index, follow">Index, Follow</option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structured Data (JSON-LD)
                </label>
                <Textarea
                  value={structuredDataInput}
                  onChange={(e) => setStructuredDataInput(e.target.value)}
                  placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Your Company"}'
                  rows={6}
                  className="font-mono text-sm"
                  disabled={readonly}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {!readonly && (
            <div className="flex gap-4">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save SEO Data
              </Button>
              <Button 
                variant="outline"
                onClick={analyzeContent}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>
          )}
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Preview Tabs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              
              <div className="flex border-b mb-4">
                {[
                  { key: 'google', label: 'Google', icon: Search },
                  { key: 'facebook', label: 'Facebook', icon: Globe },
                  { key: 'twitter', label: 'Twitter', icon: Globe }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewMode(key as any)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 ${
                      previewMode === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {renderPreview()}
            </div>

            {/* SEO Checklist */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Checklist</h3>
              
              <div className="space-y-3 text-sm">
                <div className={`flex items-center gap-2 ${
                  seoData.title.length >= 30 && seoData.title.length <= 60 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    seoData.title.length >= 30 && seoData.title.length <= 60 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                  Title length (30-60 chars)
                </div>

                <div className={`flex items-center gap-2 ${
                  seoData.description.length >= 120 && seoData.description.length <= 160 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    seoData.description.length >= 120 && seoData.description.length <= 160 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                  Description length (120-160 chars)
                </div>

                <div className={`flex items-center gap-2 ${
                  seoData.keywords.length >= 3 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    seoData.keywords.length >= 3 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                  Keywords (3+ recommended)
                </div>

                <div className={`flex items-center gap-2 ${
                  seoData.ogImage 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    seoData.ogImage 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}></div>
                  Open Graph image
                </div>

                <div className={`flex items-center gap-2 ${
                  seoData.canonical 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    seoData.canonical 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}></div>
                  Canonical URL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

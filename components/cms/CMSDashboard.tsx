'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Image, 
  Search, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Globe,
  BarChart3,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CMSStats {
  totalContent: number
  publishedContent: number
  draftContent: number
  totalMedia: number
  totalSeoPages: number
}

interface ContentItem {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  updatedAt: string
}

interface MediaItem {
  id: string
  originalName: string
  type: string
  size: number
  uploadedAt: string
}

interface SeoItem {
  id: string
  path: string
  title: string
  updatedAt: string
}

export function CMSDashboard() {
  const [stats, setStats] = useState<CMSStats>({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalMedia: 0,
    totalSeoPages: 0
  })
  
  const [recentContent, setRecentContent] = useState<ContentItem[]>([])
  const [recentMedia, setRecentMedia] = useState<MediaItem[]>([])
  const [recentSeo, setRecentSeo] = useState<SeoItem[]>([])
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo'>('content')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load content data
      const contentResponse = await fetch('/api/cms/content?limit=5')
      const contentData = await contentResponse.json()
      
      // Load media data
      const mediaResponse = await fetch('/api/cms/media?limit=5')
      const mediaData = await mediaResponse.json()
      
      // Load SEO data
      const seoResponse = await fetch('/api/cms/seo?limit=5')
      const seoData = await seoResponse.json()

      // Update stats
      setStats({
        totalContent: contentData.total || 0,
        publishedContent: contentData.contents?.filter((c: ContentItem) => c.status === 'published').length || 0,
        draftContent: contentData.contents?.filter((c: ContentItem) => c.status === 'draft').length || 0,
        totalMedia: mediaData.total || 0,
        totalSeoPages: seoData.total || 0
      })

      setRecentContent(contentData.contents || [])
      setRecentMedia(mediaData.files || [])
      setRecentSeo(seoData.seoEntries || [])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CMS Dashboard</h1>
        <p className="text-gray-600">Manage your content, media, and SEO settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.publishedContent}</p>
            </div>
            <Globe className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draftContent}</p>
            </div>
            <Edit className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Media Files</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMedia}</p>
            </div>
            <Image className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SEO Pages</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalSeoPages}</p>
            </div>
            <Target className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Content
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Media
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SEO Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Content</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>
            </div>
          </div>
          <div className="p-6">
            {recentContent.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No content yet</p>
                <Button className="mt-4">Create Your First Content</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{content.title}</h3>
                      <p className="text-sm text-gray-500">/{content.slug}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          content.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {content.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Updated {formatDate(content.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Media</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          </div>
          <div className="p-6">
            {recentMedia.length === 0 ? (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No media files yet</p>
                <Button className="mt-4">Upload Your First Media</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMedia.map((media) => (
                  <div key={media.id} className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-sm truncate">{media.originalName}</h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{formatFileSize(media.size)}</span>
                      <span>{formatDate(media.uploadedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">SEO Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add SEO Page
              </Button>
            </div>
          </div>
          <div className="p-6">
            {recentSeo.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No SEO pages configured yet</p>
                <Button className="mt-4">Configure Your First SEO Page</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSeo.map((seo) => (
                  <div key={seo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{seo.title}</h3>
                      <p className="text-sm text-gray-500">{seo.path}</p>
                      <span className="text-xs text-gray-500">
                        Updated {formatDate(seo.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

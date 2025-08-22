'use client'

import { useState, useEffect } from 'react'

interface SEOAnalysis {
  score: number
  issues: Array<{
    type: 'critical' | 'warning' | 'info'
    category: string
    title: string
    description: string
    fix: string
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    title: string
    description: string
    implementation: string
  }>
  summary: {
    metaScore: number
    contentScore: number
    technicalScore: number
    performanceScore: number
  }
}

interface AnalyticsData {
  overview: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    totalCategories: number
    totalTags: number
  }
  postsPerMonth: Array<{
    month: string
    published: number
    drafts: number
  }>
  topPosts: Array<{
    id: string
    title: string
    slug: string
    viewCount: number
    publishedAt: Date | null
  }>
}

export default function SEODashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [selectedPost, setSelectedPost] = useState<string>('')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/cms?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeSEO = async (postId: string) => {
    if (!postId) return
    
    try {
      const response = await fetch(`/api/seo/analyze?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setSeoAnalysis(data.data)
      }
    } catch (error) {
      console.error('Failed to analyze SEO:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tags</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalTags}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts Over Time</h3>
            <div className="space-y-2">
              {analytics.postsPerMonth.slice(-6).map((month) => (
                <div key={month.month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex space-x-4">
                    <span className="text-sm text-green-600">Published: {month.published}</span>
                    <span className="text-sm text-orange-600">Drafts: {month.drafts}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Posts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Posts by Views</h3>
            <div className="space-y-3">
              {analytics.topPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-sm text-gray-500">/{post.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{post.viewCount}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO Analysis Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">SEO Analysis</h3>
          <div className="flex space-x-4">
            <select
              value={selectedPost}
              onChange={(e) => {
                setSelectedPost(e.target.value)
                if (e.target.value) {
                  analyzeSEO(e.target.value)
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a post to analyze</option>
              {analytics?.topPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {seoAnalysis && (
          <div className="space-y-6">
            {/* SEO Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBgColor(seoAnalysis.score)} ${getScoreColor(seoAnalysis.score)}`}>
                {seoAnalysis.score}
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-700">Overall SEO Score</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(seoAnalysis.summary.metaScore)}`}>
                  {seoAnalysis.summary.metaScore}
                </div>
                <p className="text-sm text-gray-600">Meta Tags</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(seoAnalysis.summary.contentScore)}`}>
                  {seoAnalysis.summary.contentScore}
                </div>
                <p className="text-sm text-gray-600">Content</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(seoAnalysis.summary.technicalScore)}`}>
                  {seoAnalysis.summary.technicalScore}
                </div>
                <p className="text-sm text-gray-600">Technical</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(seoAnalysis.summary.performanceScore)}`}>
                  {seoAnalysis.summary.performanceScore}
                </div>
                <p className="text-sm text-gray-600">Performance</p>
              </div>
            </div>

            {/* Issues */}
            {seoAnalysis.issues.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Issues Found</h4>
                <div className="space-y-3">
                  {seoAnalysis.issues.map((issue, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getIssueIcon(issue.type)}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{issue.title}</h5>
                          <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
                          <p className="text-blue-600 text-sm mt-2 font-medium">Fix: {issue.fix}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {seoAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-3">
                  {seoAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getPriorityIcon(rec.priority)}</span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                          <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                          <p className="text-green-600 text-sm mt-2 font-medium">Implementation: {rec.implementation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

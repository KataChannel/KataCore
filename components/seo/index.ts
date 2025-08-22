// SEO Components Export
export { default as SEODashboard } from './SEODashboard'
export { default as PostManager } from './PostManager'
export { default as SEOOptimization } from './SEOOptimization'

// Types
export interface SEOMetrics {
  score: number
  issues: SEOIssue[]
  recommendations: SEORecommendation[]
  summary: SEOSummary
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info'
  category: 'meta' | 'content' | 'technical' | 'performance'
  title: string
  description: string
  fix: string
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  implementation: string
}

export interface SEOSummary {
  metaScore: number
  contentScore: number
  technicalScore: number
  performanceScore: number
}

export interface PostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: any
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  featuredImage: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: Date | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  postCount?: number
}

export interface TagData {
  id: string
  name: string
  slug: string
  description: string | null
  postCount?: number
}

export interface AnalyticsOverview {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalCategories: number
  totalTags: number
}

export interface PostAnalytics {
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
  categoryStats: Array<{
    id: string
    name: string
    postCount: number
    totalViews: number
  }>
  tagStats: Array<{
    id: string
    name: string
    postCount: number
    totalViews: number
  }>
  authorStats: Array<{
    id: string
    displayName: string
    postCount: number
    totalViews: number
  }>
}

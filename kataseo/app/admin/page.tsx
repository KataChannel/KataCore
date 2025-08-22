'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { 
  FileText, 
  Image, 
  Users, 
  Tags, 
  TrendingUp,
  Activity,
  Calendar,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  posts: number
  media: number
  users: number
  categories: number
}

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    posts: 0,
    media: 0,
    users: 0,
    categories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch dashboard statistics
        const endpoints = []
        
        if (hasPermission('posts:read')) {
          endpoints.push(fetch('/api/posts?limit=1').then(r => r.json()))
        }
        if (hasPermission('media:read')) {
          endpoints.push(fetch('/api/media?limit=1').then(r => r.json()))
        }
        if (hasPermission('users:read')) {
          endpoints.push(fetch('/api/users?limit=1').then(r => r.json()))
        }
        if (hasPermission('categories:read')) {
          endpoints.push(fetch('/api/categories?limit=1').then(r => r.json()))
        }

        const results = await Promise.allSettled(endpoints)
        
        // Update stats based on API responses
        setStats(prev => ({
          posts: results[0]?.status === 'fulfilled' ? results[0].value?.total || 0 : prev.posts,
          media: results[1]?.status === 'fulfilled' ? results[1].value?.total || 0 : prev.media,
          users: results[2]?.status === 'fulfilled' ? results[2].value?.total || 0 : prev.users,
          categories: results[3]?.status === 'fulfilled' ? results[3].value?.total || 0 : prev.categories
        }))
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [hasPermission])

  const quickActions = [
    {
      name: 'Create Post',
      href: '/admin/posts/create',
      icon: FileText,
      color: 'bg-blue-500',
      permission: 'posts:create'
    },
    {
      name: 'Upload Media',
      href: '/admin/media?action=upload',
      icon: Image,
      color: 'bg-green-500',
      permission: 'media:create'
    },
    {
      name: 'Add User',
      href: '/admin/users/create',
      icon: Users,
      color: 'bg-purple-500',
      permission: 'users:create'
    },
    {
      name: 'New Category',
      href: '/admin/categories/create',
      icon: Tags,
      color: 'bg-orange-500',
      permission: 'categories:create'
    }
  ]

  const filteredQuickActions = quickActions.filter(action => 
    hasPermission(action.permission)
  )

  const statCards = [
    {
      name: 'Total Posts',
      value: stats.posts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      permission: 'posts:read',
      href: '/admin/posts'
    },
    {
      name: 'Media Files',
      value: stats.media,
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      permission: 'media:read',
      href: '/admin/media'
    },
    {
      name: 'Users',
      value: stats.users,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      permission: 'users:read',
      href: '/admin/users'
    },
    {
      name: 'Categories',
      value: stats.categories,
      icon: Tags,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      permission: 'categories:read',
      href: '/admin/categories'
    }
  ]

  const filteredStatCards = statCards.filter(card => 
    hasPermission(card.permission)
  )

  return (
    <ProtectedRoute requiredPermissions={['admin:access']}>
      <AdminLayout>
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.email}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your website today.
            </p>
          </div>

          {/* Quick Actions */}
          {filteredQuickActions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredQuickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <div className={`inline-flex p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {action.name}
                          </h3>
                        </div>
                      </div>
                      <Plus className="absolute top-4 right-4 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Statistics */}
          {filteredStatCards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStatCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <Link
                      key={card.name}
                      href={card.href}
                      className="group bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                            {card.name}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">
                            {loading ? (
                              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                            ) : (
                              card.value.toLocaleString()
                            )}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Welcome to your admin dashboard!
                    </p>
                    <p className="text-xs text-gray-500">
                      Start by creating your first post or uploading media files.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  fallbackPath = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackPath)
        return
      }

      // Check role requirements
      if (requiredRoles && !hasRole(requiredRoles)) {
        router.push('/unauthorized')
        return
      }

      // Check permission requirements
      if (requiredPermissions) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          hasPermission(permission)
        )
        if (!hasAllPermissions) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, loading, hasRole, hasPermission, requiredRoles, requiredPermissions, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return null // Will redirect
  }

  // Check permission requirements
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    if (!hasAllPermissions) {
      return null // Will redirect
    }
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

export function EditorOrAdmin({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
      {children}
    </ProtectedRoute>
  )
}

// Permission-based protection
export function RequirePermission({ 
  children, 
  permissions 
}: { 
  children: ReactNode
  permissions: string[]
}) {
  return (
    <ProtectedRoute requiredPermissions={permissions}>
      {children}
    </ProtectedRoute>
  )
}

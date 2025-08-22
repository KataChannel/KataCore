'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'GUEST'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, role?: 'ADMIN' | 'EDITOR' | 'GUEST') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  hasRole: (roles: string | string[]) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Permission mapping based on roles
const ROLE_PERMISSIONS = {
  ADMIN: [
    'posts:create', 'posts:read', 'posts:update', 'posts:delete',
    'media:create', 'media:read', 'media:update', 'media:delete',
    'users:create', 'users:read', 'users:update', 'users:delete',
    'categories:create', 'categories:read', 'categories:update', 'categories:delete',
    'tags:create', 'tags:read', 'tags:update', 'tags:delete',
    'admin:access'
  ],
  EDITOR: [
    'posts:create', 'posts:read', 'posts:update',
    'media:create', 'media:read', 'media:update',
    'categories:create', 'categories:read', 'categories:update',
    'tags:create', 'tags:read', 'tags:update',
    'admin:access'
  ],
  GUEST: [
    'posts:read',
    'media:read',
    'categories:read',
    'tags:read'
  ]
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        if (storedToken) {
          // Verify token with server
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setToken(storedToken)
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('authToken')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('authToken', data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (email: string, password: string, role: 'ADMIN' | 'EDITOR' | 'GUEST' = 'GUEST') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after successful registration
        return await login(email, password)
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
  }

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const userPermissions = ROLE_PERMISSIONS[user.role] || []
    return userPermissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        hasRole,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for protected routes
export function useRequireAuth(requiredRoles?: string[]) {
  const { user, loading } = useAuth()
  
  if (loading) return { loading: true, hasAccess: false }
  
  if (!user) return { loading: false, hasAccess: false }
  
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return { loading: false, hasAccess: false }
  }
  
  return { loading: false, hasAccess: true }
}

// Higher-order component for role-based access
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { loading, hasAccess } = useRequireAuth(requiredRoles)
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

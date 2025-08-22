import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock the AuthContext with mutable properties
let mockUser: any = null
let mockToken: string | null = null
let mockLoading = false
const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockLogout = jest.fn()
const mockHasRole = jest.fn()
const mockHasPermission = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    token: mockToken,
    loading: mockLoading,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    hasRole: mockHasRole,
    hasPermission: mockHasPermission,
  }),
}))

// Test component
const TestComponent: React.FC = () => {
  return <div>Protected Content</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = null
    mockToken = null
    mockLoading = false
    mockHasRole.mockReturnValue(false)
    mockHasPermission.mockReturnValue(false)
  })

  it('renders children when user is authenticated', async () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'EDITOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading when authentication is in progress', () => {
    mockLoading = true

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', async () => {
    mockUser = null
    mockToken = null

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to unauthorized when user lacks required role', async () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasRole.mockReturnValue(false)

    render(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized')
    })

    expect(mockHasRole).toHaveBeenCalledWith('ADMIN')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user has required role', () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasRole.mockReturnValue(true)

    render(
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockHasRole).toHaveBeenCalledWith('ADMIN')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to unauthorized when user lacks required permission', async () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'EDITOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasPermission.mockReturnValue(false)

    render(
      <ProtectedRoute requiredPermissions={['delete']}>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized')
    })

    expect(mockHasPermission).toHaveBeenCalledWith('delete')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user has required permission', () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasPermission.mockReturnValue(true)

    render(
      <ProtectedRoute requiredPermissions={['delete']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockHasPermission).toHaveBeenCalledWith('delete')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('handles multiple protection criteria', async () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'EDITOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasRole.mockReturnValue(true)
    mockHasPermission.mockReturnValue(false) // Fails permission check

    render(
      <ProtectedRoute requiredRoles={['EDITOR']} requiredPermissions={['delete']}>
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized')
    })

    expect(mockHasRole).toHaveBeenCalledWith('EDITOR')
    expect(mockHasPermission).toHaveBeenCalledWith('delete')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('passes all protection criteria successfully', () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    mockHasRole.mockReturnValue(true)
    mockHasPermission.mockReturnValue(true)

    render(
      <ProtectedRoute requiredRoles={['ADMIN']} requiredPermissions={['delete']}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(mockHasRole).toHaveBeenCalledWith('ADMIN')
    expect(mockHasPermission).toHaveBeenCalledWith('delete')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows loading state correctly during authentication check', () => {
    mockLoading = true
    mockUser = null
    mockToken = null

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('uses custom fallback path', async () => {
    mockUser = null
    mockToken = null

    render(
      <ProtectedRoute fallbackPath="/custom-login">
        <TestComponent />
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles multiple required roles', () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'EDITOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    // Mock returns true for EDITOR but would be false for ADMIN
    mockHasRole.mockImplementation((role: string) => role === 'EDITOR')

    render(
      <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
        <TestComponent />
      </ProtectedRoute>
    )

    // Should pass if user has any of the required roles
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('handles multiple required permissions', () => {
    mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'EDITOR',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockToken = 'valid-token'
    // Mock returns true for write but would be false for delete
    mockHasPermission.mockImplementation((permission: string) => permission === 'write')

    render(
      <ProtectedRoute requiredPermissions={['write', 'delete']}>
        <TestComponent />
      </ProtectedRoute>
    )

    // Should pass if user has any of the required permissions  
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})

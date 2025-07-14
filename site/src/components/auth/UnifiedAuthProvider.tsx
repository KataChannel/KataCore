// ============================================================================
// TAZA CORE UNIFIED AUTH PROVIDER
// ============================================================================
// Centralized authentication and authorization context
// Follows TazaCore standards for consistency and maintainability

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedPermissionService } from '@/lib/auth/unified-permission.service';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================
interface User {
  id: string;
  email?: string | undefined;
  phone?: string | undefined;
  username?: string | undefined;
  displayName: string;
  avatar?: string | undefined;
  roleId: string;
  role?: {
  id: string;
  name: string;
  permissions: string[];
  level: number;
} | undefined;
  modules?: string[] | undefined;
  permissions?: string[] | undefined;
  isActive: boolean;
  isVerified: boolean;
  provider: string;
}

interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
}

interface AuthContextType {
  // User state
  user: User | null;
  loading: boolean;

  // Permission service
  permissionService: UnifiedPermissionService | null;

  // Core auth methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;

  // Permission methods
  hasPermission: (action: string, resource: string, scope?: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canAccessRoute: (route: string) => boolean;

  // Role methods
  isSuperAdmin: () => boolean;
  isSystemAdmin: () => boolean;
  isManager: () => boolean;
  hasRole: (roleId: string) => boolean;
  hasMinimumRoleLevel: (level: number) => boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================
export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionService, setPermissionService] = useState<UnifiedPermissionService | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Add error state
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  useEffect(() => {
    setIsMounted(true);
    loadUserFromToken();
  }, []);

  useEffect(() => {
    if (user) {
      try {
        const service = new UnifiedPermissionService({
          id: user.id,
          email: user.email || '',
          name: user.displayName,
          roleId: user.roleId,
          role: user.role ? {
            id: user.role.id,
            name: user.role.name,
            description: '',
            level: user.role.level,
            permissions: user.role.permissions.map((p) => {
              const parts = p.split(':');
              return {
                action: parts[0] as any,
                resource: parts[1] || parts[0],
              };
            }),
            modules: user.modules || [],
          } as any : undefined,
          isActive: user.isActive,
        });

        setPermissionService(service);
      } catch (error) {
        console.error('[AUTH] Failed to initialize permission service:', error);
        setPermissionService(null);
      }
    } else {
      setPermissionService(null);
    }
  }, [user]);

  // ==========================================================================
  // AUTH METHODS
  // ==========================================================================

  const loadUserFromToken = useCallback(async () => {
    if (!isMounted) return;
    
    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken') ||
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessToken='))
            ?.split('=')[1];
      }

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Fix: Ensure userData structure matches our User interface
        if (userData && userData.id) {
          const transformedUser: User = {
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            username: userData.username,
            displayName: userData.displayName,
            avatar: userData.avatar,
            roleId: userData.role?.id || userData.roleId,
            role: userData.role ? {
              id: userData.role.id,
              name: userData.role.name,
              permissions: userData.role.permissions || [],
              level: userData.role.level || 1,
            } : undefined,
            modules: userData.modules || [],
            permissions: userData.permissions || [],
            isActive: userData.isActive ?? true,
            isVerified: userData.isVerified ?? false,
            provider: userData.provider || 'email',
          };
          setUser(transformedUser);
        } else {
          console.warn('[AUTH] Invalid user data received');
          localStorage.removeItem('accessToken');
          clearAuthCookies();
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        clearAuthCookies();
      }
    } catch (error) {
      console.error('[AUTH] Failed to load user:', error);
      localStorage.removeItem('accessToken');
      clearAuthCookies();
    } finally {
      setLoading(false);
    }
  }, [isMounted]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null); // Clear previous errors

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store access token
        localStorage.setItem('accessToken', data.accessToken);

        // Transform and set user data to match our interface
        const transformedUser: User = {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          username: data.user.username,
          displayName: data.user.displayName,
          avatar: data.user.avatar,
          roleId: data.user.role?.id || data.user.roleId,
          role: data.user.role ? {
            id: data.user.role.id,
            name: data.user.role.name,
            permissions: data.user.role.permissions || [],
            level: data.user.role.level || 1,
          } : undefined,
          modules: data.user.modules || [],
          permissions: data.user.permissions || [],
          isActive: data.user.isActive ?? true,
          isVerified: data.user.isVerified ?? false,
          provider: data.user.provider || credentials.provider || 'email',
        };

        setUser(transformedUser);

        // Redirect to dashboard or intended page
        const redirectTo =
          new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        router.push(redirectTo);
      } catch (error) {
        console.error('[AUTH] Login error:', error);
        setError(error instanceof Error ? error.message : 'Login failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      // Call logout API if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('[AUTH] Logout API error:', error);
      // Continue with local cleanup even if API fails
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');

      // Clear auth cookies
      clearAuthCookies();

      // Reset state
      setUser(null);
      setPermissionService(null);
      setError(null);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  // Add token refresh functionality
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies for refresh token
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      } else {
        // Refresh failed, logout user
        logout();
        return null;
      }
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
      logout();
      return null;
    }
  }, [logout]);

  const refreshAuth = useCallback(async () => {
    await loadUserFromToken();
  }, [loadUserFromToken]);

  // ==========================================================================
  // PERMISSION METHODS
  // ==========================================================================

  const hasPermission = useCallback(
    (action: string, resource: string, scope: string = 'all'): boolean => {
      if (!permissionService || !user) return false;
      try {
        return permissionService.hasPermission(action, resource, scope as any);
      } catch (error) {
        console.error('[AUTH] Permission check error:', error);
        return false;
      }
    },
    [permissionService, user]
  );

  const hasModuleAccess = useCallback(
    (module: string): boolean => {
      if (!permissionService || !user) return false;
      try {
        return permissionService.hasModuleAccess(module);
      } catch (error) {
        console.error('[AUTH] Module access check error:', error);
        return false;
      }
    },
    [permissionService, user]
  );

  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!permissionService || !user) return false;
      try {
        return permissionService.canAccessRoute(route);
      } catch (error) {
        console.error('[AUTH] Route access check error:', error);
        return false;
      }
    },
    [permissionService, user]
  );

  // ==========================================================================
  // ROLE METHODS
  // ==========================================================================

  const isSuperAdmin = useCallback((): boolean => {
    if (!permissionService) return false;
    return permissionService.isSuperAdmin();
  }, [permissionService]);

  const isSystemAdmin = useCallback((): boolean => {
    if (!permissionService) return false;
    return permissionService.isSystemAdmin();
  }, [permissionService]);

  const isManager = useCallback((): boolean => {
    if (!permissionService) return false;
    return permissionService.isManager();
  }, [permissionService]);

  const hasRole = useCallback(
    (roleId: string): boolean => {
      if (!permissionService) return false;
      return permissionService.hasRole(roleId);
    },
    [permissionService]
  );

  const hasMinimumRoleLevel = useCallback(
    (level: number): boolean => {
      if (!permissionService) return false;
      return permissionService.hasMinimumRoleLevel(level);
    },
    [permissionService]
  );

  // ==========================================================================
  // AUTO TOKEN REFRESH
  // ==========================================================================

  useEffect(() => {
    if (!user) return;

    // Set up automatic token refresh every 14 minutes (assuming 15 min expiry)
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await refreshToken();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  // ==========================================================================
  // IMPROVED UTILITY FUNCTIONS
  // ==========================================================================

  const clearAuthCookies = useCallback(() => {
    const cookies = ['accessToken', 'refreshToken', 'token'];
    cookies.forEach((cookie) => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }, []);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue: AuthContextType = {
    // User state
    user,
    loading,

    // Permission service
    permissionService,

    // Core auth methods
    login,
    logout,
    refreshAuth,

    // Permission methods
    hasPermission,
    hasModuleAccess,
    canAccessRoute,

    // Role methods
    isSuperAdmin,
    isSystemAdmin,
    isManager,
    hasRole,
    hasMinimumRoleLevel,
  };

  // Show error state if needed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center unified-card max-w-md">
          <h1 className="text-2xl font-bold text-error mb-4">Authentication Error</h1>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              refreshAuth();
            }}
            className="unified-button accent"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook to access auth context
 */
function useUnifiedAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

/**
 * Hook for permission checking
 */
function useUnifiedPermissions() {
  const { hasPermission, hasModuleAccess, canAccessRoute } = useUnifiedAuth();

  return {
    hasPermission,
    hasModuleAccess,
    canAccessRoute,
  };
}

/**
 * Hook for role checking
 */
function useUnifiedRoles() {
  const { isSuperAdmin, isSystemAdmin, isManager, hasRole, hasMinimumRoleLevel } = useUnifiedAuth();

  return {
    isSuperAdmin,
    isSystemAdmin,
    isManager,
    hasRole,
    hasMinimumRoleLevel,
  };
}

// ============================================================================
// HOC FOR ROUTE PROTECTION
// ============================================================================

interface WithAuthOptions {
  requireAuth?: boolean;
  requireModule?: string;
  requirePermission?: { action: string; resource: string };
  requireRole?: string;
  requireMinLevel?: number;
  redirectTo?: string;
  fallback?: React.ComponentType;
}

interface PermissionGateProps {
  children: React.ReactNode;
  action?: string;
  resource?: string;
  module?: string;
  role?: string;
  minLevel?: number;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireAuth = true,
    requireModule,
    requirePermission,
    requireRole,
    requireMinLevel,
    redirectTo = '/login',
    fallback: Fallback,
  } = options;

  return function AuthProtectedComponent(props: P) {
    const { user, loading, hasPermission, hasModuleAccess, hasRole, hasMinimumRoleLevel } =
      useUnifiedAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;

      // Check authentication requirement
      if (requireAuth && !user) {
        router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // Check module access requirement
      if (requireModule && !hasModuleAccess(requireModule)) {
        router.push('/?error=module-access-denied');
        return;
      }

      // Check permission requirement
      if (
        requirePermission &&
        !hasPermission(requirePermission.action, requirePermission.resource)
      ) {
        router.push('/?error=permission-denied');
        return;
      }

      // Check role requirement
      if (requireRole && !hasRole(requireRole)) {
        router.push('/?error=role-required');
        return;
      }

      // Check minimum level requirement
      if (requireMinLevel && !hasMinimumRoleLevel(requireMinLevel)) {
        router.push('/?error=insufficient-level');
        return;
      }
    }, [user, loading, router, hasPermission, hasModuleAccess, hasRole, hasMinimumRoleLevel]);

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Show fallback if access denied
    if (requireAuth && !user) {
      return Fallback ? <Fallback /> : null;
    }

    // Check all requirements
    const hasAccess =
      (!requireAuth || user) &&
      (!requireModule || hasModuleAccess(requireModule)) &&
      (!requirePermission || hasPermission(requirePermission.action, requirePermission.resource)) &&
      (!requireRole || hasRole(requireRole)) &&
      (!requireMinLevel || hasMinimumRoleLevel(requireMinLevel));

    if (!hasAccess) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center unified-card max-w-md">
            <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
            <p className="text-text-secondary">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Fix PermissionGate to use CSS classes
export function PermissionGate({
  children,
  action,
  resource,
  module,
  role,
  minLevel,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasModuleAccess, hasRole, hasMinimumRoleLevel, user, loading } = useUnifiedAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return <div className="animate-pulse bg-surface rounded h-4 w-full"></div>;
  }

  // If no user and any permission is required, deny access
  if (!user && (action || resource || module || role || minLevel)) {
    return <>{fallback}</>;
  }

  // Check all conditions
  const hasAccess =
    (!action || !resource || hasPermission(action, resource)) &&
    (!module || hasModuleAccess(module)) &&
    (!role || hasRole(role)) &&
    (!minLevel || hasMinimumRoleLevel(minLevel));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Access badge component
 */
interface AccessBadgeProps {
  module?: string;
  permission?: { action: string; resource: string };
  className?: string;
}

export function AccessBadge({ module, permission, className = '' }: AccessBadgeProps) {
  const { hasModuleAccess, hasPermission, user, loading } = useUnifiedAuth();

  // Show loading state
  if (loading) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ${className}`}>
        Loading...
      </span>
    );
  }

  // No user means no access
  if (!user) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
        No Access
      </span>
    );
  }

  let hasAccess = true;
  let badgeText = 'Full Access';
  let badgeColor = 'bg-green-100 text-green-800';

  if (module) {
    hasAccess = hasModuleAccess(module);
    badgeText = hasAccess ? 'Module Access' : 'No Module Access';
    badgeColor = hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  if (permission) {
    const permissionAccess = hasPermission(permission.action, permission.resource);
    if (module) {
      // If both module and permission are specified, both must be true
      hasAccess = hasAccess && permissionAccess;
      badgeText = hasAccess 
        ? 'Full Access' 
        : hasModuleAccess(module) 
        ? 'Limited Access' 
        : 'No Access';
      badgeColor = hasAccess 
        ? 'bg-green-100 text-green-800' 
        : hasModuleAccess(module) 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-red-100 text-red-800';
    } else {
      // If only permission is specified
      hasAccess = permissionAccess;
      badgeText = hasAccess ? 'Permission Granted' : 'Permission Denied';
      badgeColor = hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor} ${className}`}
    >
      {badgeText}
    </span>
  );
}

/**
 * Login modal component
 */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    provider: 'email',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUnifiedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Login Required</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">Please login to access this module.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email || ''}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password || ''}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================
export {
  UnifiedAuthProvider as AuthProvider,
  useUnifiedAuth,
  useUnifiedPermissions,
  useUnifiedRoles,
};

export type {
  User,
  LoginCredentials,
  AuthContextType,
  WithAuthOptions,
  PermissionGateProps,
  AccessBadgeProps,
  LoginModalProps,
};

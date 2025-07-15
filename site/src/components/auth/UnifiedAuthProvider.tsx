// ============================================================================
// TAZA CORE UNIFIED AUTH PROVIDER
// ============================================================================
// Centralized authentication and authorization context
// Follows TazaCore standards for consistency and maintainability

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedPermissionService } from '@/lib/auth/unified-permission.service';
import { createSafePermissionService, debugUserPermissions } from '@/lib/auth/permission-validator';

// Import unified types from single source of truth
import type {
  User,
  UserRole,
  LoginCredentials,
  AuthContextType,
  WithAuthOptions,
  PermissionGateProps,
  AccessBadgeProps,
  LoginModalProps,
} from '@/types/auth';

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
    console.log('🔍 [AUTH DEBUG] Initial useEffect triggered, setting isMounted to true');
    setIsMounted(true);
    console.log('🔍 [AUTH DEBUG] Calling loadUserFromToken...');
    loadUserFromToken();
  }, []);

  useEffect(() => {
    if (user) {
      try {
        console.log('🔍 [AUTH DEBUG] Creating permission service for user:', user.displayName);
        console.log('🔍 [AUTH DEBUG] User role:', user.role);
        console.log('🔍 [AUTH DEBUG] User role level:', user.role?.level);
        
        // Use safe permission service creation with validation
        const service = createSafePermissionService(user);
        console.log('🔍 [AUTH DEBUG] Permission service created:', !!service);
        
        setPermissionService(service);
        
        if (service) {
          console.log('🔍 [AUTH DEBUG] Permission service initialized successfully for user:', user.displayName);
          // Debug user permissions in development
          if (process.env.NODE_ENV === 'development') {
            debugUserPermissions(user, service);
          }
        } else {
          console.error('[AUTH] Failed to create permission service - invalid user data');
        }
      } catch (error) {
        console.error('[AUTH] Failed to initialize permission service:', error);
        setPermissionService(null);
      }
    } else {
      console.log('🔍 [AUTH DEBUG] No user, clearing permission service');
      setPermissionService(null);
    }
  }, [user]);

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  const clearAuthCookies = useCallback(() => {
    const cookies = ['accessToken', 'refreshToken', 'token'];
    cookies.forEach((cookie) => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }, []);

  // ==========================================================================
  // AUTH METHODS
  // ==========================================================================

  const loadUserFromToken = useCallback(async () => {
    console.log('🔍 [AUTH DEBUG] loadUserFromToken called, isMounted:', isMounted);
    // Remove isMounted check temporarily for debugging
    // if (!isMounted) return;
    
    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken') ||
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessToken='))
            ?.split('=')[1];
      }

      console.log('🔍 [AUTH DEBUG] Token found:', !!token);
      if (!token) {
        console.log('🔍 [AUTH DEBUG] No token found, setting loading to false');
        setLoading(false);
        return;
      }

      console.log('🔍 [AUTH DEBUG] Making request to /api/auth/me');
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 [AUTH DEBUG] Response status:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('🔍 [AUTH DEBUG] User data received:', userData);
        // Fix: Ensure userData structure matches our User interface
        if (userData && userData.id) {
          const transformedUser: User = {
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            username: userData.username,
            displayName: userData.displayName || userData.name || 'User',
            avatar: userData.avatar,
            roleId: userData.role?.id || userData.roleId || 'default',
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
          console.log('🔍 [AUTH DEBUG] Setting user:', transformedUser);
          setUser(transformedUser);
        } else {
          console.warn('[AUTH] Invalid user data received');
          localStorage.removeItem('accessToken');
          clearAuthCookies();
        }
      } else {
        console.log('🔍 [AUTH DEBUG] Response not ok, clearing tokens');
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
  }, [isMounted, clearAuthCookies]);

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
        console.log('🔍 [AUTH DEBUG] Storing token in localStorage:', data.accessToken ? 'YES' : 'NO');
        localStorage.setItem('accessToken', data.accessToken);
        console.log('🔍 [AUTH DEBUG] Token stored, verifying:', localStorage.getItem('accessToken') ? 'FOUND' : 'NOT FOUND');

        // Transform and set user data to match our interface
        const transformedUser: User = {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          username: data.user.username,
          displayName: data.user.displayName || data.user.name || 'User',
          avatar: data.user.avatar,
          roleId: data.user.role?.id || data.user.roleId || 'default',
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

        console.log('🔍 [AUTH DEBUG] Setting user after login:', transformedUser.displayName);
        setUser(transformedUser);
        
        // Ensure auth state is properly updated
        setLoading(false);
        
        // Force a complete auth refresh to ensure state consistency
        setTimeout(async () => {
          await loadUserFromToken();
        }, 500);

        // Only redirect if we're not already on the home page
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '') {
          // Redirect to dashboard or intended page
          const redirectTo =
            new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
          router.push(redirectTo);
        }
        // If we're on the home page, just stay here and show authenticated content
      } catch (error) {
        console.error('[AUTH] Login error:', error);
        setError(error instanceof Error ? error.message : 'Login failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, clearAuthCookies]
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
      console.log('🔍 [AUTH DEBUG] hasMinimumRoleLevel called with level:', level);
      console.log('🔍 [AUTH DEBUG] permissionService:', !!permissionService);
      console.log('🔍 [AUTH DEBUG] user:', user ? `${user.displayName} (roleLevel: ${user.role?.level})` : 'null');
      
      // If no permission service, try direct check from user data
      if (!permissionService) {
        console.log('🔍 [AUTH DEBUG] No permission service, trying direct user check');
        if (user?.role?.level) {
          const directResult = user.role.level >= level;
          console.log('🔍 [AUTH DEBUG] Direct user role level check:', directResult, `(${user.role.level} >= ${level})`);
          return directResult;
        }
        
        // Fallback: Check if user is super admin by roleId
        if (user?.roleId === 'super_admin' || user?.role?.name === 'Super Administrator') {
          console.log('🔍 [AUTH DEBUG] User is super admin, granting access');
          return true;
        }
        
        console.log('🔍 [AUTH DEBUG] No permission service and no direct role level, returning false');
        return false;
      }
      
      const result = permissionService.hasMinimumRoleLevel(level);
      console.log('🔍 [AUTH DEBUG] permissionService.hasMinimumRoleLevel result:', result);
      return result;
    },
    [permissionService, user]
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
      // Clear form
      setCredentials({ email: '', password: '', provider: 'email' });
      // Close modal after successful login
      onClose();
      // Small delay to ensure state updates, then force a refresh if on home page
      setTimeout(() => {
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.location.reload();
        }
      }, 300);
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

// Note: withAuth, PermissionGate, AccessBadge, and LoginModal are already exported above

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModulePermissionService } from '@/lib/auth/module-permission-service';
import { SYSTEM_ROLES } from '@/lib/auth/modules-permissions';

interface User {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  permissionService: ModulePermissionService | null;
  checkModuleAccess: (module: string) => boolean;
  checkPermission: (action: string, resource: string) => boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionService, setPermissionService] = useState<ModulePermissionService | null>(null);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Initialize permission service when user changes
  useEffect(() => {
    if (user) {
      const service = new ModulePermissionService({
        id: user.id,
        email: user.email,
        name: user.displayName,
        roleId: user.roleId,
        departmentId: undefined,
        teamId: undefined,
        isActive: user.isActive,
      });
      setPermissionService(service);
    } else {
      setPermissionService(null);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const checkModuleAccess = (module: string): boolean => {
    if (!permissionService) return false;
    return permissionService.canAccessModule(module);
  };

  const checkPermission = (action: string, resource: string): boolean => {
    if (!permissionService) return false;
    return permissionService.hasPermission(action, resource);
  };

  const login = async (credentials: any) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      permissionService,
      checkModuleAccess,
      checkPermission,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting modules
export function withModuleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredModule: string
) {
  return function ModuleGuardedComponent(props: P) {
    const { user, loading, checkModuleAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (!loading && user && !checkModuleAccess(requiredModule)) {
        router.push('/?error=access-denied');
        return;
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!user || !checkModuleAccess(requiredModule)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don't have permission to access this module.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Component for module access badges
export function ModuleAccessBadge({ module }: { module: string }) {
  const { checkModuleAccess } = useAuth();
  const hasAccess = checkModuleAccess(module);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      hasAccess 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {hasAccess ? 'Accessible' : 'Restricted'}
    </span>
  );
}

// Login modal component
export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-gray-600 mb-4">Please login to access this module.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

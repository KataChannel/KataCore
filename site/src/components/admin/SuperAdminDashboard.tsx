'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  UserPlus,
  Crown,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

interface SuperAdmin {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalEmployees: number;
  recentLogins: number;
  systemHealth: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    checkInitialization();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      loadSuperAdminData();
    }
  }, [isInitialized]);

  const checkInitialization = async () => {
    try {
      const response = await fetch('/api/admin/initialize');
      const data = await response.json();
      setIsInitialized(data.initialized);
      
      if (!data.initialized) {
        setShowInitModal(true);
      }
    } catch (error:any) {
      console.error('Error checking initialization:', error);
      setError('Failed to check system status');
    }
  };

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      console.log('Loading Super Admin data with token:', token ? 'Token exists' : 'No token');
      
      // If no token and system is initialized, redirect to login immediately
      if (!token && isInitialized) {
        console.log('No token found, redirecting to login...');
        window.location.href = '/login';
        return;
      }
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/admin/super-admin', {
        headers
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        // If unauthorized, redirect to login with a helpful message
        if (response.status === 403 || response.status === 401) {
          try {
            const errorData = await response.json();
            
            // Check if it's a redirect request
            if (errorData.redirectTo) {
              window.location.href = errorData.redirectTo;
              return;
            }
            
            // Show a more user-friendly message
            alert('Super Admin access required. Please login as a Super Administrator.\n\nDefault credentials:\nEmail: admin@taza.com\nPassword: TazaAdmin@2024!');
            
            // Redirect to login page
            window.location.href = '/login';
            return;
          } catch (jsonError) {
            // If response is not JSON, just redirect
            window.location.href = '/login';
            return;
          }
        }
        
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to load Super Admin data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setSuperAdmins(data.data.superAdmins);
      setSystemStats(data.data.systemStats);
    } catch (error:any) {
      console.error('Error loading Super Admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSystem = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setupKey: formData.setupKey,
          adminData: {
            email: formData.email,
            password: formData.password,
            displayName: formData.displayName,
            username: formData.username
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize system');
      }

      const result = await response.json();
      setIsInitialized(true);
      setShowInitModal(false);
      
      alert(`System initialized successfully!\nEmail: ${result.data.credentials.email}\nPassword: ${result.data.credentials.password}\n\nPlease login to continue.`);
      
      // Redirect to login page instead of loading data immediately
      window.location.href = '/login';
      
    } catch (error:any) {
      console.error('Error initializing system:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateSuperAdmin = async (formData: any) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create-super-admin',
          userData: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Super Admin');
      }

      setShowCreateModal(false);
      await loadSuperAdminData();
      alert('Super Administrator created successfully!');
    } catch (error:any) {
      console.error('Error creating Super Admin:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleGrantSuperAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to grant Super Administrator role to this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'grant-super-admin',
          userData: { userId }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to grant Super Admin role');
      }

      await loadSuperAdminData();
      alert('Super Administrator role granted successfully!');
    } catch (error:any) {
      console.error('Error granting Super Admin role:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleRevokeSuperAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke Super Administrator role from this user? This action cannot be undone!')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'revoke-super-admin',
          userData: { userId }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke Super Admin role');
      }

      await loadSuperAdminData();
      alert('Super Administrator role revoked successfully!');
    } catch (error:any) {
      console.error('Error revoking Super Admin role:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isInitialized) {
    return <SystemInitializationModal onInitialize={handleInitializeSystem} />;
  }

  // Add authentication check
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  if (!token && isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in as a Super Administrator to access this dashboard.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Default Login Credentials:</h3>
              <p className="text-sm text-gray-700">Email: admin@taza.com</p>
              <p className="text-sm text-gray-700">Password: TazaAdmin@2024!</p>
            </div>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading Super Admin Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={loadSuperAdminData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Super Administrator Dashboard</h1>
              <p className="text-red-100">Complete system control and management</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Super Admin</span>
          </button>
        </div>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Roles</p>
                <p className="text-2xl font-bold text-purple-600">{systemStats.totalRoles}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-sm font-bold text-green-600 uppercase">{systemStats.systemHealth}</p>
              </div>
              <Activity className={`h-8 w-8 ${systemStats.systemHealth === 'operational' ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>
      )}

      {/* Super Administrators List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Super Administrators</h2>
            <span className="text-sm text-gray-500">{superAdmins.length} total</span>
          </div>
        </div>

        <div className="p-6">
          {superAdmins.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No Super Administrators found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {superAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{admin.displayName}</h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {new Date(admin.createdAt).toLocaleDateString()}
                        </span>
                        {admin.lastLoginAt && (
                          <span className="text-xs text-gray-500">
                            Last login: {new Date(admin.lastLoginAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRevokeSuperAdmin(admin.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center space-x-1"
                      title="Revoke Super Admin Role"
                    >
                      <Unlock className="h-3 w-3" />
                      <span>Revoke</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateSuperAdminModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSuperAdmin}
        />
      )}
    </div>
  );
};

// System Initialization Modal
const SystemInitializationModal: React.FC<{ onInitialize: (data: any) => void }> = ({ onInitialize }) => {
  const [formData, setFormData] = useState({
    setupKey: '',
    email: 'admin@taza.com',
    password: 'TazaAdmin@2024!',
    displayName: 'Super Administrator',
    username: 'superadmin'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInitialize(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Initialize TazaCore System</h2>
          <p className="text-gray-600 mt-2">Set up your Super Administrator account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Key
            </label>
            <input
              type="password"
              value={formData.setupKey}
              onChange={(e) => setFormData({ ...formData, setupKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter system setup key"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
          >
            Initialize System
          </button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> This will create the initial Super Administrator account. 
            Make sure to change the default password after first login for security.
          </p>
        </div>
      </div>
    </div>
  );
};

// Create Super Admin Modal
const CreateSuperAdminModal: React.FC<{ 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create Super Administrator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

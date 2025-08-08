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
  Crown,
  Lock,
  Unlock,
  RefreshCw,
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
  recentLogins: number;
  systemHealth: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');

      //console.log('Loading Super Admin data with token:', token ? 'Token exists' : 'No token');

      // If no token, redirect to login immediately
      if (!token) {
        //console.log('No token found, redirecting to login...');
       // window.location.href = '/login';
        return;
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/super-admin', {
        headers,
      });

      //console.log('Response status:', response.status);

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
            alert(
              'Super Admin access required. Please login as a Super Administrator.\n\nDefault credentials:\nEmail: admin@taza.com\nPassword: TazaAdmin@2024!'
            );

            // Redirect to login page
           // window.location.href = '/login';
            return;
          } catch (jsonError) {
            // If response is not JSON, just redirect
            // window.location.href = '/login';
            return;
          }
        }

        const errorText = await response.text();
       // console.log('Error response:', errorText);
        throw new Error(`Failed to load Super Admin data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      //console.log('Received data:', data);
      setSuperAdmins(data.data.superAdmins);
      setSystemStats(data.data.systemStats);
    } catch (error: any) {
      //console.error('Error loading Super Admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add authentication check
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  if (!token) {
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
              <p className="text-sm text-gray-700">Email: it@tazagroup.vn</p>
              <p className="text-sm text-gray-700">Password: 123456</p>
            </div>
            <button
              onClick={() => (window.location.href = '/login')}
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
          <div className="bg-white/10 text-white px-4 py-2 rounded-lg">
            <span className="text-sm">Use Permission Management to create/modify users</span>
          </div>
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
                <p className="text-sm font-bold text-green-600 uppercase">
                  {systemStats.systemHealth}
                </p>
              </div>
              <Activity
                className={`h-8 w-8 ${systemStats.systemHealth === 'operational' ? 'text-green-500' : 'text-red-500'}`}
              />
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
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{admin.displayName}</h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
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
                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      Use Permission Management to modify roles
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

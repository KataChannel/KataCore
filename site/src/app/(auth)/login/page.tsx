'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
      if (token) {
        // Set a flag to prevent immediate redirect during token verification
        const isVerifying = sessionStorage.getItem('token-verifying');
        if (isVerifying) return;
        
        sessionStorage.setItem('token-verifying', 'true');
        
        // Verify token is still valid
        fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(async (response) => {
            if (response.ok) {
              const userData = await response.json();
              console.log('User data:', userData);
              if (userData && userData.role?.level >= 3) {
                // Set a flag to prevent admin layout from redirecting back
                sessionStorage.setItem('user-authenticated', 'true');
                // Add a small delay to ensure auth context is ready
                setTimeout(() => {
                  router.push('/admin');
                }, 100);
              } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('authToken');
                console.log('User role level insufficient for admin access:', userData?.role?.level);
              }
            } else {
              // Token invalid, clear it
              localStorage.removeItem('accessToken');
              localStorage.removeItem('authToken');
            }
          })
          .catch((error) => {
            console.warn('Auth check failed:', error);
            // Token invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('authToken');
          })
          .finally(() => {
            sessionStorage.removeItem('token-verifying');
          });
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          provider: 'email',
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Set authentication flag before navigation
      sessionStorage.setItem('user-authenticated', 'true');

      setMessage('Đăng nhập thành công! Đang chuyển hướng...');
      console.log('Login successful:', data);
      
      // Check if user is Super Admin (level 10) or Admin (level >= 3)
      if (data.user?.role?.level === 10) {
        setTimeout(() => router.push('/admin/super-admin'), 1000);
      } else if (data.user?.role?.level >= 3) {
        setTimeout(() => router.push('/admin'), 1000);
      } else {
        // For users below admin level, redirect to appropriate page
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đã xảy ra lỗi trong quá trình đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fillSuperAdminCredentials = () => {
    setFormData({
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
    });
    setError(null);
    setMessage('Đã điền thông tin tài khoản Super Admin');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Chào mừng đến với TazaCore</h1>
        <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
      </div>

      {/* Default Credentials Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Tài khoản Super Admin mặc định</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                <strong>Email:</strong> superadmin@tazacore.com
              </p>
              <p>
                <strong>Mật khẩu:</strong> SuperAdmin@2024
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={fillSuperAdminCredentials}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Sử dụng thông tin này
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{message}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            placeholder="Nhập địa chỉ email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang đăng nhập...
            </div>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="text-sm text-gray-500">
          <p>Cần hỗ trợ? Liên hệ quản trị viên hệ thống</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-red-600 hover:text-red-700"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

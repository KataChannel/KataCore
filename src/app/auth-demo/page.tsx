'use client';

import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/auth';

type AuthMode = 'login' | 'register' | 'demo';

export default function AuthDemo() {
  const [authMode, setAuthMode] = useState<AuthMode>('demo');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (credentials: any) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Đăng nhập thành công! Chào mừng ${data.user.displayName}`);
        // Redirect or update state as needed
      } else {
        setMessage(`❌ Lỗi đăng nhập: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Lỗi kết nối: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (credentials: any) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Đăng ký thành công! Chào mừng ${data.user.displayName}`);
        // Redirect or update state as needed
      } else {
        setMessage(`❌ Lỗi đăng ký: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Lỗi kết nối: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setAuthMode('demo');
    setMessage(null);
  };

  if (authMode === 'login') {
    return <LoginForm onLogin={handleLogin} onBack={handleBack} loading={loading} />;
  }

  if (authMode === 'register') {
    return <RegisterForm onRegister={handleRegister} onBack={handleBack} loading={loading} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 TazaCore Authentication System
            </h1>
            <p className="text-gray-600 text-lg">
              Hệ thống xác thực toàn diện với nhiều phương thức đăng nhập
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Feature Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔐 Tính năng đăng nhập</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-3">📧</span>
                  <div>
                    <div className="font-medium">Email & Mật khẩu</div>
                    <div className="text-sm text-gray-600">Đăng nhập truyền thống với email</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 mr-3">📱</span>
                  <div>
                    <div className="font-medium">Số điện thoại & OTP</div>
                    <div className="text-sm text-gray-600">Xác thực qua SMS với mã OTP</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-600 mr-3">👤</span>
                  <div>
                    <div className="font-medium">Tên đăng nhập</div>
                    <div className="text-sm text-gray-600">Đăng nhập với username tùy chỉnh</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 mr-3">🌐</span>
                  <div>
                    <div className="font-medium">Mạng xã hội</div>
                    <div className="text-sm text-gray-600">Google, Facebook, Apple OAuth</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📝 Tính năng đăng ký</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-indigo-600 mr-3">🔒</span>
                  <div>
                    <div className="font-medium">Kiểm tra độ mạnh mật khẩu</div>
                    <div className="text-sm text-gray-600">Đánh giá và gợi ý cải thiện</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-teal-50 rounded-lg">
                  <span className="text-teal-600 mr-3">✅</span>
                  <div>
                    <div className="font-medium">Xác thực đa bước</div>
                    <div className="text-sm text-gray-600">Email và SMS verification</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-600 mr-3">🎛️</span>
                  <div>
                    <div className="font-medium">Tùy chọn linh hoạt</div>
                    <div className="text-sm text-gray-600">Mật khẩu tùy chọn cho SĐT</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-pink-600 mr-3">🛡️</span>
                  <div>
                    <div className="font-medium">Bảo mật cao</div>
                    <div className="text-sm text-gray-600">JWT tokens và cookie security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">🔧 API Endpoints</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-mono bg-blue-100 px-2 py-1 rounded mb-2">POST /api/auth/login</div>
                <div className="font-mono bg-green-100 px-2 py-1 rounded mb-2">POST /api/auth/register</div>
                <div className="font-mono bg-purple-100 px-2 py-1 rounded mb-2">POST /api/auth/send-otp</div>
                <div className="font-mono bg-orange-100 px-2 py-1 rounded mb-2">POST /api/auth/verify-otp</div>
              </div>
              <div>
                <div className="font-mono bg-yellow-100 px-2 py-1 rounded mb-2">POST /api/auth/google</div>
                <div className="font-mono bg-red-100 px-2 py-1 rounded mb-2">POST /api/auth/logout</div>
                <div className="font-mono bg-teal-100 px-2 py-1 rounded mb-2">GET /api/auth/me</div>
                <div className="font-mono bg-pink-100 px-2 py-1 rounded mb-2">POST /api/auth/refresh</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setAuthMode('login')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              🔑 Demo Đăng nhập
            </button>
            
            <button
              onClick={() => setAuthMode('register')}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              📝 Demo Đăng ký
            </button>
            
            <button
              onClick={() => window.open('/api-docs', '_blank')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              📚 API Documentation
            </button>
          </div>

          {/* Sample Credentials */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🔐 Thông tin đăng nhập mẫu:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div><strong>Email:</strong> superadmin@tazacore.com | <strong>Password:</strong> SuperAdmin@2024</div>
              <div><strong>Phone:</strong> +84901234567 | <strong>OTP:</strong> Sẽ được gửi qua SMS</div>
              <div><strong>Username:</strong> admin | <strong>Password:</strong> Admin@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import SocialLoginButton, { SocialLoginPanel } from '@/components/auth/SocialLoginButton';

export default function FacebookLoginDemo() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = (data: any) => {
    setLoading(false);
    setError(null);
    setResult(data);
    console.log('✅ Facebook Login Success:', data);
  };

  const handleError = (errorMsg: string) => {
    setLoading(false);
    setResult(null);
    setError(errorMsg);
    console.error('❌ Facebook Login Error:', errorMsg);
  };

  const handleLoginStart = () => {
    setLoading(true);
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Facebook Login Demo
            </h1>
            <p className="text-sm text-gray-600">
              Test Facebook authentication integration
            </p>
          </div>

          {/* Environment Check */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Environment Status:</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Facebook App ID:</span>
                <span className={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>HTTPS:</span>
                <span className={typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost') ? 'text-green-600' : 'text-red-600'}>
                  {typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost') ? '✅ Secure' : '❌ Required'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Facebook SDK:</span>
                <span className={typeof window !== 'undefined' && window.FB ? 'text-green-600' : 'text-orange-600'}>
                  {typeof window !== 'undefined' && window.FB ? '✅ Loaded' : '⏳ Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Single Button Test */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Single Button Test:</h3>
            <SocialLoginButton
              provider="facebook"
              onSuccess={handleSuccess}
              onError={handleError}
              disabled={loading}
              text={loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Facebook'}
              size="medium"
              variant="button"
            />
          </div>

          {/* Social Panel Test */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Social Panel Test:</h3>
            <SocialLoginPanel
              onSuccess={handleSuccess}
              onError={handleError}
              disabled={loading}
              title="Hoặc đăng nhập bằng"
              variant="buttons"
              size="medium"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-800">Đang xử lý đăng nhập...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Lỗi đăng nhập:</h4>
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2 text-xs text-red-600">
                <p>💡 Kiểm tra:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Đảm bảo đang truy cập qua HTTPS hoặc localhost</li>
                  <li>Kiểm tra Facebook App ID trong .env</li>
                  <li>Kiểm tra Facebook App Secret (server-side)</li>
                  <li>Xem console browser để biết thêm chi tiết</li>
                </ul>
              </div>
            </div>
          )}

          {/* Success Display */}
          {result && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">✅ Đăng nhập thành công!</h4>
              <div className="text-xs text-green-700">
                <p><strong>User:</strong> {result.user?.displayName}</p>
                <p><strong>Email:</strong> {result.user?.email}</p>
                <p><strong>Provider:</strong> {result.user?.provider}</p>
                <p><strong>Is New User:</strong> {result.isNewUser ? 'Yes' : 'No'}</p>
                <p><strong>Login Count:</strong> {result.user?.loginCount || 'N/A'}</p>
                {result.message && <p><strong>Message:</strong> {result.message}</p>}
              </div>
              <details className="mt-2">
                <summary className="text-xs text-green-600 cursor-pointer">Show full response</summary>
                <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <details>
              <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'Not set'}</p>
                <p><strong>API Version:</strong> {process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'Not set'}</p>
                <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
                <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'Unknown'}</p>
                <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Unknown'}</p>
              </div>
            </details>
          </div>

          {/* Manual Test Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.FB) {
                  window.FB.getLoginStatus((response: any) => {
                    console.log('Facebook Status:', response);
                    alert(`Facebook Status: ${response.status}`);
                  });
                } else {
                  alert('Facebook SDK not loaded yet');
                }
              }}
              className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded border"
            >
              🔍 Check Facebook SDK Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

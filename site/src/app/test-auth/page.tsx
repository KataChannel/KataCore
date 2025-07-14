'use client';

import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const [cookies, setCookies] = useState('');
  const [localStorageToken, setLocalStorageToken] = useState('');
  const [sessionStorageToken, setSessionStorageToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      setLocalStorageToken(window.localStorage.getItem('token') || 'null');
      setSessionStorageToken(window.sessionStorage.getItem('token') || 'null');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Auth Page</h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {cookies || 'No cookies found'}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage Token</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{localStorageToken}</pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">SessionStorage Token</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {sessionStorageToken}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={() => (window.location.href = '/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  window.localStorage.removeItem('token');
                  window.sessionStorage.removeItem('token');
                  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All Tokens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

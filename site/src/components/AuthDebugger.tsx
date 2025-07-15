'use client';

import React, { useEffect, useState } from 'react';

export function AuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Add manual token setter for testing
  const setTestToken = () => {
    const testToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIyMzZlYzM5Ny0xNGM1LTQ0YTItOTdhYy1kN2FkMTM5ZGMzZDIiLCJlbWFpbCI6InN1cGVyYWRtaW5AdGF6YWNvcmUuY29tIiwicGhvbmUiOiIrODQ5MDAwMDAwMDAiLCJ1c2VybmFtZSI6InN1cGVyYWRtaW5fdGF6YSIsImRpc3BsYXlOYW1lIjoiU3VwZXIgQWRtaW5pc3RyYXRvciIsInJvbGVJZCI6IjlhMTU3NjM2LWIzMjYtNDhlMi04ZDJmLTBjYzkzNDY0MWY3MyIsInJvbGVOYW1lIjoiU3VwZXIgQWRtaW5pc3RyYXRvciIsInJvbGVMZXZlbCI6MCwibW9kdWxlcyI6W10sInBlcm1pc3Npb25zIjpbInN5c3RlbTphZG1pbiIsInN5c3RlbTptYW5hZ2UiLCJzeXN0ZW06Y29uZmlndXJlIiwiY3JlYXRlOioiLCJyZWFkOioiLCJ1cGRhdGU6KiIsImRlbGV0ZToqIiwibWFuYWdlOioiXSwiaXNBY3RpdmUiOnRydWUsImlzVmVyaWZpZWQiOnRydWUsInByb3ZpZGVyIjoiZW1haWwiLCJpYXQiOjE3NTI1NDYyNTQsImV4cCI6MTc1MjU0NzE1NCwic3ViIjoiMjM2ZWMzOTctMTRjNS00NGEyLTk3YWMtZDdhZDEzOWRjM2QyIn0.uUzdkDl8Dfn7sLkd4V0W6EhAm7VaxFSK3MlsNfAmj-Y';
    localStorage.setItem('accessToken', testToken);
    console.log('🔧 Test token set, refreshing...');
    window.location.reload();
  };

  useEffect(() => {
    const checkAuthState = async () => {
      const info: any = {
        hasLocalStorage: typeof window !== 'undefined' && !!window.localStorage,
        token: null,
        cookies: '',
        apiTest: null
      };

      if (typeof window !== 'undefined') {
        info.token = localStorage.getItem('accessToken');
        info.cookies = document.cookie;

        // Test API call if token exists
        if (info.token) {
          try {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${info.token}`,
                'Content-Type': 'application/json'
              }
            });

            info.apiTest = {
              status: response.status,
              ok: response.ok,
              data: response.ok ? await response.json() : await response.text()
            };
          } catch (error) {
            info.apiTest = { error: error.message };
          }
        }
      }

      setDebugInfo(info);
      console.log('🔍 Auth Debugger Info:', info);
    };

    checkAuthState();
  }, []);

  if (typeof window === 'undefined') {
    return null; // SSR protection
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 font-mono">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>
          <span className="text-blue-400">Token:</span> {debugInfo.token ? '✅ EXISTS' : '❌ NONE'}
        </div>
        <div>
          <span className="text-blue-400">Cookies:</span> {debugInfo.cookies ? '✅ EXISTS' : '❌ NONE'}
        </div>
        {debugInfo.apiTest && (
          <div>
            <span className="text-blue-400">API Test:</span> 
            <div className="ml-2">
              <div>Status: {debugInfo.apiTest.status}</div>
              <div>OK: {debugInfo.apiTest.ok ? '✅' : '❌'}</div>
              {debugInfo.apiTest.data && (
                <div className="text-xs text-gray-300 mt-1">
                  Data: {typeof debugInfo.apiTest.data === 'object' 
                    ? JSON.stringify(debugInfo.apiTest.data, null, 2).substring(0, 100) + '...'
                    : debugInfo.apiTest.data.substring(0, 100) + '...'
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs mr-2"
      >
        Refresh
      </button>
      <button 
        onClick={setTestToken}
        className="mt-2 bg-green-600 px-2 py-1 rounded text-xs"
      >
        Set Test Token
      </button>
    </div>
  );
}

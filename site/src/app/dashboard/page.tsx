'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check token from localStorage/sessionStorage first
        let token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('Dashboard: checking token from storage:', token ? '***' + token.slice(-10) : 'null');
        
        // If no token in storage, check cookie (for SSR/middleware)
        if (!token) {
          const cookieToken = document.cookie.split(';').find(row => row.startsWith('token='))?.split('=')[1];
          console.log('Dashboard: checking token from cookie:', cookieToken ? '***' + cookieToken.slice(-10) : 'null');
          token = cookieToken || null;
        }
        
        if (!token) {
          console.log('Dashboard: No token found, redirecting to login');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Dashboard: Auth check response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('Dashboard: User data received:', userData);
          setUser(userData);
        } else {
          console.log('Dashboard: Auth check failed, clearing tokens');
          // Token invalid, redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          router.push('/login');
        }
      } catch (error) {
        console.error('Dashboard: Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Dashboard
              </h1>
              <p className="text-gray-600">
                Hello, {user.displayName || user.email}!
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    router.push('/login');
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

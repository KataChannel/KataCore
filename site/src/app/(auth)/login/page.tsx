'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  otpCode?: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
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

      console.log('Login successful:', data);
      
      // Check if user is Super Admin (level 10) or Admin (level >= 3)
      if (data.user?.role?.level === 10) {
        router.push('/admin/super-admin');
      } else if (data.user?.role?.level >= 3) {
        router.push('/admin');
      } else {
        // For users below admin level, redirect to appropriate page
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err; // Re-throw để LoginForm component xử lý hiển thị lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
        <LoginForm 
          onLogin={handleLogin}
          onBack={handleBack}
          loading={loading}
        />
    </div>
  );
}

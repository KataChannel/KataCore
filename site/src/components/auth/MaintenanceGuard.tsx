'use client';
import React from 'react';
import { siteConfig } from '../../lib/config/site';
import { LoginForm } from './index';
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
import Loading from '@/app/loading';
interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuardContent: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { user, login, logout, loading } = useUnifiedAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  if (loading) {
    return (
      <div>
        <Loading className="!min-h-screen" />
      </div>
      // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      //   <div className="text-center space-y-6">
      //     {/* Coffee Cup Icon */}
      // <div className="flex justify-center">
      //   <div className="relative">
      //     <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
      //       <path d="M2 21h18v-2H2v2zM20 8h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3H0v5c0 3.53 2.61 6.43 6 6.92V21h12v-2.08c3.39-.49 6-3.39 6-6.92V8zM4 5h12v3H4V5zM18 19H6c-2.21 0-4-1.79-4-4v-3h2v-2h12v2h2v3c0 2.21-1.79 4-4 4z"/>
      //     </svg>
      //     {/* Steam animation */}
      //     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
      //       <div className="w-1 h-3 bg-amber-400 rounded-full opacity-70 animate-pulse"></div>
      //     </div>
      //     <div className="absolute -top-3 left-1/2 transform -translate-x-2">
      //       <div className="w-1 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      //     </div>
      //     <div className="absolute -top-3 left-1/2 transform translate-x-1">
      //       <div className="w-1 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
      //     </div>
      //   </div>
      //     </div>

      //     <div className="space-y-2">
      //   <h3 className="text-lg font-semibold text-slate-800">Đang tải</h3>
      //   <p className="text-slate-500 text-sm">Pha một tách cà phê và chờ trong giây lát...</p>
      //     </div>

      //   <div className="flex justify-center space-x-1">
      //   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
      //   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      //   <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      //     </div>
      //   </div>
      // </div>
    );
  }

  // Nếu website offline và không có user đăng nhập
  if (siteConfig.offline && !user) {
    if (showLogin) {
      return <LoginForm onLogin={login} onBack={() => setShowLogin(false)} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Website đang bảo trì</h1>
              <p className="text-gray-600 mb-4">{siteConfig.maintenance.message}</p>
              {siteConfig.maintenance.estimatedTime && (
                <p className="text-sm text-gray-500 mb-6">
                  Thời gian dự kiến: {siteConfig.maintenance.estimatedTime}
                </p>
              )}
            </div>
            {/* <button
                            onClick={() => setShowLogin(true)}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Đăng nhập quản trị
                        </button> */}
            {/* <div className="mt-4">
                            <a
                                href="/admin"
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                                Trang quản trị
                            </a>
                        </div> */}
          </div>
        </div>
      </div>
    );
  }

  // Nếu website offline nhưng user đã đăng nhập và có quyền truy cập
  if (siteConfig.offline && user) {
    const hasAccess = siteConfig.maintenance.allowedUsers.includes(user.email || '');

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
                <p className="text-gray-600 mb-4">
                  Tài khoản của bạn không có quyền truy cập trong thời gian bảo trì.
                </p>
                <p className="text-sm text-gray-500 mb-6">Đăng nhập: {user.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      );
    }

    // User có quyền truy cập - hiển thị banner bảo trì
    return (
      <div>
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium relative">
          <span>
            ⚠️ Website đang trong chế độ bảo trì - Bạn đang truy cập với quyền quản trị ({user.role?.name || 'Unknown'}
            )
          </span>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <a href="/admin" className="underline hover:no-underline text-xs">
              Admin Panel
            </a>
            <button onClick={logout} className="underline hover:no-underline text-xs">
              Đăng xuất
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Website không offline - hiển thị bình thường
  return <>{children}</>;
};

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  return <MaintenanceGuardContent>{children}</MaintenanceGuardContent>;
};

export default MaintenanceGuard;

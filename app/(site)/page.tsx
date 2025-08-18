'use client';

import React, { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  LockClosedIcon,
  KeyIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { SimpleThemeToggle } from '@/components/common/SimpleThemeToggle';
import { useSimpleTheme } from '@/hooks/useSimpleTheme';
import {
  useUnifiedAuth,
  LoginModal,
  AccessBadge,
  AuthProvider,
} from '@/components/auth/UnifiedAuthProvider';
import { ClientOnly } from '@/components/ClientOnly';
import { useModules } from '@/hooks/useModules';

// Icon mapping from string to component
const iconMapping: Record<string, React.ComponentType<any>> = {
  'home': HomeIcon,
  'chart-bar': ChartBarIcon,
  'users': UsersIcon,
  'user': UserIcon,
  'user-group': UserGroupIcon,
  'cube': CubeIcon,
  'currency-dollar': CurrencyDollarIcon,
  'clipboard-document-list': ClipboardDocumentListIcon,
  'cog': CogIcon,
  'megaphone': MegaphoneIcon,
  'chat-bubble-left-right': ChatBubbleLeftRightIcon,
  'document-chart-bar': DocumentChartBarIcon,
  'computer-desktop': ComputerDesktopIcon,
  'building-office': BuildingOfficeIcon,
  'briefcase': BriefcaseIcon,
  'clock': ClockIcon,
  'calendar': CalendarIcon,
  'document-text': DocumentTextIcon,
  'swatch': SwatchIcon,
};

function HomePageContent(): JSX.Element {
  const { theme, setTheme } = useSimpleTheme();
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isDarkMode = theme === 'dark' || (theme === 'system' && window?.matchMedia('(prefers-color-scheme: dark)').matches);
  const [accessCheckResults, setAccessCheckResults] = useState<Record<string, any>>({});

  const { user, loading, hasModuleAccess, logout } = useUnifiedAuth();

  // Fetch modules from database
  const { 
    modules: dbModules, 
    loading: modulesLoading, 
    error: modulesError 
  } = useModules({
    userId: user?.id,
    roleId: user?.roleId,
  });

  // Enhanced user logging and debug information
  useEffect(() => {
    if (user) {
      console.log('=== User Authentication Status ===');
      console.log('User:', user);
      console.log('Role:', user.role);
      console.log('Permissions:', user.role?.permissions);
      console.log('Is Active:', user.isActive);
      console.log('Is Verified:', user.isVerified);
      console.log('=====================================');
      
      console.log('🔍 [PAGE DEBUG] Auth state:', { user: !!user, loading, userDetails: user });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        console.log('🔍 [PAGE DEBUG] Token in localStorage:', !!token);
      }
    }
  }, [user, loading]);

  // Helper function to determine access level
  const getAccessLevel = (hasModuleAccess: boolean, permissionChecks: any[]) => {
    if (!hasModuleAccess) return 'no-access';

    const grantedPermissions = permissionChecks.filter((p) => p.hasAccess).length;
    const totalPermissions = permissionChecks.length;

    if (grantedPermissions === totalPermissions) return 'full-access';
    if (grantedPermissions > 0) return 'partial-access';
    return 'no-access';
  };

  // Transform database modules to include icon components and fallback for missing modules
  const modules = React.useMemo(() => {
    if (dbModules && dbModules.length > 0) {
      return dbModules.map(module => {
        const IconComponent = iconMapping[module.icon] || HomeIcon;
        
        return {
          ...module,
          icon: IconComponent,
          // Ensure we have proper access control
          canAccess: user ? module.hasAccess : false,
        };
      });
    }

    // Fallback static modules if database is empty or loading
    return [
      {
        id: 'sales',
        title: 'Quản lý Bán hàng',
        titleVi: 'Quản lý Bán hàng',
        subtitle: 'Sales Management',
        description: 'Quản lý quy trình bán hàng, theo dõi đơn hàng và doanh thu. Cốt lõi để tạo dòng tiền cho doanh nghiệp.',
        icon: ChartBarIcon,
        href: '/sales',
        color: 'from-blue-500 to-cyan-500',
        module: 'sales',
        permissions: ['read:order', 'create:order', 'manage:pipeline'],
        canAccess: true,
        hasAccess: false,
      },
      {
        id: 'crm',
        title: 'Quản lý Khách hàng',
        titleVi: 'Quản lý Khách hàng',
        subtitle: 'CRM',
        description: 'Tổ chức thông tin khách hàng, tăng cường quan hệ và cải thiện tỷ lệ chuyển đổi đơn hàng.',
        icon: UsersIcon,
        href: '/admin/crm',
        color: 'from-green-500 to-emerald-500',
        module: 'crm',
        permissions: ['read:admin', 'read:customer', 'read:lead', 'manage:campaign'],
        canAccess: true,
        hasAccess: false,
      },
      {
        id: 'hrm',
        title: 'Quản lý Nhân sự',
        titleVi: 'Quản lý Nhân sự',
        subtitle: 'HRM',
        description: 'Quản lý thông tin nhân viên, lương thưởng, chấm công. Quan trọng cho SMEs có đội ngũ lớn.',
        icon: UserGroupIcon,
        href: '/admin/hrm',
        color: 'from-purple-500 to-pink-500',
        module: 'hrm',
        permissions: ['read:employee', 'read:attendance', 'read:payroll'],
        canAccess: true,
        hasAccess: false,
      },
    ];
  }, [dbModules, user]);

  // Set mounted state for hydration with cleanup
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check access for all modules when user changes
  useEffect(() => {
    if (user && mounted && modules.length > 0) {
      const results: Record<string, any> = {};

      modules.forEach((module) => {
        // Use database access info if available, otherwise fallback to hasModuleAccess
        const moduleAccess = module.hasAccess !== undefined ? 
          module.hasAccess : hasModuleAccess(module.module);
          
        const permissionChecks = module.permissions.map((permission) => ({
          permission,
          hasAccess: false, // Set to false since detailed permission checking isn't implemented yet
        }));

        results[module.module] = {
          hasModuleAccess: moduleAccess,
          permissionChecks,
          requiredPermissions: module.permissions,
          accessLevel: getAccessLevel(moduleAccess, permissionChecks),
        };
      });

      setAccessCheckResults(results);
      console.log('Module Access Results:', results);
    }
  }, [user, mounted, hasModuleAccess, modules]);

  // Listen for system theme changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined' && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, mounted]);

  // Handle theme changes with proper cleanup
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const darkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [theme, mounted]);

  // Enhanced module click handler with detailed access checking
  const handleModuleClick = (module: any, e: React.MouseEvent) => {
    console.log(`Attempting to access module: ${module.title}`);

    // Check if user is authenticated
    if (!user) {
      e.preventDefault();
      console.log('User not authenticated, showing login modal');
      setShowLoginModal(true);
      return;
    }

    // Check if user is active and verified
    if (!user.isActive) {
      e.preventDefault();
      alert('Your account is inactive. Please contact administrator.');
      console.log('User account is inactive');
      return;
    }

    if (!user.isVerified) {
      e.preventDefault();
      alert('Please verify your account before accessing modules.');
      console.log('User account is not verified');
      return;
    }

    // Check module access - use database info if available
    const hasAccess = module.hasAccess !== undefined ? 
      module.hasAccess : hasModuleAccess(module.module);
    console.log(`User has access to module ${module.module}:`, hasAccess);

    if (!hasAccess) {
      e.preventDefault();
      console.log(`Access denied to module: ${module.module}`);
      alert(`Access denied. You don't have permission to access ${module.title}`);
      return;
    }

    // Check specific permissions
    // const accessResult = accessCheckResults[module.module];
    // if (accessResult) {
    //   const grantedPermissions = accessResult.permissionChecks.filter((p: any) => p.hasAccess);
    //   console.log(`Module: ${module.module}`);
    //   console.log(`Access Level: ${accessResult.accessLevel}`);
    //   console.log(`Granted Permissions:`, grantedPermissions.map((p: any) => p.permission));

    //   if (accessResult.accessLevel === 'no-access') {
    //     e.preventDefault();
    //     alert(`Insufficient permissions for ${module.title}. Required: ${module.permissions.join(', ')}`);
    //     return;
    //   }
    // }

    // console.log(`Access granted to module: ${module.title}`);
  };

  // Function to get access badge info
  const getAccessBadgeInfo = (module: any) => {
    if (!user) {
      return {
        text: 'Login Required',
        className: 'bg-yellow-100 text-yellow-800',
        icon: KeyIcon,
      };
    }

    const accessResult = accessCheckResults[module.module];
    console.log(`Access result for module ${module.module}:`, accessResult);

    if (!accessResult) {
      return {
        text: 'Checking...',
        className: 'bg-gray-100 text-gray-800',
        icon: ExclamationTriangleIcon,
      };
    }

    switch (accessResult.accessLevel) {
      case 'full-access':
        return {
          text: 'Full Access',
          className: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
        };
      case 'partial-access':
        return {
          text: 'Limited Access',
          className: 'bg-orange-100 text-orange-800',
          icon: ExclamationTriangleIcon,
        };
      case 'no-access':
        return {
          text: 'Access Denied',
          className: 'bg-red-100 text-red-800',
          icon: XCircleIcon,
        };
      default:
        return {
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800',
          icon: ExclamationTriangleIcon,
        };
    }
  };

  if (!mounted) {
    return <></>; // Prevent hydration mismatch
  }

  return (
    <div
      className={`font-mono min-h-screen transition-all duration-700 ease-in-out ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-black'
      }`}
    >
      {/* Services Section */}
      <section id="modules" className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h3
              className={`text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter transition-all duration-700 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent'
              }`}
            >
              Taza Group
            </h3>
            <div
              className={`w-12 sm:w-16 h-px mx-auto transition-all duration-700 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-transparent via-white to-transparent'
                  : 'bg-gradient-to-r from-transparent via-black to-transparent'
              }`}
            ></div>
            <div className="flex flex-row space-x-2 items-center justify-center mt-4">
              <ClientOnly>
              <SimpleThemeToggle
                variant="icon"
                className={`h-11 px-2 rounded-lg transition-all duration-500 hover:scale-110 group flex items-center justify-center ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-lg shadow-white/5'
                  : 'bg-black/10 text-black hover:bg-black/20 border border-black/20 shadow-lg shadow-black/5'
                }`}
              />
              </ClientOnly>
              {user ? (
              <button
                onClick={logout}
                className={`h-11 flex items-center gap-2 px-3 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/30'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Logout</span>
              </button>
              ) : (
                <Link
                href="/login"
                className={`h-11 flex items-center gap-2 px-4 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white hover:from-blue-500/30 hover:to-purple-500/30 border border-white/20 shadow-lg shadow-blue-500/10'
                  : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-black hover:from-blue-500/30 hover:to-purple-500/30 border border-black/20 shadow-lg shadow-blue-500/10'
                }`}
                >
                <KeyIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{loading ? 'Loading...' : 'Đăng nhập'}</span>
                </Link>
              )}
            </div>
           
            {user && (
              <div className="mt-8">
                <p               className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, <span className="font-semibold">{user.displayName}</span>
                </p>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Role: {user.role?.name}
                  </span>
                  <span className={`${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isActive ? '● Active' : '● Inactive'}
                  </span>
                  {user.isVerified && <span className="text-green-400">✓ Verified</span>}
                </div>
              </div>
            )}
          </div>

          {/* Loading state for modules */}
          {(loading || modulesLoading) && (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {loading ? 'Đang xác thực...' : 'Đang tải modules...'}
              </p>
            </div>
          )}

          {/* Error state for modules */}
          {modulesError && (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Lỗi tải modules: {modulesError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Modules grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {!loading && !modulesLoading && !modulesError && modules.map((module, index) => {
              const IconComponent = module.icon;
              const hasAccess = user ? (module.hasAccess !== undefined ? module.hasAccess : hasModuleAccess(module.module)) : false;
              const accessResult = accessCheckResults[module.module];
              const isDisabled = user && !hasAccess;
              const badgeInfo = getAccessBadgeInfo(module);
              const BadgeIcon = badgeInfo.icon;

              return (
                <Link
                  key={index}
                  href={module.href}
                  onClick={(e) => handleModuleClick(module, e)}
                  className={`group border rounded-xl p-6 sm:p-8 transition-all duration-700 cursor-pointer block relative overflow-hidden ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-[1.05] hover:-translate-y-2'
                  } ${
                    isDarkMode
                      ? 'border-gray-800 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-800/70 backdrop-blur-sm'
                      : 'border-gray-200 hover:border-gray-400 bg-white/70 hover:bg-white/90 backdrop-blur-sm'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}
                  ></div>

                  {/* Lock overlay for disabled modules */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                      <LockClosedIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="mb-6">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-r ${module.color} p-2.5 sm:p-3 transition-all duration-500 ${
                          !isDisabled ? 'group-hover:scale-110 group-hover:rotate-6' : ''
                        }`}
                      >
                        <IconComponent className="w-full h-full text-white" />
                      </div>
                    </div>

                    <h4
                      className={`text-lg sm:text-xl font-bold mb-2 leading-tight transition-colors duration-500 ${
                        isDarkMode
                          ? 'text-white group-hover:text-gray-200'
                          : 'text-black group-hover:text-gray-800'
                      }`}
                    >
                      {module.title}
                    </h4>

                    <p
                      className={`text-xs sm:text-sm font-medium mb-4 uppercase tracking-wider transition-colors duration-500 ${
                        isDarkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}
                    >
                      {module.subtitle}
                    </p>

                    <p
                      className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${
                        isDarkMode
                          ? 'text-gray-300 group-hover:text-gray-200'
                          : 'text-gray-600 group-hover:text-gray-700'
                      }`}
                    >
                      {module.description}
                    </p>

                    {/* Enhanced Access Control Information */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Access Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeInfo.className}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {badgeInfo.text}
                      </span>

                      {/* Permission Details for Admins */}
                      {user &&
                        (user.role?.name === 'Super Administrator' ||
                          user.role?.name === 'ADMIN') &&
                        accessResult && (
                          <div className="w-full mt-2">
                            <div className="text-xs text-gray-500 mb-1">Permissions:</div>
                            <div className="flex flex-wrap gap-1">
                              {accessResult.permissionChecks.map((perm: any, idx: number) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-1 py-0.5 rounded text-xs ${
                                    perm.hasAccess
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {perm.hasAccess ? (
                                    <CheckCircleIcon className="w-2 h-2" />
                                  ) : (
                                    <XCircleIcon className="w-2 h-2" />
                                  )}
                                  {perm.permission.split(':')[1]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-8 sm:py-12 px-4 sm:px-6 transition-all duration-700 ${
          isDarkMode
            ? 'border-gray-800 bg-gray-900/30 backdrop-blur-sm'
            : 'border-gray-200 bg-white/30 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`text-sm transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            © 2024 Taza Group. All rights reserved.
          </p>
          {user && (
            <p
              className={`text-xs mt-2 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Logged in as {user.displayName} | Role: {user.role?.name} | Status:{' '}
              {user.isActive ? 'Active' : 'Inactive'} |{user.isVerified ? 'Verified' : 'Unverified'}
            </p>
          )}
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export default function HomePage(): JSX.Element {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import ThemeManager, { ColorSchemeToggle } from '@/components/ThemeManager';
import { AuthProvider, useAuth, LoginModal, ModuleAccessBadge } from '@/components/auth/ModuleGuard';

function HomePageContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, loading, checkModuleAccess, logout } = useAuth();

  // Load theme from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    setIsDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Enhanced modules with access control integration
  const modules = [
    {
      title: 'Quản lý Bán hàng',
      subtitle: 'Sales Management',
      description:
        'Quản lý quy trình bán hàng, theo dõi đơn hàng và doanh thu. Cốt lõi để tạo dòng tiền cho doanh nghiệp.',
      icon: ChartBarIcon,
      href: '/sales',
      color: 'from-blue-500 to-cyan-500',
      module: 'sales',
      permissions: ['read:order', 'create:order', 'manage:pipeline'],
    },
    {
      title: 'Quản lý Khách hàng',
      subtitle: 'CRM',
      description:
        'Tổ chức thông tin khách hàng, tăng cường quan hệ và cải thiện tỷ lệ chuyển đổi đơn hàng.',
      icon: UsersIcon,
      href: '/admin/crm',
      color: 'from-green-500 to-emerald-500',
      module: 'crm',
      permissions: ['read:customer', 'read:lead', 'manage:campaign'],
    },
    {
      title: 'Quản lý Kho',
      subtitle: 'Inventory Management',
      description:
        'Theo dõi tồn kho, nhập/xuất hàng. Thiết yếu cho bán lẻ, phân phối hoặc sản xuất.',
      icon: CubeIcon,
      href: '/inventory',
      color: 'from-orange-500 to-red-500',
      module: 'inventory',
      permissions: ['read:product', 'read:stock', 'manage:warehouse'],
    },
    {
      title: 'Quản lý Tài chính',
      subtitle: 'Accounting & Finance',
      description:
        'Quản lý dòng tiền, hóa đơn điện tử, báo cáo thuế, đảm bảo tuân thủ pháp luật.',
      icon: CurrencyDollarIcon,
      href: '/finance',
      color: 'from-yellow-500 to-orange-500',
      module: 'finance',
      permissions: ['read:invoice', 'read:payment', 'read:financial_reports'],
    },
    {
      title: 'Quản lý Nhân sự',
      subtitle: 'HRM',
      description:
        'Quản lý thông tin nhân viên, lương thưởng, chấm công. Quan trọng cho SMEs có đội ngũ lớn.',
      icon: UserGroupIcon,
      href: '/hrm',
      color: 'from-purple-500 to-pink-500',
      module: 'hrm',
      permissions: ['read:employee', 'read:attendance', 'read:payroll'],
    },
    {
      title: 'Quản lý Dự án',
      subtitle: 'Project Management',
      description:
        'Theo dõi tiến độ dự án, phân công nhiệm vụ, hỗ trợ quản lý nội bộ.',
      icon: ClipboardDocumentListIcon,
      href: '/projects',
      color: 'from-indigo-500 to-purple-500',
      module: 'projects',
      permissions: ['read:project', 'read:task', 'manage:team'],
    },
    {
      title: 'Quản lý Sản xuất',
      subtitle: 'Manufacturing',
      description:
        'Quản lý quy trình sản xuất, tối ưu hóa nguồn lực. Chỉ cần cho SMEs trong ngành sản xuất.',
      icon: CogIcon,
      href: '/manufacturing',
      color: 'from-gray-500 to-slate-500',
      module: 'manufacturing',
      permissions: ['read:production_plan', 'read:work_order', 'manage:quality_control'],
    },
    {
      title: 'Marketing',
      subtitle: 'Digital Marketing',
      description:
        'Hỗ trợ xây dựng chiến dịch tiếp thị, quản lý kênh truyền thông. Thường tận dụng kênh miễn phí cho SMEs nhỏ.',
      icon: MegaphoneIcon,
      href: '/marketing',
      color: 'from-pink-500 to-rose-500',
      module: 'marketing',
      permissions: ['read:campaign', 'create:content', 'manage:social_media'],
    },
    {
      title: 'Chăm sóc Khách hàng',
      subtitle: 'Customer Support',
      description: 'Quản lý yêu cầu hỗ trợ, cải thiện trải nghiệm khách hàng.',
      icon: ChatBubbleLeftRightIcon,
      href: '/support',
      color: 'from-teal-500 to-cyan-500',
      module: 'support',
      permissions: ['read:ticket', 'create:ticket', 'read:knowledge_base'],
    },
    {
      title: 'Báo cáo & Phân tích',
      subtitle: 'Analytics',
      description:
        'Cung cấp dữ liệu để ra quyết định, phân tích hiệu suất kinh doanh.',
      icon: DocumentChartBarIcon,
      href: '/analytics',
      color: 'from-violet-500 to-purple-500',
      module: 'analytics',
      permissions: ['read:dashboard', 'read:report', 'read:business_intelligence'],
    },
    {
      title: 'Thương mại Điện tử',
      subtitle: 'E-commerce',
      description:
        'Quản lý nền tảng bán hàng online, tối ưu website. Phù hợp cho SMEs có kênh bán hàng trực tuyến.',
      icon: ComputerDesktopIcon,
      href: '/ecommerce',
      color: 'from-emerald-500 to-teal-500',
      module: 'ecommerce',
      permissions: ['read:catalog', 'read:online_order', 'manage:website'],
    },
  ];

  const handleModuleClick = (module: any, e: React.MouseEvent) => {
    // If user is not logged in, show login modal
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
      return;
    }

    // If user doesn't have access to this module, prevent navigation
    if (!checkModuleAccess(module.module)) {
      e.preventDefault();
      alert(`Access denied. You don't have permission to access ${module.title}`);
      return;
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div
      className={`font-mono min-h-screen transition-all duration-700 ease-in-out ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-black'
      }`}
    >
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-500 hover:scale-110 group ${
            isDarkMode
              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-lg shadow-white/5'
              : 'bg-black/10 text-black hover:bg-black/20 border border-black/20 shadow-lg shadow-black/5'
          }`}
          aria-label="Toggle theme"
        >
          <div className="relative w-5 h-5 sm:w-6 sm:h-6">
            <SunIcon 
              className={`w-full h-full transition-all duration-500 absolute inset-0 ${
                isDarkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`} 
            />
            <MoonIcon 
              className={`w-full h-full transition-all duration-500 absolute inset-0 ${
                isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
              }`} 
            />
          </div>
        </button>
        
        <ColorSchemeToggle 
          showLabel={false}
          className="hidden sm:flex items-center gap-2 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105" 
        />

        {/* User Auth Status */}
        {user ? (
          <div className={`flex flex-col items-center gap-2 p-3 rounded-lg backdrop-blur-md transition-all duration-300 ${
            isDarkMode
              ? 'bg-white/10 border border-white/20'
              : 'bg-black/10 border border-black/20'
          }`}>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{user.displayName}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className={`flex items-center gap-2 p-3 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                : 'bg-black/10 text-black hover:bg-black/20 border border-black/20'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Login</span>
          </button>
        )}
      </div>

      {/* Services Section */}
      <section id="modules" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h3 className={`text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter transition-all duration-700 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent'
            }`}>
              Taza Group
            </h3>
            <div
              className={`w-12 sm:w-16 h-px mx-auto transition-all duration-700 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-transparent via-white to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-black to-transparent'
              }`}
            ></div>
            
            {user && (
              <div className="mt-8">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Welcome back, <span className="font-semibold">{user.displayName}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {modules.map((module, index) => {
              const IconComponent = module.icon;
              const hasAccess = user ? checkModuleAccess(module.module) : false;
              const isDisabled = user && !hasAccess;
              
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
                  <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
                  
                  {/* Lock overlay for disabled modules */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                      <LockClosedIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="mb-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-r ${module.color} p-2.5 sm:p-3 transition-all duration-500 ${
                        !isDisabled ? 'group-hover:scale-110 group-hover:rotate-6' : ''
                      }`}>
                        <IconComponent className="w-full h-full text-white" />
                      </div>
                    </div>

                    <h4 className={`text-lg sm:text-xl font-bold mb-2 leading-tight transition-colors duration-500 ${
                      isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-black group-hover:text-gray-800'
                    }`}>
                      {module.title}
                    </h4>
                    
                    <p
                      className={`text-xs sm:text-sm font-medium mb-4 uppercase tracking-wider transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'
                      }`}
                    >
                      {module.subtitle}
                    </p>
                    
                    <p
                      className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'
                      }`}
                    >
                      {module.description}
                    </p>

                    {/* Access Control Information */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {user ? (
                        <ModuleAccessBadge module={module.module} />
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Login Required
                        </span>
                      )}
                      
                      {/* Show required permissions for admins or developers */}
                      {user && (user.role?.name === 'Super Administrator' || user.role?.name === 'ADMIN') && (
                        <div className="text-xs text-gray-500 mt-2">
                          Required: {module.permissions.slice(0, 2).join(', ')}
                          {module.permissions.length > 2 && ` +${module.permissions.length - 2} more`}
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
            <p className={`text-xs mt-2 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Logged in as {user.displayName} | Role: {user.role?.name}
            </p>
          )}
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageContent />
    </AuthProvider>
  );
}

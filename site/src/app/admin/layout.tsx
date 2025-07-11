'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  CogIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load theme and user data from localStorage
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('admin-theme');
    const savedUserData = localStorage.getItem('admin-user-data');

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setIsDarkMode(prefersDark);
    }

    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  // Save theme to localStorage and update DOM
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, mounted]);

  const hrSubMenus = [
    {
      name: 'Dashboard',
      nameVi: 'Tổng quan',
      href: '/admin/hr',
      icon: ChartBarIcon,
    },
    {
      name: 'Employees',
      nameVi: 'Nhân viên',
      href: '/admin/hr/employees',
      icon: UsersIcon,
    },
    {
      name: 'Departments',
      nameVi: 'Phòng ban',
      href: '/admin/hr/departments',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Positions',
      nameVi: 'Vị trí',
      href: '/admin/hr/positions',
      icon: BriefcaseIcon,
    },
    {
      name: 'Attendance',
      nameVi: 'Chấm công',
      href: '/admin/hr/attendance',
      icon: ClockIcon,
    },
    {
      name: 'Leave Requests',
      nameVi: 'Yêu cầu nghỉ phép',
      href: '/admin/hr/leave-requests',
      icon: CalendarIcon,
    },
    {
      name: 'Payroll',
      nameVi: 'Bảng lương',
      href: '/admin/hr/payroll',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Performance',
      nameVi: 'Hiệu suất',
      href: '/admin/hr/performance',
      icon: ChartBarIcon,
    },
    {
      name: 'Reports',
      nameVi: 'Báo cáo',
      href: '/admin/hr/reports',
      icon: DocumentTextIcon,
    },
    {
      name: 'Settings',
      nameVi: 'Cài đặt',
      href: '/admin/hr/settings',
      icon: CogIcon,
    },
  ];

  const menuItems = [
    {
      title: 'Dashboard',
      icon: HomeIcon,
      path: '/admin',
      active: pathname === '/admin',
    },
    {
      title: 'HR Management',
      icon: UsersIcon,
      path: '/admin/hr',
      active: pathname.startsWith('/admin/hr'),
      children: hrSubMenus,
    },
    {
      title: 'CRM',
      icon: UserIcon,
      path: '/admin/crm',
      active: pathname.startsWith('/admin/crm'),
    },
    {
      title: 'Website Management',
      icon: ComputerDesktopIcon,
      path: '/admin/website',
      active: pathname.startsWith('/admin/website'),
    },
    {
      title: 'Analytics',
      icon: ChartBarIcon,
      path: '/admin/analytics',
      active: pathname.startsWith('/admin/analytics'),
    },
    {
      title: 'Settings',
      icon: CogIcon,
      path: '/admin/settings',
      active: pathname.startsWith('/admin/settings'),
    },
    {
      title: 'Monochrome Demo',
      icon: SwatchIcon,
      path: '/admin/monochrome-demo',
      active: pathname.startsWith('/admin/monochrome-demo'),
    },
  ];

  // Auto-expand menus when submenu is active
  useEffect(() => {
    const activeParentMenus = menuItems
      .filter(item => item.children && item.active)
      .map(item => item.path);

    setExpandedMenus(prev => {
      const newExpanded = [...prev];
      activeParentMenus.forEach(path => {
        if (!newExpanded.includes(path)) {
          newExpanded.push(path);
        }
      });
      return newExpanded;
    });
  }, [pathname]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-user-data');
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-theme');
    router.push('/login');
  };

  const toggleMenuExpansion = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  // Check if submenu should be expanded
  const shouldExpand = (item: any) => {
    return expandedMenus.includes(item.path) || item.active;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
    >
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={`
          hidden lg:flex flex-col bg-surface border-r border-border transition-all duration-300 z-20
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div
              className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}
            >
              {sidebarOpen && (
                <>
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="text-lg font-semibold text-primary">
                    TazaCore
                  </span>
                </>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-hover transition-colors"
            >
              <Bars3Icon className="h-5 w-5 text-text-secondary" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map(item => (
              <div key={item.path}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenuExpansion(item.path);
                    } else {
                      router.push(item.path);
                    }
                  }}
                  className={`
                    hover:bg-gray-300 w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors
                    ${
                      item.active
                        ? 'bg-gray-300'
                        : 'text-text-secondary hover:bg-hover hover:text-primary'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </div>
                  {sidebarOpen && item.children && (
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${
                        shouldExpand(item) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {sidebarOpen && item.children && shouldExpand(item) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map(subItem => (
                      <button
                        key={subItem.href}
                        onClick={() => router.push(subItem.href)}
                        className={`
                         hover:bg-gray-300 w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                          ${
                            pathname === subItem.href
                              ? 'bg-gray-300'
                              : 'text-text-secondary hover:bg-hover hover:text-primary'
                          }
                        `}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 w-64 border-r border-border z-50 transform transition-transform duration-300 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
        `}
        >
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                TazaCore
              </span>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-hover transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-text-secondary" />
            </button>
          </div>

          {/* Mobile Menu */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => (
              <div key={item.path}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenuExpansion(item.path);
                    } else {
                      router.push(item.path);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors
                    ${
                      item.active
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-hover hover:text-primary'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.children && (
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${
                        shouldExpand(item) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Mobile Submenu */}
                {item.children && shouldExpand(item) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map(subItem => (
                      <button
                        key={subItem.href}
                        onClick={() => {
                          router.push(subItem.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                          ${
                            pathname === subItem.href
                              ? 'bg-accent/10 text-accent'
                              : 'text-text-secondary hover:bg-hover hover:text-primary'
                          }
                        `}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-hover transition-colors lg:hidden"
              >
                <Bars3Icon className="h-5 w-5 text-text-secondary" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-text-secondary">Admin</span>
                <span className="text-text-secondary">/</span>
                <span className="text-primary font-medium">
                  {(() => {
                    const segments = pathname.split('/');
                    const lastSegment = segments[segments.length - 1];
                    return lastSegment
                      ? lastSegment.charAt(0).toUpperCase() +
                          lastSegment.slice(1)
                      : 'Dashboard';
                  })()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-hover transition-colors"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-text-secondary" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-text-secondary" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-hover transition-colors relative">
                <BellIcon className="h-5 w-5 text-text-secondary" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-primary">
                    {userData?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-text-secondary">Administrator</p>
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {userData?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-hover transition-colors"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-text-secondary" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

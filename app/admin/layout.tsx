'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMenuItems } from '../hooks/useMenuItems';
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
import { useUnifiedTheme } from '@/hooks';
import { useUnifiedAuth } from '@/components/auth/UnifiedAuthProvider';
import ThemeManager from '@/components/ThemeManager';


interface AdminLayoutProps {
  children: React.ReactNode;
}

// Icon mapping from string to component
const iconMapping: Record<string, React.ComponentType<any>> = {
  'home': HomeIcon,
  'users': UsersIcon,
  'user': UserIcon,
  'building-office': BuildingOfficeIcon,
  'chart-bar': ChartBarIcon,
  'computer-desktop': ComputerDesktopIcon,
  'cog': CogIcon,
  'briefcase': BriefcaseIcon,
  'clock': ClockIcon,
  'calendar': CalendarIcon,
  'currency-dollar': CurrencyDollarIcon,
  'document-text': DocumentTextIcon,
  'swatch': SwatchIcon,
  'bell': BellIcon,
};

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication
  const { user, loading, logout, hasModuleAccess, refreshAuth } = useUnifiedAuth();
  
  // Theme
  const { actualMode, toggleMode, isLoading } = useUnifiedTheme();

  // Menu items from database
  const { menuItems: dbMenuItems, loading: menuLoading, error: menuError } = useMenuItems({
    userId: user?.id,
  });

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        const isAuthenticated = sessionStorage.getItem('user-authenticated');
        const hasToken = localStorage.getItem('accessToken');
        
        if (isAuthenticated && hasToken) {
          refreshAuth().then(() => {});
          
          const timeoutId = setTimeout(() => {
            if (!user) {
              sessionStorage.removeItem('user-authenticated');
              router.push('/login?redirect=' + encodeURIComponent(pathname));
            }
          }, 3000);

          return () => clearTimeout(timeoutId);
        } else {
          router.push('/login?redirect=' + encodeURIComponent(pathname));
        }
      } else {
        sessionStorage.removeItem('user-authenticated');
      }
    }
    
    return undefined;
  }, [user, loading, router, pathname, refreshAuth]);

  // Admin access check
  useEffect(() => {
    if (user && !loading) {
      const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
      const hasAdminAccess = hasModuleAccess('admin') || 
                            userPermissions.includes('admin:*') ||
                            userPermissions.includes('admin:system') ||
                            user.role?.name === 'Super Administrator' ||
                            (user.role?.level && user.role.level >= 8);
            
      if (!hasAdminAccess) {
        router.push('/?error=access-denied&reason=insufficient-permissions');
      }
    }
  }, [user, loading, hasModuleAccess, router]);

  // Transform database menu items to match the existing structure
  const transformMenuItems = useMemo(() => {
    return (items: any[]) => {
      return items.map(item => {
        const IconComponent = iconMapping[item.icon] || HomeIcon;
        
        return {
          title: item.titleVi || item.title,
          icon: IconComponent,
          path: item.path,
          active: pathname === item.path || pathname.startsWith(item.path + '/'),
          permission: item.permission,
          canAccess: item.canAccess,
          children: item.children ? item.children.map((child: any) => ({
            name: child.titleVi || child.title,
            nameVi: child.titleVi || child.title,
            href: child.path,
            icon: iconMapping[child.icon] || HomeIcon,
            permission: child.permission,
            canAccess: child.canAccess,
          })) : undefined,
        };
      });
    };
  }, [pathname]);

  // Get menu items (use database if available, fallback to static)
  const menuItems = useMemo(() => {
    if (dbMenuItems && dbMenuItems.length > 0) {
      return transformMenuItems(dbMenuItems);
    }
    
    return [
      // Fallback static menu (original structure)
      {
        title: 'Dashboard',
        icon: HomeIcon,
        path: '/admin',
        active: pathname === '/admin',
        permission: 'read:dashboard',
        canAccess: true,
      },
      {
        title: 'Quản lý Nhân sự',
        icon: UsersIcon,
        path: '/admin/hr',
        active: pathname.startsWith('/admin/hr'),
        permission: 'read:hrm',
        canAccess: true,
        children: [
          {
            name: 'Tổng quan',
            nameVi: 'Tổng quan',
            href: '/admin/hr',
            icon: ChartBarIcon,
            permission: 'read:hrm',
            canAccess: true,
          },
          // ... other HR menu items
        ],
      },
      // ... other static menu items
    ];
  }, [dbMenuItems, transformMenuItems, pathname]);

  // Auto-expand menus when submenu is active
  useEffect(() => {
    const activeParentMenus = menuItems
      .filter((item) => item.children && item.active)
      .map((item) => item.path);

    setExpandedMenus((prev) => {
      const newExpanded = [...prev];
      let hasChanges = false;
      
      activeParentMenus.forEach((path) => {
        if (!newExpanded.includes(path)) {
          newExpanded.push(path);
          hasChanges = true;
        }
      });
      
      return hasChanges ? newExpanded : prev;
    });
  }, [menuItems]);

  const toggleTheme = () => {
    toggleMode();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenuExpansion = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  // Check if submenu should be expanded
  const shouldExpand = (item: any) => {
    return expandedMenus.includes(item.path) || item.active;
  };

  // Prevent hydration mismatch
  if (!mounted || loading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {loading ? 'Đang xác thực...' : 'Đang tải menu...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${actualMode === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className={`
          hidden lg:flex flex-col bg-surface border-r border-border transition-all duration-300 z-20
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              {sidebarOpen && (
                <>
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="text-lg font-semibold text-primary">KataCore</span>
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
            {menuItems.filter(item => item.canAccess).map((item) => (
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
                    ${item.active 
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
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                      shouldExpand(item) ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>
                
                {/* Submenu */}
                {sidebarOpen && item.children && shouldExpand(item) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.filter((child: any) => child.canAccess).map((subItem: any) => (
                      <button
                        key={subItem.href}
                        onClick={() => router.push(subItem.href)}
                        className={`
                         hover:bg-gray-300 w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                          ${pathname === subItem.href 
                            ? 'bg-gray-300' 
                            : 'text-text-secondary hover:bg-hover hover:text-primary'
                          }
                        `}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.nameVi}</span>
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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleMobileMenu} />
        )}

        {/* Mobile Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 w-64 border-r border-border z-50 transform transition-transform duration-300 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${actualMode === 'dark' ? 'bg-gray-900' : 'bg-white'}
        `}>
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-semibold text-primary">KataCore</span>
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
            {menuItems.filter(item => item.canAccess).map((item) => (
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
                    ${item.active 
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
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                      shouldExpand(item) ? 'rotate-180' : ''
                    }`} />
                  )}
                </button>
                
                {/* Mobile Submenu */}
                {item.children && shouldExpand(item) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.filter((child: any) => child.canAccess).map((subItem: any) => (
                      <button
                        key={subItem.href}
                        onClick={() => {
                          router.push(subItem.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                          ${pathname === subItem.href 
                            ? 'bg-accent/10 text-accent' 
                            : 'text-text-secondary hover:bg-hover hover:text-primary'
                          }
                        `}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.nameVi}</span>
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
                    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : 'Dashboard';
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
                {actualMode === 'dark' ? (
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
                    {user?.displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {user?.role?.name || 'Administrator'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.displayName?.charAt(0) || 'A'}
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
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background transition-colors duration-300">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main AdminLayout component với ThemeManager wrapper
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <ThemeManager>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeManager>
  );
};

export default AdminLayout;

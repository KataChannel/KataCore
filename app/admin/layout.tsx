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
  ChevronRightIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  CogIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  DocumentIcon,
  SwatchIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  KeyIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  PhotoIcon,
  MegaphoneIcon,
  ShareIcon,
  LinkIcon,
  TagIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  EyeIcon,
  PencilIcon,
  FolderIcon,
  ArchiveBoxIcon,
  TicketIcon,
  InformationCircleIcon,
  BookOpenIcon,
  WrenchScrewdriverIcon,
  CommandLineIcon,
  CodeBracketIcon,
  BugAntIcon,
  BeakerIcon,
  CpuChipIcon,
  BoltIcon,
  PuzzlePieceIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useSimpleTheme } from '@/hooks/useSimpleTheme';


interface AdminLayoutProps {
  children: React.ReactNode;
}

// Icon mapping from string to component - Direct mapping for Heroicons
const iconMapping: Record<string, React.ComponentType<any>> = {
  // Direct icon names (as stored in database)
  'HomeIcon': HomeIcon,
  'UsersIcon': UsersIcon,
  'UserIcon': UserIcon,
  'UserGroupIcon': UserGroupIcon,
  'UserPlusIcon': UserPlusIcon,
  'BuildingOfficeIcon': BuildingOfficeIcon,
  'BuildingOffice2Icon': BuildingOffice2Icon,
  'ChartBarIcon': ChartBarIcon,
  'ChartPieIcon': ChartPieIcon,
  'ComputerDesktopIcon': ComputerDesktopIcon,
  'CogIcon': CogIcon,
  'BriefcaseIcon': BriefcaseIcon,
  'ClockIcon': ClockIcon,
  'CalendarIcon': CalendarIcon,
  'CurrencyDollarIcon': CurrencyDollarIcon,
  'DocumentTextIcon': DocumentTextIcon,
  'DocumentIcon': DocumentIcon,
  'SwatchIcon': SwatchIcon,
  'BellIcon': BellIcon,
  'MagnifyingGlassIcon': MagnifyingGlassIcon,
  'ShieldCheckIcon': ShieldCheckIcon,
  'KeyIcon': KeyIcon,
  'ServerIcon': ServerIcon,
  'CircleStackIcon': CircleStackIcon,
  'GlobeAltIcon': GlobeAltIcon,
  'PhoneIcon': PhoneIcon,
  'EnvelopeIcon': EnvelopeIcon,
  'CameraIcon': CameraIcon,
  'PhotoIcon': PhotoIcon,
  'MegaphoneIcon': MegaphoneIcon,
  'ShareIcon': ShareIcon,
  'LinkIcon': LinkIcon,
  'TagIcon': TagIcon,
  'StarIcon': StarIcon,
  'TrophyIcon': TrophyIcon,
  'SparklesIcon': SparklesIcon,
  'EyeIcon': EyeIcon,
  'PencilIcon': PencilIcon,
  'FolderIcon': FolderIcon,
  'ArchiveBoxIcon': ArchiveBoxIcon,
  'TicketIcon': TicketIcon,
  'InformationCircleIcon': InformationCircleIcon,
  'BookOpenIcon': BookOpenIcon,
  'WrenchScrewdriverIcon': WrenchScrewdriverIcon,
  'CommandLineIcon': CommandLineIcon,
  'CodeBracketIcon': CodeBracketIcon,
  'BugAntIcon': BugAntIcon,
  'BeakerIcon': BeakerIcon,
  'CpuChipIcon': CpuChipIcon,
  'BoltIcon': BoltIcon,
  'PuzzlePieceIcon': PuzzlePieceIcon,
  'AdjustmentsHorizontalIcon': AdjustmentsHorizontalIcon,
  'ArrowDownTrayIcon': ArrowDownTrayIcon,
  'Bars3Icon': Bars3Icon,
  
  // Legacy support for old format (lowercase with dashes)
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
  'magnifying-glass': MagnifyingGlassIcon,
};

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed for better mobile UX
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false); // For collapsed sidebar state
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication - get from localStorage for now
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Try to get user info from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };
  
  const hasModuleAccess = (module: string) => {
    if (!user) return false;
    if (user.role?.level && user.role.level >= 3) return true;
    return user.permissions?.includes(`${module}:*`) || user.permissions?.includes(`read:${module}`) || false;
  };
  
  const refreshAuth = async () => {
    // Refresh auth logic here
  };
  
  // Theme
  const { theme, setTheme } = useSimpleTheme();

  const toggleMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Menu items from database with user permissions
  const { menuItems: dbMenuItems, loading: menuLoading, error: menuError } = useMenuItems({
    userId: user?.id,
    roleId: user?.roleId,
  });

  // Debug menu loading
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Menu Debug Info:', {
        user: user,
        userId: user?.id,
        roleId: user?.roleId,
        dbMenuItems: dbMenuItems,
        menuLoading,
        menuError,
        dbMenuItemsLength: dbMenuItems?.length || 0
      });
    }
  }, [user, dbMenuItems, menuLoading, menuError]);

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-detect screen size and adjust sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Large screens: keep sidebar open by default
      if (width >= 1024) {
        setSidebarOpen(true);
        setMobileMenuOpen(false);
        setIsCollapsed(false);
      }
      // Medium screens: collapse sidebar to save space
      else if (width >= 768) {
        setSidebarOpen(true);
        setMobileMenuOpen(false);
        setIsCollapsed(true);
      }
      // Mobile screens: hide sidebar, use mobile menu
      else {
        setSidebarOpen(false);
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('[data-sidebar="mobile"]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // ESC to clear search or close mobile menu
      if (e.key === 'Escape') {
        if (searchQuery.trim()) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }

      // Ctrl+B or Cmd+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          toggleSidebar();
        } else {
          toggleMobileMenu();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, mobileMenuOpen]);

  // Authentication check
  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [user, loading, router, pathname]);

  // Admin access check
  useEffect(() => {
    if (user && !loading) {
      const hasAdminAccess = hasModuleAccess('admin') || 
                            user.role?.name === 'Super Administrator' ||
                            (user.role?.level && user.role.level >= 3);
            
      if (!hasAdminAccess) {
        router.push('/?error=access-denied&reason=insufficient-permissions');
      }
    }
  }, [user, loading, router]);

  // Transform database menu items to match the existing structure
  const transformMenuItems = useMemo(() => {
    return (items: any[]) => {
      return items.map(item => {
        // Get icon component - try direct mapping first, then fallback to HomeIcon
        const IconComponent = iconMapping[item.icon] || HomeIcon;
        
        return {
          title: item.titleVi || item.title,
          icon: IconComponent,
          path: item.path,
          active: pathname === item.path || pathname.startsWith(item.path + '/'),
          permission: item.permission,
          canAccess: item.canAccess !== false, // Default to true if not specified
          children: item.children && item.children.length > 0 ? item.children.map((child: any) => ({
            name: child.titleVi || child.title,
            nameVi: child.titleVi || child.title,
            href: child.path,
            icon: iconMapping[child.icon] || HomeIcon,
            permission: child.permission,
            canAccess: child.canAccess !== false,
            active: pathname === child.path
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
      {
        title: 'SEO & CMS',
        icon: MagnifyingGlassIcon,
        path: '/admin/seo',
        active: pathname.startsWith('/admin/seo'),
        permission: 'read:seo',
        canAccess: true,
        children: [
          {
            name: 'Dashboard',
            nameVi: 'Tổng quan SEO',
            href: '/admin/seo',
            icon: ChartBarIcon,
            permission: 'read:seo',
            canAccess: true,
          },
          {
            name: 'Posts',
            nameVi: 'Quản lý Bài viết',
            href: '/admin/seo/posts',
            icon: DocumentTextIcon,
            permission: 'read:posts',
            canAccess: true,
          },
          {
            name: 'Categories',
            nameVi: 'Danh mục',
            href: '/admin/seo/categories',
            icon: SwatchIcon,
            permission: 'read:categories',
            canAccess: true,
          },
          {
            name: 'Tags',
            nameVi: 'Thẻ từ khóa',
            href: '/admin/seo/tags',
            icon: SwatchIcon,
            permission: 'read:tags',
            canAccess: true,
          },
        ],
      },
      // ... other static menu items
    ];
  }, [dbMenuItems, transformMenuItems, pathname]);

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems;
    }

    const searchLower = searchQuery.toLowerCase();
    
    return menuItems.filter(item => {
      // Check if parent menu matches
      const parentMatches = item.title.toLowerCase().includes(searchLower);
      
      // Check if any child menu matches
      const childMatches = item.children?.some((child: any) => 
        child.name.toLowerCase().includes(searchLower) ||
        child.nameVi.toLowerCase().includes(searchLower)
      ) || false;
      
      return parentMatches || childMatches;
    }).map(item => {
      // If parent doesn't match but children do, filter children
      if (!item.title.toLowerCase().includes(searchLower) && item.children) {
        return {
          ...item,
          children: item.children.filter((child: any) =>
            child.name.toLowerCase().includes(searchLower) ||
            child.nameVi.toLowerCase().includes(searchLower)
          )
        };
      }
      return item;
    });
  }, [menuItems, searchQuery]);

  // Show "No results" message when search has no results
  const hasSearchResults = searchQuery.trim() && filteredMenuItems.length === 0;

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Auto-expand menus when submenu is active or when searching
  useEffect(() => {
    const activeParentMenus = filteredMenuItems
      .filter((item) => item.children && (item.active || searchQuery.trim()))
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
      
      // If searching, expand all parent menus with children
      if (searchQuery.trim()) {
        filteredMenuItems.forEach((item) => {
          if (item.children && !newExpanded.includes(item.path)) {
            newExpanded.push(item.path);
            hasChanges = true;
          }
        });
      }
      
      return hasChanges ? newExpanded : prev;
    });
  }, [filteredMenuItems, searchQuery]);

  const toggleTheme = () => {
    toggleMode();
  };

  const toggleSidebar = () => {
    // Desktop/tablet behavior
    if (window.innerWidth >= 768) {
      if (window.innerWidth >= 1024) {
        // Large screens: toggle between open and collapsed
        if (sidebarOpen && !isCollapsed) {
          setIsCollapsed(true);
        } else if (sidebarOpen && isCollapsed) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
          setIsCollapsed(false);
        }
      } else {
        // Medium screens: toggle collapsed state
        setIsCollapsed(!isCollapsed);
      }
    } else {
      // Mobile: use mobile menu instead
      toggleMobileMenu();
    }
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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex bg-background">


        {/* Desktop Sidebar */}
        <aside className={`
          hidden md:flex flex-col bg-surface border-r border-border transition-all duration-300 z-20
          ${sidebarOpen ? (isCollapsed ? 'w-16' : 'w-64') : 'w-0 border-r-0'}
          ${!sidebarOpen ? 'overflow-hidden' : ''}
        `}>
          {/* Sidebar Header */}
          <div className={`
            flex items-center h-16 px-4 border-b border-border transition-all duration-300
            ${isCollapsed ? 'justify-center px-2' : 'justify-between'}
            ${!sidebarOpen ? 'opacity-0' : 'opacity-100'}
          `}>
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'justify-center w-full' : 'space-x-3'
            }`}>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">K</span>
              </div>
              {!isCollapsed && (
          <span className="text-lg font-semibold text-primary whitespace-nowrap overflow-hidden">
            KataCore
          </span>
              )}
            </div>
            {!isCollapsed && (
              <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-hover transition-colors flex-shrink-0"
          title="Toggle sidebar (Ctrl+B)"
              >
          <Bars3Icon className="h-5 w-5 text-text-secondary" />
              </button>
            )}
          </div>

          {/* Search Box */}
          {sidebarOpen && !isCollapsed && (
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm menu... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm 
               focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
               placeholder-text-secondary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-hover rounded"
            >
              <XMarkIcon className="h-3 w-3 text-text-secondary" />
            </button>
          )}
              </div>
            </div>
          )}

          {/* Collapsed Search Icon */}
          {sidebarOpen && isCollapsed && (
            <div className="px-2 py-3 border-b border-border flex justify-center">
              <button
          onClick={() => {
            setIsCollapsed(false);
            setTimeout(() => searchInputRef.current?.focus(), 300);
          }}
          className="p-2 rounded-lg hover:bg-hover transition-colors"
          title="Expand to search (Ctrl+K)"
              >
          <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
          )}

          {/* Sidebar Menu */}
          <nav className={`
            relative flex-1 overflow-y-auto transition-all duration-300
            ${isCollapsed ? 'px-2 py-4 space-y-2' : 'px-4 py-4 space-y-1'}
          `}>
            {/* No search results message */}
            {hasSearchResults && !isCollapsed && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
          <MagnifyingGlassIcon className="w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Không tìm thấy menu nào</p>
          <p className="text-xs text-gray-400 mt-1">với từ khóa "{searchQuery}"</p>
              </div>
            )}

            {filteredMenuItems.filter(item => item.canAccess).map((item) => (
              <div key={item.path}>
          <button
            onClick={() => {
              if (item.children && !isCollapsed) {
                toggleMenuExpansion(item.path);
              } else if (item.children && isCollapsed) {
                setIsCollapsed(false);
                setTimeout(() => toggleMenuExpansion(item.path), 300);
              } else {
                router.push(item.path);
              }
            }}
            className={`
              group relative w-full flex items-center rounded-lg transition-all duration-200
              ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'}
              ${item.active 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }
            `}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={`flex items-center transition-all duration-200 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">
            {searchQuery.trim() ? highlightSearchTerm(item.title, searchQuery) : item.title}
                </span>
              )}
            </div>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                {item.title}
                {item.children && (
            <span className="ml-2 text-xs opacity-75">▶</span>
                )}
              </div>
            )}
            
            {!isCollapsed && item.children && (
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                shouldExpand(item) ? 'rotate-180' : ''
              }`} />
            )}
          </button>
          
          {/* Submenu */}
          {!isCollapsed && item.children && shouldExpand(item) && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.filter((child: any) => child.canAccess).map((subItem: any) => (
                <button
            key={subItem.href}
            onClick={() => router.push(subItem.href)}
            className={`
              w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
              ${pathname === subItem.href 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }
            `}
                >
            <subItem.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {searchQuery.trim() ? highlightSearchTerm(subItem.nameVi, searchQuery) : subItem.nameVi}
            </span>
                </button>
              ))}
            </div>
          )}
              </div>
            ))}

            {/* Expand button at bottom for collapsed state */}
            {isCollapsed && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            title="Expand sidebar (Ctrl+B)"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-400 mx-auto" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
              Expand sidebar
            </div>
          </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" 
            onClick={toggleMobileMenu}
            data-sidebar="overlay"
          />
        )}

        {/* Mobile Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-surface border-r border-border z-50 
            transform transition-transform duration-300 md:hidden
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          data-sidebar="mobile"
        >
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
          <nav className="relative flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Tìm kiếm menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm 
                           focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                           placeholder-text-secondary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-hover rounded"
                  >
                    <XMarkIcon className="h-3 w-3 text-text-secondary" />
                  </button>
                )}
              </div>
            </div>

            {/* No search results message for mobile */}
            {hasSearchResults && (
              <div className="text-center py-8">
                <div className="text-text-secondary text-sm">
                  <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy menu nào</p>
                  <p className="text-xs mt-1">với từ khóa "{searchQuery}"</p>
                </div>
              </div>
            )}

            {filteredMenuItems.filter(item => item.canAccess).map((item) => (
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
                    <span className="font-medium">
                      {searchQuery.trim() ? highlightSearchTerm(item.title, searchQuery) : item.title}
                    </span>
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
                        <span>
                          {searchQuery.trim() ? highlightSearchTerm(subItem.nameVi, searchQuery) : subItem.nameVi}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>



        {/* Main Content */}
        <div className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${sidebarOpen && !isCollapsed ? 'md:ml-0' : ''}
        `}>
          {/* Top Header */}
          <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-hover transition-colors md:hidden"
                title="Open menu"
              >
                <Bars3Icon className="h-5 w-5 text-text-secondary" />
              </button>

              {/* Desktop Sidebar Toggle - only show when sidebar is hidden */}
              {!sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="hidden md:flex p-2 rounded-lg hover:bg-hover transition-colors"
                  title="Open sidebar (Ctrl+B)"
                >
                  <Bars3Icon className="h-5 w-5 text-text-secondary" />
                </button>
              )}
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-text-secondary">Admin</span>
                <span className="text-text-secondary">/</span>
                <span className="text-primary font-medium truncate max-w-[200px]">
                  {(() => {
                    const segments = pathname.split('/');
                    const lastSegment = segments[segments.length - 1];
                    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : 'Dashboard';
                  })()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Toggle for Mobile */}
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toggleMobileMenu();
                  } else {
                    searchInputRef.current?.focus();
                  }
                }}
                className="p-2 rounded-lg hover:bg-hover transition-colors sm:hidden"
                title="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-hover transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
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
                  <p className="text-sm font-medium text-primary truncate max-w-[120px]">
                    {user?.displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-text-secondary truncate max-w-[120px]">
                    {user?.role?.name || 'Administrator'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main AdminLayout component với simple theme system
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  );
};

export default AdminLayout;

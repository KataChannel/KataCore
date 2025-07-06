'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ResizableTable from '../shared/Table';
import Sidebar from '../shared/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load theme and user data from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    const savedUserData = localStorage.getItem('admin-user-data');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const hrSubMenus = [
    { name: 'Dashboard', nameVi: 'Tổng quan', href: '/admin/hr', icon: '📊' },
    { name: 'Employees', nameVi: 'Nhân viên', href: '/admin/hr/employees', icon: '👥' },
    { name: 'Departments', nameVi: 'Phòng ban', href: '/admin/hr/departments', icon: '🏢' },
    { name: 'Positions', nameVi: 'Vị trí', href: '/admin/hr/positions', icon: '💼' },
    { name: 'Attendance', nameVi: 'Chấm công', href: '/admin/hr/attendance', icon: '⏰' },
    { name: 'Leave Requests', nameVi: 'Yêu cầu nghỉ phép', href: '/admin/hr/leave-requests', icon: '📋' },
    { name: 'Payroll', nameVi: 'Bảng lương', href: '/admin/hr/payroll', icon: '💰' },
    { name: 'Performance', nameVi: 'Hiệu suất', href: '/admin/hr/performance', icon: '📈' },
    { name: 'Reports', nameVi: 'Báo cáo', href: '/admin/hr/reports', icon: '📄' },
    { name: 'Settings', nameVi: 'Cài đặt', href: '/admin/hr/settings', icon: '⚙️' },
  ];

  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: '📊', 
      path: '/admin', 
      active: pathname === '/admin' 
    },
    { 
      title: 'HR Management', 
      icon: '👥', 
      path: '/admin/hr', 
      active: pathname.startsWith('/admin/hr'),
      children: hrSubMenus
    },
    { 
      title: 'CRM', 
      icon: '🤝', 
      path: '/admin/crm', 
      active: pathname.startsWith('/admin/crm') 
    },
    { 
      title: 'Website Management', 
      icon: '🌐', 
      path: '/admin/website', 
      active: pathname.startsWith('/admin/website') 
    },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-user-data');
    localStorage.removeItem('admin-token');
    router.push('/login');
  };

  const toggleMenuExpansion = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-black transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar menuItems={menuItems} />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Admin Dashboard
                </h2>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white transition-colors"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <span className="text-white dark:text-black text-sm font-bold">
                      {userData?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <span className="text-black dark:text-white font-medium">
                    {userData?.name || 'Admin'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    🚪
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8">
            <ResizableTable />
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
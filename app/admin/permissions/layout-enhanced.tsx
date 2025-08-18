'use client';

import React, { useState, useEffect } from 'react';
import { AdminPermissionsSidebar, AdminPermissionsHeader } from '@/components/admin/permissions';
import { useResponsive } from '@/hooks';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [typeof window !== 'undefined' ? window.location.pathname : '', isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminPermissionsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminPermissionsHeader 
          onMenuToggle={toggleSidebar} 
          title={title}
          subtitle={subtitle}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
            {/* Content Area with proper responsive spacing */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 TazaGroup. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Version 2.0.0
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnhancedLayout;

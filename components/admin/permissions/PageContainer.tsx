'use client';

import React from 'react';
import Breadcrumb from './Breadcrumb';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }>;
  className?: string;
  showBreadcrumb?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbItems,
  className = '',
  showBreadcrumb = true,
}) => {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {actions}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;

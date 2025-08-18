'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/admin/permissions', icon: HomeIcon }
    ];

    if (pathname === '/admin/permissions') {
      return breadcrumbItems;
    }

    const routeMap: Record<string, string> = {
      'menus': 'Quản lý Menu',
      'users': 'Quản lý Users',
      'roles': 'Quản lý Roles',
      'user-roles': 'Phân quyền User-Role',
      'graphql': 'GraphQL API',
      'graphql-demo': 'GraphQL Demo',
    };

    // Build breadcrumb from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (segment === 'admin' || segment === 'permissions') return;
      
      const label = routeMap[segment] || segment;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1 sm:mx-2" />
              )}
              
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1 sm:mr-2" />}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.slice(0, 10)}...</span>
                </Link>
              ) : (
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                  {Icon && <Icon className="h-4 w-4 mr-1 sm:mr-2" />}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.slice(0, 10)}...</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

interface TailwindCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'outlined' | 'soft' | 'solid';
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  loading?: boolean;
  actions?: React.ReactNode;
  tags?: string[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function TailwindCard({
  children,
  title,
  subtitle,
  variant = 'outlined',
  color = 'neutral',
  size = 'md',
  hover = true,
  loading = false,
  actions,
  tags,
  orientation = 'vertical',
  className
}: TailwindCardProps) {
  const baseClasses = "rounded-lg transition-all duration-200 ease-in-out";
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 shadow-sm",
    outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    soft: "bg-gray-50 dark:bg-gray-800/50",
    solid: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
  };

  const colorClasses = {
    primary: {
      default: "bg-blue-50 dark:bg-blue-950/30",
      outlined: "border-blue-200 dark:border-blue-800",
      soft: "bg-blue-50 dark:bg-blue-950/30",
      solid: "bg-blue-600 dark:bg-blue-500"
    },
    neutral: {
      default: "bg-white dark:bg-gray-800",
      outlined: "border-gray-200 dark:border-gray-700",
      soft: "bg-gray-50 dark:bg-gray-800/50",
      solid: "bg-gray-900 dark:bg-gray-100"
    },
    danger: {
      default: "bg-red-50 dark:bg-red-950/30",
      outlined: "border-red-200 dark:border-red-800",
      soft: "bg-red-50 dark:bg-red-950/30",
      solid: "bg-red-600 dark:bg-red-500"
    },
    success: {
      default: "bg-green-50 dark:bg-green-950/30",
      outlined: "border-green-200 dark:border-green-800",
      soft: "bg-green-50 dark:bg-green-950/30",
      solid: "bg-green-600 dark:bg-green-500"
    },
    warning: {
      default: "bg-yellow-50 dark:bg-yellow-950/30",
      outlined: "border-yellow-200 dark:border-yellow-800",
      soft: "bg-yellow-50 dark:bg-yellow-950/30",
      solid: "bg-yellow-600 dark:bg-yellow-500"
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const orientationClasses = {
    horizontal: "flex flex-row",
    vertical: "flex flex-col"
  };

  const hoverClasses = hover ? "hover:shadow-md hover:scale-[1.02]" : "";
  const loadingClasses = loading ? "opacity-60 pointer-events-none" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        colorClasses[color][variant],
        sizeClasses[size],
        orientationClasses[orientation],
        hoverClasses,
        loadingClasses,
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
              <button
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1">
        {children}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// Export as OptimizedCard for backward compatibility
export { TailwindCard as OptimizedCard };

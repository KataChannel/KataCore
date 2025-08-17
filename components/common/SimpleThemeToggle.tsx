'use client';

import React from 'react';
import { useSimpleTheme, type ThemeType } from '@/hooks/useSimpleTheme';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface SimpleThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button' | 'cycle';
}

export function SimpleThemeToggle({ className = '', variant = 'icon' }: SimpleThemeToggleProps) {
  const { theme, setTheme } = useSimpleTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'system':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={cycleTheme}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`}
      >
        {getIcon()}
        {getLabel()}
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className={`p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all duration-200 ${className}`}
      title={`Current theme: ${getLabel()}`}
    >
      {getIcon()}
    </button>
  );
}

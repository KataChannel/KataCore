'use client';

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSimpleTheme, type ThemeType } from '@/hooks/useSimpleTheme';
import { cn } from '@/lib/utils';

interface ThemeManagerProps {
  className?: string;
}

export function SimpleThemeManager({ className = '' }: ThemeManagerProps) {
  const { theme, setTheme } = useSimpleTheme();

  return (
    <div className={cn('flex gap-2 items-center', className)}>
      <select
        className="block w-[120px] rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeType)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>

      <button
        type="button"
        className="rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <SunIcon className="h-5 w-5" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export default SimpleThemeManager;

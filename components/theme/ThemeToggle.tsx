'use client';

import React from 'react';
import { useSimpleTheme } from '@/hooks/useSimpleTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'switch';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = '',
  variant = 'icon',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, setTheme } = useSimpleTheme();
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {variant === 'icon' ? (
        <button
          type="button"
          className="rounded-md bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      ) : (
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox"
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          {showLabel && (
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {theme === 'dark' ? 'Dark' : 'Light'} mode
            </span>
          )}
        </label>
      )}
    </div>
  );
}

interface ThemeSelectProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeSelect({ className = '', showLabel = true }: ThemeSelectProps) {
  const { theme, setTheme } = useSimpleTheme();
  
  const modes = [
    { value: 'light', label: 'Light', Icon: SunIcon },
    { value: 'dark', label: 'Dark', Icon: MoonIcon },
    { value: 'system', label: 'System', Icon: SunIcon },
  ] as const;
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
          Theme Mode
        </span>
      )}
      <div className="flex gap-2">
        {modes.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-1 rounded-lg p-3 ${
              theme === value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={`Switch to ${label} mode`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Export ThemeToggle as the default component
export default ThemeToggle;

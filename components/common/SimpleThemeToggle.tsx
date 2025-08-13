'use client';

import React from 'react';
import { Button } from '@mui/joy';
import { useTheme } from '@/hooks/useSimpleTheme';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface SimpleThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button' | 'cycle';
}

export function SimpleThemeToggle({ className = '', variant = 'icon' }: SimpleThemeToggleProps) {
  const { mode, setMode } = useTheme();

  const cycleTheme = () => {
    if (mode === 'light') {
      setMode('dark');
    } else if (mode === 'dark') {
      setMode('system');
    } else {
      setMode('light');
    }
  };

  const getIcon = () => {
    switch (mode) {
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
    switch (mode) {
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
      <Button
        variant="outlined"
        size="sm"
        onClick={cycleTheme}
        className={className}
        startDecorator={getIcon()}
      >
        {getLabel()}
      </Button>
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

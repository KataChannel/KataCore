'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TailwindThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const TailwindThemeContext = createContext<TailwindThemeContextType | undefined>(undefined);

interface TailwindThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;
}

/**
 * Tailwind Theme Provider Component
 * 
 * Provides theme context for Tailwind CSS dark mode
 * Handles theme persistence and system preference detection
 */
export function TailwindThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'tailwind-theme'
}: TailwindThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Handle hydration and initial theme setup
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = stored ? (stored as 'light' | 'dark') : (prefersDark ? 'dark' : 'light');
    setThemeState(initialTheme);
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(storageKey, theme);
  }, [theme, mounted, storageKey]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="contents">{children}</div>;
  }

  return (
    <TailwindThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </TailwindThemeContext.Provider>
  );
}

/**
 * Hook to use Tailwind theme context
 */
export function useTailwindTheme() {
  const context = useContext(TailwindThemeContext);
  if (context === undefined) {
    throw new Error('useTailwindTheme must be used within a TailwindThemeProvider');
  }
  return context;
}

/**
 * Theme toggle button component
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTailwindTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className || ''}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

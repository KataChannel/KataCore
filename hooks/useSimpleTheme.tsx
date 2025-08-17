'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useSimpleTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSimpleTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeType;
  enableSystemPreference?: boolean;
  enablePersistence?: boolean;
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
  enableSystemPreference = true,
  enablePersistence = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeType>(defaultMode as ThemeType);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as ThemeType;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeState(saved);
      }
    }
  }, [enablePersistence]);

  // Calculate and apply actual theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const actualTheme = theme === 'system' && enableSystemPreference
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : theme === 'dark' ? 'dark' : 'light';
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      
      // Add current theme class
      root.classList.add(actualTheme);
      
      // Set color scheme for browser
      root.style.setProperty('color-scheme', actualTheme);
      
      // Add event listener for system theme changes
      if (theme === 'system' && enableSystemPreference) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
          root.classList.remove('light', 'dark');
          root.classList.add(e.matches ? 'dark' : 'light');
          root.style.setProperty('color-scheme', e.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [theme, enableSystemPreference]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Safe hooks with fallbacks
export function useSafeTheme() {
  try {
    return useSimpleTheme();
  } catch {
    return {
      theme: 'light' as ThemeType,
      setTheme: () => {},
    };
  }
}

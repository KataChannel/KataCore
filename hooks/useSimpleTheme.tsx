'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  actualMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  enableSystemPreference?: boolean;
  enablePersistence?: boolean;
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
  enableSystemPreference = true,
  enablePersistence = true,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');

  // Load saved theme from localStorage on mount
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode') as ThemeMode;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setModeState(saved);
      }
    }
  }, [enablePersistence]);

  // Calculate actual mode based on system preference
  useEffect(() => {
    const calculateActualMode = () => {
      if (mode === 'system' && enableSystemPreference) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return mode === 'dark' ? 'dark' : 'light';
    };

    setActualMode(calculateActualMode());

    if (mode === 'system' && enableSystemPreference) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => setActualMode(calculateActualMode());
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode, enableSystemPreference]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      
      // Add current theme class
      root.classList.add(actualMode);
      
      // Set Joy UI color scheme
      root.setAttribute('data-joy-color-scheme', actualMode);
      
      // Set CSS custom property for Tailwind
      root.style.setProperty('color-scheme', actualMode);
    }
  }, [actualMode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', newMode);
    }
  };

  const toggleMode = () => {
    const newMode = actualMode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        actualMode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Safe hooks with fallbacks
export function useSafeTheme() {
  try {
    return useTheme();
  } catch {
    return {
      mode: 'light' as ThemeMode,
      actualMode: 'light' as const,
      setMode: () => {},
      toggleMode: () => {},
    };
  }
}

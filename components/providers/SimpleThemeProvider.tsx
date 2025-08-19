'use client';

import React from 'react';
import { TailwindThemeProvider } from './TailwindThemeProvider';
import { ThemeProvider } from '@/hooks/useSimpleTheme';

interface SimpleThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Simple Theme Provider Component (Backward Compatible)
 * 
 * Provides both TailwindThemeProvider and the original ThemeProvider
 * to maintain backward compatibility during migration
 */
export function SimpleThemeProvider({ children }: SimpleThemeProviderProps) {
  return (
    <TailwindThemeProvider defaultTheme="light" storageKey="simple-theme">
      <ThemeProvider defaultMode="light" enableSystemPreference={true} enablePersistence={true}>
        {children}
      </ThemeProvider>
    </TailwindThemeProvider>
  );
}

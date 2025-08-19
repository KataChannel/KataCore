'use client';

import React from 'react';
import { TailwindThemeProvider } from './TailwindThemeProvider';
import { ThemeProvider } from '@/hooks/useSimpleTheme';

interface JoyUIProviderProps {
  children: React.ReactNode;
}

/**
 * Joy UI Provider Component (Now using Tailwind with Backward Compatibility)
 * 
 * Provides both TailwindThemeProvider and the original ThemeProvider
 * to maintain backward compatibility during migration
 */
export function JoyUIProvider({ children }: JoyUIProviderProps) {
  return (
    <TailwindThemeProvider defaultTheme="light" storageKey="joy-theme">
      <ThemeProvider defaultMode="light" enableSystemPreference={true} enablePersistence={true}>
        {children}
      </ThemeProvider>
    </TailwindThemeProvider>
  );
}

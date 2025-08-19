'use client';

import React from 'react';
import { TailwindThemeProvider } from './TailwindThemeProvider';

interface SimpleThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Simple Theme Provider Component (Now using Tailwind)
 * 
 * Migrated to use TailwindThemeProvider for backward compatibility
 * Maintains the same interface but uses Tailwind CSS instead of Joy UI
 */
export function SimpleThemeProvider({ children }: SimpleThemeProviderProps) {
  return (
    <TailwindThemeProvider defaultTheme="light" storageKey="simple-theme">
      {children}
    </TailwindThemeProvider>
  );
}

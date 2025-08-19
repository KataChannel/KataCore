'use client';

import React from 'react';
import { TailwindThemeProvider } from './TailwindThemeProvider';

interface JoyUIProviderProps {
  children: React.ReactNode;
}

/**
 * Joy UI Provider Component (Now using Tailwind)
 * 
 * Migrated to use TailwindThemeProvider for backward compatibility
 * Maintains the same interface but uses Tailwind CSS instead of Joy UI
 */
export function JoyUIProvider({ children }: JoyUIProviderProps) {
  return (
    <TailwindThemeProvider defaultTheme="light" storageKey="joy-theme">
      {children}
    </TailwindThemeProvider>
  );
}

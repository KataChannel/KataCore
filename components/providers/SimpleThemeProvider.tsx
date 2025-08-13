'use client';

import React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import { ThemeProvider } from '@/hooks/useSimpleTheme';
import { joyTheme } from '@/lib/theme/joy-theme';

interface SimpleThemeProviderProps {
  children: React.ReactNode;
}

export function SimpleThemeProvider({ children }: SimpleThemeProviderProps) {
  return (
    <ThemeProvider
      defaultMode="light"
      enableSystemPreference={true}
      enablePersistence={true}
    >
      <CssVarsProvider theme={joyTheme} defaultMode="light">
        {children}
      </CssVarsProvider>
    </ThemeProvider>
  );
}

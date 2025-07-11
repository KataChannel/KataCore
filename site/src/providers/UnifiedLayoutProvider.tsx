'use client';

import React, { ReactNode } from 'react';
import { MonochromeProvider } from '../hooks/useMonochromeTheme';
import { monochromeThemeConfig } from '../lib/config/monochrome-theme';

interface UnifiedLayoutProviderProps {
  children: ReactNode;
}

export function UnifiedLayoutProvider({
  children,
}: UnifiedLayoutProviderProps) {
  return (
    <MonochromeProvider
      defaultMode={monochromeThemeConfig.defaults.mode}
      defaultLanguage={monochromeThemeConfig.defaults.language}
    >
      {children}
    </MonochromeProvider>
  );
}

export default UnifiedLayoutProvider;

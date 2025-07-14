'use client';

import React, { ReactNode } from 'react';
import { UnifiedThemeProvider } from '@/hooks/useUnifiedTheme';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';

interface SafeLayoutProps {
  children: ReactNode;
}

export function SafeLayout({ children }: SafeLayoutProps) {
  return (
    <UnifiedThemeProvider
      defaultConfig={{
        mode: 'light',
        language: 'vi',
        colorScheme: 'monochrome',
      }}
      enablePersistence={true}
      enableSystemListener={true}
    >
      <UnifiedAuthProvider>
        <div className="min-h-screen bg-background transition-all duration-300">
          {children}
        </div>
      </UnifiedAuthProvider>
    </UnifiedThemeProvider>
  );
}

export default SafeLayout;

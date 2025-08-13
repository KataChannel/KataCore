'use client';

import React, { ReactNode } from 'react';
import { SimpleThemeProvider } from '@/components/providers/SimpleThemeProvider';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';

interface SafeLayoutProps {
  children: ReactNode;
}

export function SafeLayout({ children }: SafeLayoutProps) {
  return (
    <SimpleThemeProvider>
      <UnifiedAuthProvider>
        <div className="min-h-screen bg-theme-bg text-theme-fg transition-all duration-300">
          {children}
        </div>
      </UnifiedAuthProvider>
    </SimpleThemeProvider>
  );
}

export default SafeLayout;

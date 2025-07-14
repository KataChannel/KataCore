// ============================================================================
// TAZA CORE MAIN LAYOUT
// ============================================================================
// Root layout following TazaCore unified standards

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { UnifiedThemeProvider } from '@/hooks/useUnifiedTheme';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';
import { ThemeInitScript } from '@/components/ThemeManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/unified-theme.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TazaCore - Unified Business Management',
  description: 'Complete business management solution with unified modules',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
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
              {children}
            </UnifiedAuthProvider>
          </UnifiedThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

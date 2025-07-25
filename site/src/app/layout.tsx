// ============================================================================
// TAZA CORE MAIN LAYOUT
// ============================================================================
// Root layout following TazaCore unified standards

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { UnifiedThemeProvider } from '@/hooks/useUnifiedTheme';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';
import { ThemeInitScript } from '@/components/ThemeManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import '@/styles/unified-theme.css';

const inter = Inter({ subsets: ['latin'] });

// Fix: Loại bỏ viewport khỏi metadata
export const metadata: Metadata = {
  title: 'TazaCore - Unified Business Management',
  description: 'Complete business management solution with unified modules',
  manifest: '/manifest.json',
  // Loại bỏ viewport từ đây
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TazaCore',
    startupImage: [
      '/icons/icon-192x192.png',
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

// Fix: Gộp viewport config vào một export duy nhất
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        {/* PWA meta tags */}
        <meta name="application-name" content="TazaCore" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TazaCore" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Link tags for PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
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
              <PWAInstallPrompt />
            </UnifiedAuthProvider>
          </UnifiedThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

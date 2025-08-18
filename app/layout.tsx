// ============================================================================
// TAZA CORE MAIN LAYOUT
// ============================================================================
// Root layout following TazaCore unified standards with Joy UI integration

import type { Metadata, Viewport } from 'next';
import './styles/globals.css';
import { UnifiedAuthProvider } from '@/components/auth/UnifiedAuthProvider';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { SimpleThemeProvider } from '@/components/providers/SimpleThemeProvider';
import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { GraphQLProvider } from '@/components/providers/GraphQLProvider';
import { Suspense } from 'react';
import { ClientOnly } from '@/components/ClientOnly';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <SimpleThemeProvider>
          <UnifiedAuthProvider>
            <ToastProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <ClientOnly>
                  {children}
                </ClientOnly>
              </Suspense>
            </ToastProvider>
          </UnifiedAuthProvider>
        </SimpleThemeProvider>
      </body>
    </html>
  );
}

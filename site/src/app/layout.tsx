// ============================================================================
// TAZA CORE MAIN LAYOUT
// ============================================================================
// Root layout following TazaCore unified standards

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/UnifiedAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TazaCore - Unified Business Management',
  description: 'Complete business management solution with unified modules',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

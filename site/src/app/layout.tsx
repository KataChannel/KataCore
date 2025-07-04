import '@/app/globals.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { siteConfig } from '@/app/lib/config/site';
import Head from 'next/head'; // Sử dụng next/head cho các thẻ meta
import { MaintenanceGuard } from '@/app/components/auth';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="A Progressive Web App built with Next.js" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body className={`${inter.className} antialiased`}>
        <MaintenanceGuard>
          {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}
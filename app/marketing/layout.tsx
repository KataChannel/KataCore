import { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'
import { cn } from '@/lib/utils'

// Font optimization với preload
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: {
    default: 'TazaCore - Platform quản lý doanh nghiệp',
    template: '%s | TazaCore'
  },
  description: 'Hệ thống quản lý doanh nghiệp toàn diện với Next.js 15',
  keywords: ['CRM', 'ERP', 'Quản lý', 'Doanh nghiệp', 'Next.js'],
  authors: [{ name: 'TazaCore Team' }],
  creator: 'TazaCore',
  publisher: 'TazaCore',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3900'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'TazaCore - Platform quản lý doanh nghiệp',
    description: 'Hệ thống quản lý doanh nghiệp toàn diện với Next.js 15',
    siteName: 'TazaCore',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TazaCore - Platform quản lý doanh nghiệp',
    description: 'Hệ thống quản lý doanh nghiệp toàn diện với Next.js 15',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn(
      'min-h-screen bg-background font-sans antialiased',
      inter.variable,
      roboto.variable
    )}>
      {/* Marketing Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                TazaCore
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Tính năng
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#pricing"
              >
                Giá cả
              </a>
              <a
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#about"
              >
                Về chúng tôi
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Marketing Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2024 TazaCore. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

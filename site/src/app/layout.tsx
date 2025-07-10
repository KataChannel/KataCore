import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "../lib/config/site";
import { MaintenanceGuard } from "../components/auth";
import ThemeManager, { ThemeInitScript } from "@/components/ThemeManager";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KataCore HR",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "KataCore HR Management System",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="KataCore HR" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KataCore HR" />
        <meta
          name="description"
          content="Comprehensive HR management system with employee management, departments, attendance, payroll, and more"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#4f46e5"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://katacore.hr" />
        <meta name="twitter:title" content="KataCore HR Management System" />
        <meta
          name="twitter:description"
          content="Comprehensive HR management system with employee management, departments, attendance, payroll, and more"
        />
        <meta
          name="twitter:image"
          content="https://katacore.hr/icons/icon-192x192.png"
        />
        <meta name="twitter:creator" content="@katacore" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KataCore HR Management System" />
        <meta
          property="og:description"
          content="Comprehensive HR management system with employee management, departments, attendance, payroll, and more"
        />
        <meta property="og:site_name" content="KataCore HR Management System" />
        <meta property="og:url" content="https://katacore.hr" />
        <meta
          property="og:image"
          content="https://katacore.hr/icons/icon-192x192.png"
        />
      </head>
      <body suppressHydrationWarning>
        <MaintenanceGuard>
          <ThemeManager
            defaultConfig={{
              mode: "light",
              language: "vi",
              colorScheme: "monochrome",
            }}
            enablePersistence={true}
            enableSystemListener={true}
            enableDebugMode={false}
          >
            {children}
          </ThemeManager>
        </MaintenanceGuard>
      </body>
    </html>
  );
}

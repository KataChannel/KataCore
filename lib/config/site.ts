export const siteConfig = {
  title: 'TazaCore',
  description: 'Professional business management system with modern design',
  offline: false,
  maintenance: {
    enabled: false,
    message: 'Website đang trong quá trình bảo trì. Vui lòng quay lại sau!',
    allowedUsers: ['admin@example.com', 'user@example.com'],
    estimatedTime: '8/7/2025',
  },
  auth: {
    loginRequired: true,
    redirectAfterLogin: '/dashboard',
    redirectAfterLogout: '/login',
  },

  // Simplified theme configuration - Light/Dark only
  theme: {
    default: 'light', // 'light' | 'dark' | 'system'
    allowUserToggle: true,
    respectSystemPreference: true,
    transitions: true,
  },

  // Multi-language configuration
  i18n: {
    defaultLanguage: 'vi',
    supportedLanguages: ['vi', 'en'],
    autoDetect: true,
    allowUserSwitch: true,
    persistLanguage: true,
    fallbackLanguage: 'vi',
  },

  // Logo configuration
  logo: {
    default: '/images/logo.png',
    dark: '/images/logo-dark.png',
    light: '/images/logo-light.png',
    width: 150,
    height: 50,
    alt: 'TazaCore',
  },

  // SEO configuration
  seo: {
    titleTemplate: '%s | TazaCore',
    titleSeparator: '|',
    titleSuffix: 'TazaCore',
    description: 'TazaCore - Hệ thống quản lý doanh nghiệp hiện đại với hỗ trợ đa ngôn ngữ và chế độ tối.',
    keywords: [
      'business management',
      'dark mode',
      'multi-language',
      'react',
      'nextjs',
      'tailwindcss',
      'joyui',
      'typescript',
    ],
    url: 'https://tazacore.com',
    image: '/images/og-image.png',
    twitterCard: 'summary_large_image',
  },

  // Author information
  author: {
    name: 'TazaCore Team',
    email: 'contact@tazacore.com',
    url: 'https://tazacore.com',
    social: {
      twitter: '@tazacore',
      github: 'tazacore',
      linkedin: 'tazacore',
    },
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: true,
    notifications: true,
    offlineMode: false,
    analytics: true,
    errorReporting: true,
  },

  // UI preferences
  ui: {
    animations: true,
    transitions: true,
    reducedMotion: false,
    fontSize: 'base',
    borderRadius: 'base',
    shadowLevel: 'normal',
  },

  // Layout configuration
  layout: {
    header: {
      sticky: true,
      transparent: false,
      blur: true,
    },
    sidebar: {
      collapsible: true,
      defaultCollapsed: false,
      width: 256,
      collapsedWidth: 64,
    },
    footer: {
      visible: true,
      sticky: false,
    },
  },

  // Performance settings
  performance: {
    lazyLoading: true,
    imageOptimization: true,
    codesplitting: true,
    prefetching: true,
    caching: true,
  },
};

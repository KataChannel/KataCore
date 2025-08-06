export const siteConfig = {
  title: 'TazaCore - Monochrome UI',
  description: 'Professional HR management system with modern design',
  offline: false, // Chỉ sử dụng khi website không cần kết nối internet
  maintenance: {
    enabled: false, // Bật/tắt chế độ bảo trì
    message: 'Website đang trong quá trình bảo trì. Vui lòng quay lại sau!',
    allowedUsers: ['admin@example.com', 'user@example.com'], // Email được phép truy cập khi bảo trì
    estimatedTime: '8/7/2025',
  },
  auth: {
    loginRequired: true, // Yêu cầu đăng nhập để truy cập
    redirectAfterLogin: '/dashboard', // Trang chuyển hướng sau khi đăng nhập thành công
    redirectAfterLogout: '/login',
  },

  // Enhanced theme configuration
  theme: {
    default: 'light', // Chế độ giao diện mặc định: 'light', 'dark', 'auto'
    mode: 'monochrome', // Chế độ màu sắc: 'monochrome', 'colorful'
    allowUserToggle: true, // Cho phép người dùng chuyển đổi theme
    respectSystemPreference: true, // Tự động theo system preference
    transitions: true, // Bật hiệu ứng chuyển đổi
    customColors: {
      accent: '#2563eb', // Màu nhấn chính
      accentSecondary: '#3b82f6', // Màu nhấn phụ
    },
  },

  // Multi-language configuration
  i18n: {
    defaultLanguage: 'vi', // Ngôn ngữ mặc định
    supportedLanguages: ['vi', 'en'], // Các ngôn ngữ được hỗ trợ
    autoDetect: true, // Tự động phát hiện ngôn ngữ từ browser
    allowUserSwitch: true, // Cho phép người dùng chuyển đổi ngôn ngữ
    persistLanguage: true, // Lưu lựa chọn ngôn ngữ
    fallbackLanguage: 'vi', // Ngôn ngữ dự phòng
  },

  // Logo configuration
  logo: {
    default: '/images/logo.png', // Đường dẫn đến logo mặc định
    dark: '/images/logo-dark.png', // Đường dẫn đến logo tối
    light: '/images/logo-light.png', // Đường dẫn đến logo sáng
    width: 150, // Chiều rộng của logo
    height: 50, // Chiều cao của logo
    alt: 'TazaCore - Monochrome UI System',
  },

  // SEO configuration
  seo: {
    titleTemplate: '%s | TazaCore',
    titleSeparator: '|',
    titleSuffix: 'TazaCore',
    description: 'TazaCore - Hệ thống giao diện đơn sắc với hỗ trợ đa ngôn ngữ và chế độ tối.',
    keywords: [
      'monochrome ui',
      'dark mode',
      'multi-language',
      'react',
      'nextjs',
      'tailwindcss',
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
    darkMode: true, // Bật tính năng dark mode
    multiLanguage: true, // Bật tính năng đa ngôn ngữ
    notifications: true, // Bật hệ thống thông báo
    offlineMode: false, // Bật chế độ offline
    analytics: true, // Bật analytics
    errorReporting: true, // Bật báo cáo lỗi
  },

  // UI preferences
  ui: {
    animations: true, // Bật hoạt ảnh
    transitions: true, // Bật hiệu ứng chuyển đổi
    reducedMotion: false, // Giảm hoạt ảnh (accessibility)
    fontSize: 'base', // Kích thước font mặc định
    borderRadius: 'base', // Độ bo góc mặc định
    shadowLevel: 'normal', // Mức độ bóng đổ
  },

  // Layout configuration
  layout: {
    header: {
      sticky: true, // Header dính
      transparent: false, // Header trong suốt
      blur: true, // Hiệu ứng mờ
    },
    sidebar: {
      collapsible: true, // Sidebar có thể thu gọn
      defaultCollapsed: false, // Mặc định thu gọn
      width: 256, // Chiều rộng sidebar
      collapsedWidth: 64, // Chiều rộng khi thu gọn
    },
    footer: {
      visible: true, // Hiển thị footer
      sticky: false, // Footer dính
    },
  },

  // Performance settings
  performance: {
    lazyLoading: true, // Bật lazy loading
    imageOptimization: true, // Tối ưu hình ảnh
    codesplitting: true, // Tách code
    prefetching: true, // Prefetch pages
    caching: true, // Bật cache
  },
};

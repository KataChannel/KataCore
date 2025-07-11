# Hệ thống Theme Thống Nhất - TazaCore

## 🎯 Tổng quan

Hệ thống theme thống nhất của TazaCore cung cấp một giải pháp tập trung để quản lý dark mode, theme config và cấu hình giao diện cho toàn bộ ứng dụng.

## ✨ Tính năng chính

### 🌓 Dark Mode & Theme Mode
- **Light Mode**: Giao diện sáng với màu nền trắng
- **Dark Mode**: Giao diện tối với màu nền đen
- **Auto Mode**: Tự động theo system preference

### 🎨 Color Scheme
- **Monochrome**: Thiết kế đơn sắc với bảng màu xám tinh tế
- **Colorful**: Thiết kế nhiều màu sắc (có thể mở rộng)

### 🌍 Multi-language
- Hỗ trợ Tiếng Việt và Tiếng Anh
- Tự động phát hiện ngôn ngữ từ trình duyệt
- Dễ dàng mở rộng thêm ngôn ngữ

### ♿ Accessibility
- High Contrast Mode
- Reduced Motion Support
- Focus Management
- Screen Reader Support

## 🚀 Cài đặt và sử dụng

### 1. Cấu hình App Layout

```tsx
// app/layout.tsx
import { ThemeManager, ThemeInitScript } from '@/src/components/ThemeManager';
import '@/src/styles/unified-theme.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Ngăn FOUC (Flash of Unstyled Content) */}
        <ThemeInitScript />
      </head>
      <body>
        <ThemeManager
          defaultConfig={{
            mode: 'light',
            language: 'vi',
            colorScheme: 'monochrome',
          }}
          enablePersistence={true}
          enableSystemListener={true}
          enableDebugMode={false}
        >
          {children}
        </ThemeManager>
      </body>
    </html>
  );
}
```

### 2. Sử dụng Hook chính

```tsx
// components/MyComponent.tsx
import { useUnifiedTheme } from '@/src/hooks/useUnifiedTheme';

export function MyComponent() {
  const {
    config,           // Cấu hình theme hiện tại
    actualMode,       // 'light' | 'dark' (mode thực tế)
    colors,           // Object chứa tất cả màu sắc
    isLoading,        // Trạng thái loading
    toggleMode,       // Chuyển đổi theme mode
    toggleLanguage,   // Chuyển đổi ngôn ngữ
    updateConfig,     // Cập nhật cấu hình
  } = useUnifiedTheme();

  return (
    <div className="unified-card">
      <h1 style={{ color: colors.text }}>
        {config.language === 'vi' ? 'Xin chào' : 'Hello'}
      </h1>
      
      <button onClick={toggleMode} className="unified-button">
        {config.mode === 'light' ? '🌙' : '☀️'}
      </button>
      
      <button onClick={toggleLanguage} className="unified-button secondary">
        {config.language === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
      </button>
    </div>
  );
}
```

### 3. Sử dụng Hook chuyên biệt

```tsx
// Chỉ cần theme mode
import { useThemeMode } from '@/src/hooks/useUnifiedTheme';

export function ThemeToggle() {
  const { mode, actualMode, toggleMode, isSystemMode } = useThemeMode();
  
  return (
    <button onClick={toggleMode} className="unified-button ghost">
      {actualMode === 'dark' ? '🌙' : '☀️'}
      {isSystemMode && <span className="text-xs">AUTO</span>}
    </button>
  );
}

// Chỉ cần language
import { useLanguage } from '@/src/hooks/useUnifiedTheme';

export function LanguageSwitch() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button onClick={toggleLanguage} className="unified-button ghost">
      {language === 'vi' ? '🇻🇳' : '🇺🇸'}
    </button>
  );
}

// Chỉ cần colors
import { useThemeColors } from '@/src/hooks/useUnifiedTheme';

export function ThemedIcon() {
  const { colors, mode } = useThemeColors();
  
  return (
    <svg fill={colors.accent} className="w-6 h-6">
      {/* SVG content */}
    </svg>
  );
}

// Check dark mode
import { useIsDarkMode } from '@/src/hooks/useUnifiedTheme';

export function ConditionalComponent() {
  const isDark = useIsDarkMode();
  
  return (
    <div className={isDark ? 'dark-specific-class' : 'light-specific-class'}>
      Content
    </div>
  );
}
```

### 4. Sử dụng Components có sẵn

```tsx
import { 
  ThemeModeToggle, 
  LanguageToggle, 
  ThemeControlPanel 
} from '@/src/components/ThemeManager';

export function Header() {
  return (
    <header className="unified-card">
      <div className="flex items-center gap-4">
        <h1>TazaCore</h1>
        
        {/* Toggle đơn giản */}
        <ThemeModeToggle />
        <LanguageToggle />
        
        {/* Toggle với label */}
        <ThemeModeToggle showLabel={true} />
        <LanguageToggle showLabel={true} />
      </div>
    </header>
  );
}

export function SettingsPage() {
  return (
    <div className="p-6">
      <h1>Cài đặt</h1>
      
      {/* Panel điều khiển đầy đủ */}
      <ThemeControlPanel className="max-w-md" />
    </div>
  );
}
```

## 🎨 CSS Classes

### Unified Classes (Khuyến khích sử dụng)

```css
/* Components */
.unified-card         /* Thẻ cơ bản */
.unified-button       /* Nút cơ bản */
.unified-button.secondary  /* Nút phụ */
.unified-button.ghost     /* Nút trong suốt */
.unified-button.accent    /* Nút nhấn */
.unified-input        /* Input field */
.unified-badge        /* Badge/Tag */
.unified-divider      /* Đường phân cách */

/* Utilities */
.unified-transition      /* Transition cơ bản */
.unified-transition-fast /* Transition nhanh */
.unified-transition-slow /* Transition chậm */
.unified-focus-ring     /* Focus indicator */
.unified-loading        /* Loading shimmer */
```

### Tailwind Integration

```tsx
// Sử dụng CSS variables trong Tailwind
<div className="bg-background text-text border-border">
  <h1 className="text-primary">Title</h1>
  <p className="text-text-secondary">Description</p>
  <button className="bg-accent text-white shadow-md">
    Button
  </button>
</div>

// Responsive design
<div className="
  unified-card 
  bg-surface 
  hover:bg-surface-elevated 
  transition-all duration-normal
">
  Content
</div>
```

### CSS Variables

```css
/* Color Variables */
--color-primary          /* Màu chính */
--color-secondary        /* Màu phụ */
--color-accent           /* Màu nhấn */
--color-background       /* Nền chính */
--color-surface          /* Nền thẻ */
--color-text             /* Văn bản chính */
--color-text-secondary   /* Văn bản phụ */
--color-border           /* Đường viền */

/* Gray Scale */
--color-gray-50 ... --color-gray-900

/* Status Colors */
--color-success, --color-warning, --color-error, --color-info

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl

/* Animation */
--duration-fast, --duration-normal, --duration-slow
--easing-in-out, --easing-bounce
```

## 🔧 Cấu hình nâng cao

### Custom Theme Config

```tsx
import { ThemeConfig } from '@/src/lib/config/unified-theme';

const customConfig: Partial<ThemeConfig> = {
  mode: 'auto',
  colorScheme: 'monochrome',
  language: 'vi',
  animationLevel: 'normal',
  fontSize: 'base',
  borderRadius: 'lg',
  enableTransitions: true,
  enableAnimations: true,
  highContrast: false,
  reducedMotion: false,
};

// Sử dụng trong ThemeManager
<ThemeManager defaultConfig={customConfig}>
  {children}
</ThemeManager>
```

### Authentication Integration

```tsx
// components/AuthenticatedApp.tsx
import { enhancedAuthService } from '@/lib/auth/enhancedAuthService';
import { useUnifiedTheme } from '@/src/hooks/useUnifiedTheme';

export function AuthenticatedApp() {
  const { config, updateConfig } = useUnifiedTheme();
  
  // Sync theme với user preferences
  useEffect(() => {
    const syncUserTheme = async () => {
      const user = await enhancedAuthService.getUserById(userId);
      if (user?.themePreferences) {
        updateConfig(user.themePreferences);
      }
    };
    
    syncUserTheme();
  }, []);
  
  // Save theme changes
  const handleThemeChange = useCallback((newConfig) => {
    updateConfig(newConfig);
    enhancedAuthService.updateUserThemePreferences(userId, newConfig);
  }, [userId]);
  
  return <div>App content</div>;
}
```

### HOC Usage

```tsx
import { withTheme, withThemeMode } from '@/src/hooks/useUnifiedTheme';

// Inject toàn bộ theme context
const ThemedComponent = withTheme(({ theme, ...props }) => {
  return (
    <div style={{ color: theme.colors.text }}>
      Content with theme: {theme.actualMode}
    </div>
  );
});

// Chỉ inject theme mode
const ModeAwareComponent = withThemeMode(({ themeMode, ...props }) => {
  return (
    <div className={themeMode.actualMode === 'dark' ? 'dark-style' : 'light-style'}>
      Current mode: {themeMode.mode}
    </div>
  );
});
```

## 📱 Responsive Design

```tsx
// Mobile-first approach
<div className="
  unified-card
  p-4 md:p-6 lg:p-8
  text-sm md:text-base lg:text-lg
  border-radius-sm md:border-radius-base lg:border-radius-lg
">
  Responsive content
</div>
```

## ♿ Accessibility

```tsx
import { useAccessibility } from '@/src/hooks/useUnifiedTheme';

export function AccessibleComponent() {
  const { 
    highContrast, 
    reducedMotion, 
    enableHighContrast, 
    enableReducedMotion 
  } = useAccessibility();
  
  return (
    <div>
      <button 
        onClick={() => enableHighContrast(!highContrast)}
        className="unified-button"
        aria-label="Toggle high contrast"
      >
        High Contrast: {highContrast ? 'ON' : 'OFF'}
      </button>
      
      <button 
        onClick={() => enableReducedMotion(!reducedMotion)}
        className="unified-button"
        aria-label="Toggle reduced motion"
      >
        Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
```

## 🔄 Migration từ hệ thống cũ

### 1. Thay thế imports

```tsx
// Cũ
import { useTheme } from '@/src/hooks/useTheme';
import { useMonochromeTheme } from '@/src/hooks/useMonochromeTheme';

// Mới
import { useUnifiedTheme } from '@/src/hooks/useUnifiedTheme';
```

### 2. Cập nhật CSS classes

```tsx
// Cũ
<div className="mono-card">
  <button className="mono-button">Click</button>
</div>

// Mới (khuyến khích)
<div className="unified-card">
  <button className="unified-button">Click</button>
</div>

// Hoặc giữ nguyên (legacy support)
<div className="mono-card">  {/* Vẫn hoạt động */}
  <button className="mono-button">Click</button>
</div>
```

### 3. Cập nhật CSS variables

```css
/* Cũ */
background-color: var(--mono-color-surface);

/* Mới */
background-color: var(--color-surface);
```

## 🐛 Troubleshooting

### FOUC (Flash of Unstyled Content)

```tsx
// Đảm bảo ThemeInitScript được include
<head>
  <ThemeInitScript />
</head>
```

### Theme không sync giữa tabs

```tsx
// Sử dụng storage events
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'taza-unified-theme') {
      // Reload theme config
      window.location.reload();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### CSS Variables không hoạt động

```tsx
// Kiểm tra CSS import
import '@/src/styles/unified-theme.css';

// Kiểm tra ThemeManager wrap app
<ThemeManager>
  {children}
</ThemeManager>
```

## 📚 API Reference

### useUnifiedTheme()

```tsx
interface UnifiedThemeContextType {
  config: ThemeConfig;
  actualMode: 'light' | 'dark';
  colors: ColorPalette;
  classes: ThemeClasses;
  isLoading: boolean;
  isSystemMode: boolean;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleMode: () => void;
  toggleLanguage: () => void;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  
  // Accessibility
  enableHighContrast: (enabled: boolean) => void;
  enableReducedMotion: (enabled: boolean) => void;
}
```

### ThemeConfig Interface

```tsx
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'monochrome' | 'colorful';
  language: 'vi' | 'en';
  animationLevel: 'none' | 'reduced' | 'normal' | 'enhanced';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius: 'none' | 'sm' | 'base' | 'lg' | 'xl';
  respectSystemPreference: boolean;
  enableTransitions: boolean;
  enableAnimations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}
```

## 🎯 Best Practices

1. **Sử dụng unified-theme.css**: Import CSS chính thay vì các file CSS riêng lẻ
2. **Prefer hooks**: Sử dụng hooks thay vì truy cập context trực tiếp
3. **CSS Variables**: Sử dụng CSS variables thay vì hardcode màu sắc
4. **Responsive Design**: Thiết kế mobile-first với breakpoints nhất quán
5. **Accessibility**: Luôn test với screen readers và keyboard navigation
6. **Performance**: Sử dụng `enablePersistence={false}` nếu không cần lưu trạng thái
7. **Testing**: Test theme switching trong tất cả browsers chính

## 🔮 Future Plans

- [ ] Theme Builder UI
- [ ] More color schemes
- [ ] Animation presets
- [ ] RTL support
- [ ] Theme marketplace
- [ ] Advanced accessibility features

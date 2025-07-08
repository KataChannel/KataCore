# KataCore - Monochrome UI System

Hệ thống giao diện đơn sắc với hỗ trợ đa ngôn ngữ và chế độ tối cho ứng dụng Next.js.

## 🌟 Tính năng chính

### 🌍 Đa ngôn ngữ (Multi-language)
- Hỗ trợ Tiếng Việt và Tiếng Anh
- Tự động phát hiện ngôn ngữ từ trình duyệt
- Lưu trữ lựa chọn ngôn ngữ của người dùng
- Dễ dàng mở rộng thêm ngôn ngữ mới

### 🌙 Chế độ tối (Dark Mode)
- Chuyển đổi mượt mà giữa light và dark mode
- Tự động theo system preference
- Lưu trữ lựa chọn theme của người dùng
- Hiệu ứng transition mượt mà

### 🎨 Giao diện đơn sắc (Monochrome UI)
- Thiết kế tối giản, tập trung vào nội dung
- Bảng màu xám chủ đạo với accent color duy nhất
- Nhất quán về typography và spacing
- Responsive design

## 📁 Cấu trúc thư mục

```
app/
├── lib/
│   └── config/
│       ├── i18n.ts          # Cấu hình đa ngôn ngữ
│       ├── theme.ts         # Cấu hình theme và màu sắc
│       └── site.ts          # Cấu hình chung của site
├── hooks/
│   └── useTheme.tsx         # React hooks cho theme và language
├── components/
│   └── MonochromeDemo.tsx   # Component demo
├── globals.css              # CSS toàn cục với variables
└── tailwind.config.ts       # Cấu hình Tailwind CSS
```

## 🚀 Cách sử dụng

### 1. Thiết lập Theme Provider

Bao bọc ứng dụng của bạn với `ThemeProvider` và `LanguageProvider`:

```tsx
// app/layout.tsx
import { ThemeProvider, LanguageProvider } from './hooks/useTheme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ThemeProvider defaultMode="light">
          <LanguageProvider defaultLanguage="vi">
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Sử dụng Theme Hook

```tsx
import { useTheme, useLanguage } from './hooks/useTheme';
import { useTranslation } from './lib/config/i18n';

function MyComponent() {
  const { mode, toggleMode } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <div className="bg-background text-text">
      <h1>{t('welcome')}</h1>
      
      <button onClick={toggleMode}>
        {mode === 'light' ? t('darkMode') : t('lightMode')}
      </button>
      
      <button onClick={toggleLanguage}>
        {language === 'vi' ? 'English' : 'Tiếng Việt'}
      </button>
    </div>
  );
}
```

### 3. Sử dụng Monochrome CSS Classes

```tsx
function MonochromeCard() {
  return (
    <div className="mono-card">
      <h3 className="text-primary font-semibold">Tiêu đề</h3>
      <p className="text-text-secondary">Nội dung mô tả</p>
      
      <div className="flex space-x-4 mt-4">
        <button className="mono-button accent">
          Nút chính
        </button>
        <button className="mono-button secondary">
          Nút phụ
        </button>
      </div>
    </div>
  );
}
```

### 4. Sử dụng Tailwind Classes

```tsx
function ResponsiveComponent() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input 
          className="mono-input"
          placeholder="Nhập văn bản..."
        />
        <select className="mono-input">
          <option>Tùy chọn 1</option>
          <option>Tùy chọn 2</option>
        </select>
      </div>
    </div>
  );
}
```

## 🎨 Color System

### Light Mode
- `--color-background`: #ffffff (Nền chính)
- `--color-surface`: #f9fafb (Nền thẻ)
- `--color-primary`: #1a1a1a (Văn bản chính)
- `--color-accent`: #2563eb (Màu nhấn)

### Dark Mode
- `--color-background`: #0a0a0a (Nền chính)
- `--color-surface`: #18181b (Nền thẻ)
- `--color-primary`: #ffffff (Văn bản chính)
- `--color-accent`: #3b82f6 (Màu nhấn)

### Gray Scale
- `mono-50` đến `mono-900`: Bảng màu xám từ sáng đến tối

## 📖 API Reference

### useTheme Hook

```tsx
const {
  mode,           // 'light' | 'dark'
  colors,         // Object chứa tất cả màu sắc
  toggleMode,     // Function chuyển đổi theme
  setMode        // Function set theme cụ thể
} = useTheme();
```

### useLanguage Hook

```tsx
const {
  language,       // 'vi' | 'en'
  setLanguage,    // Function set ngôn ngữ
  toggleLanguage  // Function chuyển đổi ngôn ngữ
} = useLanguage();
```

### useTranslation Hook

```tsx
const { t } = useTranslation(language);

// Sử dụng:
t('welcome')              // "Chào mừng" hoặc "Welcome"
t('hr.employees')         // "Nhân viên" hoặc "Employees"
t('save')                 // "Lưu" hoặc "Save"
```

## 🛠️ Tùy chỉnh

### Thêm ngôn ngữ mới

1. Cập nhật `i18nConfig` trong `lib/config/i18n.ts`:

```tsx
export const i18nConfig = {
  // ...existing config
  common: {
    vi: { /* Vietnamese translations */ },
    en: { /* English translations */ },
    ja: { /* Japanese translations */ },  // Thêm mới
  }
};
```

2. Cập nhật type trong hook:

```tsx
type Language = 'vi' | 'en' | 'ja';
```

### Tùy chỉnh màu sắc

1. Cập nhật `themeConfig` trong `lib/config/theme.ts`:

```tsx
export const themeConfig = {
  colors: {
    light: {
      accent: "#your-custom-color",
      // ...other colors
    }
  }
};
```

2. Cập nhật CSS variables trong `globals.css`:

```css
:root {
  --color-accent: #your-custom-color;
}
```

### Thêm component mới

```tsx
// components/CustomMonoComponent.tsx
export function CustomMonoComponent() {
  const { mode } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  
  return (
    <div className={`mono-card ${mode === 'dark' ? 'dark-specific-class' : ''}`}>
      <h2 className="text-primary">{t('custom.title')}</h2>
      <p className="text-text-secondary">{t('custom.description')}</p>
    </div>
  );
}
```

## 📱 Responsive Design

Hệ thống sử dụng Tailwind CSS breakpoints:

- `sm`: >= 640px
- `md`: >= 768px
- `lg`: >= 1024px
- `xl`: >= 1280px
- `2xl`: >= 1536px

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## ♿ Accessibility

- Hỗ trợ `prefers-color-scheme` để tự động theo system theme
- Hỗ trợ `prefers-reduced-motion` để giảm animation
- Color contrast ratio đạt chuẩn WCAG
- Keyboard navigation support
- Screen reader friendly

## 🔧 Troubleshooting

### Theme không thay đổi
- Kiểm tra `ThemeProvider` đã được wrap đúng chưa
- Đảm bảo CSS variables được load trong `globals.css`

### Translation không hiển thị
- Kiểm tra `LanguageProvider` đã được setup
- Đảm bảo key translation tồn tại trong `i18nConfig`

### CSS không load
- Đảm bảo `globals.css` được import trong `layout.tsx`
- Kiểm tra Tailwind config đã include đúng paths

## 📄 License

MIT License - Có thể sử dụng tự do cho dự án cá nhân và thương mại.

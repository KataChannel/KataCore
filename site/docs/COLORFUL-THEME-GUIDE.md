# 🎨 TazaCore Colorful Theme Guide

## Tổng quan

Colorful Theme là một hệ thống giao diện sống động và hiện đại của TazaCore, mang đến trải nghiệm người dùng phong phú với màu sắc đa dạng và gradient đẹp mắt.

## 🌈 Tính năng chính

### 1. **Bảng màu phong phú**
- Primary: `#3b82f6` (Blue) / `#60a5fa` (Light Blue - Dark mode)
- Secondary: `#8b5cf6` (Purple) / `#a78bfa` (Light Purple - Dark mode)  
- Accent: `#06b6d4` (Cyan) / `#22d3ee` (Light Cyan - Dark mode)
- Success: `#10b981` (Emerald) / `#34d399` (Light Emerald - Dark mode)
- Warning: `#f59e0b` (Amber) / `#fbbf24` (Light Amber - Dark mode)
- Error: `#ef4444` (Red) / `#f87171` (Light Red - Dark mode)
- Info: `#06b6d4` (Cyan) / `#22d3ee` (Light Cyan - Dark mode)

### 2. **Gradient hỗ trợ**
- Primary Gradient: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`
- Secondary Gradient: `linear-gradient(135deg, #06b6d4 0%, #10b981 100%)`
- Accent Gradient: `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)`
- Surface Gradient: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)`

### 3. **Adaptive Design**
- Tự động thích ứng với dark/light mode
- Responsive design cho mobile và desktop
- High contrast support
- Reduced motion support

## 🚀 Cách sử dụng

### 1. Kích hoạt Colorful Theme

#### Qua ThemeManager Component:
```tsx
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';

function MyComponent() {
  const { setColorScheme } = useUnifiedTheme();
  
  // Chuyển sang colorful theme
  const enableColorful = () => {
    setColorScheme('colorful');
  };
  
  return (
    <button onClick={enableColorful}>
      Bật giao diện nhiều màu
    </button>
  );
}
```

#### Qua ColorSchemeToggle Component:
```tsx
import { ColorSchemeToggle } from '@/components/ThemeManager';

function Header() {
  return (
    <div className="header">
      <ColorSchemeToggle showLabel />
    </div>
  );
}
```

### 2. Sử dụng CSS Classes

#### Buttons:
```tsx
// Colorful buttons
<button className="btn-colorful-primary">Primary Button</button>
<button className="btn-colorful-secondary">Secondary Button</button>

// Unified buttons với colorful theme
<button className="unified-button accent">Accent Button</button>
<button className="unified-button success">Success Button</button>
```

#### Cards:
```tsx
// Colorful card
<div className="card-colorful">
  <h3>Colorful Card Title</h3>
  <p>Card content with colorful styling</p>
</div>

// Unified card với colorful theme
<div className="unified-card">
  <h3>Auto-themed Card</h3>
  <p>Automatically adapts to current color scheme</p>
</div>
```

#### Form Elements:
```tsx
// Colorful inputs
<input className="input-colorful" placeholder="Colorful input" />
<select className="input-colorful">
  <option>Option 1</option>
</select>
<textarea className="input-colorful" rows={4}></textarea>
```

#### Status Badges:
```tsx
<span className="badge-colorful-success">Success</span>
<span className="badge-colorful-warning">Warning</span>
<span className="badge-colorful-error">Error</span>
```

### 3. Sử dụng CSS Variables

#### Background Colors:
```css
.my-element {
  background-color: var(--colorful-primary);
  color: var(--colorful-text-inverse);
}

.my-gradient {
  background: var(--colorful-gradient-primary);
}
```

#### Text Colors:
```css
.primary-text { color: var(--colorful-primary); }
.secondary-text { color: var(--colorful-secondary); }
.accent-text { color: var(--colorful-accent); }
```

#### Border Colors:
```css
.bordered {
  border: 2px solid var(--colorful-border);
}

.accent-border {
  border-color: var(--colorful-primary);
}
```

### 4. Utility Classes

#### Background Utilities:
```html
<div class="bg-colorful-primary">Primary background</div>
<div class="bg-colorful-secondary">Secondary background</div>
<div class="bg-gradient-colorful-primary">Primary gradient</div>
```

#### Text Utilities:
```html
<span class="text-colorful-primary">Primary text</span>
<span class="text-colorful-success">Success text</span>
```

#### Border Utilities:
```html
<div class="border-colorful-primary">Primary border</div>
<div class="border-colorful-accent">Accent border</div>
```

## 🎯 Best Practices

### 1. **Semantic Color Usage**
```tsx
// ✅ Đúng - Sử dụng màu theo ngữ nghĩa
<button className="btn-colorful-primary">Save Changes</button>
<span className="badge-colorful-success">Completed</span>
<span className="badge-colorful-error">Failed</span>

// ❌ Sai - Sử dụng màu không phù hợp ngữ nghĩa
<button className="btn-colorful-error">Save Changes</button>
<span className="badge-colorful-success">Failed</span>
```

### 2. **Responsive Design**
```tsx
// ✅ Đúng - Responsive và adaptive
<div className="card-colorful md:w-1/2 lg:w-1/3">
  Content adapts to screen size
</div>

// Sử dụng với responsive utilities
<button className="btn-colorful-primary text-sm md:text-base">
  Responsive Button
</button>
```

### 3. **Accessibility**
```tsx
// ✅ Đúng - Có contrast tốt và accessible
<button 
  className="btn-colorful-primary"
  aria-label="Save document"
>
  Save
</button>

// Sử dụng với high contrast mode
<div className="card-colorful focus:ring-2 focus:ring-colorful-primary">
  Accessible card
</div>
```

### 4. **Theme Consistency**
```tsx
// ✅ Đúng - Sử dụng unified classes để tự động thích ứng
<div className="unified-card">
  <button className="unified-button accent">Action</button>
</div>

// ✅ Đúng - Kiểm tra theme hiện tại
const { config } = useUnifiedTheme();
const buttonClass = config.colorScheme === 'colorful' 
  ? 'btn-colorful-primary' 
  : 'mono-button';
```

## 🔧 Customization

### 1. Tùy chỉnh màu sắc

Thêm/sửa trong `src/styles/colorfull.css`:

```css
:root {
  /* Custom primary colors */
  --colorful-primary: #your-color;
  --colorful-primary-light: #your-light-color;
  --colorful-primary-dark: #your-dark-color;
}

.dark {
  /* Dark mode custom colors */
  --colorful-primary: #your-dark-mode-color;
}
```

### 2. Tạo component tùy chỉnh

```tsx
// components/MyColorfulCard.tsx
interface MyColorfulCardProps {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export function MyColorfulCard({ variant = 'primary', children }: MyColorfulCardProps) {
  const variantClasses = {
    primary: 'border-colorful-primary bg-colorful-surface',
    secondary: 'border-colorful-secondary bg-gradient-colorful-secondary',
    accent: 'border-colorful-accent bg-colorful-accent/10'
  };

  return (
    <div className={`card-colorful ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
```

### 3. Responsive breakpoints

```css
/* Mobile first approach */
.card-colorful {
  padding: 1rem;
  border-radius: 0.5rem;
}

@media (min-width: 768px) {
  .card-colorful {
    padding: 1.5rem;
    border-radius: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .card-colorful {
    padding: 2rem;
    border-radius: 1rem;
  }
}
```

## 📝 Examples

### Dashboard với Colorful Theme:
```tsx
function ColorfulDashboard() {
  const { config } = useUnifiedTheme();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-colorful-primary text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Colorful Dashboard</h1>
        <p>Welcome to the vibrant interface</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-colorful text-center">
          <div className="text-2xl font-bold text-colorful-primary">1,234</div>
          <div className="text-text-secondary">Total Users</div>
        </div>
        <div className="card-colorful text-center">
          <div className="text-2xl font-bold text-colorful-secondary">567</div>
          <div className="text-text-secondary">Active Sessions</div>
        </div>
        <div className="card-colorful text-center">
          <div className="text-2xl font-bold text-colorful-success">89%</div>
          <div className="text-text-secondary">Success Rate</div>
        </div>
        <div className="card-colorful text-center">
          <div className="text-2xl font-bold text-colorful-accent">$12.5K</div>
          <div className="text-text-secondary">Revenue</div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button className="btn-colorful-primary">Create New</button>
        <button className="btn-colorful-secondary">View Reports</button>
        <button className="unified-button accent">Settings</button>
      </div>
    </div>
  );
}
```

## 🔗 API Reference

### Hooks
- `useUnifiedTheme()` - Main theme hook
- `setColorScheme('colorful')` - Switch to colorful theme

### Components
- `<ColorSchemeToggle />` - Toggle between monochrome/colorful
- `<ThemeControlPanel />` - Complete theme settings panel

### CSS Classes
- `.card-colorful` - Colorful card styling
- `.btn-colorful-{variant}` - Colorful buttons
- `.input-colorful` - Colorful form inputs
- `.badge-colorful-{status}` - Status badges
- `.bg-colorful-{color}` - Background utilities
- `.text-colorful-{color}` - Text color utilities
- `.border-colorful-{color}` - Border utilities

### CSS Variables
- `--colorful-primary` - Primary color
- `--colorful-secondary` - Secondary color
- `--colorful-accent` - Accent color
- `--colorful-gradient-*` - Gradient backgrounds
- `--colorful-text-*` - Text colors
- `--colorful-border-*` - Border colors

## 📋 Migration từ Monochrome

### Tự động migration:
Các unified classes sẽ tự động thích ứng:
```tsx
// Không cần thay đổi - tự động adaptive
<div className="unified-card">
  <button className="unified-button accent">Action</button>
</div>
```

### Manual migration:
```tsx
// Before (monochrome only)
<div className="mono-card">
  <button className="mono-button">Action</button>
</div>

// After (adaptive)
<div className="unified-card">
  <button className="unified-button">Action</button>
</div>

// Or explicit colorful
<div className="card-colorful">
  <button className="btn-colorful-primary">Action</button>
</div>
```

## 🐛 Troubleshooting

### CSS Variables không load:
Đảm bảo `colorfull.css` được import trong `globals.css`:
```css
@import '../styles/unified-theme.css';
@import '../styles/colorfull.css';
```

### Theme không chuyển đổi:
Kiểm tra ThemeManager có được wrap đúng không:
```tsx
<ThemeManager>
  <App />
</ThemeManager>
```

### Performance issues:
Sử dụng CSS variables thay vì inline styles:
```tsx
// ✅ Đúng
<div className="bg-colorful-primary">

// ❌ Sai
<div style={{ backgroundColor: 'var(--colorful-primary)' }}>
```

---

🎨 **Happy theming với TazaCore Colorful Theme!**

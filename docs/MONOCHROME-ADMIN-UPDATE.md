# TazaCore Admin - Monochrome UI System

## 🎨 Phong cách thiết kế đã cập nhật

Hệ thống admin TazaCore đã được cập nhật với **phong cách monochrome UI hiện đại** với các tính năng sau:

### ✨ Tính năng chính

#### 🌙 Dark Mode
- Tự động phát hiện chế độ tối của hệ thống
- Chuyển đổi thủ công giữa light/dark mode
- Lưu trạng thái trong localStorage
- Smooth transitions khi chuyển đổi

#### 🎨 Monochrome Design
- Thiết kế đơn sắc với bảng màu xám tinh tế
- Accent color duy nhất (blue) để highlight
- Typography nhất quán và dễ đọc
- Shadows và borders tinh tế

#### 📱 Responsive Design
- Hoàn toàn responsive trên mọi thiết bị
- Mobile-first approach
- Adaptive layouts cho tablet và desktop
- Touch-friendly interface

#### 🌍 Multilingual Support
- Hỗ trợ tiếng Việt và tiếng Anh
- Chuyển đổi ngôn ngữ real-time
- Lưu preference trong localStorage

### 🛠️ Components đã cập nhật

#### Layouts
- ✅ `/admin/layout.tsx` - Main admin layout với sidebar collapsible
- ✅ `/admin/hr/layout.tsx` - HR-specific layout với sidebar và quick actions

#### Pages
- ✅ `/admin/hr/page.tsx` - HR Dashboard với stats cards hiện đại
- ✅ `/admin/monochrome-demo/page.tsx` - Demo showcase của design system

#### CSS Classes
- `.mono-card` - Cards với borders và shadows tinh tế
- `.mono-button` - Buttons với variants (accent, secondary, ghost)
- `.mono-input` - Form inputs với focus states
- `.text-primary`, `.text-secondary` - Typography utilities
- `.bg-surface`, `.bg-hover` - Background utilities

### 🎯 Highlights của thiết kế mới

1. **Clean & Minimal**: Giao diện sạch sẽ, tập trung vào nội dung
2. **High Contrast**: Tương tự tốt giữa các elements
3. **Consistent Spacing**: Grid system và spacing nhất quán
4. **Smooth Animations**: Transitions và hover effects mượt mà
5. **Accessibility**: Tuân thủ WCAG guidelines

### 📊 HR Dashboard Features

- **Stats Cards**: Hiển thị metrics quan trọng với trend indicators
- **Quick Actions**: Shortcuts đến các chức năng thường dùng
- **Recent Activity**: Timeline của các hoạt động gần đây
- **Department Overview**: Tổng quan về các phòng ban
- **Color-coded**: Sử dụng màu sắc để phân loại thông tin

### 🚀 Cách sử dụng

1. **Dark Mode**: Click vào icon sun/moon để chuyển đổi
2. **Language**: Click vào button EN/VI để đổi ngôn ngữ
3. **Navigation**: Sử dụng sidebar để điều hướng
4. **Mobile**: Tap hamburger menu để mở sidebar trên mobile

### 🔧 Technical Details

- **Framework**: Next.js 14 với App Router
- **Styling**: Tailwind CSS với custom CSS variables
- **Icons**: Heroicons
- **State**: localStorage cho preferences
- **Performance**: Optimized với lazy loading và memoization

### 📈 Performance Optimizations

- Reduced bundle size với tree-shaking
- Optimized CSS với purging
- Smooth transitions với CSS transforms
- Minimal re-renders với proper state management

---

*Hệ thống monochrome UI mới mang lại trải nghiệm admin hiện đại, professional và dễ sử dụng.*

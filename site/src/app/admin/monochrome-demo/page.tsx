'use client';

import { useState } from 'react';
import {
  SunIcon,
  MoonIcon,
  LanguageIcon,
  EyeIcon,
  SwatchIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

export default function MonochromeShowcase() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>('vi');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const getText = (en: string, vi: string) => {
    return language === 'en' ? en : vi;
  };

  const features = [
    {
      icon: SwatchIcon,
      title: getText('Monochrome Design', 'Thiết kế đơn sắc'),
      description: getText(
        'Clean black and white aesthetic with subtle gray tones',
        'Thẩm mỹ trắng đen sạch sẽ với tông màu xám tinh tế'
      ),
    },
    {
      icon: SunIcon,
      title: getText('Dark Mode Support', 'Hỗ trợ chế độ tối'),
      description: getText(
        'Automatic dark mode detection with manual toggle',
        'Tự động phát hiện chế độ tối với khả năng chuyển đổi thủ công'
      ),
    },
    {
      icon: DevicePhoneMobileIcon,
      title: getText('Fully Responsive', 'Hoàn toàn responsive'),
      description: getText(
        'Optimized for all screen sizes and devices',
        'Được tối ưu hóa cho tất cả kích thước màn hình và thiết bị'
      ),
    },
    {
      icon: LanguageIcon,
      title: getText('Multilingual Support', 'Hỗ trợ đa ngôn ngữ'),
      description: getText(
        'Vietnamese and English language support',
        'Hỗ trợ tiếng Việt và tiếng Anh'
      ),
    },
  ];

  const components = [
    {
      name: getText('Cards', 'Thẻ'),
      class: 'mono-card',
      example: 'p-6 bg-surface border border-border rounded-lg'
    },
    {
      name: getText('Buttons', 'Nút'),
      class: 'mono-button',
      example: 'accent, secondary, ghost variants'
    },
    {
      name: getText('Inputs', 'Ô nhập liệu'),
      class: 'mono-input',
      example: 'bg-surface border border-border rounded-lg'
    },
    {
      name: getText('Typography', 'Typography'),
      class: 'text-primary',
      example: 'text-primary, text-secondary, text-muted'
    },
  ];

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={toggleDarkMode}
              className="mono-button secondary"
              title={getText('Toggle dark mode', 'Chuyển đổi chế độ tối')}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              {getText('Dark Mode', 'Chế độ tối')}
            </button>
            <button
              onClick={toggleLanguage}
              className="mono-button secondary"
              title={getText('Switch language', 'Đổi ngôn ngữ')}
            >
              <LanguageIcon className="h-5 w-5" />
              {language.toUpperCase()}
            </button>
          </div>
          
          <h1 className="text-4xl font-bold text-primary mb-4">
            {getText('Monochrome UI System', 'Hệ thống giao diện đơn sắc')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {getText(
              'A modern, minimalist design system built for KataCore Admin with dark mode and responsive design.',
              'Hệ thống thiết kế hiện đại, tối giản được xây dựng cho KataCore Admin với chế độ tối và thiết kế responsive.'
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="mono-card p-6 text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg inline-flex mb-4">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Component Examples */}
        <div className="mono-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {getText('Component Examples', 'Ví dụ về components')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                {getText('Buttons', 'Nút bấm')}
              </h3>
              <div className="space-y-3">
                <button className="mono-button accent">
                  {getText('Primary Button', 'Nút chính')}
                </button>
                <button className="mono-button secondary">
                  {getText('Secondary Button', 'Nút phụ')}
                </button>
                <button className="mono-button ghost">
                  {getText('Ghost Button', 'Nút trong suốt')}
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                {getText('Form Elements', 'Phần tử form')}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  className="mono-input"
                  placeholder={getText('Enter text...', 'Nhập văn bản...')}
                />
                <select className="mono-input">
                  <option>{getText('Select option', 'Chọn tùy chọn')}</option>
                  <option>{getText('Option 1', 'Tùy chọn 1')}</option>
                  <option>{getText('Option 2', 'Tùy chọn 2')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Component Classes */}
        <div className="mono-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {getText('Available CSS Classes', 'Các lớp CSS có sẵn')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {components.map((component, index) => (
              <div key={index} className="p-4 bg-mono-50 dark:bg-mono-900 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">{component.name}</h4>
                <code className="text-sm text-accent bg-mono-100 dark:bg-mono-800 px-2 py-1 rounded">
                  .{component.class}
                </code>
                <p className="text-xs text-text-secondary mt-2">{component.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="mono-card p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {getText('Color Palette', 'Bảng màu')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-primary mb-3">
                {getText('Primary Colors', 'Màu chính')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <span className="text-text">Primary</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-text-secondary rounded"></div>
                  <span className="text-text">Secondary</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded"></div>
                  <span className="text-text">Accent</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-3">
                {getText('Surface Colors', 'Màu bề mặt')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-background border border-border rounded"></div>
                  <span className="text-text">Background</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-surface border border-border rounded"></div>
                  <span className="text-text">Surface</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-hover border border-border rounded"></div>
                  <span className="text-text">Hover</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-3">
                {getText('Status Colors', 'Màu trạng thái')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                  <span className="text-text">Success</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                  <span className="text-text">Warning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded"></div>
                  <span className="text-text">Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

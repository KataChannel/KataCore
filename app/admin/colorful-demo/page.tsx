'use client';

import React, { useState } from 'react';
import {
  PaintBrushIcon,
  SwatchIcon,
  SparklesIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';
import {
  ThemeModeToggle,
  ColorSchemeToggle,
  LanguageToggle,
} from '../../../components/ThemeManager';

export default function ColorfulThemeDemo() {
  const { config, actualMode, setColorScheme } = useUnifiedTheme();
  const [activeTab, setActiveTab] = useState('components');

  // Force colorful theme for this demo
  React.useEffect(() => {
    if (config.colorScheme !== 'colorful') {
      setColorScheme('colorful');
    }
  }, [config.colorScheme, setColorScheme]);

  const getText = (en: string, vi: string) => {
    return config.language === 'en' ? en : vi;
  };

  const features = [
    {
      icon: PaintBrushIcon,
      title: getText('Vibrant Colors', 'Màu sắc sống động'),
      description: getText(
        'Rich color palette with blues, purples, and accent colors',
        'Bảng màu phong phú với xanh dương, tím và màu nhấn'
      ),
    },
    {
      icon: SparklesIcon,
      title: getText('Enhanced Aesthetics', 'Thẩm mỹ nâng cao'),
      description: getText(
        'Beautiful gradients and modern visual effects',
        'Gradient đẹp mắt và hiệu ứng hình ảnh hiện đại'
      ),
    },
    {
      icon: EyeIcon,
      title: getText('Visual Hierarchy', 'Phân cấp thị giác'),
      description: getText(
        'Clear distinction between elements using colors',
        'Phân biệt rõ ràng giữa các phần tử bằng màu sắc'
      ),
    },
  ];

  const colorPalette = [
    { name: 'Primary', color: 'var(--colorful-primary)', class: 'bg-colorful-primary' },
    { name: 'Secondary', color: 'var(--colorful-secondary)', class: 'bg-colorful-secondary' },
    { name: 'Accent', color: 'var(--colorful-accent)', class: 'bg-colorful-accent' },
    { name: 'Success', color: 'var(--colorful-success)', class: 'bg-colorful-success' },
    { name: 'Warning', color: 'var(--colorful-warning)', class: 'bg-colorful-warning' },
    { name: 'Error', color: 'var(--colorful-error)', class: 'bg-colorful-error' },
    { name: 'Info', color: 'var(--colorful-info)', class: 'bg-colorful-info' },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center space-x-4 mb-6">
            <ThemeModeToggle showLabel className="flex items-center gap-2" />
            <ColorSchemeToggle showLabel className="flex items-center gap-2" />
            <LanguageToggle showLabel className="flex items-center gap-2" />
          </div>

          <div className="relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-colorful-primary bg-clip-text text-transparent">
              {getText('Colorful Theme', 'Giao diện nhiều màu')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {getText(
                'Experience vibrant colors and modern design with our colorful theme system',
                'Trải nghiệm màu sắc sống động và thiết kế hiện đại với hệ thống giao diện nhiều màu'
              )}
            </p>
          </div>

          <div className="mt-8 p-4 bg-gradient-colorful-surface rounded-lg border border-colorful-border">
            <p className="text-sm text-text-muted">
              {getText('Current Mode', 'Chế độ hiện tại')}: {actualMode} • {config.language} •{' '}
              {config.colorScheme}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-surface border border-border rounded-lg p-1">
            {[
              { id: 'components', label: getText('Components', 'Thành phần') },
              { id: 'colors', label: getText('Colors', 'Màu sắc') },
              { id: 'examples', label: getText('Examples', 'Ví dụ') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-colorful-primary text-colorful-text-inverse'
                    : 'text-text-secondary hover:text-text hover:bg-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-colorful group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-colorful-primary rounded-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text">{feature.title}</h3>
              </div>
              <p className="text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'components' && (
          <div className="space-y-12">
            {/* Buttons */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Colorful Buttons', 'Nút nhiều màu')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="btn-colorful-primary">{getText('Primary', 'Chính')}</button>
                <button className="btn-colorful-secondary">{getText('Secondary', 'Phụ')}</button>
                <button className="unified-button accent">{getText('Accent', 'Nhấn')}</button>
                <button className="unified-button success">
                  {getText('Success', 'Thành công')}
                </button>
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Colorful Cards', 'Thẻ nhiều màu')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card-colorful">
                  <h3 className="text-lg font-semibold mb-2 text-colorful-primary">
                    {getText('Primary Card', 'Thẻ chính')}
                  </h3>
                  <p className="text-text-secondary">
                    {getText(
                      'This card demonstrates the primary color theme',
                      'Thẻ này minh họa chủ đề màu chính'
                    )}
                  </p>
                </div>

                <div
                  className="unified-card"
                  style={{ background: 'var(--colorful-gradient-secondary)' }}
                >
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {getText('Gradient Card', 'Thẻ gradient')}
                  </h3>
                  <p className="text-white/80">
                    {getText(
                      'Beautiful gradient background with colorful theme',
                      'Nền gradient đẹp mắt với giao diện nhiều màu'
                    )}
                  </p>
                </div>

                <div className="unified-card border-colorful-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-colorful-accent rounded-full"></div>
                    <h3 className="text-lg font-semibold text-text">
                      {getText('Accent Border', 'Viền nhấn')}
                    </h3>
                  </div>
                  <p className="text-text-secondary">
                    {getText(
                      'Card with accent color border and indicators',
                      'Thẻ với viền màu nhấn và chỉ báo'
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Form Elements */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Form Elements', 'Phần tử biểu mẫu')}
              </h2>
              <div className="card-colorful max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">
                      {getText('Colorful Input', 'Ô nhập liệu màu sắc')}
                    </label>
                    <input
                      type="text"
                      placeholder={getText('Enter text here...', 'Nhập văn bản tại đây...')}
                      className="input-colorful"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">
                      {getText('Select Option', 'Chọn tùy chọn')}
                    </label>
                    <select className="input-colorful">
                      <option>{getText('Option 1', 'Tùy chọn 1')}</option>
                      <option>{getText('Option 2', 'Tùy chọn 2')}</option>
                      <option>{getText('Option 3', 'Tùy chọn 3')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text">
                      {getText('Message', 'Tin nhắn')}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={getText('Enter your message...', 'Nhập tin nhắn của bạn...')}
                      className="input-colorful"
                    ></textarea>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Color Palette', 'Bảng màu')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {colorPalette.map((color, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`w-full h-20 rounded-lg mb-2 border border-border ${color.class}`}
                      style={{ backgroundColor: color.color }}
                    ></div>
                    <p className="text-sm font-medium text-text">{color.name}</p>
                    <p className="text-xs text-text-muted font-mono">{color.color}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Gradient Examples', 'Ví dụ gradient')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-32 bg-gradient-colorful-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Primary Gradient</span>
                </div>
                <div className="h-32 bg-gradient-colorful-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Secondary Gradient</span>
                </div>
                <div className="h-32 bg-gradient-colorful-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Accent Gradient</span>
                </div>
                <div className="h-32 bg-gradient-colorful-surface rounded-lg flex items-center justify-center border border-border">
                  <span className="text-text font-semibold">Surface Gradient</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-text">
                {getText('Dashboard Example', 'Ví dụ bảng điều khiển')}
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card-colorful text-center">
                  <div className="text-2xl font-bold text-colorful-primary mb-1">1,234</div>
                  <div className="text-sm text-text-secondary">
                    {getText('Total Users', 'Tổng người dùng')}
                  </div>
                </div>
                <div className="card-colorful text-center">
                  <div className="text-2xl font-bold text-colorful-secondary mb-1">567</div>
                  <div className="text-sm text-text-secondary">
                    {getText('Active Sessions', 'Phiên hoạt động')}
                  </div>
                </div>
                <div className="card-colorful text-center">
                  <div className="text-2xl font-bold text-colorful-success mb-1">89%</div>
                  <div className="text-sm text-text-secondary">
                    {getText('Success Rate', 'Tỷ lệ thành công')}
                  </div>
                </div>
                <div className="card-colorful text-center">
                  <div className="text-2xl font-bold text-colorful-accent mb-1">$12.5K</div>
                  <div className="text-sm text-text-secondary">
                    {getText('Revenue', 'Doanh thu')}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="card-colorful">
                <h3 className="text-lg font-semibold mb-4 text-text">
                  {getText('Status Indicators', 'Chỉ báo trạng thái')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="badge-colorful-success">{getText('Active', 'Hoạt động')}</span>
                  <span className="badge-colorful-warning">{getText('Pending', 'Đang chờ')}</span>
                  <span className="badge-colorful-error">{getText('Error', 'Lỗi')}</span>
                  <span className="unified-badge accent">{getText('Info', 'Thông tin')}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center border-t border-border pt-8">
          <p className="text-text-secondary">
            {getText(
              'Colorful theme provides a vibrant and modern user experience with rich colors and beautiful gradients.',
              'Giao diện nhiều màu mang đến trải nghiệm người dùng sống động và hiện đại với màu sắc phong phú và gradient đẹp mắt.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

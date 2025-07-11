// Example component demonstrating the unified theme system
// This shows how to use the new unified theme in a real component
'use client';
import { useIsDarkMode } from '@/hooks/useMonochromeTheme';
import { useLanguage } from '@/hooks/useTheme';
import useUnifiedTheme, { useThemeMode } from '@/hooks/useUnifiedTheme';
import React, { useState } from 'react';
import { ThemeModeToggle, LanguageToggle, ThemeControlPanel } from './ThemeManager';
export function UnifiedThemeDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'examples'>('overview');
  
  // Different ways to access theme data
  const theme = useUnifiedTheme();
  const { mode, actualMode, toggleMode } = useThemeMode();
  const { language, toggleLanguage } = useLanguage();
  const isDark = useIsDarkMode();

  const getText = (en: string, vi: string) => {
    return language === 'en' ? en : vi;
  };

  return (
    <div className="min-h-screen bg-background transition-all duration-normal">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <header className="unified-card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {getText('Unified Theme System', 'Hệ thống Theme Thống nhất')}
              </h1>
              <p className="text-text-secondary">
                {getText(
                  'Centralized dark mode and theme management for TazaCore',
                  'Quản lý dark mode và theme tập trung cho TazaCore'
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeModeToggle showLabel={true} />
              <LanguageToggle showLabel={true} />
            </div>
          </div>
        </header>

        {/* Current Status */}
        <div className="unified-card mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">
            {getText('Current Status', 'Trạng thái hiện tại')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-surface border border-border rounded-lg">
              <div className="text-sm text-text-secondary mb-1">
                {getText('Theme Mode', 'Chế độ Theme')}
              </div>
              <div className="font-medium text-primary">
                {mode} → {actualMode}
              </div>
            </div>
            
            <div className="p-4 bg-surface border border-border rounded-lg">
              <div className="text-sm text-text-secondary mb-1">
                {getText('Color Scheme', 'Bảng màu')}
              </div>
              <div className="font-medium text-primary">
                {theme.config.colorScheme}
              </div>
            </div>
            
            <div className="p-4 bg-surface border border-border rounded-lg">
              <div className="text-sm text-text-secondary mb-1">
                {getText('Language', 'Ngôn ngữ')}
              </div>
              <div className="font-medium text-primary">
                {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
              </div>
            </div>
            
            <div className="p-4 bg-surface border border-border rounded-lg">
              <div className="text-sm text-text-secondary mb-1">
                {getText('Animation Level', 'Mức hoạt ảnh')}
              </div>
              <div className="font-medium text-primary">
                {theme.config.animationLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="unified-card">
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8">
              {([
                { key: 'overview', en: 'Overview', vi: 'Tổng quan' },
                { key: 'controls', en: 'Controls', vi: 'Điều khiển' },
                { key: 'examples', en: 'Examples', vi: 'Ví dụ' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-fast
                    ${
                      activeTab === tab.key
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-secondary hover:text-text hover:border-border'
                    }
                  `}
                >
                  {getText(tab.en, tab.vi)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    {getText('Features', 'Tính năng')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: '🌓',
                        title: getText('Smart Dark Mode', 'Dark Mode thông minh'),
                        desc: getText(
                          'Auto, light, dark modes with system sync',
                          'Chế độ tự động, sáng, tối với đồng bộ hệ thống'
                        ),
                      },
                      {
                        icon: '🎨',
                        title: getText('Unified Colors', 'Màu sắc thống nhất'),
                        desc: getText(
                          'CSS variables for consistent theming',
                          'CSS variables cho theme nhất quán'
                        ),
                      },
                      {
                        icon: '🌍',
                        title: getText('Multi-language', 'Đa ngôn ngữ'),
                        desc: getText(
                          'Vietnamese and English support',
                          'Hỗ trợ Tiếng Việt và Tiếng Anh'
                        ),
                      },
                      {
                        icon: '♿',
                        title: getText('Accessibility', 'Khả năng tiếp cận'),
                        desc: getText(
                          'High contrast, reduced motion support',
                          'Tương phản cao, giảm chuyển động'
                        ),
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="p-4 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors duration-fast"
                      >
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <h4 className="font-medium text-primary mb-1">{feature.title}</h4>
                        <p className="text-sm text-text-secondary">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    {getText('Color Palette', 'Bảng màu')}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(theme.colors.gray).map(([shade, color]) => (
                      <div key={shade} className="text-center">
                        <div
                          className="w-full h-16 rounded-lg border border-border mb-2"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-xs font-mono text-text-secondary">
                          gray-{shade}
                        </div>
                        <div className="text-xs font-mono text-text-muted">
                          {color}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="max-w-md">
                <ThemeControlPanel />
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-8">
                {/* Components Example */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {getText('Component Examples', 'Ví dụ Components')}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Buttons */}
                    <div>
                      <h4 className="font-medium text-primary mb-3">
                        {getText('Buttons', 'Nút bấm')}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        <button className="unified-button">
                          {getText('Primary', 'Chính')}
                        </button>
                        <button className="unified-button secondary">
                          {getText('Secondary', 'Phụ')}
                        </button>
                        <button className="unified-button ghost">
                          {getText('Ghost', 'Trong suốt')}
                        </button>
                        <button className="unified-button accent">
                          {getText('Accent', 'Nhấn')}
                        </button>
                        <button className="unified-button success">
                          {getText('Success', 'Thành công')}
                        </button>
                        <button className="unified-button warning">
                          {getText('Warning', 'Cảnh báo')}
                        </button>
                        <button className="unified-button error">
                          {getText('Error', 'Lỗi')}
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div>
                      <h4 className="font-medium text-primary mb-3">
                        {getText('Inputs', 'Nhập liệu')}
                      </h4>
                      <div className="space-y-3 max-w-md">
                        <input
                          type="text"
                          placeholder={getText('Text input', 'Nhập văn bản')}
                          className="unified-input"
                        />
                        <input
                          type="email"
                          placeholder={getText('Email input', 'Nhập email')}
                          className="unified-input"
                        />
                        <textarea
                          placeholder={getText('Textarea', 'Vùng văn bản')}
                          className="unified-input resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Badges */}
                    <div>
                      <h4 className="font-medium text-primary mb-3">
                        {getText('Badges', 'Nhãn')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="unified-badge">
                          {getText('Default', 'Mặc định')}
                        </span>
                        <span className="unified-badge accent">
                          {getText('Accent', 'Nhấn')}
                        </span>
                        <span className="unified-badge success">
                          {getText('Success', 'Thành công')}
                        </span>
                        <span className="unified-badge warning">
                          {getText('Warning', 'Cảnh báo')}
                        </span>
                        <span className="unified-badge error">
                          {getText('Error', 'Lỗi')}
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div>
                      <h4 className="font-medium text-primary mb-3">
                        {getText('Cards', 'Thẻ')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="unified-card">
                          <h5 className="font-medium text-primary mb-2">
                            {getText('Basic Card', 'Thẻ cơ bản')}
                          </h5>
                          <p className="text-text-secondary text-sm">
                            {getText(
                              'This is a basic card with default styling.',
                              'Đây là thẻ cơ bản với style mặc định.'
                            )}
                          </p>
                        </div>
                        
                        <div className="unified-card elevated">
                          <h5 className="font-medium text-primary mb-2">
                            {getText('Elevated Card', 'Thẻ nổi')}
                          </h5>
                          <p className="text-text-secondary text-sm">
                            {getText(
                              'This card has elevated styling with enhanced shadow.',
                              'Thẻ này có style nổi với bóng đổ tăng cường.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSS Variables Demo */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {getText('CSS Variables Demo', 'Demo CSS Variables')}
                  </h3>
                  
                  <div className="unified-card bg-surface">
                    <div className="font-mono text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>--color-primary:</span>
                        <span style={{ color: 'var(--color-primary)' }}>
                          {theme.colors.primary}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>--color-accent:</span>
                        <span style={{ color: 'var(--color-accent)' }}>
                          {theme.colors.accent}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>--color-background:</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {theme.colors.background}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>--color-surface:</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {theme.colors.surface}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-text-secondary text-sm">
          <p>
            {getText(
              'TazaCore Unified Theme System - Centralized dark mode and theme management',
              'Hệ thống Theme Thống nhất TazaCore - Quản lý dark mode và theme tập trung'
            )}
          </p>
          <p className="mt-1">
            {getText('Current mode', 'Chế độ hiện tại')}: {actualMode} | 
            {getText('System mode', 'Chế độ hệ thống')}: {theme.isSystemMode ? 'ON' : 'OFF'}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default UnifiedThemeDemo;

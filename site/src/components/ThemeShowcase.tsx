'use client';

import React from 'react';
import { useUnifiedTheme } from '../hooks/useUnifiedTheme';
import { ThemeModeToggle, ColorSchemeToggle, LanguageToggle } from './ThemeManager';

export function ThemeShowcase() {
  const { config } = useUnifiedTheme();
  
  const getText = (en: string, vi: string) => {
    return config.language === 'en' ? en : vi;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Theme Controls */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-6 text-text">
          {getText('TazaCore Theme System', 'Hệ thống giao diện TazaCore')}
        </h1>
        
        <div className="flex justify-center items-center gap-4 mb-6">
          <ThemeModeToggle showLabel className="flex items-center gap-2" />
          <ColorSchemeToggle showLabel className="flex items-center gap-2" />
          <LanguageToggle showLabel className="flex items-center gap-2" />
        </div>

        <div className="inline-block px-4 py-2 bg-surface border border-border rounded-lg">
          <span className="text-sm text-text-secondary">
            {getText('Current', 'Hiện tại')}: {config.mode} • {config.colorScheme} • {config.language}
          </span>
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-8">
        {/* Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-text">
            {getText('Cards', 'Thẻ')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="unified-card">
              <h3 className="text-lg font-semibold mb-2 text-text">
                {getText('Standard Card', 'Thẻ tiêu chuẩn')}
              </h3>
              <p className="text-text-secondary">
                {getText(
                  'This card adapts to the current theme automatically.',
                  'Thẻ này tự động thích ứng với giao diện hiện tại.'
                )}
              </p>
            </div>

            {config.colorScheme === 'colorful' ? (
              <div className="card-colorful">
                <h3 className="text-lg font-semibold mb-2 text-colorful-primary">
                  {getText('Colorful Card', 'Thẻ nhiều màu')}
                </h3>
                <p className="text-text-secondary">
                  {getText(
                    'This card shows vibrant colors in colorful mode.',
                    'Thẻ này hiển thị màu sắc sống động ở chế độ nhiều màu.'
                  )}
                </p>
              </div>
            ) : (
              <div className="mono-card">
                <h3 className="text-lg font-semibold mb-2 text-text">
                  {getText('Monochrome Card', 'Thẻ đơn sắc')}
                </h3>
                <p className="text-text-secondary">
                  {getText(
                    'This card shows clean monochrome design.',
                    'Thẻ này hiển thị thiết kế đơn sắc sạch sẽ.'
                  )}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-text">
            {getText('Buttons', 'Nút bấm')}
          </h2>
          <div className="flex flex-wrap gap-4">
            {config.colorScheme === 'colorful' ? (
              <>
                <button className="btn-colorful-primary">
                  {getText('Primary', 'Chính')}
                </button>
                <button className="btn-colorful-secondary">
                  {getText('Secondary', 'Phụ')}
                </button>
                <button className="unified-button accent">
                  {getText('Accent', 'Nhấn')}
                </button>
              </>
            ) : (
              <>
                <button className="mono-button">
                  {getText('Primary', 'Chính')}
                </button>
                <button className="mono-button secondary">
                  {getText('Secondary', 'Phụ')}
                </button>
                <button className="mono-button accent">
                  {getText('Accent', 'Nhấn')}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Status Indicators */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-text">
            {getText('Status Indicators', 'Chỉ báo trạng thái')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {config.colorScheme === 'colorful' ? (
              <>
                <span className="badge-colorful-success">
                  {getText('Success', 'Thành công')}
                </span>
                <span className="badge-colorful-warning">
                  {getText('Warning', 'Cảnh báo')}
                </span>
                <span className="badge-colorful-error">
                  {getText('Error', 'Lỗi')}
                </span>
              </>
            ) : (
              <>
                <span className="unified-badge success">
                  {getText('Success', 'Thành công')}
                </span>
                <span className="unified-badge warning">
                  {getText('Warning', 'Cảnh báo')}
                </span>
                <span className="unified-badge error">
                  {getText('Error', 'Lỗi')}
                </span>
              </>
            )}
          </div>
        </section>

        {/* Color Preview */}
        {config.colorScheme === 'colorful' && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-text">
              {getText('Color Preview', 'Xem trước màu sắc')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-full h-16 bg-colorful-primary rounded-lg mb-2"></div>
                <span className="text-sm text-text-secondary">Primary</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-colorful-secondary rounded-lg mb-2"></div>
                <span className="text-sm text-text-secondary">Secondary</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-colorful-accent rounded-lg mb-2"></div>
                <span className="text-sm text-text-secondary">Accent</span>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-gradient-colorful-primary rounded-lg mb-2"></div>
                <span className="text-sm text-text-secondary">Gradient</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t border-border pt-6">
        <p className="text-text-secondary">
          {getText(
            'Try switching between monochrome and colorful themes to see the difference!',
            'Thử chuyển đổi giữa giao diện đơn sắc và nhiều màu để thấy sự khác biệt!'
          )}
        </p>
      </div>
    </div>
  );
}

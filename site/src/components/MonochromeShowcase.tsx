'use client';

import React from 'react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  SparklesIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useSafeThemeMode, useSafeLanguage } from '../hooks/useUnifiedTheme';
import { useTranslation } from '../lib/config/i18n';

const MonochromeShowcase: React.FC = () => {
  const { mode, actualMode, toggleMode, setMode } = useSafeThemeMode();
  const { language, toggleLanguage } = useSafeLanguage();

  const { t } = useTranslation();

  const getModeIcon = () => {
    switch (mode) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'auto':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'light':
        return t('lightMode');
      case 'dark':
        return t('darkMode');
      case 'auto':
        return t('autoMode');
      default:
        return t('lightMode');
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'light':
        return t('lightMode');
      case 'dark':
        return t('darkMode');
      case 'auto':
        return t('autoMode');
      default:
        return t('lightMode');
    }
  };

  const features = [
    {
      icon: SwatchIcon,
      title: language === 'en' ? 'Monochrome Design' : 'Thiết kế đơn sắc',
      description:
        language === 'en'
          ? 'Clean black and white aesthetic with subtle gray tones'
          : 'Thẩm mỹ trắng đen sạch sẽ với tông màu xám tinh tế',
    },
    {
      icon: SunIcon,
      title: language === 'en' ? 'Dark Mode Support' : 'Hỗ trợ chế độ tối',
      description:
        language === 'en'
          ? 'Automatic dark mode detection with manual toggle and auto mode'
          : 'Tự động phát hiện chế độ tối với khả năng chuyển đổi thủ công và chế độ tự động',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: language === 'en' ? 'Fully Responsive' : 'Hoàn toàn responsive',
      description:
        language === 'en'
          ? 'Optimized for all screen sizes and devices'
          : 'Được tối ưu hóa cho tất cả kích thước màn hình và thiết bị',
    },
    {
      icon: LanguageIcon,
      title: language === 'en' ? 'Multilingual' : 'Đa ngôn ngữ',
      description:
        language === 'en'
          ? 'Support for Vietnamese and English with easy switching'
          : 'Hỗ trợ tiếng Việt và tiếng Anh với khả năng chuyển đổi dễ dàng',
    },
    {
      icon: SparklesIcon,
      title: language === 'en' ? 'Smooth Animations' : 'Hoạt ảnh mượt mà',
      description:
        language === 'en'
          ? 'Carefully crafted transitions and micro-interactions'
          : 'Chuyển tiếp và tương tác vi mô được chế tác cẩn thận',
    },
    {
      icon: EyeIcon,
      title: language === 'en' ? 'Accessibility' : 'Khả năng tiếp cận',
      description:
        language === 'en'
          ? 'WCAG compliant with high contrast and reduced motion support'
          : 'Tuân thủ WCAG với độ tương phản cao và hỗ trợ giảm chuyển động',
    },
  ];

  // Loading state removed - using safe hooks instead

  return (
    <div className="min-h-screen bg-background mono-transition">
      <div className="mono-container py-12">
        {/* Header */}
        <div className="text-center mb-12 mono-animate-fade-in-down">
          <div className="flex justify-center items-center gap-4 mb-6">
            <button
              onClick={toggleMode}
              className="mono-button secondary"
              title={language === 'en' ? 'Toggle theme mode' : 'Chuyển đổi chế độ theme'}
            >
              {getModeIcon()}
              {getModeText()}
            </button>

            <button
              onClick={toggleLanguage}
              className="mono-button secondary"
              title={language === 'en' ? 'Switch language' : 'Đổi ngôn ngữ'}
            >
              <LanguageIcon className="h-5 w-5" />
              {language === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
          </div>

          <h1 className="mono-heading text-4xl font-bold mb-4">
            {language === 'en'
              ? 'TazaCore Monochrome UI System'
              : 'Hệ thống giao diện đơn sắc TazaCore'}
          </h1>

          <p className="mono-text-secondary text-lg max-w-2xl mx-auto">
            {language === 'en'
              ? 'A modern, unified design system with dark mode support and multilingual capabilities.'
              : 'Hệ thống thiết kế hiện đại và thống nhất với hỗ trợ chế độ tối và khả năng đa ngôn ngữ.'}
          </p>

          <div className="mono-badge accent mt-4">
            {language === 'en' ? 'Current Mode' : 'Chế độ hiện tại'}: {actualMode} • {language}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mono-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="mono-card mono-animate-fade-in-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <feature.icon className="h-6 w-6 text-accent mono-transition group-hover:scale-110" />
                <h3 className="mono-heading text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="mono-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Component Showcase */}
        <div className="mono-card mb-12 mono-animate-fade-in">
          <h2 className="mono-heading text-2xl font-bold mb-6">
            {language === 'en' ? 'Component Showcase' : 'Showcase Component'}
          </h2>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="mono-heading text-lg font-semibold mb-4">
              {language === 'en' ? 'Buttons' : 'Nút bấm'}
            </h3>
            <div className="mono-flex flex-wrap">
              <button className="mono-button accent">
                {language === 'en' ? 'Primary Button' : 'Nút chính'}
              </button>
              <button className="mono-button secondary">
                {language === 'en' ? 'Secondary Button' : 'Nút phụ'}
              </button>
              <button className="mono-button ghost">
                {language === 'en' ? 'Ghost Button' : 'Nút trong suốt'}
              </button>
              <button className="mono-button danger">
                {language === 'en' ? 'Danger Button' : 'Nút nguy hiểm'}
              </button>
              <button className="mono-button" disabled>
                {language === 'en' ? 'Disabled' : 'Vô hiệu hóa'}
              </button>
            </div>
          </div>

          {/* Form Elements */}
          <div className="mb-8">
            <h3 className="mono-heading text-lg font-semibold mb-4">
              {language === 'en' ? 'Form Elements' : 'Phần tử Form'}
            </h3>
            <div className="mono-grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="mono-input"
                placeholder={language === 'en' ? 'Enter text...' : 'Nhập văn bản...'}
              />
              <select className="mono-input mono-select">
                <option>{language === 'en' ? 'Select option' : 'Chọn tùy chọn'}</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
              <textarea
                className="mono-input"
                rows={3}
                placeholder={language === 'en' ? 'Enter description...' : 'Nhập mô tả...'}
              />
              <div className="space-y-2">
                <label className="mono-checkbox flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="mono-text-secondary">
                    {language === 'en' ? 'Checkbox option' : 'Tùy chọn checkbox'}
                  </span>
                </label>
                <label className="mono-radio flex items-center gap-2">
                  <input type="radio" name="radio-group" />
                  <span className="checkmark"></span>
                  <span className="mono-text-secondary">
                    {language === 'en' ? 'Radio option' : 'Tùy chọn radio'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h3 className="mono-heading text-lg font-semibold mb-4">
              {language === 'en' ? 'Badges' : 'Nhãn'}
            </h3>
            <div className="mono-flex flex-wrap">
              <span className="mono-badge">Default</span>
              <span className="mono-badge accent">Accent</span>
              <span className="mono-badge success">Success</span>
              <span className="mono-badge warning">Warning</span>
              <span className="mono-badge error">Error</span>
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="mono-heading text-lg font-semibold mb-4">
              {language === 'en' ? 'Typography' : 'Typography'}
            </h3>
            <div className="space-y-2">
              <h1 className="mono-heading text-4xl">
                {language === 'en' ? 'Heading 1' : 'Tiêu đề 1'}
              </h1>
              <h2 className="mono-heading text-3xl">
                {language === 'en' ? 'Heading 2' : 'Tiêu đề 2'}
              </h2>
              <h3 className="mono-heading text-2xl">
                {language === 'en' ? 'Heading 3' : 'Tiêu đề 3'}
              </h3>
              <p className="mono-text-primary">
                {language === 'en' ? 'Primary text content' : 'Nội dung văn bản chính'}
              </p>
              <p className="mono-text-secondary">
                {language === 'en' ? 'Secondary text content' : 'Nội dung văn bản phụ'}
              </p>
              <p className="mono-text-muted">
                {language === 'en' ? 'Muted text content' : 'Nội dung văn bản mờ'}
              </p>
              <a href="#" className="mono-link">
                {language === 'en' ? 'Link example' : 'Ví dụ liên kết'}
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mono-grid grid-cols-1 md:grid-cols-3 gap-6 mono-animate-fade-in">
          <div className="mono-card text-center">
            <div className="text-3xl font-bold text-accent mb-2">100%</div>
            <div className="mono-text-secondary">
              {language === 'en' ? 'Responsive' : 'Responsive'}
            </div>
          </div>
          <div className="mono-card text-center">
            <div className="text-3xl font-bold text-accent mb-2">2</div>
            <div className="mono-text-secondary">
              {language === 'en' ? 'Languages' : 'Ngôn ngữ'}
            </div>
          </div>
          <div className="mono-card text-center">
            <div className="text-3xl font-bold text-accent mb-2">3</div>
            <div className="mono-text-secondary">
              {language === 'en' ? 'Theme Modes' : 'Chế độ theme'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonochromeShowcase;

'use client';

import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useTheme';
import { useTranslation } from '../lib/config/i18n';
import { 
  SunIcon, 
  MoonIcon, 
  LanguageIcon,
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export function MonochromeDemo() {
  const { mode, toggleMode } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation(language);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">MonoApp</h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-text hover:text-accent mono-transition px-3 py-2 rounded-md text-sm font-medium">
                {t('dashboard')}
              </a>
              <a href="#" className="text-text-secondary hover:text-accent mono-transition px-3 py-2 rounded-md text-sm font-medium">
                {t('hr.employees')}
              </a>
              <a href="#" className="text-text-secondary hover:text-accent mono-transition px-3 py-2 rounded-md text-sm font-medium">
                {t('hr.reports')}
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleMode}
                className="p-2 rounded-lg bg-surface hover:bg-mono-100 border border-border mono-transition"
                title={mode === 'light' ? t('darkMode') : t('lightMode')}
              >
                {mode === 'light' ? (
                  <MoonIcon className="h-5 w-5 text-text-secondary" />
                ) : (
                  <SunIcon className="h-5 w-5 text-text-secondary" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-surface hover:bg-mono-100 border border-border mono-transition flex items-center space-x-1"
                title={t('toggleLanguage')}
              >
                <LanguageIcon className="h-5 w-5 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary">
                  {language.toUpperCase()}
                </span>
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg bg-surface hover:bg-mono-100 border border-border mono-transition relative">
                <BellIcon className="h-5 w-5 text-text-secondary" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 rounded-lg bg-surface hover:bg-mono-100 border border-border mono-transition flex items-center space-x-2"
                >
                  <UserIcon className="h-5 w-5 text-text-secondary" />
                  <ChevronDownIcon className="h-4 w-4 text-text-secondary" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-mono-lg z-10">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-text hover:bg-mono-100 mono-transition">
                        {t('profile')}
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-text hover:bg-mono-100 mono-transition">
                        {t('settings')}
                      </a>
                      <hr className="my-1 border-border" />
                      <a href="#" className="block px-4 py-2 text-sm text-text hover:bg-mono-100 mono-transition">
                        {t('logout')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('welcome')} - Monochrome UI Demo
          </h1>
          <p className="text-text-secondary">
            {language === 'vi' 
              ? 'Giao diện đơn sắc với hỗ trợ chế độ tối và đa ngôn ngữ' 
              : 'Monochrome interface with dark mode and multi-language support'
            }
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Card */}
          <div className="mono-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{t('hr.totalEmployees')}</p>
                <p className="text-2xl font-bold text-primary">1,234</p>
              </div>
              <div className="p-3 bg-mono-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-success">+12%</span>
              <span className="text-sm text-text-secondary ml-2">
                {language === 'vi' ? 'so với tháng trước' : 'from last month'}
              </span>
            </div>
          </div>

          {/* Action Card */}
          <div className="mono-card">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('hr.addEmployee')}</h3>
            <p className="text-text-secondary mb-4">
              {language === 'vi' 
                ? 'Thêm nhân viên mới vào hệ thống' 
                : 'Add new employee to the system'
              }
            </p>
            <button className="mono-button accent">
              {t('add')}
            </button>
          </div>

          {/* Settings Card */}
          <div className="mono-card">
            <div className="flex items-center mb-4">
              <Cog6ToothIcon className="h-5 w-5 text-text-secondary mr-2" />
              <h3 className="text-lg font-semibold text-primary">{t('settings')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('darkMode')}</span>
                <button
                  onClick={toggleMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mode === 'dark' ? 'bg-accent' : 'bg-mono-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('language')}</span>
                <button
                  onClick={toggleLanguage}
                  className="mono-button secondary text-sm"
                >
                  {language === 'vi' ? 'Tiếng Việt' : 'English'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Example */}
        <div className="mono-card max-w-2xl">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {language === 'vi' ? 'Biểu mẫu mẫu' : 'Sample Form'}
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {language === 'vi' ? 'Tên' : 'Name'}
              </label>
              <input
                type="text"
                className="mono-input"
                placeholder={language === 'vi' ? 'Nhập tên của bạn' : 'Enter your name'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                className="mono-input"
                placeholder={language === 'vi' ? 'Nhập email của bạn' : 'Enter your email'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {language === 'vi' ? 'Tin nhắn' : 'Message'}
              </label>
              <textarea
                className="mono-input"
                rows={4}
                placeholder={language === 'vi' ? 'Nhập tin nhắn của bạn' : 'Enter your message'}
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="mono-button accent">
                {t('save')}
              </button>
              <button type="button" className="mono-button secondary">
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

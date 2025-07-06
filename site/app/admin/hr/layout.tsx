'use client';

import { ReactNode, useState, useEffect } from 'react';
import {
  MoonIcon,
  SunIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

interface HRLayoutProps {
  children: ReactNode;
}

export default function HRLayout({ children }: HRLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') as 'en' | 'vi' || 'en';
    setDarkMode(isDark);
    setLanguage(savedLanguage);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const getText = (en: string, vi: string) => {
    return language === 'vi' ? vi : en;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {getText('HR Management', 'Quản lý Nhân sự')}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={getText('Switch to Vietnamese', 'Chuyển sang tiếng Anh')}
              >
                <LanguageIcon className="h-6 w-6" />
                <span className="ml-1 text-xs font-medium">
                  {language === 'en' ? 'EN' : 'VI'}
                </span>
              </button>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={getText('Toggle dark mode', 'Chuyển chế độ tối')}
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'button';
  showIcon?: boolean;
  showLabel?: boolean;
}

const languageLabels = {
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
};

export function LanguageSelector({
  className = '',
  variant = 'dropdown',
  showIcon = true,
  showLabel = true,
}: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();
  const currentLanguage = languageLabels[language as keyof typeof languageLabels] || languageLabels.vi;

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const toggleLanguage = () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        {showIcon && <GlobeAltIcon className="w-4 h-4" />}
        <span>{showLabel ? currentLanguage.nativeName : currentLanguage.flag}</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-500" />}
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {Object.entries(languageLabels).map(([lang, label]) => (
          <option key={lang} value={lang}>
            <div className="flex items-center gap-2">
              <span>{label.flag}</span>
              {showLabel && <span>{label.nativeName}</span>}
            </div>
          </option>
        ))}
      </select>
    </div>
  );
}
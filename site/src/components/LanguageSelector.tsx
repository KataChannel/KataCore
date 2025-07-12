'use client';

import React from 'react';
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';
import { Language } from '@/lib/config/i18n';
import { 
  LanguageIcon,
  ChevronDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'button';
  showIcon?: boolean;
  showLabel?: boolean;
}

const languageLabels: Record<Language, { name: string; flag: string; nativeName: string }> = {
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
};

export function LanguageSelector({ 
  className = '',
  variant = 'dropdown',
  showIcon = true,
  showLabel = true 
}: LanguageSelectorProps) {
  const { config, setLanguage, toggleLanguage } = useUnifiedTheme();
  const { language } = config;

  const currentLanguage = languageLabels[language];

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleLanguage}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
          bg-surface hover:bg-hover border border-border
          text-text-secondary hover:text-primary
          ${className}
        `}
        title={`Switch to ${language === 'vi' ? 'English' : 'Tiếng Việt'}`}
      >
        {showIcon && (
          <GlobeAltIcon className="h-4 w-4" />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {Object.entries(languageLabels).map(([lang, info]) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as Language)}
            className={`
              px-2 py-1 rounded text-xs font-medium transition-all duration-200
              ${language === lang
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-hover text-text-secondary hover:text-primary border border-border'
              }
            `}
          >
            {info.flag} {info.name}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative group ${className}`}>
      <button
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
          bg-surface hover:bg-hover border border-border
          text-text-secondary hover:text-primary
          group-hover:border-accent
        `}
      >
        {showIcon && (
          <GlobeAltIcon className="h-4 w-4" />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
        )}
        <ChevronDownIcon className="h-3 w-3 transition-transform group-hover:rotate-180" />
      </button>

      {/* Dropdown Menu */}
      <div className={`
        absolute right-0 top-full mt-1 w-48 z-50
        bg-surface border border-border rounded-lg shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 transform origin-top-right
        scale-95 group-hover:scale-100
      `}>
        {Object.entries(languageLabels).map(([lang, info]) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as Language)}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 text-left
              hover:bg-hover transition-colors duration-150
              first:rounded-t-lg last:rounded-b-lg
              ${language === lang 
                ? 'bg-accent/10 text-accent border-l-2 border-accent' 
                : 'text-text-secondary hover:text-primary'
              }
            `}
          >
            <span className="text-lg">{info.flag}</span>
            <div className="flex-1">
              <div className="text-sm font-medium">{info.nativeName}</div>
              <div className="text-xs text-text-muted">{info.name}</div>
            </div>
            {language === lang && (
              <div className="w-2 h-2 bg-accent rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact Language Toggle (for mobile)
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { config, toggleLanguage } = useUnifiedTheme();
  const { language } = config;

  return (
    <button
      onClick={toggleLanguage}
      className={`
        flex items-center justify-center w-8 h-8 rounded-full
        bg-surface hover:bg-hover border border-border
        text-text-secondary hover:text-primary
        transition-all duration-200 hover:scale-110
        ${className}
      `}
      title={`Switch to ${language === 'vi' ? 'English' : 'Tiếng Việt'}`}
    >
      <span className="text-sm font-semibold">
        {language === 'vi' ? 'EN' : 'VI'}
      </span>
    </button>
  );
}

export default LanguageSelector;

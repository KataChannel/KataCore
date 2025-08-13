'use client';

import { useMemo } from 'react';
import { useTheme } from './useSimpleTheme';

// Simple translation interface
interface TranslationKeys {
  common: {
    welcome: string;
    hello: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    language: string;
    toggle: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
  };
}

// Simple translations
const translations: Record<string, TranslationKeys> = {
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      language: 'Language',
      toggle: 'Toggle',
    },
    auth: {
      login: 'Login',
      logout: 'Logout', 
      register: 'Register',
      email: 'Email',
      password: 'Password',
    },
  },
  vi: {
    common: {
      welcome: 'Chào mừng',
      hello: 'Xin chào',
      theme: 'Chủ đề',
      light: 'Sáng',
      dark: 'Tối',
      system: 'Hệ thống',
      language: 'Ngôn ngữ',
      toggle: 'Chuyển đổi',
    },
    auth: {
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      register: 'Đăng ký',
      email: 'Email',
      password: 'Mật khẩu',
    },
  },
};

/**
 * Simple i18n hook using simple theme system
 */
export function useI18n(module: keyof TranslationKeys = 'common') {
  // Get language from localStorage or default to 'vi'
  const getLanguage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'vi';
    }
    return 'vi';
  };

  const language = getLanguage();

  const t = useMemo(() => {
    return (key: keyof TranslationKeys[typeof module]) => {
      return translations[language]?.[module]?.[key] || String(key);
    };
  }, [language, module]);

  return {
    t,
    language,
  };
}

/**
 * Alias cho useI18n để tương thích với code cũ
 */
export const useTranslation = useI18n;

export default useI18n;

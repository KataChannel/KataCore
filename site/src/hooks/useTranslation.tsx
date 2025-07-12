'use client';

import { useCallback } from 'react';
import { useUnifiedTheme } from './useUnifiedTheme';
import { i18nConfig, Language } from '@/lib/config/i18n';

/**
 * Hook để sử dụng translation tích hợp với unified theme system
 * Tự động sync với language setting trong unified theme
 */
export function useTranslation() {
  const { config } = useUnifiedTheme();
  const { language } = config;

  /**
   * Function để translate key thành text tương ứng
   * @param key - Translation key (có thể có dấu chấm để access nested object)
   * @param module - Module chứa translation ('common', 'hr', etc.)
   * @param fallback - Text fallback nếu không tìm thấy translation
   * @returns Translated text
   */
  const t = useCallback((
    key: string, 
    module: keyof typeof i18nConfig = 'common',
    fallback?: string
  ): string => {
    try {
      const keys = key.split('.');
      const translations = i18nConfig[module] as any;
      let value: any = translations[language];

      // Navigate through nested object
      for (const k of keys) {
        value = value?.[k];
      }

      // Return translated value or fallback
      return value || fallback || key;
    } catch (error) {
      console.warn(`Translation error for key "${key}" in module "${module}":`, error);
      return fallback || key;
    }
  }, [language]);

  /**
   * Function để translate với interpolation
   * @param key - Translation key
   * @param params - Parameters để thay thế trong string
   * @param module - Module chứa translation
   * @returns Translated text với params được thay thế
   */
  const tParams = useCallback((
    key: string,
    params: Record<string, string | number>,
    module: keyof typeof i18nConfig = 'common'
  ): string => {
    let text = t(key, module);
    
    // Replace placeholders with params
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
    });

    return text;
  }, [t]);

  /**
   * Function để lấy plural form của translation
   * @param key - Base translation key
   * @param count - Number để xác định form
   * @param module - Module chứa translation
   * @returns Translated text với plural form
   */
  const tPlural = useCallback((
    key: string,
    count: number,
    module: keyof typeof i18nConfig = 'common'
  ): string => {
    // For Vietnamese: no plural forms, just return singular
    if (language === 'vi') {
      return tParams(key, { count }, module);
    }

    // For English: check for plural forms
    const singularKey = `${key}.singular`;
    const pluralKey = `${key}.plural`;
    
    const baseText = t(count === 1 ? singularKey : pluralKey, module);
    if (baseText !== singularKey && baseText !== pluralKey) {
      return tParams(baseText, { count }, module);
    }

    // Fallback to base key with count
    return tParams(key, { count }, module);
  }, [language, t, tParams]);

  /**
   * Function để format number theo locale
   * @param value - Number để format
   * @param options - Intl.NumberFormatOptions
   * @returns Formatted number string
   */
  const formatNumber = useCallback((
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(value);
  }, [language]);

  /**
   * Function để format currency theo locale
   * @param value - Amount để format
   * @param currency - Currency code (VND, USD, etc.)
   * @returns Formatted currency string
   */
  const formatCurrency = useCallback((
    value: number,
    currency?: string
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const defaultCurrency = language === 'vi' ? 'VND' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || defaultCurrency,
    }).format(value);
  }, [language]);

  /**
   * Function để format date theo locale
   * @param date - Date để format
   * @param options - Intl.DateTimeFormatOptions
   * @returns Formatted date string
   */
  const formatDate = useCallback((
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }, [language]);

  return {
    t,
    tParams,
    tPlural,
    formatNumber,
    formatCurrency,
    formatDate,
    language,
    isVietnamese: language === 'vi',
    isEnglish: language === 'en',
  };
}

/**
 * Standalone hook để sử dụng translation mà không cần unified theme context
 * Hữu ích cho các component độc lập
 */
export function useTranslationStandalone(language: Language = 'vi') {
  const t = useCallback((
    key: string, 
    module: keyof typeof i18nConfig = 'common',
    fallback?: string
  ): string => {
    try {
      const keys = key.split('.');
      const translations = i18nConfig[module] as any;
      let value: any = translations[language];

      for (const k of keys) {
        value = value?.[k];
      }

      return value || fallback || key;
    } catch (error) {
      console.warn(`Translation error for key "${key}" in module "${module}":`, error);
      return fallback || key;
    }
  }, [language]);

  const formatNumber = useCallback((
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(value);
  }, [language]);

  const formatCurrency = useCallback((
    value: number,
    currency?: string
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const defaultCurrency = language === 'vi' ? 'VND' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || defaultCurrency,
    }).format(value);
  }, [language]);

  const formatDate = useCallback((
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }, [language]);

  return {
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    language,
    isVietnamese: language === 'vi',
    isEnglish: language === 'en',
  };
}

export default useTranslation;

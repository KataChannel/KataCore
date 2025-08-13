'use client';

import { useI18n } from './useI18n';

/**
 * Simple translation hook wrapper
 */
export function useTranslation() {
  const { t, language } = useI18n('common');
  
  const setLanguage = (lang: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      window.location.reload(); // Simple reload to apply language change
    }
  };

  return {
    t,
    language,
    setLanguage,
  };
}

'use client';

import { useMemo } from 'react';
import { useUnifiedTheme } from './useUnifiedTheme';
import { createTranslationFunction, type TranslationModule, type Language } from '@/lib/config/i18n';

/**
 * Hook để sử dụng translations với unified theme system
 * 
 * @param module - Module translation muốn sử dụng (default: 'common')
 * @returns Object chứa function translate và language hiện tại
 */
export function useI18n(module: TranslationModule = 'common') {
  const { config } = useUnifiedTheme();
  const language = config.language;

  const t = useMemo(() => {
    return createTranslationFunction(language, module);
  }, [language, module]);

  return {
    t,
    language
  };
}

/**
 * Alias cho useI18n để tương thích với code cũ
 */
export const useTranslation = useI18n;

export default useI18n;

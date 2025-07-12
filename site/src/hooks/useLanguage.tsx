// Unified Language Hook - Tích hợp với unified theme system
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, saveLanguagePreference, loadLanguagePreference, i18nConfig } from '@/lib/config/i18n';
import { useUnifiedTheme } from './useUnifiedTheme';

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isLoading: boolean;
  t: (key: string, module?: keyof typeof i18nConfig) => string;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ 
  children, 
  defaultLanguage 
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    defaultLanguage || i18nConfig.defaultLocale
  );
  const [isLoading, setIsLoading] = useState(true);

  // Sync with unified theme if available
  const unifiedTheme = useUnifiedTheme();

  // Initialize language on mount
  useEffect(() => {
    const loadedLanguage = loadLanguagePreference();
    setLanguageState(loadedLanguage);
    
    // Sync with unified theme
    if (unifiedTheme?.setLanguage && loadedLanguage !== unifiedTheme.config.language) {
      unifiedTheme.setLanguage(loadedLanguage);
    }
    
    setIsLoading(false);
  }, [unifiedTheme]);

  // Handle language changes
  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    saveLanguagePreference(newLanguage);
    
    // Sync with unified theme
    if (unifiedTheme?.setLanguage) {
      unifiedTheme.setLanguage(newLanguage);
    }
  }, [unifiedTheme]);

  // Toggle between languages
  const toggleLanguage = useCallback(() => {
    const newLanguage: Language = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  // Translation function
  const t = useCallback((key: string, module: keyof typeof i18nConfig = 'common') => {
    const keys = key.split('.');
    const translations = i18nConfig[module] as any;
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isLoading,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// ============================================================================
// STANDALONE HOOK (for use without provider)
// ============================================================================

export function useTranslationStandalone(language?: Language) {
  const currentLanguage = language || loadLanguagePreference();
  
  const t = useCallback((key: string, module: keyof typeof i18nConfig = 'common') => {
    const keys = key.split('.');
    const translations = i18nConfig[module] as any;
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }, [currentLanguage]);

  return { t, language: currentLanguage };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { Language, LanguageContextType };
export { i18nConfig } from '@/lib/config/i18n';

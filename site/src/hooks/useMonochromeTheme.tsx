'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  ThemeMode,
  Language,
  ColorPalette,
  monochromeThemeConfig,
  getThemeColors,
  applyThemeMode,
  saveThemePreference,
  loadThemePreference,
  saveLanguagePreference,
  loadLanguagePreference,
} from '../lib/config/monochrome-theme';

// Theme Context
interface ThemeContextType {
  mode: ThemeMode;
  actualMode: 'light' | 'dark';
  colors: ColorPalette;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Language Context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

// Language Provider Props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Combined Provider Props
interface MonochromeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultLanguage?: Language;
}

// Theme Provider Component
export function ThemeProvider({ children, defaultMode }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(
    defaultMode || monochromeThemeConfig.defaults.mode
  );
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [colors, setColors] = useState<ColorPalette>(getThemeColors('light'));

  // Initialize theme on mount
  useEffect(() => {
    const loadedMode = loadThemePreference();
    setModeState(loadedMode);

    const applied = applyThemeMode(loadedMode);
    setActualMode(applied);
    setColors(getThemeColors(applied));

    setIsLoading(false);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!isLoading) {
      const applied = applyThemeMode(mode);
      setActualMode(applied);
      setColors(getThemeColors(applied));
      saveThemePreference(mode);
    }
  }, [mode, isLoading]);

  // Listen for system theme changes when mode is 'auto'
  useEffect(() => {
    if (mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const applied = applyThemeMode('auto');
      setActualMode(applied);
      setColors(getThemeColors(applied));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const toggleMode = () => {
    const newMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
    setModeState(newMode);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{ mode, actualMode, colors, toggleMode, setMode, isLoading }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Language Provider Component
export function LanguageProvider({
  children,
  defaultLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    defaultLanguage || monochromeThemeConfig.defaults.language
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language on mount
  useEffect(() => {
    const loadedLanguage = loadLanguagePreference();
    setLanguageState(loadedLanguage);
    setIsLoading(false);
  }, []);

  // Handle language changes
  useEffect(() => {
    if (!isLoading) {
      saveLanguagePreference(language);
      // Update document language attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    }
  }, [language, isLoading]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Combined Provider Component
export function MonochromeProvider({
  children,
  defaultMode,
  defaultLanguage,
}: MonochromeProviderProps) {
  return (
    <ThemeProvider defaultMode={defaultMode}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Theme Hook
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider or MonochromeProvider'
    );
  }
  return context;
}

// Language Hook
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      'useLanguage must be used within a LanguageProvider or MonochromeProvider'
    );
  }
  return context;
}

// Combined Hook for convenience
export function useMonochrome() {
  const theme = useTheme();
  const language = useLanguage();

  return {
    // Theme
    mode: theme.mode,
    actualMode: theme.actualMode,
    colors: theme.colors,
    toggleMode: theme.toggleMode,
    setMode: theme.setMode,
    themeLoading: theme.isLoading,

    // Language
    language: language.language,
    setLanguage: language.setLanguage,
    toggleLanguage: language.toggleLanguage,
    languageLoading: language.isLoading,

    // Combined loading state
    isLoading: theme.isLoading || language.isLoading,
  };
}

// Utility hooks
export function useIsDarkMode(): boolean {
  const { actualMode } = useTheme();
  return actualMode === 'dark';
}

export function useThemeColors(): ColorPalette {
  const { colors } = useTheme();
  return colors;
}

export function useCurrentLanguage(): Language {
  const { language } = useLanguage();
  return language;
}

// HOC for theme-aware components
export function withTheme<T extends object>(Component: React.ComponentType<T>) {
  const WrappedComponent = (props: T) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// HOC for language-aware components
export function withLanguage<T extends object>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = (props: T) => {
    const language = useLanguage();
    return <Component {...props} language={language} />;
  };

  WrappedComponent.displayName = `withLanguage(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// HOC for monochrome-aware components
export function withMonochrome<T extends object>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = (props: T) => {
    const monochrome = useMonochrome();
    return <Component {...props} monochrome={monochrome} />;
  };

  WrappedComponent.displayName = `withMonochrome(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default {
  ThemeProvider,
  LanguageProvider,
  MonochromeProvider,
  useTheme,
  useLanguage,
  useMonochrome,
  useIsDarkMode,
  useThemeColors,
  useCurrentLanguage,
  withTheme,
  withLanguage,
  withMonochrome,
};

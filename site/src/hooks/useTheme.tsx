'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { ThemeMode, ThemeColors, getThemeColors, generateCSSVariables } from '../lib/config/theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [colors, setColors] = useState<ThemeColors>(getThemeColors(defaultMode));

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setModeState(savedMode);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemMode = systemPrefersDark ? 'dark' : 'light';
      setModeState(systemMode);
    }
  }, []);

  useEffect(() => {
    // Update colors when mode changes
    const newColors = getThemeColors(mode);
    setColors(newColors);

    // Update CSS variables
    const cssVariables = generateCSSVariables(mode);
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Update HTML class for Tailwind dark mode
    document.documentElement.classList.toggle('dark', mode === 'dark');

    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for managing language state
interface LanguageContextType {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: 'vi' | 'en';
}

export function LanguageProvider({ children, defaultLanguage = 'vi' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<'vi' | 'en'>(defaultLanguage);

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as 'vi' | 'en';
    if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    } else {
      // Check browser language
      const browserLang = navigator.language.toLowerCase();
      const detectedLang = browserLang.includes('vi') ? 'vi' : 'en';
      setLanguageState(detectedLang);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (newLanguage: 'vi' | 'en') => {
    setLanguageState(newLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Combined hook for both theme and language
export function useAppSettings() {
  const theme = useTheme();
  const language = useLanguage();

  return {
    ...theme,
    ...language,
  };
}

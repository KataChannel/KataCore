// ============================================================================
// UNIFIED THEME HOOK - HOOK THEME THỐNG NHẤT
// ============================================================================
// Hook quản lý theme tập trung cho TazaCore

'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'vi' | 'en';
export type ColorScheme = 'colorful' | 'blue' | 'green' | 'purple';

export interface ThemeConfig {
  mode: ThemeMode;
  language: Language;
  colorScheme: ColorScheme;
}

// ============================================================================
// CẤU HÌNH MẶC ĐỊNH
// ============================================================================

const DEFAULT_CONFIG: ThemeConfig = {
  mode: 'light',
  language: 'vi',
  colorScheme: 'colorful',
};

// ============================================================================
// HÀM TIỆN ÍCH
// ============================================================================

function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(config: ThemeConfig): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';

  const actualMode = config.mode === 'auto' ? getSystemMode() : config.mode;
  
  // Áp dụng class cho document
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(actualMode);
  document.documentElement.setAttribute('data-theme', actualMode);
  document.documentElement.setAttribute('lang', config.language);

  return actualMode;
}

function saveConfig(config: ThemeConfig): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('taza-theme-config', JSON.stringify(config));
    } catch (error) {
      console.warn('Không thể lưu cấu hình theme:', error);
    }
  }
}

function loadConfig(): Partial<ThemeConfig> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const stored = localStorage.getItem('taza-theme-config');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Không thể tải cấu hình theme:', error);
    return {};
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface UnifiedThemeContextType {
  config: ThemeConfig;
  actualMode: 'light' | 'dark';
  isLoading: boolean;
  setMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleMode: () => void;
  toggleLanguage: () => void;
}

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface UnifiedThemeProviderProps {
  children: ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
  enablePersistence?: boolean;
  enableSystemListener?: boolean;
}

export function UnifiedThemeProvider({
  children,
  defaultConfig = {},
  enablePersistence = true,
  enableSystemListener = true,
}: UnifiedThemeProviderProps) {
  // State
  const [config, setConfig] = useState<ThemeConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...defaultConfig,
  }));
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Khởi tạo theme khi component mount
  useEffect(() => {
    setIsMounted(true);
    
    // Tải cấu hình đã lưu nếu được bật
    if (enablePersistence) {
      const savedConfig = loadConfig();
      setConfig(prev => ({ ...prev, ...savedConfig }));
    }

    setIsLoading(false);
  }, [enablePersistence]);

  // Áp dụng theme khi config thay đổi
  useEffect(() => {
    if (!isMounted) return;

    const applied = applyTheme(config);
    setActualMode(applied);

    // Lưu cấu hình nếu được bật
    if (enablePersistence) {
      saveConfig(config);
    }
  }, [config, isMounted, enablePersistence]);

  // Lắng nghe thay đổi system theme
  useEffect(() => {
    if (!isMounted || !enableSystemListener || config.mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setActualMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.mode, enableSystemListener, isMounted]);

  // Actions
  const setMode = useCallback((mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setConfig(prev => ({ ...prev, language }));
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  }, []);

  const toggleMode = useCallback(() => {
    setMode(config.mode === 'light' ? 'dark' : config.mode === 'dark' ? 'auto' : 'light');
  }, [config.mode, setMode]);

  const toggleLanguage = useCallback(() => {
    setLanguage(config.language === 'vi' ? 'en' : 'vi');
  }, [config.language, setLanguage]);

  // Context value
  const contextValue: UnifiedThemeContextType = {
    config,
    actualMode,
    isLoading,
    setMode,
    setLanguage,
    setColorScheme,
    toggleMode,
    toggleLanguage,
  };

  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      {children}
    </UnifiedThemeContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useUnifiedTheme(): UnifiedThemeContextType {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error('useUnifiedTheme phải được sử dụng trong UnifiedThemeProvider');
  }
  return context;
}

export function useThemeMode() {
  const { config, actualMode, setMode, toggleMode } = useUnifiedTheme();
  return {
    mode: config.mode,
    actualMode,
    setMode,
    toggleMode,
  };
}

export function useLanguage() {
  const { config, setLanguage, toggleLanguage } = useUnifiedTheme();
  return {
    language: config.language,
    setLanguage,
    toggleLanguage,
  };
}

// ============================================================================
// EXPORT MẶC ĐỊNH
// ============================================================================
export default useUnifiedTheme;
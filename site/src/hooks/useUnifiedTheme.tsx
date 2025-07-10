// Unified Theme Hook - Centralized theme management for KataCore
// Replaces all other theme hooks with a single, synchronized solution
'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  UNIFIED_THEME_CONFIG,
  ThemeConfig,
  ThemeMode,
  Language,
  ColorPalette,
  ColorScheme,
  AnimationLevel,
  getThemeColors,
  applyCSSVariables,
  applyThemeMode,
  saveThemeConfig,
  loadThemeConfig,
  createSystemThemeListener,
  getThemeClasses,
} from '../lib/config/unified-theme';

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

interface UnifiedThemeContextType {
  // Current configuration
  config: ThemeConfig;
  
  // Derived values
  actualMode: 'light' | 'dark';
  colors: ColorPalette;
  classes: ReturnType<typeof getThemeClasses>;
  
  // State
  isLoading: boolean;
  isSystemMode: boolean;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setFontSize: (size: ThemeConfig['fontSize']) => void;
  setBorderRadius: (radius: ThemeConfig['borderRadius']) => void;
  
  // Utilities
  toggleMode: () => void;
  toggleLanguage: () => void;
  resetToDefaults: () => void;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  
  // Accessibility
  enableHighContrast: (enabled: boolean) => void;
  enableReducedMotion: (enabled: boolean) => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

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
  const [config, setConfigState] = useState<ThemeConfig>(() => {
    const defaults = { ...UNIFIED_THEME_CONFIG.defaults, ...defaultConfig };
    return enablePersistence ? loadThemeConfig() : defaults;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<ColorPalette>(getThemeColors('light'));

  // Derived values
  const isSystemMode = config.mode === 'auto';
  const classes = getThemeClasses(config);

  // Initialize theme on mount
  useEffect(() => {
    const applied = applyThemeMode(config.mode);
    setActualMode(applied);
    setColors(getThemeColors(applied));
    applyCSSVariables(config);
    setIsLoading(false);
  }, []);

  // Handle config changes
  useEffect(() => {
    if (!isLoading) {
      const applied = applyThemeMode(config.mode);
      setActualMode(applied);
      setColors(getThemeColors(applied));
      applyCSSVariables(config);
      
      if (enablePersistence) {
        saveThemeConfig(config);
      }
    }
  }, [config, isLoading, enablePersistence]);

  // System theme listener
  useEffect(() => {
    if (!enableSystemListener || config.mode !== 'auto') return;

    const cleanup = createSystemThemeListener((isDark: boolean) => {
      const newMode = isDark ? 'dark' : 'light';
      setActualMode(newMode);
      setColors(getThemeColors(newMode));
      applyCSSVariables({ ...config, mode: newMode });
    });

    return cleanup;
  }, [config.mode, enableSystemListener]);

  // Accessibility: Listen for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !config.reducedMotion) {
        updateConfigInternal({ reducedMotion: true });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Check initial state
    if (mediaQuery.matches && !config.reducedMotion) {
      updateConfigInternal({ reducedMotion: true });
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.reducedMotion]);

  // Internal config update function
  const updateConfigInternal = useCallback((updates: Partial<ThemeConfig>) => {
    setConfigState((prev: ThemeConfig) => ({ ...prev, ...updates }));
  }, []);

  // ============================================================================
  // ACTION FUNCTIONS
  // ============================================================================

  const setMode = useCallback((mode: ThemeMode) => {
    updateConfigInternal({ mode });
  }, [updateConfigInternal]);

  const setLanguage = useCallback((language: Language) => {
    updateConfigInternal({ language });
    
    // Update document language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [updateConfigInternal]);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    updateConfigInternal({ colorScheme });
  }, [updateConfigInternal]);

  const setAnimationLevel = useCallback((animationLevel: AnimationLevel) => {
    updateConfigInternal({ animationLevel });
  }, [updateConfigInternal]);

  const setFontSize = useCallback((fontSize: ThemeConfig['fontSize']) => {
    updateConfigInternal({ fontSize });
  }, [updateConfigInternal]);

  const setBorderRadius = useCallback((borderRadius: ThemeConfig['borderRadius']) => {
    updateConfigInternal({ borderRadius });
  }, [updateConfigInternal]);

  const toggleMode = useCallback(() => {
    const nextMode: ThemeMode = 
      config.mode === 'light' ? 'dark' : 
      config.mode === 'dark' ? 'auto' : 'light';
    setMode(nextMode);
  }, [config.mode, setMode]);

  const toggleLanguage = useCallback(() => {
    const nextLanguage: Language = config.language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLanguage);
  }, [config.language, setLanguage]);

  const resetToDefaults = useCallback(() => {
    const defaults = { ...UNIFIED_THEME_CONFIG.defaults, ...defaultConfig };
    setConfigState(defaults);
  }, [defaultConfig]);

  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    updateConfigInternal(updates);
  }, [updateConfigInternal]);

  const enableHighContrast = useCallback((enabled: boolean) => {
    updateConfigInternal({ highContrast: enabled });
    
    // Apply high contrast class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast', enabled);
    }
  }, [updateConfigInternal]);

  const enableReducedMotion = useCallback((enabled: boolean) => {
    updateConfigInternal({ 
      reducedMotion: enabled,
      enableAnimations: enabled ? false : config.enableAnimations,
      enableTransitions: enabled ? false : config.enableTransitions,
    });
    
    // Apply reduced motion class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('reduced-motion', enabled);
    }
  }, [updateConfigInternal, config.enableAnimations, config.enableTransitions]);

  // Context value
  const contextValue: UnifiedThemeContextType = {
    // Current configuration
    config,
    
    // Derived values
    actualMode,
    colors,
    classes,
    
    // State
    isLoading,
    isSystemMode,
    
    // Actions
    setMode,
    setLanguage,
    setColorScheme,
    setAnimationLevel,
    setFontSize,
    setBorderRadius,
    
    // Utilities
    toggleMode,
    toggleLanguage,
    resetToDefaults,
    updateConfig,
    
    // Accessibility
    enableHighContrast,
    enableReducedMotion,
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

/**
 * Main hook for accessing unified theme context
 */
export function useUnifiedTheme(): UnifiedThemeContextType {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error('useUnifiedTheme must be used within a UnifiedThemeProvider');
  }
  return context;
}

/**
 * Hook for theme mode only
 */
export function useThemeMode() {
  const { config, actualMode, setMode, toggleMode, isSystemMode } = useUnifiedTheme();
  return {
    mode: config.mode,
    actualMode,
    setMode,
    toggleMode,
    isSystemMode,
  };
}

/**
 * Hook for language only
 */
export function useLanguage() {
  const { config, setLanguage, toggleLanguage } = useUnifiedTheme();
  return {
    language: config.language,
    setLanguage,
    toggleLanguage,
  };
}

/**
 * Hook for colors only
 */
export function useThemeColors() {
  const { colors, actualMode } = useUnifiedTheme();
  return { colors, mode: actualMode };
}

/**
 * Hook for dark mode state (boolean)
 */
export function useIsDarkMode() {
  const { actualMode } = useUnifiedTheme();
  return actualMode === 'dark';
}

/**
 * Hook for current language
 */
export function useCurrentLanguage() {
  const { config } = useUnifiedTheme();
  return config.language;
}

/**
 * Hook for accessibility features
 */
export function useAccessibility() {
  const { 
    config, 
    enableHighContrast, 
    enableReducedMotion 
  } = useUnifiedTheme();
  
  return {
    highContrast: config.highContrast,
    reducedMotion: config.reducedMotion,
    enableHighContrast,
    enableReducedMotion,
  };
}

// ============================================================================
// HOCs (Higher-Order Components)
// ============================================================================

/**
 * HOC to inject theme props
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: UnifiedThemeContextType }>
) {
  return function ThemedComponent(props: P) {
    const theme = useUnifiedTheme();
    return <Component {...props} theme={theme} />;
  };
}

/**
 * HOC to inject only theme mode
 */
export function withThemeMode<P extends object>(
  Component: React.ComponentType<P & { themeMode: ReturnType<typeof useThemeMode> }>
) {
  return function ThemedComponent(props: P) {
    const themeMode = useThemeMode();
    return <Component {...props} themeMode={themeMode} />;
  };
}

/**
 * HOC to inject only language
 */
export function withLanguage<P extends object>(
  Component: React.ComponentType<P & { language: ReturnType<typeof useLanguage> }>
) {
  return function ThemedComponent(props: P) {
    const language = useLanguage();
    return <Component {...props} language={language} />;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a theme-aware class name helper
 */
export function createThemeClassNames(config: ThemeConfig) {
  const classes = getThemeClasses(config);
  
  return {
    // Mode classes
    mode: classes.mode,
    isDark: classes.mode === 'dark',
    isLight: classes.mode === 'light',
    
    // Feature classes
    colorScheme: `color-scheme-${classes.colorScheme}`,
    animation: `animation-${classes.animationLevel}`,
    fontSize: `font-size-${classes.fontSize}`,
    borderRadius: `border-radius-${classes.borderRadius}`,
    
    // Combined class
    combined: [
      classes.mode,
      `color-scheme-${classes.colorScheme}`,
      `animation-${classes.animationLevel}`,
      `font-size-${classes.fontSize}`,
      `border-radius-${classes.borderRadius}`,
    ].join(' '),
  };
}

/**
 * Get theme value by key path
 */
export function getThemeValue(path: string, config: ThemeConfig): any {
  const keys = path.split('.');
  let value: any = UNIFIED_THEME_CONFIG;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  return value;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useUnifiedTheme;

// Unified Theme Hook - Centralized theme management for TazaCore
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
  // State with SSR-safe initialization
  const [config, setConfigState] = useState<ThemeConfig>(() => {
    // Use defaults during SSR, load from storage on client
    return { ...UNIFIED_THEME_CONFIG.defaults, ...defaultConfig };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<ColorPalette>(getThemeColors('light'));

  // Derived values
  const isSystemMode = config.mode === 'auto';
  const classes = getThemeClasses(config);

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    
    // Load persisted config on client side
    if (enablePersistence) {
      const loadedConfig = loadThemeConfig();
      setConfigState({ ...config, ...loadedConfig });
    }
    
    const applied = applyThemeMode(config.mode);
    setActualMode(applied);
    setColors(getThemeColors(applied));
    applyCSSVariables(config);
    setIsLoading(false);
  }, []);

  // Handle config changes
  useEffect(() => {
    if (!isMounted || isLoading) return;
    
    const applied = applyThemeMode(config.mode);
    setActualMode(applied);
    setColors(getThemeColors(applied));
    applyCSSVariables(config);

    if (enablePersistence) {
      saveThemeConfig(config);
    }
  }, [config, isLoading, isMounted, enablePersistence]);

  // System theme listener
  useEffect(() => {
    if (!isMounted || !enableSystemListener || config.mode !== 'auto') return;

    const cleanup = createSystemThemeListener((isDark: boolean) => {
      const newMode = isDark ? 'dark' : 'light';
      setActualMode(newMode);
      setColors(getThemeColors(newMode));
      applyCSSVariables({ ...config, mode: newMode });
    });

    return cleanup;
  }, [config.mode, enableSystemListener, isMounted]);

  // Internal config update function
  const updateConfigInternal = useCallback((updates: Partial<ThemeConfig>) => {
    setConfigState((prev: ThemeConfig) => ({ ...prev, ...updates }));
  }, []);

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
  }, [config.reducedMotion, updateConfigInternal]);

  // ============================================================================
  // ACTION FUNCTIONS
  // ============================================================================

  const setMode = useCallback(
    (mode: ThemeMode) => {
      updateConfigInternal({ mode });
    },
    [updateConfigInternal]
  );

  const setLanguage = useCallback(
    (language: Language) => {
      updateConfigInternal({ language });

      // Update document language
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    },
    [updateConfigInternal]
  );

  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => {
      updateConfigInternal({ colorScheme });
    },
    [updateConfigInternal]
  );

  const setAnimationLevel = useCallback(
    (animationLevel: AnimationLevel) => {
      updateConfigInternal({ animationLevel });
    },
    [updateConfigInternal]
  );

  const setFontSize = useCallback(
    (fontSize: ThemeConfig['fontSize']) => {
      updateConfigInternal({ fontSize });
    },
    [updateConfigInternal]
  );

  const setBorderRadius = useCallback(
    (borderRadius: ThemeConfig['borderRadius']) => {
      updateConfigInternal({ borderRadius });
    },
    [updateConfigInternal]
  );

  const toggleMode = useCallback(() => {
    const nextMode: ThemeMode =
      config.mode === 'light' ? 'dark' : config.mode === 'dark' ? 'auto' : 'light';
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

  const updateConfig = useCallback(
    (updates: Partial<ThemeConfig>) => {
      updateConfigInternal(updates);
    },
    [updateConfigInternal]
  );

  const enableHighContrast = useCallback(
    (enabled: boolean) => {
      updateConfigInternal({ highContrast: enabled });

      // Apply high contrast class
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('high-contrast', enabled);
      }
    },
    [updateConfigInternal]
  );

  const enableReducedMotion = useCallback(
    (enabled: boolean) => {
      updateConfigInternal({
        reducedMotion: enabled,
        enableAnimations: enabled ? false : config.enableAnimations,
        enableTransitions: enabled ? false : config.enableTransitions,
      });

      // Apply reduced motion class
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('reduced-motion', enabled);
      }
    },
    [updateConfigInternal, config.enableAnimations, config.enableTransitions]
  );

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
    <UnifiedThemeContext.Provider value={contextValue}>{children}</UnifiedThemeContext.Provider>
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
 * Safe hook that returns default values if provider is not available
 */
export function useSafeUnifiedTheme(): UnifiedThemeContextType | null {
  const context = useContext(UnifiedThemeContext);
  return context || null;
}

/**
 * Hook for theme mode with fallback
 */
export function useSafeThemeMode() {
  const context = useSafeUnifiedTheme();
  
  if (!context) {
    return {
      mode: 'light' as ThemeMode,
      actualMode: 'light' as const,
      setMode: () => {},
      toggleMode: () => {},
      isSystemMode: false,
    };
  }

  const { config, actualMode, setMode, toggleMode, isSystemMode } = context;
  return {
    mode: config.mode,
    actualMode,
    setMode,
    toggleMode,
    isSystemMode,
  };
}

/**
 * Hook for language with fallback
 */
export function useSafeLanguage() {
  const context = useSafeUnifiedTheme();
  
  if (!context) {
    return {
      language: 'vi' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
    };
  }

  const { config, setLanguage, toggleLanguage } = context;
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
  const { config, enableHighContrast, enableReducedMotion } = useUnifiedTheme();

  return {
    highContrast: config.highContrast,
    reducedMotion: config.reducedMotion,
    enableHighContrast,
    enableReducedMotion,
  };
}

/**
 * Hook for theme mode (alternative to useSafeThemeMode for backward compatibility)
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
 * Hook for language (alternative to useSafeLanguage for backward compatibility)
 */
export function useLanguage() {
  const { config, setLanguage, toggleLanguage } = useUnifiedTheme();
  return {
    language: config.language,
    setLanguage,
    toggleLanguage,
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

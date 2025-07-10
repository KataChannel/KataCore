// Unified Theme Configuration System for KataCore
// Centralized dark mode and theme management

import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'vi' | 'en';
export type ColorScheme = 'monochrome' | 'colorful';
export type AnimationLevel = 'none' | 'reduced' | 'normal' | 'enhanced';

// Color palette interface
export interface ColorPalette {
  // Primary colors
  primary: string;
  secondary: string;
  accent: string;
  
  // Background colors
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // State colors
  hover: string;
  active: string;
  disabled: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gray scale
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// Theme configuration interface
export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  language: Language;
  animationLevel: AnimationLevel;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  borderRadius: 'none' | 'sm' | 'base' | 'lg' | 'xl';
  respectSystemPreference: boolean;
  enableTransitions: boolean;
  enableAnimations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// User preferences schema for validation
export const ThemeConfigSchema = z.object({
  mode: z.enum(['light', 'dark', 'auto']),
  colorScheme: z.enum(['monochrome', 'colorful']),
  language: z.enum(['vi', 'en']),
  animationLevel: z.enum(['none', 'reduced', 'normal', 'enhanced']),
  fontSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl']),
  borderRadius: z.enum(['none', 'sm', 'base', 'lg', 'xl']),
  respectSystemPreference: z.boolean(),
  enableTransitions: z.boolean(),
  enableAnimations: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
});

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const UNIFIED_THEME_CONFIG = {
  // Default configuration
  defaults: {
    mode: 'light' as ThemeMode,
    colorScheme: 'monochrome' as ColorScheme,
    language: 'vi' as Language,
    animationLevel: 'normal' as AnimationLevel,
    fontSize: 'base' as const,
    borderRadius: 'base' as const,
    respectSystemPreference: true,
    enableTransitions: true,
    enableAnimations: true,
    highContrast: false,
    reducedMotion: false,
  },

  // Storage keys
  storageKeys: {
    theme: 'kata-unified-theme',
    preferences: 'kata-user-preferences',
    language: 'kata-language',
    mode: 'kata-theme-mode',
  },

  // Color palettes
  colors: {
    light: {
      // Primary colors
      primary: '#000000',
      secondary: '#6c757d',
      accent: '#2563eb',
      
      // Background colors
      background: '#ffffff',
      surface: '#fafafa',
      surfaceElevated: '#f8f9fa',
      
      // Text colors
      text: '#000000',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      
      // Border colors
      border: '#dee2e6',
      borderLight: '#e9ecef',
      
      // State colors
      hover: '#f8f9fa',
      active: '#e9ecef',
      disabled: '#f8f9fa',
      
      // Status colors
      success: '#198754',
      warning: '#fd7e14',
      error: '#dc3545',
      info: '#0dcaf0',
      
      // Gray scale
      gray: {
        50: '#fafafa',
        100: '#f8f9fa',
        200: '#e9ecef',
        300: '#dee2e6',
        400: '#ced4da',
        500: '#adb5bd',
        600: '#6c757d',
        700: '#495057',
        800: '#343a40',
        900: '#212529',
      },
    } as ColorPalette,

    dark: {
      // Primary colors
      primary: '#ffffff',
      secondary: '#8b949e',
      accent: '#3b82f6',
      
      // Background colors
      background: '#0d1117',
      surface: '#161b22',
      surfaceElevated: '#21262d',
      
      // Text colors
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      
      // Border colors
      border: '#30363d',
      borderLight: '#21262d',
      
      // State colors
      hover: '#21262d',
      active: '#30363d',
      disabled: '#21262d',
      
      // Status colors
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      info: '#79c0ff',
      
      // Gray scale
      gray: {
        50: '#0d1117',
        100: '#161b22',
        200: '#21262d',
        300: '#30363d',
        400: '#484f58',
        500: '#6e7681',
        600: '#8b949e',
        700: '#b1bac4',
        800: '#c9d1d9',
        900: '#f0f6fc',
      },
    } as ColorPalette,
  },

  // Typography configuration
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' },
      sm: { size: '0.875rem', lineHeight: '1.25rem' },
      base: { size: '1rem', lineHeight: '1.5rem' },
      lg: { size: '1.125rem', lineHeight: '1.75rem' },
      xl: { size: '1.25rem', lineHeight: '1.75rem' },
      '2xl': { size: '1.5rem', lineHeight: '2rem' },
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Layout & spacing
  layout: {
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      base: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
  },

  // Animation & transitions
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Component configurations
  components: {
    card: {
      padding: '1.5rem',
      borderRadius: 'lg',
      shadow: 'md',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: 'base',
      minHeight: '2.75rem',
      fontSize: 'sm',
    },
    input: {
      padding: '1rem 1.25rem',
      borderRadius: 'lg',
      minHeight: '3rem',
      fontSize: 'sm',
    },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get theme colors based on mode
 */
export function getThemeColors(mode: ThemeMode): ColorPalette {
  if (mode === 'auto') {
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;
    return UNIFIED_THEME_CONFIG.colors[prefersDark ? 'dark' : 'light'];
  }
  return UNIFIED_THEME_CONFIG.colors[mode === 'dark' ? 'dark' : 'light'];
}

/**
 * Generate CSS variables from theme colors
 */
export function generateCSSVariables(config: Partial<ThemeConfig>): Record<string, string> {
  const actualMode = config.mode === 'auto' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : (config.mode || 'light');
    
  const colors = getThemeColors(actualMode);
  const variables: Record<string, string> = {};

  // Color variables
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (typeof subValue === 'string') {
          variables[`--color-${key}-${subKey}`] = subValue;
        }
      });
    }
  });

  // Layout variables
  Object.entries(UNIFIED_THEME_CONFIG.layout.shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });

  // Animation variables
  Object.entries(UNIFIED_THEME_CONFIG.animations.duration).forEach(([key, value]) => {
    variables[`--duration-${key}`] = value;
  });

  Object.entries(UNIFIED_THEME_CONFIG.animations.easing).forEach(([key, value]) => {
    variables[`--easing-${key}`] = value;
  });

  // Typography variables
  Object.entries(UNIFIED_THEME_CONFIG.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value.size;
    variables[`--line-height-${key}`] = value.lineHeight;
  });

  return variables;
}

/**
 * Apply CSS variables to document
 */
export function applyCSSVariables(config: Partial<ThemeConfig>): void {
  if (typeof document === 'undefined') return;

  const variables = generateCSSVariables(config);
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

/**
 * Apply theme mode to document
 */
export function applyThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';

  let actualMode: 'light' | 'dark' = 'light';

  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    actualMode = prefersDark ? 'dark' : 'light';
  } else {
    actualMode = mode === 'dark' ? 'dark' : 'light';
  }

  // Apply CSS class for Tailwind dark mode
  document.documentElement.classList.toggle('dark', actualMode === 'dark');
  
  // Apply theme-color meta tag for mobile browsers
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    const colors = getThemeColors(actualMode);
    themeColorMeta.setAttribute('content', colors.background);
  }

  return actualMode;
}

/**
 * Save theme configuration to localStorage
 */
export function saveThemeConfig(config: Partial<ThemeConfig>): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const validatedConfig = ThemeConfigSchema.partial().parse(config);
    localStorage.setItem(
      UNIFIED_THEME_CONFIG.storageKeys.theme, 
      JSON.stringify(validatedConfig)
    );
  } catch (error) {
    console.warn('Failed to save theme config:', error);
  }
}

/**
 * Load theme configuration from localStorage
 */
export function loadThemeConfig(): ThemeConfig {
  if (typeof localStorage === 'undefined') {
    return UNIFIED_THEME_CONFIG.defaults;
  }

  try {
    const saved = localStorage.getItem(UNIFIED_THEME_CONFIG.storageKeys.theme);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validated = ThemeConfigSchema.partial().parse(parsed);
      return { ...UNIFIED_THEME_CONFIG.defaults, ...validated };
    }
  } catch (error) {
    console.warn('Failed to load theme config:', error);
  }

  return UNIFIED_THEME_CONFIG.defaults;
}

/**
 * Listen for system theme changes
 */
export function createSystemThemeListener(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
}

/**
 * Get CSS class names for current theme
 */
export function getThemeClasses(config: Partial<ThemeConfig>): {
  mode: string;
  colorScheme: string;
  animationLevel: string;
  fontSize: string;
  borderRadius: string;
} {
  const actualMode = config.mode === 'auto' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : (config.mode || 'light');

  return {
    mode: actualMode,
    colorScheme: config.colorScheme || 'monochrome',
    animationLevel: config.animationLevel || 'normal',
    fontSize: config.fontSize || 'base',
    borderRadius: config.borderRadius || 'base',
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UNIFIED_THEME_CONFIG;

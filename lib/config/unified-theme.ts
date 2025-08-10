// Unified Theme Configuration System for TazaCore
// Centralized dark mode and theme management with Joy UI integration

import { z } from 'zod';
import { joyUIVariables, joyUIVariablesDark } from './joy-ui-theme';

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
    colorScheme: 'colorful' as ColorScheme,
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
    theme: 'taza-unified-theme',
    preferences: 'taza-user-preferences',
    language: 'taza-language',
    mode: 'taza-theme-mode',
  },

  // Color palettes with Joy UI integration
  colors: {
    light: {
      // Primary colors - Joy UI integrated
      primary: '#0ea5e9', // Joy UI primary-500
      secondary: '#737373', // Joy UI neutral-500
      accent: '#2563eb',

      // Background colors - Joy UI integrated
      background: '#ffffff', // Joy UI background-body
      surface: '#f8fafc', // Joy UI background-level1
      surfaceElevated: '#f1f5f9', // Joy UI background-level2

      // Text colors - Joy UI integrated
      text: '#0f172a', // Joy UI text-primary
      textSecondary: '#475569', // Joy UI text-secondary
      textMuted: '#64748b', // Joy UI text-tertiary

      // Border colors - Joy UI integrated
      border: '#e2e8f0', // Joy UI divider
      borderLight: '#f1f5f9',

      // State colors
      hover: '#f8fafc',
      active: '#e2e8f0',
      disabled: '#f8fafc',

      // Status colors - Joy UI integrated
      success: '#22c55e', // Joy UI success-500
      warning: '#f59e0b', // Joy UI warning-500
      error: '#ef4444', // Joy UI danger-500
      info: '#0ea5e9', // Joy UI primary-500

      // Gray scale - Joy UI integrated
      gray: {
        50: '#fafafa', // Joy UI neutral-50
        100: '#f5f5f5', // Joy UI neutral-100
        200: '#e5e5e5', // Joy UI neutral-200
        300: '#d4d4d4', // Joy UI neutral-300
        400: '#a3a3a3', // Joy UI neutral-400
        500: '#737373', // Joy UI neutral-500
        600: '#525252', // Joy UI neutral-600
        700: '#404040', // Joy UI neutral-700
        800: '#262626', // Joy UI neutral-800
        900: '#171717', // Joy UI neutral-900
      },
    } as ColorPalette,

    dark: {
      // Primary colors - Joy UI dark mode
      primary: '#38bdf8', // Joy UI primary-500 (inverted)
      secondary: '#a3a3a3', // Joy UI neutral-500 (inverted)
      accent: '#3b82f6',

      // Background colors - Joy UI dark mode
      background: '#0f172a', // Joy UI background-body dark
      surface: '#1e293b', // Joy UI background-surface dark
      surfaceElevated: '#334155', // Joy UI background-level1 dark

      // Text colors - Joy UI dark mode
      text: '#f8fafc', // Joy UI text-primary dark
      textSecondary: '#cbd5e1', // Joy UI text-secondary dark
      textMuted: '#94a3b8', // Joy UI text-tertiary dark

      // Border colors - Joy UI dark mode
      border: '#334155', // Joy UI divider dark
      borderLight: '#475569',

      // State colors
      hover: '#1e293b',
      active: '#334155',
      disabled: '#1e293b',

      // Status colors - Joy UI dark mode (inverted)
      success: '#4ade80', // Joy UI success-400
      warning: '#fbbf24', // Joy UI warning-400
      error: '#f87171', // Joy UI danger-400
      info: '#38bdf8', // Joy UI primary-400

      // Gray scale - Joy UI dark mode (inverted)
      gray: {
        50: '#171717', // Joy UI neutral-900
        100: '#262626', // Joy UI neutral-800
        200: '#404040', // Joy UI neutral-700
        300: '#525252', // Joy UI neutral-600
        400: '#737373', // Joy UI neutral-500
        500: '#a3a3a3', // Joy UI neutral-400
        600: '#d4d4d4', // Joy UI neutral-300
        700: '#e5e5e5', // Joy UI neutral-200
        800: '#f5f5f5', // Joy UI neutral-100
        900: '#fafafa', // Joy UI neutral-50
      },
    } as ColorPalette,

    // Colorful theme - Light mode
    colorfulLight: {
      // Primary colors
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',

      // Background colors
      background: '#fefefe',
      surface: '#f8fafc',
      surfaceElevated: '#f1f5f9',

      // Text colors
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',

      // Border colors
      border: '#cbd5e1',
      borderLight: '#e2e8f0',

      // State colors
      hover: '#f1f5f9',
      active: '#e2e8f0',
      disabled: '#f8fafc',

      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',

      // Gray scale
      gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
    } as ColorPalette,

    // Colorful theme - Dark mode
    colorfulDark: {
      // Primary colors
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#22d3ee',

      // Background colors
      background: '#0f172a',
      surface: '#1e293b',
      surfaceElevated: '#334155',

      // Text colors
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',

      // Border colors
      border: '#475569',
      borderLight: '#334155',

      // State colors
      hover: '#334155',
      active: '#475569',
      disabled: '#1e293b',

      // Status colors
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee',

      // Gray scale
      gray: {
        50: '#0f172a',
        100: '#1e293b',
        200: '#334155',
        300: '#475569',
        400: '#64748b',
        500: '#94a3b8',
        600: '#cbd5e1',
        700: '#e2e8f0',
        800: '#f1f5f9',
        900: '#f8fafc',
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
 * Get theme colors based on mode and color scheme
 */
export function getThemeColors(
  mode: ThemeMode,
  colorScheme: ColorScheme = 'monochrome'
): ColorPalette {
  const actualMode =
    mode === 'auto'
      ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode === 'dark'
        ? 'dark'
        : 'light';

  // Return colorful theme colors if colorScheme is colorful
  if (colorScheme === 'colorful') {
    return UNIFIED_THEME_CONFIG.colors[actualMode === 'dark' ? 'colorfulDark' : 'colorfulLight'];
  }

  // Return monochrome theme colors (default)
  return UNIFIED_THEME_CONFIG.colors[actualMode];
}

/**
 * Generate CSS variables from theme colors
 */
export function generateCSSVariables(config: Partial<ThemeConfig>): Record<string, string> {
  const actualMode =
    config.mode === 'auto'
      ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : config.mode || 'light';

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
 * Apply CSS variables to document with Joy UI integration
 */
export function applyCSSVariables(config: Partial<ThemeConfig>): void {
  if (typeof document === 'undefined') return;

  const variables = generateCSSVariables(config);
  
  // Apply unified theme variables
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Apply Joy UI variables based on theme mode
  const mode = config.mode || 'light';
  const actualMode = mode === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  const joyVariables = actualMode === 'dark' ? joyUIVariablesDark : joyUIVariables;
  
  // Apply Joy UI CSS variables
  Object.entries(joyVariables).forEach(([key, value]) => {
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
    localStorage.setItem(UNIFIED_THEME_CONFIG.storageKeys.theme, JSON.stringify(validatedConfig));
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
  const actualMode =
    config.mode === 'auto'
      ? typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : config.mode || 'light';

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

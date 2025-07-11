// Unified Monochrome Theme Configuration
// Centralized theme system for TazaCore

export type ThemeMode = 'light' | 'dark' | 'auto';
export type Language = 'vi' | 'en';

// Color palette interface
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  hover: string;
  active: string;
  
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
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Theme configuration
export const monochromeThemeConfig = {
  // Default settings
  defaults: {
    mode: 'light' as ThemeMode,
    language: 'vi' as Language,
    respectSystemPreference: true,
    enableTransitions: true,
    enableAnimations: true,
    enableReducedMotion: false,
  },
  
  // Storage keys for localStorage
  storageKeys: {
    theme: 'taza-theme-mode',
    language: 'taza-language',
    userPreferences: 'taza-user-preferences',
  },
  
  // Color palettes
  colors: {
    light: {
      primary: '#000000',
      secondary: '#6c757d',
      accent: '#2563eb',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      border: '#dee2e6',
      borderLight: '#e9ecef',
      hover: '#f8f9fa',
      active: '#e9ecef',
      
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
      
      success: '#198754',
      warning: '#fd7e14',
      error: '#dc3545',
      info: '#0dcaf0',
    } as ColorPalette,
    
    dark: {
      primary: '#ffffff',
      secondary: '#8b949e',
      accent: '#3b82f6',
      background: '#0d1117',
      surface: '#161b22',
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      border: '#30363d',
      borderLight: '#21262d',
      hover: '#21262d',
      active: '#30363d',
      
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
      
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      info: '#79c0ff',
    } as ColorPalette,
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Layout & Spacing
  layout: {
    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  
  // Transitions & Animations
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
    bezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Component styles
  components: {
    card: {
      padding: '24px',
      borderRadius: '12px',
      shadow: 'md',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      minHeight: '44px',
      fontSize: 'sm',
    },
    input: {
      padding: '16px 20px',
      borderRadius: '12px',
      minHeight: '48px',
      fontSize: 'sm',
    },
  },
};

// Helper functions
export function getThemeColors(mode: ThemeMode): ColorPalette {
  if (mode === 'auto') {
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;
    return monochromeThemeConfig.colors[prefersDark ? 'dark' : 'light'];
  }
  return monochromeThemeConfig.colors[mode === 'dark' ? 'dark' : 'light'];
}

export function generateCSSVariables(mode: ThemeMode): Record<string, string> {
  const colors = getThemeColors(mode);
  const variables: Record<string, string> = {};
  
  // Color variables
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        variables[`--color-${key}-${subKey}`] = subValue as string;
      });
    }
  });
  
  // Shadow variables
  const { shadows } = monochromeThemeConfig.layout;
  Object.entries(shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });
  
  // Transition variables
  const { transitions } = monochromeThemeConfig;
  Object.entries(transitions).forEach(([key, value]) => {
    variables[`--transition-${key}`] = value;
  });
  
  return variables;
}

export function applyCSSVariables(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  
  const variables = generateCSSVariables(mode);
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

export function applyThemeMode(mode: ThemeMode): ThemeMode {
  if (typeof document === 'undefined') return mode;
  
  let actualMode: 'light' | 'dark' = 'light';
  
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    actualMode = prefersDark ? 'dark' : 'light';
  } else {
    actualMode = mode === 'dark' ? 'dark' : 'light';
  }
  
  // Apply CSS class
  document.documentElement.classList.toggle('dark', actualMode === 'dark');
  
  // Apply CSS variables
  applyCSSVariables(actualMode);
  
  return actualMode;
}

export function saveThemePreference(mode: ThemeMode): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(monochromeThemeConfig.storageKeys.theme, mode);
}

export function loadThemePreference(): ThemeMode {
  if (typeof localStorage === 'undefined') return monochromeThemeConfig.defaults.mode;
  
  const saved = localStorage.getItem(monochromeThemeConfig.storageKeys.theme) as ThemeMode;
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved;
  }
  
  return monochromeThemeConfig.defaults.mode;
}

export function saveLanguagePreference(language: Language): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(monochromeThemeConfig.storageKeys.language, language);
}

export function loadLanguagePreference(): Language {
  if (typeof localStorage === 'undefined') return monochromeThemeConfig.defaults.language;
  
  const saved = localStorage.getItem(monochromeThemeConfig.storageKeys.language) as Language;
  if (saved && ['vi', 'en'].includes(saved)) {
    return saved;
  }
  
  // Try to detect from browser
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('vi')) return 'vi';
    if (browserLang.startsWith('en')) return 'en';
  }
  
  return monochromeThemeConfig.defaults.language;
}

// CSS class utilities
export const monochromeClasses = {
  // Cards
  card: 'mono-card',
  cardHover: 'mono-card-hover',
  
  // Buttons
  button: 'mono-button',
  buttonAccent: 'mono-button accent',
  buttonSecondary: 'mono-button secondary',
  buttonGhost: 'mono-button ghost',
  
  // Inputs
  input: 'mono-input',
  
  // Text
  textPrimary: 'text-primary',
  textSecondary: 'text-text-secondary',
  textMuted: 'text-text-muted',
  
  // Backgrounds
  bgBackground: 'bg-background',
  bgSurface: 'bg-surface',
  bgHover: 'bg-hover',
  
  // Borders
  borderBase: 'border-border',
  borderLight: 'border-border-light',
  
  // Transitions
  transition: 'transition-all duration-300 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-500 ease-in-out',
};

export default monochromeThemeConfig;

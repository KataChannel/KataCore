// Theme configuration for monochrome UI and dark mode
export const themeConfig = {
  // Default theme mode
  defaultMode: 'light' as 'light' | 'dark',
  
  // Monochrome color palette
  colors: {
    light: {
      // Primary monochrome colors
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      accent: '#2563eb', // Single accent color (blue)
      
      // Gray scale
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      },
      
      // Semantic colors
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#1a1a1a',
      textSecondary: '#4b5563',
      border: '#e5e7eb',
      
      // Status colors (muted for monochrome)
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb'
    },
    
    dark: {
      // Primary monochrome colors
      primary: '#ffffff',
      secondary: '#a1a1aa',
      accent: '#3b82f6', // Single accent color (blue)
      
      // Gray scale
      gray: {
        50: '#18181b',
        100: '#27272a',
        200: '#3f3f46',
        300: '#52525b',
        400: '#71717a',
        500: '#a1a1aa',
        600: '#d4d4d8',
        700: '#e4e4e7',
        800: '#f4f4f5',
        900: '#fafafa'
      },
      
      // Semantic colors
      background: '#0a0a0a',
      surface: '#18181b',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: '#3f3f46',
      
      // Status colors (muted for monochrome)
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    base: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
};

// Theme context and hook
export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof themeConfig.colors.light;

export interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Helper functions
export function getThemeColors(mode: ThemeMode): ThemeColors {
  return themeConfig.colors[mode];
}

export function generateCSSVariables(mode: ThemeMode): Record<string, string> {
  const colors = getThemeColors(mode);
  const variables: Record<string, string> = {};
  
  // Convert colors to CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key}`] = value;
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        variables[`--color-${key}-${subKey}`] = subValue;
      });
    }
  });
  
  return variables;
}
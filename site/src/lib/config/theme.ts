// Legacy theme configuration - Redirects to unified monochrome theme
// This file is kept for backward compatibility

import {
  ThemeMode,
  ColorPalette,
  monochromeThemeConfig,
  getThemeColors,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeMode,
  saveThemePreference,
  loadThemePreference,
} from './monochrome-theme';

// Re-export types for backward compatibility
export type { ThemeMode, ColorPalette };

// Re-export the unified config as themeConfig
export const themeConfig = monochromeThemeConfig;

// Legacy type definitions for backward compatibility
export type ThemeColors = ColorPalette;

export interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

// Re-export helper functions
export {
  getThemeColors,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeMode,
  saveThemePreference,
  loadThemePreference,
};

// Legacy default export for backward compatibility
export default {
  themeConfig: monochromeThemeConfig,
  getThemeColors,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeMode,
  saveThemePreference,
  loadThemePreference,
};

// Unified Theme Exports - Single source of truth for theme hooks
// This file provides centralized exports to prevent hook conflicts

// Main exports from unified theme
export {
  UnifiedThemeProvider,
  useUnifiedTheme,
  useSafeUnifiedTheme,
  useSafeThemeMode,
  useSafeLanguage,
  useThemeColors,
  useIsDarkMode,
  useCurrentLanguage,
  useAccessibility,
} from './useUnifiedTheme';

// Legacy compatibility exports - redirect to safe versions
export { useSafeThemeMode as useThemeMode } from './useUnifiedTheme';
export { useSafeLanguage as useLanguage } from './useUnifiedTheme';

// Auth exports
export {
  UnifiedAuthProvider as AuthProvider,
  useUnifiedAuth,
  useUnifiedPermissions,
  useUnifiedRoles,
  withAuth,
  PermissionGate,
  AccessBadge,
} from '../components/auth/UnifiedAuthProvider';

// Error boundary
export { ErrorBoundary } from '../components/ErrorBoundary';

// Safe layout component
export { SafeLayout } from '../components/SafeLayout';

// Type exports
export type {
  ThemeConfig,
  ThemeMode,
  Language,
  ColorPalette,
  ColorScheme,
  AnimationLevel,
} from '../lib/config/unified-theme';

// Constants
export { UNIFIED_THEME_CONFIG } from '../lib/config/unified-theme';

// Legacy exports (kept for backward compatibility)
export { default as useLocalStorage } from './useLocalStorage';
export { default as useApi } from './useApi';

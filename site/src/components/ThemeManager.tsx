// Central Theme Manager - Unified theme system integration
// This component provides centralized theme management across the entire application

'use client';

import React, { useEffect, ReactNode } from 'react';
import { UnifiedThemeProvider, useUnifiedTheme } from '../hooks/useUnifiedTheme';
import { UNIFIED_THEME_CONFIG, ThemeConfig } from '../lib/config/unified-theme';

// ============================================================================
// THEME MANAGER COMPONENT
// ============================================================================

interface ThemeManagerProps {
  children: ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
  enablePersistence?: boolean;
  enableSystemListener?: boolean;
  enableDebugMode?: boolean;
}

/**
 * Internal Theme Manager that handles global theme application
 */
function ThemeManagerInternal({ 
  children, 
  enableDebugMode = false 
}: { 
  children: ReactNode; 
  enableDebugMode?: boolean; 
}) {
  const { config, actualMode, isLoading } = useUnifiedTheme();

  // Apply global document classes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const { documentElement } = document;
    
    // Remove existing theme classes
    documentElement.classList.remove('light', 'dark', 'auto');
    documentElement.classList.remove('color-scheme-monochrome', 'color-scheme-colorful');
    documentElement.classList.remove('animation-none', 'animation-reduced', 'animation-normal', 'animation-enhanced');
    documentElement.classList.remove('font-size-xs', 'font-size-sm', 'font-size-base', 'font-size-lg', 'font-size-xl');
    documentElement.classList.remove('border-radius-none', 'border-radius-sm', 'border-radius-base', 'border-radius-lg', 'border-radius-xl');
    
    // Apply current theme classes
    documentElement.classList.add(actualMode);
    documentElement.classList.add(`color-scheme-${config.colorScheme}`);
    documentElement.classList.add(`animation-${config.animationLevel}`);
    documentElement.classList.add(`font-size-${config.fontSize}`);
    documentElement.classList.add(`border-radius-${config.borderRadius}`);
    
    // Apply accessibility classes
    documentElement.classList.toggle('high-contrast', config.highContrast);
    documentElement.classList.toggle('reduced-motion', config.reducedMotion);
    
    // Set language attribute
    documentElement.lang = config.language;
    
    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') || 
                          document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    themeColorMeta.setAttribute('content', actualMode === 'dark' ? '#0d1117' : '#ffffff');
    if (!document.querySelector('meta[name="theme-color"]')) {
      document.head.appendChild(themeColorMeta);
    }
    
    // Update color-scheme meta for browser UI
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]') || 
                           document.createElement('meta');
    colorSchemeMeta.setAttribute('name', 'color-scheme');
    colorSchemeMeta.setAttribute('content', actualMode === 'dark' ? 'dark' : 'light');
    if (!document.querySelector('meta[name="color-scheme"]')) {
      document.head.appendChild(colorSchemeMeta);
    }

    if (enableDebugMode) {
      console.log('🎨 Theme Manager: Applied theme', {
        mode: config.mode,
        actualMode,
        colorScheme: config.colorScheme,
        language: config.language,
        config,
      });
    }
  }, [config, actualMode, enableDebugMode]);

  // Add loading state management
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle('theme-loading', isLoading);
    
    if (!isLoading) {
      // Remove any flash of unstyled content prevention
      const fouc = document.querySelector('#fouc-prevention');
      if (fouc) {
        fouc.remove();
      }
    }
  }, [isLoading]);

  return <>{children}</>;
}

/**
 * Main Theme Manager component that wraps the entire application
 */
export function ThemeManager({
  children,
  defaultConfig,
  enablePersistence = true,
  enableSystemListener = true,
  enableDebugMode = false,
}: ThemeManagerProps) {
  return (
    <UnifiedThemeProvider
      defaultConfig={defaultConfig}
      enablePersistence={enablePersistence}
      enableSystemListener={enableSystemListener}
    >
      <ThemeManagerInternal enableDebugMode={enableDebugMode}>
        {children}
      </ThemeManagerInternal>
    </UnifiedThemeProvider>
  );
}

// ============================================================================
// THEME INITIALIZATION
// ============================================================================

/**
 * Theme initialization script to prevent FOUC (Flash of Unstyled Content)
 * This should be included in the document head before any content
 */
export const ThemeInitScript = () => {
  const script = `
    (function() {
      try {
        // Get stored theme config
        const stored = localStorage.getItem('${UNIFIED_THEME_CONFIG.storageKeys.theme}');
        const config = stored ? JSON.parse(stored) : ${JSON.stringify(UNIFIED_THEME_CONFIG.defaults)};
        
        // Determine actual mode
        let actualMode = config.mode;
        if (config.mode === 'auto') {
          actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        // Apply essential classes immediately
        document.documentElement.classList.add(actualMode);
        document.documentElement.classList.add('color-scheme-' + config.colorScheme);
        document.documentElement.classList.add('animation-' + config.animationLevel);
        document.documentElement.classList.add('font-size-' + config.fontSize);
        document.documentElement.classList.add('border-radius-' + config.borderRadius);
        
        if (config.highContrast) {
          document.documentElement.classList.add('high-contrast');
        }
        
        if (config.reducedMotion) {
          document.documentElement.classList.add('reduced-motion');
        }
        
        // Set language
        document.documentElement.lang = config.language;
        
        // Set theme-color meta
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = actualMode === 'dark' ? '#0d1117' : '#ffffff';
        document.head.appendChild(meta);
        
        // Add loading prevention styles
        const style = document.createElement('style');
        style.id = 'fouc-prevention';
        style.textContent = 'body { visibility: hidden; }';
        document.head.appendChild(style);
        
        // Remove loading styles after content loads
        window.addEventListener('DOMContentLoaded', function() {
          setTimeout(function() {
            document.body.style.visibility = 'visible';
            const fouc = document.getElementById('fouc-prevention');
            if (fouc) fouc.remove();
          }, 100);
        });
        
      } catch (e) {
        console.warn('Theme initialization failed:', e);
        // Fallback to light mode
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

/**
 * Simple theme provider for components that only need theme context
 */
export function ThemeProvider({ 
  children, 
  defaultConfig 
}: { 
  children: ReactNode; 
  defaultConfig?: Partial<ThemeConfig>;
}) {
  return (
    <UnifiedThemeProvider defaultConfig={defaultConfig}>
      {children}
    </UnifiedThemeProvider>
  );
}

// ============================================================================
// THEME SWITCH COMPONENTS
// ============================================================================

/**
 * Theme mode toggle button
 */
export function ThemeModeToggle({ 
  className = '',
  showLabel = false,
}: { 
  className?: string;
  showLabel?: boolean;
}) {
  const { config, toggleMode, isSystemMode } = useUnifiedTheme();

  const getModeIcon = () => {
    switch (config.mode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🌓';
      default: return '☀️';
    }
  };

  const getModeLabel = () => {
    switch (config.mode) {
      case 'light': return config.language === 'vi' ? 'Sáng' : 'Light';
      case 'dark': return config.language === 'vi' ? 'Tối' : 'Dark';
      case 'auto': return config.language === 'vi' ? 'Tự động' : 'Auto';
      default: return 'Light';
    }
  };

  return (
    <button
      onClick={toggleMode}
      className={`px-4 py-2 rounded border border-border hover:bg-hover transition-colors ${className}`}
      aria-label={config.language === 'vi' ? 'Chuyển chế độ theme' : 'Toggle theme mode'}
      title={`${config.language === 'vi' ? 'Chế độ hiện tại' : 'Current mode'}: ${getModeLabel()}`}
    >
      <span className="text-lg">{getModeIcon()}</span>
      {showLabel && <span>{getModeLabel()}</span>}
    </button>
  );
}

/**
 * Language toggle button
 */
export function LanguageToggle({ 
  className = '',
  showLabel = false,
}: { 
  className?: string;
  showLabel?: boolean;
}) {
  const { config, toggleLanguage } = useUnifiedTheme();

  return (
    <button
      onClick={toggleLanguage}
      className={`px-4 py-2 rounded border border-border hover:bg-hover transition-colors ${className}`}
      aria-label={config.language === 'vi' ? 'Chuyển ngôn ngữ' : 'Toggle language'}
    >
      <span className="text-lg">
        {config.language === 'vi' ? '🇻🇳' : '🇺🇸'}
      </span>
      {showLabel && (
        <span>{config.language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
      )}
    </button>
  );
}

/**
 * Complete theme controls panel
 */
export function ThemeControlPanel({ className = '' }: { className?: string }) {
  const {
    config,
    setMode,
    setColorScheme,
    setAnimationLevel,
    enableHighContrast,
    enableReducedMotion,
  } = useUnifiedTheme();

  return (
    <div className={`bg-surface border border-border rounded-lg p-6 shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-primary">
        {config.language === 'vi' ? 'Cài đặt giao diện' : 'Theme Settings'}
      </h3>
      
      {/* Theme Mode */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {config.language === 'vi' ? 'Chế độ màu' : 'Color Mode'}
        </label>
        <div className="flex gap-2">
          {(['light', 'dark', 'auto'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`px-4 py-2 rounded transition-colors ${
                config.mode === mode 
                  ? 'bg-accent text-white' 
                  : 'border border-border hover:bg-hover'
              }`}
            >
              {mode === 'light' && (config.language === 'vi' ? 'Sáng' : 'Light')}
              {mode === 'dark' && (config.language === 'vi' ? 'Tối' : 'Dark')}
              {mode === 'auto' && (config.language === 'vi' ? 'Tự động' : 'Auto')}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {config.language === 'vi' ? 'Phong cách màu' : 'Color Scheme'}
        </label>
        <div className="flex gap-2">
          {(['monochrome', 'colorful'] as const).map((scheme) => (
            <button
              key={scheme}
              onClick={() => setColorScheme(scheme)}
              className={`px-4 py-2 rounded transition-colors ${
                config.colorScheme === scheme 
                  ? 'bg-accent text-white' 
                  : 'border border-border hover:bg-hover'
              }`}
            >
              {scheme === 'monochrome' && (config.language === 'vi' ? 'Đơn sắc' : 'Monochrome')}
              {scheme === 'colorful' && (config.language === 'vi' ? 'Nhiều màu' : 'Colorful')}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Level */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {config.language === 'vi' ? 'Mức độ hoạt ảnh' : 'Animation Level'}
        </label>
        <div className="flex gap-2">
          {(['none', 'reduced', 'normal', 'enhanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setAnimationLevel(level)}
              className={`px-4 py-2 rounded transition-colors ${
                config.animationLevel === level 
                  ? 'bg-accent text-white' 
                  : 'border border-border hover:bg-hover'
              }`}
            >
              {level === 'none' && (config.language === 'vi' ? 'Không' : 'None')}
              {level === 'reduced' && (config.language === 'vi' ? 'Giảm' : 'Reduced')}
              {level === 'normal' && (config.language === 'vi' ? 'Bình thường' : 'Normal')}
              {level === 'enhanced' && (config.language === 'vi' ? 'Nâng cao' : 'Enhanced')}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="border-t border-color-border pt-4">
        <h4 className="text-md font-medium mb-3">
          {config.language === 'vi' ? 'Khả năng tiếp cận' : 'Accessibility'}
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.highContrast}
              onChange={(e) => enableHighContrast(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">
              {config.language === 'vi' ? 'Tương phản cao' : 'High Contrast'}
            </span>
          </label>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.reducedMotion}
              onChange={(e) => enableReducedMotion(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">
              {config.language === 'vi' ? 'Giảm chuyển động' : 'Reduced Motion'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeManager;

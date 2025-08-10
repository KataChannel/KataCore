'use client';

import React, { useEffect, useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { joyUITheme } from '@/lib/config/joy-ui-theme';
import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';

interface JoyUIProviderProps {
  children: React.ReactNode;
}

/**
 * Joy UI Provider Component
 * 
 * Provides Joy UI theme context with integration to unified theme system
 * Handles SSR/hydration safely
 */
export function JoyUIProvider({ children }: JoyUIProviderProps) {
  const { config } = useUnifiedTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use 'light' as default for SSR, actual theme after hydration
  const colorScheme = mounted 
    ? (config.mode === 'dark' ? 'dark' : 'light')
    : 'light';
  
  return (
    <CssVarsProvider 
      theme={joyUITheme}
      defaultColorScheme={colorScheme}
      modeStorageKey="joy-ui-mode"
      disableTransitionOnChange
      colorSchemeStorageKey="joy-ui-color-scheme"
    >
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}

/**
 * Higher-order component to wrap components with Joy UI provider
 */
export function withJoyUI<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <JoyUIProvider>
      <Component {...props} />
    </JoyUIProvider>
  );

  WrappedComponent.displayName = `withJoyUI(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default JoyUIProvider;

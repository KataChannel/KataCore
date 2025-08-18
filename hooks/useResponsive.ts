'use client';

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof BreakpointConfig;

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: Breakpoint;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    currentBreakpoint: 'sm',
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg && width < breakpoints.xl;
      const isLargeDesktop = width >= breakpoints.xl;

      let currentBreakpoint: Breakpoint = 'sm';
      if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
      else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
      else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
      else if (width >= breakpoints.md) currentBreakpoint = 'md';

      setState({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        currentBreakpoint,
      });
    };

    // Set initial size
    updateSize();

    // Add event listener
    window.addEventListener('resize', updateSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return state;
};

export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { width } = useResponsive();
  return width >= breakpoints[breakpoint];
};

export const useBelowBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { width } = useResponsive();
  return width < breakpoints[breakpoint];
};

import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Unified Theme System - CSS variables for dynamic theming
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        'surface-elevated': "var(--color-surface-elevated)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        text: "var(--color-text)",
        'text-secondary': "var(--color-text-secondary)",
        'text-muted': "var(--color-text-muted)",
        border: "var(--color-border)",
        'border-light': "var(--color-border-light)",
        hover: "var(--color-hover)",
        active: "var(--color-active)",
        disabled: "var(--color-disabled)",
        
        // Unified gray scale
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        
        // Legacy mono classes for backward compatibility
        mono: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        
        // Semantic colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        xs: ['var(--font-size-xs)', 'var(--line-height-xs)'],
        sm: ['var(--font-size-sm)', 'var(--line-height-sm)'],
        base: ['var(--font-size-base)', 'var(--line-height-base)'],
        lg: ['var(--font-size-lg)', 'var(--line-height-lg)'],
        xl: ['var(--font-size-xl)', 'var(--line-height-xl)'],
        '2xl': ['var(--font-size-2xl)', 'var(--line-height-2xl)'],
        '3xl': ['var(--font-size-3xl)', 'var(--line-height-3xl)'],
        '4xl': ['var(--font-size-4xl)', 'var(--line-height-4xl)'],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
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
      
      boxShadow: {
        none: 'var(--shadow-none)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        
        // Legacy mono shadows
        'mono-sm': 'var(--shadow-sm)',
        'mono': 'var(--shadow-base)',
        'mono-md': 'var(--shadow-md)',
        'mono-lg': 'var(--shadow-lg)',
        'mono-xl': 'var(--shadow-xl)',
        'mono-base': 'var(--shadow-base)',
      },
      
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-normal)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      
      transitionTimingFunction: {
        DEFAULT: 'var(--easing-in-out)',
        linear: 'var(--easing-linear)',
        in: 'var(--easing-in)',
        out: 'var(--easing-out)',
        bounce: 'var(--easing-bounce)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      
      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'unified-loading-shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
      
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'loading-shimmer': 'unified-loading-shimmer 1.5s infinite',
      },
    },
  },
  plugins: [
    // Custom plugin for unified theme utilities
    function({ addUtilities, theme }: { addUtilities: any; theme: any }) {
      addUtilities({
        '.unified-card': {
          'background-color': 'var(--color-surface)',
          'border': '1px solid var(--color-border)',
          'border-radius': '16px',
          'padding': '32px',
          'transition': 'all var(--duration-normal) var(--easing-in-out)',
          'box-shadow': 'var(--shadow-sm)',
          'position': 'relative',
          'overflow': 'hidden',
          'backdrop-filter': 'blur(8px)',
        },
        '.unified-card:hover': {
          'box-shadow': 'var(--shadow-lg)',
          'transform': 'translateY(-4px)',
          'border-color': 'var(--color-border-light)',
        },
        // Unified transitions
        '.unified-transition': {
          'transition': 'all var(--duration-normal) var(--easing-in-out)',
        },
        '.unified-transition-fast': {
          'transition': 'all var(--duration-fast) var(--easing-in-out)',
        },
        '.unified-transition-slow': {
          'transition': 'all var(--duration-slow) var(--easing-in-out)',
        },
        
        // Unified focus ring
        '.unified-focus-ring': {
          '&:focus': {
            'outline': '2px solid var(--color-accent)',
            'outline-offset': '2px',
          },
        },
        
        // Legacy mono utilities for backward compatibility
        '.mono-transition': {
          'transition': 'all var(--duration-normal) var(--easing-in-out)',
        },
        '.mono-transition-fast': {
          'transition': 'all var(--duration-fast) var(--easing-in-out)',
        },
        '.mono-transition-slow': {
          'transition': 'all var(--duration-slow) var(--easing-in-out)',
        },
        '.mono-focus-ring': {
          '&:focus': {
            'outline': '2px solid var(--color-accent)',
            'outline-offset': '2px',
          },
        },
      });
    },
  ],
} satisfies Config;

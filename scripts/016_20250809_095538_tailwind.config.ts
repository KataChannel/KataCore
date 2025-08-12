import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Joy UI Integration - Primary palette
        'joy-primary': {
          50: 'var(--joy-palette-primary-50)',
          100: 'var(--joy-palette-primary-100)',
          200: 'var(--joy-palette-primary-200)',
          300: 'var(--joy-palette-primary-300)',
          400: 'var(--joy-palette-primary-400)',
          500: 'var(--joy-palette-primary-500)',
          600: 'var(--joy-palette-primary-600)',
          700: 'var(--joy-palette-primary-700)',
          800: 'var(--joy-palette-primary-800)',
          900: 'var(--joy-palette-primary-900)',
          DEFAULT: 'var(--joy-palette-primary-500)',
        },
        
        // Joy UI Secondary palette
        'joy-neutral': {
          50: 'var(--joy-palette-neutral-50)',
          100: 'var(--joy-palette-neutral-100)',
          200: 'var(--joy-palette-neutral-200)',
          300: 'var(--joy-palette-neutral-300)',
          400: 'var(--joy-palette-neutral-400)',
          500: 'var(--joy-palette-neutral-500)',
          600: 'var(--joy-palette-neutral-600)',
          700: 'var(--joy-palette-neutral-700)',
          800: 'var(--joy-palette-neutral-800)',
          900: 'var(--joy-palette-neutral-900)',
          DEFAULT: 'var(--joy-palette-neutral-500)',
        },

        // Joy UI Success palette
        'joy-success': {
          50: 'var(--joy-palette-success-50)',
          100: 'var(--joy-palette-success-100)',
          200: 'var(--joy-palette-success-200)',
          300: 'var(--joy-palette-success-300)',
          400: 'var(--joy-palette-success-400)',
          500: 'var(--joy-palette-success-500)',
          600: 'var(--joy-palette-success-600)',
          700: 'var(--joy-palette-success-700)',
          800: 'var(--joy-palette-success-800)',
          900: 'var(--joy-palette-success-900)',
          DEFAULT: 'var(--joy-palette-success-500)',
        },

        // Joy UI Warning palette
        'joy-warning': {
          50: 'var(--joy-palette-warning-50)',
          100: 'var(--joy-palette-warning-100)',
          200: 'var(--joy-palette-warning-200)',
          300: 'var(--joy-palette-warning-300)',
          400: 'var(--joy-palette-warning-400)',
          500: 'var(--joy-palette-warning-500)',
          600: 'var(--joy-palette-warning-600)',
          700: 'var(--joy-palette-warning-700)',
          800: 'var(--joy-palette-warning-800)',
          900: 'var(--joy-palette-warning-900)',
          DEFAULT: 'var(--joy-palette-warning-500)',
        },

        // Joy UI Danger palette
        'joy-danger': {
          50: 'var(--joy-palette-danger-50)',
          100: 'var(--joy-palette-danger-100)',
          200: 'var(--joy-palette-danger-200)',
          300: 'var(--joy-palette-danger-300)',
          400: 'var(--joy-palette-danger-400)',
          500: 'var(--joy-palette-danger-500)',
          600: 'var(--joy-palette-danger-600)',
          700: 'var(--joy-palette-danger-700)',
          800: 'var(--joy-palette-danger-800)',
          900: 'var(--joy-palette-danger-900)',
          DEFAULT: 'var(--joy-palette-danger-500)',
        },

        // Unified Theme System - CSS variables for dynamic theming
        background: 'var(--joy-palette-background-body, var(--color-background))',
        surface: 'var(--joy-palette-background-surface, var(--color-surface))',
        'surface-elevated': 'var(--joy-palette-background-level1, var(--color-surface-elevated))',
        primary: 'var(--joy-palette-primary-500, var(--color-primary))',
        secondary: 'var(--joy-palette-neutral-500, var(--color-secondary))',
        accent: 'var(--color-accent)',
        text: 'var(--joy-palette-text-primary, var(--color-text))',
        'text-secondary': 'var(--joy-palette-text-secondary, var(--color-text-secondary))',
        'text-muted': 'var(--joy-palette-text-tertiary, var(--color-text-muted))',
        border: 'var(--joy-palette-divider, var(--color-border))',
        'border-light': 'var(--color-border-light)',
        hover: 'var(--color-hover)',
        active: 'var(--color-active)',
        disabled: 'var(--color-disabled)',

        // Unified gray scale with Joy UI integration
        gray: {
          50: 'var(--joy-palette-neutral-50, var(--color-gray-50))',
          100: 'var(--joy-palette-neutral-100, var(--color-gray-100))',
          200: 'var(--joy-palette-neutral-200, var(--color-gray-200))',
          300: 'var(--joy-palette-neutral-300, var(--color-gray-300))',
          400: 'var(--joy-palette-neutral-400, var(--color-gray-400))',
          500: 'var(--joy-palette-neutral-500, var(--color-gray-500))',
          600: 'var(--joy-palette-neutral-600, var(--color-gray-600))',
          700: 'var(--joy-palette-neutral-700, var(--color-gray-700))',
          800: 'var(--joy-palette-neutral-800, var(--color-gray-800))',
          900: 'var(--joy-palette-neutral-900, var(--color-gray-900))',
        },

        // Legacy mono classes for backward compatibility
        mono: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
        },

        // Semantic colors with Joy UI integration
        success: 'var(--joy-palette-success-500, var(--color-success))',
        warning: 'var(--joy-palette-warning-500, var(--color-warning))',
        error: 'var(--joy-palette-danger-500, var(--color-error))',
        info: 'var(--joy-palette-primary-500, var(--color-info))',
      },
      
      // Joy UI spacing system integration
      spacing: {
        'joy-xs': 'var(--joy-spacing-xs, 0.25rem)',
        'joy-sm': 'var(--joy-spacing-sm, 0.5rem)',
        'joy-md': 'var(--joy-spacing-md, 1rem)',
        'joy-lg': 'var(--joy-spacing-lg, 1.5rem)',
        'joy-xl': 'var(--joy-spacing-xl, 2rem)',
        'joy-2xl': 'var(--joy-spacing-2xl, 2.5rem)',
        'joy-3xl': 'var(--joy-spacing-3xl, 3rem)',
      },

      // Joy UI Typography system
      fontSize: {
        'joy-xs': ['var(--joy-fontSize-xs, 0.75rem)', { lineHeight: 'var(--joy-lineHeight-xs, 1.33333)' }],
        'joy-sm': ['var(--joy-fontSize-sm, 0.875rem)', { lineHeight: 'var(--joy-lineHeight-sm, 1.42857)' }],
        'joy-md': ['var(--joy-fontSize-md, 1rem)', { lineHeight: 'var(--joy-lineHeight-md, 1.5)' }],
        'joy-lg': ['var(--joy-fontSize-lg, 1.125rem)', { lineHeight: 'var(--joy-lineHeight-lg, 1.55556)' }],
        'joy-xl': ['var(--joy-fontSize-xl, 1.25rem)', { lineHeight: 'var(--joy-lineHeight-xl, 1.6)' }],
        'joy-xl2': ['var(--joy-fontSize-xl2, 1.5rem)', { lineHeight: 'var(--joy-lineHeight-xl2, 1.66667)' }],
        'joy-xl3': ['var(--joy-fontSize-xl3, 1.875rem)', { lineHeight: 'var(--joy-lineHeight-xl3, 1.73333)' }],
        'joy-xl4': ['var(--joy-fontSize-xl4, 2.25rem)', { lineHeight: 'var(--joy-lineHeight-xl4, 1.77778)' }],
      },

      // Joy UI Border radius system
      borderRadius: {
        'joy-xs': 'var(--joy-radius-xs, 0.125rem)',
        'joy-sm': 'var(--joy-radius-sm, 0.25rem)',
        'joy-md': 'var(--joy-radius-md, 0.375rem)',
        'joy-lg': 'var(--joy-radius-lg, 0.5rem)',
        'joy-xl': 'var(--joy-radius-xl, 0.75rem)',
      },

      // Joy UI Shadow system
      boxShadow: {
        'joy-xs': 'var(--joy-shadow-xs)',
        'joy-sm': 'var(--joy-shadow-sm)',
        'joy-md': 'var(--joy-shadow-md)',
        'joy-lg': 'var(--joy-shadow-lg)',
        'joy-xl': 'var(--joy-shadow-xl)',
      },

      // Keep existing colorful theme colors in the main colors object
      colorful: {
          primary: 'var(--colorful-primary)',
          'primary-light': 'var(--colorful-primary-light)',
          'primary-dark': 'var(--colorful-primary-dark)',
          secondary: 'var(--colorful-secondary)',
          'secondary-light': 'var(--colorful-secondary-light)',
          'secondary-dark': 'var(--colorful-secondary-dark)',
          accent: 'var(--colorful-accent)',
          'accent-light': 'var(--colorful-accent-light)',
          'accent-dark': 'var(--colorful-accent-dark)',
          success: 'var(--colorful-success)',
          'success-light': 'var(--colorful-success-light)',
          'success-dark': 'var(--colorful-success-dark)',
          warning: 'var(--colorful-warning)',
          'warning-light': 'var(--colorful-warning-light)',
          'warning-dark': 'var(--colorful-warning-dark)',
          error: 'var(--colorful-error)',
          'error-light': 'var(--colorful-error-light)',
          'error-dark': 'var(--colorful-error-dark)',
          info: 'var(--colorful-info)',
          'info-light': 'var(--colorful-info-light)',
          'info-dark': 'var(--colorful-info-dark)',
          background: 'var(--colorful-background)',
          surface: 'var(--colorful-surface)',
          'surface-elevated': 'var(--colorful-surface-elevated)',
          'surface-hover': 'var(--colorful-surface-hover)',
          text: 'var(--colorful-text)',
          'text-secondary': 'var(--colorful-text-secondary)',
          'text-muted': 'var(--colorful-text-muted)',
          'text-inverse': 'var(--colorful-text-inverse)',
          border: 'var(--colorful-border)',
          'border-light': 'var(--colorful-border-light)',
          'border-strong': 'var(--colorful-border-strong)',
          hover: 'var(--colorful-hover)',
          active: 'var(--colorful-active)',
          disabled: 'var(--colorful-disabled)',
          'disabled-text': 'var(--colorful-disabled-text)',
        },
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
        mono: 'var(--shadow-base)',
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

      backgroundImage: {
        // Colorful gradients
        'gradient-colorful-primary': 'var(--colorful-gradient-primary)',
        'gradient-colorful-secondary': 'var(--colorful-gradient-secondary)',
        'gradient-colorful-accent': 'var(--colorful-gradient-accent)',
        'gradient-colorful-surface': 'var(--colorful-gradient-surface)',
      },
    },
  },
  plugins: [
    // Custom plugin for unified theme utilities
    function ({ addUtilities, theme }: { addUtilities: any; theme: any }) {
      addUtilities({
        '.unified-card': {
          'background-color': 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          'border-radius': '16px',
          padding: '32px',
          transition: 'all var(--duration-normal) var(--easing-in-out)',
          'box-shadow': 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
          'backdrop-filter': 'blur(8px)',
        },
        '.unified-card:hover': {
          'box-shadow': 'var(--shadow-lg)',
          transform: 'translateY(-4px)',
          'border-color': 'var(--color-border-light)',
        },
        // Unified transitions
        '.unified-transition': {
          transition: 'all var(--duration-normal) var(--easing-in-out)',
        },
        '.unified-transition-fast': {
          transition: 'all var(--duration-fast) var(--easing-in-out)',
        },
        '.unified-transition-slow': {
          transition: 'all var(--duration-slow) var(--easing-in-out)',
        },

        // Unified focus ring
        '.unified-focus-ring': {
          '&:focus': {
            outline: '2px solid var(--color-accent)',
            'outline-offset': '2px',
          },
        },

        // Legacy mono utilities for backward compatibility
        '.mono-transition': {
          transition: 'all var(--duration-normal) var(--easing-in-out)',
        },
        '.mono-transition-fast': {
          transition: 'all var(--duration-fast) var(--easing-in-out)',
        },
        '.mono-transition-slow': {
          transition: 'all var(--duration-slow) var(--easing-in-out)',
        },
        '.mono-focus-ring': {
          '&:focus': {
            outline: '2px solid var(--color-accent)',
            'outline-offset': '2px',
          },
        },
      });
    },
  ],
};

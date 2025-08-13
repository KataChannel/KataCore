import { extendTheme } from '@mui/joy/styles';

// Joy UI Theme Configuration for Light/Dark Mode Only
export const joyTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#0c4a6e',
          100: '#075985',
          200: '#0369a1',
          300: '#0284c7',
          400: '#0ea5e9',
          500: '#38bdf8',
          600: '#7dd3fc',
          700: '#bae6fd',
          800: '#e0f2fe',
          900: '#f0f9ff',
        },
        neutral: {
          50: '#171717',
          100: '#262626',
          200: '#404040',
          300: '#525252',
          400: '#737373',
          500: '#a3a3a3',
          600: '#d4d4d4',
          700: '#e5e5e5',
          800: '#f5f5f5',
          900: '#fafafa',
        },
      },
    },
  },
  fontFamily: {
    body: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
  },
  components: {
    // Global component styles
    JoyButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: theme.radius.md,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          ...(ownerState.variant === 'solid' && {
            boxShadow: theme.shadow.sm,
            '&:hover': {
              boxShadow: theme.shadow.md,
              transform: 'translateY(-1px)',
            },
          }),
        }),
      },
    },
    JoyCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadow.sm,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadow.md,
          },
        }),
      },
    },
    JoyInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.md,
          transition: 'all 0.2s ease-in-out',
        }),
      },
    },
    JoySheet: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.lg,
        }),
      },
    },
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
});

// CSS variables for Tailwind integration
export const cssVariables = `
  :root {
    /* Joy UI Integration */
    --joy-palette-primary-500: #0ea5e9;
    --joy-palette-neutral-500: #737373;
    
    /* Custom theme variables */
    --theme-transition: all 0.2s ease-in-out;
    --theme-border-radius: 8px;
    --theme-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  .light {
    --theme-bg: #ffffff;
    --theme-fg: #171717;
    --theme-card: #fafafa;
    --theme-border: #e5e5e5;
    --theme-muted: #737373;
  }

  .dark {
    --theme-bg: #171717;
    --theme-fg: #fafafa;
    --theme-card: #262626;
    --theme-border: #404040;
    --theme-muted: #a3a3a3;
  }
`;

export default joyTheme;

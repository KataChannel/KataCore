'use client';

import React from 'react';
import { 
  Button as JoyButton, 
  Card as JoyCard, 
  Input as JoyInput,
  Textarea as JoyTextarea,
  Typography as JoyTypography,
  Sheet as JoySheet,
  Chip as JoyChip,
  Avatar as JoyAvatar,
  Badge as JoyBadge,
  IconButton as JoyIconButton,
  Modal as JoyModal,
  Divider as JoyDivider,
  Stack as JoyStack,
  Box as JoyBox,
  Grid as JoyGrid,
  CardContent,
  CardActions,
  FormControl,
  FormLabel,
  FormHelperText,
  Option,
  Select,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  AspectRatio,
  Alert,
  LinearProgress,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  ButtonGroup,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  TabList,
  Tab,
  TabPanel
} from '@mui/joy';

// Re-export Joy UI components with consistent naming
export {
  JoyButton as Button,
  JoyCard as Card,
  JoyInput as Input,
  JoyTextarea as Textarea,
  JoyTypography as Typography,
  JoySheet as Sheet,
  JoyChip as Chip,
  JoyAvatar as Avatar,
  JoyBadge as Badge,
  JoyIconButton as IconButton,
  JoyModal as Modal,
  JoyDivider as Divider,
  JoyStack as Stack,
  JoyBox as Box,
  JoyGrid as Grid,
  CardContent,
  CardActions,
  FormControl,
  FormLabel,
  FormHelperText,
  Option,
  Select,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  AspectRatio,
  Alert,
  LinearProgress,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  ButtonGroup,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  TabList,
  Tab,
  TabPanel
};

// Custom Joy UI style variants using Tailwind classes
export const joyVariants = {
  button: {
    solid: 'bg-joy-primary text-white hover:bg-joy-primary-600 shadow-joy-sm hover:shadow-joy-md transition-all duration-200',
    outlined: 'border border-joy-primary text-joy-primary hover:bg-joy-primary-50 dark:hover:bg-joy-primary-900/10',
    soft: 'bg-joy-primary-50 text-joy-primary-700 hover:bg-joy-primary-100 dark:bg-joy-primary-900/20 dark:text-joy-primary-300',
    plain: 'text-joy-primary hover:bg-joy-primary-50 dark:hover:bg-joy-primary-900/10',
  },
  card: {
    elevated: 'bg-surface shadow-joy-lg border border-joy-neutral-200 dark:border-joy-neutral-700 rounded-joy-lg',
    outlined: 'border border-joy-neutral-200 dark:border-joy-neutral-700 rounded-joy-lg bg-surface',
    soft: 'bg-joy-neutral-50 dark:bg-joy-neutral-900/20 rounded-joy-lg',
    plain: 'bg-transparent rounded-joy-lg',
  },
  input: {
    outlined: 'border border-joy-neutral-300 dark:border-joy-neutral-600 rounded-joy-md px-joy-sm py-joy-xs focus:border-joy-primary focus:ring-2 focus:ring-joy-primary/20',
    soft: 'bg-joy-neutral-50 dark:bg-joy-neutral-900/20 border-0 rounded-joy-md px-joy-sm py-joy-xs focus:bg-background',
    plain: 'border-0 border-b border-joy-neutral-300 dark:border-joy-neutral-600 rounded-none px-0 py-joy-xs focus:border-joy-primary',
  },
  typography: {
    h1: 'text-joy-xl4 font-bold text-joy-neutral-900 dark:text-joy-neutral-100 leading-tight',
    h2: 'text-joy-xl3 font-bold text-joy-neutral-900 dark:text-joy-neutral-100 leading-tight',
    h3: 'text-joy-xl2 font-semibold text-joy-neutral-900 dark:text-joy-neutral-100 leading-snug',
    h4: 'text-joy-xl font-semibold text-joy-neutral-900 dark:text-joy-neutral-100 leading-snug',
    body1: 'text-joy-md text-joy-neutral-800 dark:text-joy-neutral-200 leading-relaxed',
    body2: 'text-joy-sm text-joy-neutral-700 dark:text-joy-neutral-300 leading-relaxed',
    caption: 'text-joy-xs text-joy-neutral-600 dark:text-joy-neutral-400',
  }
} as const;

// Joy UI + Tailwind utility classes
export const joyClasses = {
  // Spacing
  spacing: {
    xs: 'p-joy-xs',
    sm: 'p-joy-sm',
    md: 'p-joy-md',
    lg: 'p-joy-lg',
    xl: 'p-joy-xl',
  },
  margin: {
    xs: 'm-joy-xs',
    sm: 'm-joy-sm',
    md: 'm-joy-md',
    lg: 'm-joy-lg',
    xl: 'm-joy-xl',
  },
  // Radius
  radius: {
    xs: 'rounded-joy-xs',
    sm: 'rounded-joy-sm',
    md: 'rounded-joy-md',
    lg: 'rounded-joy-lg',
    xl: 'rounded-joy-xl',
  },
  // Shadow
  shadow: {
    xs: 'shadow-joy-xs',
    sm: 'shadow-joy-sm',
    md: 'shadow-joy-md',
    lg: 'shadow-joy-lg',
    xl: 'shadow-joy-xl',
  },
  // Colors
  colors: {
    primary: 'text-joy-primary',
    secondary: 'text-joy-neutral-500',
    success: 'text-joy-success',
    warning: 'text-joy-warning',
    danger: 'text-joy-danger',
  },
  backgrounds: {
    primary: 'bg-joy-primary',
    secondary: 'bg-joy-neutral-100 dark:bg-joy-neutral-800',
    success: 'bg-joy-success',
    warning: 'bg-joy-warning',
    danger: 'bg-joy-danger',
    surface: 'bg-surface',
  },
} as const;

// Responsive Joy UI utility classes
export const joyResponsive = {
  // Grid system
  grid: {
    container: 'grid gap-joy-md',
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 md:grid-cols-2',
    cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  // Flex system
  flex: {
    row: 'flex flex-row items-center gap-joy-sm',
    col: 'flex flex-col gap-joy-sm',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    wrap: 'flex flex-wrap gap-joy-sm',
  },
  // Typography responsive
  text: {
    xs: 'text-joy-xs',
    sm: 'text-joy-sm md:text-joy-md',
    md: 'text-joy-md md:text-joy-lg',
    lg: 'text-joy-lg md:text-joy-xl',
    xl: 'text-joy-xl md:text-joy-xl2',
    '2xl': 'text-joy-xl2 md:text-joy-xl3',
    '3xl': 'text-joy-xl3 md:text-joy-xl4',
  },
} as const;

// Joy UI Animation classes with Tailwind
export const joyAnimations = {
  // Transitions
  transition: {
    all: 'transition-all duration-200 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
    opacity: 'transition-opacity duration-200 ease-in-out',
  },
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    lift: 'hover:-translate-y-1 hover:shadow-joy-lg transition-all duration-200',
    glow: 'hover:shadow-joy-md hover:shadow-joy-primary/25 transition-all duration-200',
    fade: 'hover:opacity-80 transition-opacity duration-200',
  },
  // Focus effects
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-joy-primary/30 focus:border-joy-primary',
    glow: 'focus:outline-none focus:shadow-joy-md focus:shadow-joy-primary/25',
  },
} as const;

// Joy UI layout patterns
export const joyLayouts = {
  // Card layouts
  card: {
    default: `${joyVariants.card.elevated} ${joyClasses.spacing.md}`,
    interactive: `${joyVariants.card.elevated} ${joyClasses.spacing.md} ${joyAnimations.hover.lift} cursor-pointer`,
    compact: `${joyVariants.card.outlined} ${joyClasses.spacing.sm}`,
  },
  // Container layouts
  container: {
    page: 'max-w-7xl mx-auto px-joy-md py-joy-lg',
    section: 'py-joy-xl',
    content: 'max-w-4xl mx-auto',
  },
  // Form layouts
  form: {
    group: `${joyResponsive.flex.col} gap-joy-md`,
    field: `${joyResponsive.flex.col} gap-joy-xs`,
    actions: `${joyResponsive.flex.row} justify-end gap-joy-sm pt-joy-md`,
  },
} as const;

// Export utility function to combine Joy UI classes
export function joyClsx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Export all utilities as default
export default {
  variants: joyVariants,
  classes: joyClasses,
  responsive: joyResponsive,
  animations: joyAnimations,
  layouts: joyLayouts,
  clsx: joyClsx,
};

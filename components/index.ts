// Components barrel exports
export * from './ui';
export * from './forms';
export * from './layout';
export * from './common';
export * from './admin';

// Simple theme system
export { SimpleThemeProvider } from './providers/SimpleThemeProvider';
export { 
  ThemeToggle,
  ThemeSelect
} from './theme/ThemeToggle';

// Demo components
export { SimpleThemeDemo } from './demo/SimpleThemeDemo';
export { OptimizedThemeDemo } from './demo/OptimizedThemeDemo';

// Layout components  
export { OptimizedLayout } from './layout/OptimizedLayout';

// UI components
export { 
  OptimizedCard, 
  InfoCard, 
  SuccessCard, 
  WarningCard, 
  DangerCard 
} from './ui/OptimizedCard';

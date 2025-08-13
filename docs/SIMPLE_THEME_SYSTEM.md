# Simple Theme System Documentation

## Overview

This is a simplified theme system that replaces the complex unified theme with a clean, straightforward approach using only:
- **Light/Dark modes** (no more monochrome/colorful modes)
- **Joy UI** for component theming
- **Tailwind CSS 4** for utility classes
- **Simple CSS variables** for custom styling

## Architecture

### Core Files

1. **`hooks/useSimpleTheme.tsx`** - Main theme hook with context
2. **`components/theme/SimpleThemeManager.tsx`** - Theme control components
3. **`lib/theme/joy-theme.ts`** - Joy UI theme configuration
4. **`app/styles/simple-theme.css`** - Theme CSS variables and utilities
5. **`components/providers/SimpleThemeProvider.tsx`** - Theme provider wrapper

### Theme Modes

- `light` - Light theme
- `dark` - Dark theme  
- `system` - Follows system preference

## Usage

### Basic Setup

```tsx
import { SimpleThemeProvider } from '@/components/providers/SimpleThemeProvider';

function App() {
  return (
    <SimpleThemeProvider>
      <YourApp />
    </SimpleThemeProvider>
  );
}
```

### Using Theme Hook

```tsx
import { useTheme } from '@/hooks/useSimpleTheme';

function MyComponent() {
  const { mode, actualMode, setMode, toggleMode } = useTheme();
  
  return (
    <div>
      <p>Current mode: {actualMode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}
```

### Theme Controls

```tsx
import { 
  ThemeToggle, 
  ThemeSwitch, 
  ThemeSelect, 
  CompactThemeControls,
  FullThemeControls 
} from '@/components/theme/SimpleThemeManager';

// Simple toggle button
<ThemeToggle />

// Switch control
<ThemeSwitch />

// Full selection (light/dark/system)
<ThemeSelect />

// For headers/navigation
<CompactThemeControls />

// For settings pages
<FullThemeControls />
```

### CSS Variables

The theme system provides CSS variables that work with both Joy UI and Tailwind:

```css
/* Theme variables */
--theme-bg        /* Background color */
--theme-fg        /* Text color */
--theme-card      /* Card background */
--theme-border    /* Border color */
--theme-muted     /* Muted text */
--theme-accent    /* Accent color */
```

### Tailwind Integration

Use theme-aware Tailwind classes:

```tsx
<div className="bg-theme-bg text-theme-fg border border-theme-border rounded-theme-lg p-4">
  <h2 className="text-theme-accent">Title</h2>
  <p className="text-theme-muted">Description</p>
</div>
```

### Custom CSS Classes

Use utility classes for theme-aware styling:

```tsx
<div className="theme-card-elevated">
  <button className="theme-button">Click me</button>
  <input className="theme-input" placeholder="Type here..." />
</div>
```

## Migration Guide

### From Old Theme System

1. **Replace theme imports:**
   ```tsx
   // Old
   import { useUnifiedTheme } from '@/hooks/useUnifiedTheme';
   
   // New
   import { useTheme } from '@/hooks/useSimpleTheme';
   ```

2. **Update theme providers:**
   ```tsx
   // Old
   <UnifiedThemeProvider>
   
   // New
   <SimpleThemeProvider>
   ```

3. **Remove complex theme modes:**
   ```tsx
   // Remove these
   monochrome: boolean
   colorful: boolean
   customColors: object
   
   // Use only
   mode: 'light' | 'dark' | 'system'
   ```

### CSS Class Updates

Replace old theme classes:
```css
/* Remove these */
.monochrome-mode { }
.colorful-mode { }
.unified-theme { }
.custom-colors { }

/* Use these */
.theme-bg { }
.theme-fg { }
.theme-card { }
```

## Benefits

### Simplified Maintenance
- ✅ Single theme context instead of multiple providers
- ✅ Clear CSS variable naming
- ✅ No complex mode switching logic
- ✅ Consistent Joy UI + Tailwind integration

### Better Performance
- ✅ Smaller bundle size (removed complex theme logic)
- ✅ Faster theme switching
- ✅ CSS-only animations and transitions
- ✅ No JavaScript theme calculations

### Developer Experience
- ✅ Simple API with only 3 modes
- ✅ Clear component naming
- ✅ Better TypeScript support
- ✅ Consistent variable naming

## Examples

### Demo Page
Visit `/test-simple-theme` to see the theme system in action with:
- All theme controls
- Joy UI components
- Tailwind integration
- CSS variable examples

### Component Examples
```tsx
// Joy UI with theme
<Button variant="solid" color="primary">
  Primary Button
</Button>

// Tailwind with theme variables
<div className="bg-theme-card border border-theme-border rounded-theme p-4">
  <h3 className="text-theme-fg font-bold">Card Title</h3>
  <p className="text-theme-muted">Card description</p>
</div>

// Custom CSS classes
<button className="theme-button">
  Themed Button
</button>
```

## Configuration

### Theme Colors
Edit `lib/theme/joy-theme.ts` to customize colors:

```ts
primary: {
  500: '#0ea5e9', // Main primary color
  // ... other shades
},
```

### CSS Variables
Edit `app/styles/simple-theme.css` to add custom variables:

```css
:root {
  --theme-custom: #your-color;
}
```

### Tailwind Classes
Edit `tailwind.config.ts` to add custom utilities:

```ts
extend: {
  colors: {
    theme: {
      custom: 'var(--theme-custom)',
    },
  },
},
```

## Testing

Test the theme system:
1. Visit `/test-simple-theme`
2. Try all theme controls
3. Check responsive behavior
4. Test system preference detection
5. Verify persistence across page reloads

## Support

- All legacy theme files are preserved for backward compatibility
- Gradual migration path available
- CSS fallbacks for unsupported browsers
- Print styles automatically use light theme

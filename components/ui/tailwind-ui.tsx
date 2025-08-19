'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'plain' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      outline: "border border-gray-200 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      plain: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
      soft: "bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg"
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Card Components
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardActions = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 p-4 pt-0", className)} {...props} />
  )
);
CardActions.displayName = "CardActions";

// Typography Component
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'body-lg' | 'body-sm' | 'caption';
  component?: React.ElementType;
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, level = 'body1', component, children, ...props }, ref) => {
    const levelClasses = {
      h1: "text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100",
      h2: "text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
      h3: "text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
      h4: "text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100",
      body1: "text-base text-gray-700 dark:text-gray-300",
      body2: "text-sm text-gray-600 dark:text-gray-400",
      'body-lg': "text-lg text-gray-700 dark:text-gray-300",
      'body-sm': "text-sm text-gray-600 dark:text-gray-400",
      caption: "text-xs text-gray-500 dark:text-gray-500"
    };

    const Component = component || (level.startsWith('h') ? level as React.ElementType : 'p');

    return React.createElement(
      Component,
      {
        ref,
        className: cn(levelClasses[level], className),
        ...props
      },
      children
    );
  }
);
Typography.displayName = "Typography";

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

// Textarea Component
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// Sheet (Layout Container)
export const Sheet = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-white dark:bg-gray-900", className)}
      {...props}
    />
  )
);
Sheet.displayName = "Sheet";

// Box (Generic Container)
export const Box = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
Box.displayName = "Box";

// Stack (Flexbox Container)
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  spacing?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'column', spacing = 2, alignItems, justifyContent, children, ...props }, ref) => {
    const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
    const spacingClass = direction === 'row' ? `gap-${spacing}` : `gap-${spacing}`;
    const alignClass = alignItems ? `items-${alignItems}` : '';
    const justifyClass = justifyContent ? `justify-${justifyContent}` : '';

    return (
      <div
        ref={ref}
        className={cn("flex", directionClass, spacingClass, alignClass, justifyClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";

// Chip Component
interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'default', color = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full font-medium transition-colors";
    
    const variantClasses = {
      default: {
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      },
      outline: {
        primary: "border border-blue-200 text-blue-800 dark:border-blue-700 dark:text-blue-400",
        secondary: "border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-300",
        success: "border border-green-200 text-green-800 dark:border-green-700 dark:text-green-400",
        warning: "border border-yellow-200 text-yellow-800 dark:border-yellow-700 dark:text-yellow-400",
        danger: "border border-red-200 text-red-800 dark:border-red-700 dark:text-red-400"
      }
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm"
    };

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variantClasses[variant][color], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Chip.displayName = "Chip";

// IconButton Component
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800"
    };

    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12"
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

// Avatar Component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', src, alt, fallback, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {fallback}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

// Divider Component
export const Divider = forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn("border-t border-gray-200 dark:border-gray-700", className)} {...props} />
  )
);
Divider.displayName = "Divider";

// Alert Component
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
      success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400",
      danger: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-lg border p-4", variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

// Progress Components
interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", className)}
      {...props}
    >
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: value ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  )
);
LinearProgress.displayName = "LinearProgress";

export const CircularProgress = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8", className)}
      {...props}
    />
  )
);
CircularProgress.displayName = "CircularProgress";

// Form Components
export const FormControl = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

export const FormLabel = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", className)}
      {...props}
    />
  )
);
FormLabel.displayName = "FormLabel";

export const FormHelperText = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
  )
);
FormHelperText.displayName = "FormHelperText";

// Legacy compatibility exports
export {
  Button as JoyButton,
  Card as JoyCard,
  Input as JoyInput,
  Textarea as JoyTextarea,
  Typography as JoyTypography,
  Sheet as JoySheet,
  Chip as JoyChip,
  Avatar as JoyAvatar,
  IconButton as JoyIconButton,
  Divider as JoyDivider,
  Stack as JoyStack,
  Box as JoyBox,
};

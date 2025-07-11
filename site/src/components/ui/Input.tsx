// Standardized Input Component
// This component follows the TazaGroup design patterns

import React, { forwardRef } from 'react';
import type { FC, InputHTMLAttributes } from '@/types/global';

// ============================================================================
// COMPONENT INTERFACE
// ============================================================================

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Full width input
   */
  fullWidth?: boolean;

  /**
   * Start icon
   */
  startIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;

  /**
   * End icon
   */
  endIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getInputStyles = (size: string = 'md', hasError: boolean = false) => {
  const baseStyles =
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const sizeStyles = {
    sm: 'h-8 text-xs',
    md: 'h-9',
    lg: 'h-10 text-base',
  };

  const errorStyles = hasError
    ? 'border-red-500 focus-visible:ring-red-500'
    : '';

  return `${baseStyles} ${sizeStyles[size as keyof typeof sizeStyles]} ${errorStyles}`;
};

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = false,
      startIcon: StartIcon,
      endIcon: EndIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {StartIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <StartIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
            ${getInputStyles(size, hasError)}
            ${StartIcon ? 'pl-10' : ''}
            ${EndIcon ? 'pr-10' : ''}
            ${className}
          `}
            {...props}
          />

          {EndIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <EndIcon className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

// ============================================================================
// COMPONENT DISPLAY NAME
// ============================================================================

Input.displayName = 'Input';

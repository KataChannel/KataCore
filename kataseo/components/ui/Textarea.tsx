import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    autosize = false,
    minRows = 3,
    maxRows = 10,
    containerClassName,
    id,
    value,
    onChange,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    // Auto-resize functionality
    useEffect(() => {
      if (autosize && textareaRef.current) {
        const textarea = textareaRef.current;
        
        // Reset height to calculate scroll height
        textarea.style.height = 'auto';
        
        // Calculate new height
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;
        
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        
        textarea.style.height = `${newHeight}px`;
      }
    }, [value, autosize, minRows, maxRows]);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <div className={cn('flex flex-col gap-1', containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={inputId}
          ref={(node) => {
            if (ref) {
              if (typeof ref === 'function') {
                ref(node);
              } else {
                ref.current = node;
              }
            }
            textareaRef.current = node;
          }}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
            error && 'border-red-500 focus:ring-red-500',
            !autosize && 'resize-y',
            className
          )}
          rows={autosize ? minRows : undefined}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
        
        {helperText && !error && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

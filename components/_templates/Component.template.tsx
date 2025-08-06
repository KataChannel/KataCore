// ============================================================================
// TAZA CORE UNIFIED COMPONENT TEMPLATE
// ============================================================================
// Copy this template for new components
// Follow TazaCore standards for consistency

// ============================================================================
// IMPORTS
// ============================================================================
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { BaseComponentProps } from '@/types/global';

// ============================================================================
// INTERFACES
// ============================================================================
interface ComponentNameProps extends BaseComponentProps {
  // Required props first
  title: string;
  data: any[];

  // Optional props second
  variant?: 'primary' | 'secondary';
  onAction?: (item: any) => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  data,
  variant = 'primary',
  onAction,
  disabled = false,
  className,
  children,
  ...props
}) => {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleAction = useCallback(
    (item: any) => {
      if (disabled) return;
      onAction?.(item);
    },
    [disabled, onAction]
  );

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Render
  return (
    <div
      className={cn(
        'base-component-styles',
        variant === 'primary' && 'primary-styles',
        variant === 'secondary' && 'secondary-styles',
        disabled && 'disabled-styles',
        className
      )}
      {...props}
    >
      {/* Component content */}
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================
export default ComponentName;
export type { ComponentNameProps };

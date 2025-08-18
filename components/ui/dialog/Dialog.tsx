"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DialogProps, DialogSize } from './types';
import { useDialogPosition } from './hooks';

const sizeClasses: Record<DialogSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full w-full h-full',
  auto: 'max-w-fit',
};

const animationClasses = {
  fade: {
    enter: 'transition-opacity duration-300 ease-out',
    enterFrom: 'opacity-0',
    enterTo: 'opacity-100',
    leave: 'transition-opacity duration-200 ease-in',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0',
  },
  slide: {
    enter: 'transition-all duration-300 ease-out',
    enterFrom: 'opacity-0 transform translate-y-4 sm:translate-y-0 sm:scale-95',
    enterTo: 'opacity-100 transform translate-y-0 sm:scale-100',
    leave: 'transition-all duration-200 ease-in',
    leaveFrom: 'opacity-100 transform translate-y-0 sm:scale-100',
    leaveTo: 'opacity-0 transform translate-y-4 sm:translate-y-0 sm:scale-95',
  },
  zoom: {
    enter: 'transition-all duration-300 ease-out',
    enterFrom: 'opacity-0 transform scale-95',
    enterTo: 'opacity-100 transform scale-100',
    leave: 'transition-all duration-200 ease-in',
    leaveFrom: 'opacity-100 transform scale-100',
    leaveTo: 'opacity-0 transform scale-95',
  },
  none: {
    enter: '',
    enterFrom: '',
    enterTo: '',
    leave: '',
    leaveFrom: '',
    leaveTo: '',
  },
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  size = 'md',
  fullScreen = false,
  responsive = true,
  draggable = false,
  dragHandle = '.dialog-header',
  scrollable = true,
  maxHeight = '80vh',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  destructive = false,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  animation = 'slide',
  showFooter = true,
  customFooter,
  showHeader = true,
  customHeader,
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { position, isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useDialogPosition(draggable);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle dragging
  useEffect(() => {
    if (!draggable || !isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggable, isDragging, handleMouseMove, handleMouseUp]);

  // Prevent body scroll
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogClasses = [
    'relative bg-white rounded-lg shadow-xl',
    fullScreen ? 'w-full h-full max-w-full max-h-full rounded-none' : sizeClasses[size],
    responsive && !fullScreen ? 'w-full mx-4 sm:mx-auto' : '',
    draggable ? 'cursor-move' : '',
    className,
  ].filter(Boolean).join(' ');

  const overlayClasses = [
    'fixed inset-0 z-50 flex items-center justify-center',
    fullScreen ? 'p-0' : 'p-4',
    'bg-black bg-opacity-50 backdrop-blur-sm',
    overlayClassName,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'flex flex-col',
    fullScreen ? 'h-full' : scrollable ? `max-h-[${maxHeight}]` : '',
    contentClassName,
  ].filter(Boolean).join(' ');

  const dialog = (
    <div className={overlayClasses} onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className={dialogClasses}
        style={draggable ? { transform: `translate(${position.x}px, ${position.y}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={contentClasses}>
          {/* Header */}
          {showHeader && (
            <div 
              className={`dialog-header flex items-center justify-between p-6 border-b ${draggable ? 'cursor-move' : ''}`}
              onMouseDown={draggable ? handleMouseDown : undefined}
            >
              {customHeader || (
                <>
                  <div>
                    {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                    {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 p-6 ${scrollable ? 'overflow-y-auto' : ''}`}>
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
              {customFooter || (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {cancelText}
                  </button>
                  {onConfirm && (
                    <button
                      onClick={onConfirm}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                        destructive
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                    >
                      {confirmText}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render dialog at document body level
  return typeof document !== 'undefined' ? createPortal(dialog, document.body) : null;
};

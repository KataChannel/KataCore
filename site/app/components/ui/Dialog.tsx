'use client';
import React, { ReactNode, createContext, useContext } from 'react';

// Dialog Context
interface DialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Main Dialog Component
interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

// Dialog Trigger Component
interface DialogTriggerProps {
    asChild?: boolean;
    children: ReactNode;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ asChild, children }) => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('DialogTrigger must be used within a Dialog');
    }

    const { onOpenChange } = context;

    const handleClick = () => {
        onOpenChange(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
        });
    }

    return (
        <button onClick={handleClick}>
            {children}
        </button>
    );
};

// Dialog Content Component
interface DialogContentProps {
    children: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
    children, 
    className = '',
    size = 'md' 
}) => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('DialogContent must be used within a Dialog');
    }

    const { open, onOpenChange } = context;

    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            
            {/* Dialog */}
            <div className={`
                relative bg-white rounded-xl shadow-2xl border border-gray-200
                ${sizeClasses[size]}
                w-full
                transform transition-all duration-200
                ${className}
            `}>
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
                >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
};

// Dialog Header Component
interface DialogHeaderProps {
    children: ReactNode;
    className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-5 border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

// Dialog Title Component
interface DialogTitleProps {
    children: ReactNode;
    className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
    return (
        <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
            {children}
        </h2>
    );
};

// Dialog Description Component
interface DialogDescriptionProps {
    children: ReactNode;
    className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = '' }) => {
    return (
        <p className={`mt-1 text-sm text-gray-600 ${className}`}>
            {children}
        </p>
    );
};

// Dialog Body Component
interface DialogBodyProps {
    children: ReactNode;
    className?: string;
}

export const DialogBody: React.FC<DialogBodyProps> = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
};

// Dialog Footer Component  
interface DialogFooterProps {
    children: ReactNode;
    className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className = '' }) => {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 bg-gray-50 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
};

export default Dialog;
'use client';
import React, { ReactNode, createContext, useContext, useState, useEffect, useRef } from 'react';

// Search Dialog Context
interface SearchDialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    query: string;
    setQuery: (query: string) => void;
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
}

const SearchDialogContext = createContext<SearchDialogContextType | undefined>(undefined);

// Search Result Interface
export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    category?: string;
    url?: string;
    icon?: ReactNode;
}

// Main Search Dialog Component
interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, children }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [open]);

    return (
        <SearchDialogContext.Provider value={{ 
            open, 
            onOpenChange, 
            query, 
            setQuery, 
            selectedIndex, 
            setSelectedIndex 
        }}>
            {children}
        </SearchDialogContext.Provider>
    );
};

// Search Dialog Trigger Component
interface SearchDialogTriggerProps {
    asChild?: boolean;
    children: ReactNode;
}

export const SearchDialogTrigger: React.FC<SearchDialogTriggerProps> = ({ asChild, children }) => {
    const context = useContext(SearchDialogContext);
    if (!context) {
        throw new Error('SearchDialogTrigger must be used within a SearchDialog');
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
        <button onClick={handleClick} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {children}
            <kbd className="ml-auto text-xs text-gray-400 border border-gray-300 rounded px-1">⌘K</kbd>
        </button>
    );
};

// Search Dialog Content Component
interface SearchDialogContentProps {
    children: ReactNode;
    className?: string;
    placeholder?: string;
}

export const SearchDialogContent: React.FC<SearchDialogContentProps> = ({ 
    children, 
    className = '',
    placeholder = "Search..."
}) => {
    const context = useContext(SearchDialogContext);
    if (!context) {
        throw new Error('SearchDialogContent must be used within a SearchDialog');
    }

    const { open, onOpenChange, query, setQuery, selectedIndex, setSelectedIndex } = context;
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when dialog opens
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenChange(true);
            }
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            
            {/* Search Dialog */}
            <div className={`
                relative bg-white rounded-xl shadow-2xl border border-gray-200
                max-w-2xl w-full max-h-[80vh] overflow-hidden
                transform transition-all duration-200
                ${className}
            `}>
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-gray-200">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder={placeholder}
                        className="flex-1 text-lg outline-none placeholder-gray-400"
                    />
                    <button
                        onClick={() => onOpenChange(false)}
                        className="ml-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-xs text-gray-400 border border-gray-300 rounded p-1">ESC</span>
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {React.cloneElement(children as React.ReactElement<any>, { query, selectedIndex, setSelectedIndex })}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="border border-gray-300 rounded p-1">↑</span>
                            <span className="border border-gray-300 rounded p-1">↓</span>
                            <span>to navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="border border-gray-300 rounded p-1">↵</span>
                            <span>to select</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="border border-gray-300 rounded p-1">ESC</span>
                            <span>to close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Search Results Component
interface SearchResultsProps {
    results: SearchResult[];
    query?: string;
    selectedIndex?: number;
    setSelectedIndex?: (index: number) => void;
    onSelect?: (result: SearchResult) => void;
    emptyMessage?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
    results, 
    query = '', 
    selectedIndex = 0, 
    setSelectedIndex,
    onSelect,
    emptyMessage = "No results found"
}) => {
    const context = useContext(SearchDialogContext);
    const { onOpenChange } = context || {};

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!setSelectedIndex) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(Math.max(selectedIndex - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, results, setSelectedIndex]);

    const handleSelect = (result: SearchResult) => {
        onSelect?.(result);
        onOpenChange?.(false);
    };

    if (!query) {
        return (
            <div className="px-4 py-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Start typing to search...</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="px-4 py-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467.901-6.063 2.372" />
                </svg>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="py-2">
            {results.map((result, index) => (
                <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 border-l-2 transition-colors
                        ${index === selectedIndex ? 'bg-blue-50 border-blue-500' : 'border-transparent'}
                    `}
                >
                    <div className="flex items-start gap-3">
                        {result.icon && (
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                {result.icon}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {result.title}
                                </h3>
                                {result.category && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {result.category}
                                    </span>
                                )}
                            </div>
                            {result.description && (
                                <p className="text-sm text-gray-600 mt-1 truncate">
                                    {result.description}
                                </p>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SearchDialog;
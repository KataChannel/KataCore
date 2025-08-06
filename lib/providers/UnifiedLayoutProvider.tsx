// Simplified UnifiedLayoutProvider
import React, { createContext, useContext } from 'react';

interface LayoutContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};

interface UnifiedLayoutProviderProps {
  children: React.ReactNode;
}

export const UnifiedLayoutProvider: React.FC<UnifiedLayoutProviderProps> = ({ children }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <LayoutContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Re-export for backward compatibility
export const MonochromeProvider = UnifiedLayoutProvider;
export const monochromeThemeConfig = {
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
  },
};

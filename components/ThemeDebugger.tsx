'use client';

import React from 'react';
import { useSafeUnifiedTheme } from '@/hooks/useUnifiedTheme';

export function ThemeDebugger() {
  const theme = useSafeUnifiedTheme();

  if (!theme) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold text-red-800">Theme Provider Not Found</h3>
        <p className="text-red-600">The UnifiedThemeProvider is not wrapping this component.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="font-bold text-green-800">Theme System Working ✅</h3>
      <div className="mt-2 text-sm">
        <p><strong>Mode:</strong> {theme.config.mode}</p>
        <p><strong>Actual Mode:</strong> {theme.actualMode}</p>
        <p><strong>Language:</strong> {theme.config.language}</p>
        <p><strong>Color Scheme:</strong> {theme.config.colorScheme}</p>
        <p><strong>Loading:</strong> {theme.isLoading ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="mt-4">
        <button
          onClick={theme.toggleMode}
          className="mr-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Toggle Mode
        </button>
        <button
          onClick={theme.toggleLanguage}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Toggle Language
        </button>
      </div>
    </div>
  );
}

export default ThemeDebugger;

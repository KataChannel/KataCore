'use client';

import React from 'react';
import {
  ThemeToggle,
  ThemeSelect
} from '@/components/theme/ThemeToggle';
import { useSimpleTheme } from '@/hooks/useSimpleTheme';

export function SimpleThemeDemo() {
  const { theme } = useSimpleTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Simple Theme System Demo
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300">
          Current theme: <strong>{theme}</strong>
        </p>

        <div className="flex flex-wrap gap-4">
          <ThemeToggle showLabel variant="icon" />
          <ThemeToggle showLabel variant="switch" />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Theme Controls</h3>
            <div className="space-y-4">
              <ThemeSelect showLabel />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Component Showcase</h3>
            <div className="space-y-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Primary Button
              </button>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Secondary Button
              </button>
              <input 
                type="text" 
                placeholder="Sample input field"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-gray-800 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Theme Classes Demo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Light/Dark Mode</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Automatically adapts to the current theme</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Themed Button
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-gray-900 rounded-lg p-4">
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Gradient Theme</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Using gradient backgrounds with theme</p>
            <button className="mt-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-white dark:hover:bg-gray-800 transition-all">
              Gradient Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TabType } from '../types';

interface LoadingErrorProps {
  loading: boolean;
  error: string | null;
  activeTab: TabType;
  onRetry: () => void;
}

const LoadingError: React.FC<LoadingErrorProps> = ({ loading, error, activeTab, onRetry }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

export default LoadingError;

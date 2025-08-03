// File: app/loading.tsx
'use client';
import React from 'react';

interface LoadingProps {
  className?: string;
}

export default function Loading({ className = '' }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${className}`}>
      <div className="text-center space-y-6">
        {/* Coffee Cup Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21h18v-2H2v2zM20 8h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3H0v5c0 3.53 2.61 6.43 6 6.92V21h12v-2.08c3.39-.49 6-3.39 6-6.92V8zM4 5h12v3H4V5zM18 19H6c-2.21 0-4-1.79-4-4v-3h2v-2h12v2h2v3c0 2.21-1.79 4-4 4z" />
            </svg>
            {/* Steam animation */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-3 bg-amber-400 rounded-full opacity-70 animate-pulse"></div>
            </div>
            <div className="absolute -top-3 left-1/2 transform -translate-x-2">
              <div
                className="w-1 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>
            <div className="absolute -top-3 left-1/2 transform translate-x-1">
              <div
                className="w-1 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800">Đang tải</h3>
          <p className="text-slate-500 text-sm">Pha một tách cà phê và chờ trong giây lát...</p>
        </div>

        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

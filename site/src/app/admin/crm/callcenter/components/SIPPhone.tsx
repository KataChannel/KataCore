'use client';

import React, { useState, useEffect } from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { useSIP } from '../hooks/useSIP';
import { SIPConfig } from '../types/callcenter.types';

interface SIPPhoneProps {
  config: SIPConfig;
  className?: string;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
}

export default function SIPPhone({ config, className = '', onStatusChange }: SIPPhoneProps) {
  const {
    isRegistered,
    currentSession,
    callStatus,
    callDuration,
    isConnecting,
    error,
    formatDuration,
    makeCall,
    answerCall,
    hangupCall,
    holdCall,
    unholdCall,
    sendDTMF,
    mute,
    unmute,
    initializeSIP
  } = useSIP(config);

  const [isMinimized, setIsMinimized] = useState(false);

  // Call onStatusChange callback when registration status changes
  useEffect(() => {
    if (onStatusChange) {
      if (isRegistered) {
        onStatusChange('connected');
      } else if (isConnecting) {
        onStatusChange('connecting');
      } else if (error) {
        onStatusChange('error');
      } else {
        onStatusChange('disconnected');
      }
    }
  }, [isRegistered, isConnecting, error, onStatusChange]);

  // Remove the JsSIP loading logic from here since it's now handled in the service
  useEffect(() => {
    // Initialize SIP when component mounts
    initializeSIP();
  }, [initializeSIP]);

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`p-3 rounded-full shadow-lg ${
            currentSession 
              ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
              : isRegistered
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
        {currentSession && callDuration > 0 && (
          <div className="absolute -top-2 -left-2 bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow">
            {formatDuration(callDuration)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SIP Phone</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isRegistered
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : isConnecting
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {isRegistered ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Connection Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={initializeSIP}
                  className="bg-red-100 dark:bg-red-900 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      <div className="p-4">
        {/* Phone interface content */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {isConnecting ? 'Initializing SIP connection...' : 
             isRegistered ? 'Ready to make calls' : 
             'SIP not connected'}
          </p>
        </div>
      </div>
    </div>
  );
}

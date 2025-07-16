'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PhoneIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Call Center Context for shared state
interface CallCenterContextType {
  sipStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  activeExtension: string | null;
  activeCallCount: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  updateSipStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  updateActiveExtension: (extension: string | null) => void;
  updateActiveCallCount: (count: number) => void;
}

const CallCenterContext = createContext<CallCenterContextType | null>(null);

export const useCallCenter = () => {
  const context = useContext(CallCenterContext);
  if (!context) {
    throw new Error('useCallCenter must be used within CallCenterLayout');
  }
  return context;
};

interface CallCenterLayoutProps {
  children: React.ReactNode;
}

export default function CallCenterLayout({ children }: CallCenterLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sipStatus, setSipStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>(
    'disconnected'
  );
  const [activeExtension, setActiveExtension] = useState<string | null>('9999');
  const [activeCallCount, setActiveCallCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved extension from localStorage
  useEffect(() => {
    const savedExtension = localStorage.getItem('callcenter_active_extension');
    if (savedExtension) {
      setActiveExtension(savedExtension);
    }
  }, []);

  const updateSipStatus = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => {
    setSipStatus(status);
    // Update system health based on SIP status
    if (status === 'error') {
      setSystemHealth('error');
    } else if (status === 'connecting') {
      setSystemHealth('warning');
    } else if (status === 'connected') {
      setSystemHealth('healthy');
    }
  };

  const updateActiveExtension = (extension: string | null) => {
    setActiveExtension(extension);
    if (extension) {
      localStorage.setItem('callcenter_active_extension', extension);
    } else {
      localStorage.removeItem('callcenter_active_extension');
    }
  };

  const updateActiveCallCount = (count: number) => {
    setActiveCallCount(count);
  };

  const getSipStatusIcon = () => {
    switch (sipStatus) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getSipStatusText = () => {
    switch (sipStatus) {
      case 'connected':
        return 'SIP Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const handleEmergency = () => {
    // Handle emergency button click
    if (
      window.confirm(
        'Are you sure you want to trigger emergency mode? This will end all active calls and alert supervisors.'
      )
    ) {
      // In a real implementation, this would trigger emergency protocols
      console.log('Emergency mode activated');
      alert('Emergency mode activated. Supervisors have been notified.');
    }
  };

  const contextValue: CallCenterContextType = {
    sipStatus,
    activeExtension,
    activeCallCount,
    systemHealth,
    updateSipStatus,
    updateActiveExtension,
    updateActiveCallCount,
  };

  return (
    <CallCenterContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Call Center Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Quản lý tổng thể hệ thống call center - Extensions, Users, Calls & Settings
              </p>
            </div>
          </div>
        </div>
        {/* Enhanced Status Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* System Title */}
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Call Center System
                </span>
              </div>

              {/* SIP Status */}
              <div className="flex items-center space-x-2">
                {getSipStatusIcon()}
                <span
                  className={`text-xs font-medium ${
                    sipStatus === 'connected'
                      ? 'text-green-600 dark:text-green-400'
                      : sipStatus === 'connecting'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : sipStatus === 'error'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {getSipStatusText()}
                </span>
              </div>

              {/* Active Calls Indicator */}
              {activeCallCount > 0 && (
                <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                  <PhoneIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {activeCallCount} Active Call{activeCallCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* System Health */}
              <div className="flex items-center space-x-2">
                <SignalIcon
                  className={`h-4 w-4 ${
                    systemHealth === 'healthy'
                      ? 'text-green-500'
                      : systemHealth === 'warning'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  System {systemHealth}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Current Time */}
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>{currentTime.toLocaleString('vi-VN')}</span>
              </div>

              {/* Active Extension */}
              {activeExtension && (
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ext:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activeExtension}
                  </span>
                </div>
              )}

              {/* Emergency Button */}
              <button
                onClick={handleEmergency}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
              >
                <ExclamationTriangleIcon className="h-3 w-3" />
                <span>Emergency</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Audio Elements for SIP Calling */}
        <audio id="remoteAudio" autoPlay />
        <audio id="localAudio" muted />

        {/* Global Call Notification Area */}
        <div
          id="call-notifications"
          className="fixed top-4 right-4 z-50 space-y-2"
          style={{ pointerEvents: 'none' }}
        >
          {/* Call notifications will be inserted here dynamically */}
        </div>
      </div>
    </CallCenterContext.Provider>
  );
}

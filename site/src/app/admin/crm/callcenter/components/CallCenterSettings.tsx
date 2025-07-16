'use client';

import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  ServerIcon,
  PhoneIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { type SIPConfig } from '../types/callcenter.types';

interface CallCenterSettingsConfig {
  recordingEnabled: boolean;
  autoAnswer: boolean;
  callTimeout: number;
  maxCallDuration: number;
  notificationsEnabled: boolean;
}

interface SettingsProps {
  onConfigChange?: (config: SIPConfig) => void;
}

export default function CallCenterSettings({ onConfigChange }: SettingsProps) {
  const [sipConfig, setSipConfig] = useState<SIPConfig>({
    uri: 'sip:9999@tazaspa102019',
    password: 'NtRrcSl8Zp',
    ws_servers: 'wss://pbx01.onepos.vn:5000',
    display_name: 'Call Center Agent'
  });

  const [settings, setSettings] = useState<CallCenterSettingsConfig>({
    recordingEnabled: true,
    autoAnswer: false,
    callTimeout: 30,
    maxCallDuration: 3600,
    notificationsEnabled: true
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('callcenter_sip_config');
    const savedSettings = localStorage.getItem('callcenter_settings');
    
    if (savedConfig) {
      try {
        setSipConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading SIP config:', error);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSipConfigChange = (field: keyof SIPConfig, value: string) => {
    setSipConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field: keyof CallCenterSettingsConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would test the WebSocket connection
      const isValid = sipConfig.uri && sipConfig.password && sipConfig.ws_servers;
      
      if (isValid) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('callcenter_sip_config', JSON.stringify(sipConfig));
      localStorage.setItem('callcenter_settings', JSON.stringify(settings));
      
      // Notify parent component
      onConfigChange?.(sipConfig);
      
      // Show success message
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset to default settings? This will overwrite your current configuration.')) {
      setSipConfig({
        uri: 'sip:9999@tazaspa102019',
        password: 'NtRrcSl8Zp',
        ws_servers: 'wss://pbx01.onepos.vn:5000',
        display_name: 'Call Center Agent'
      });
      
      setSettings({
        recordingEnabled: true,
        autoAnswer: false,
        callTimeout: 30,
        maxCallDuration: 3600,
        notificationsEnabled: true
      });
      
      setConnectionStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Call Center Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure SIP connection and call center preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveConfiguration}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIP Configuration */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ServerIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SIP Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SIP URI
              </label>
              <input
                type="text"
                value={sipConfig.uri}
                onChange={(e) => handleSipConfigChange('uri', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="sip:user@domain"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: sip:extension@domain
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={sipConfig.password}
                onChange={(e) => handleSipConfigChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="SIP password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WebSocket Server
              </label>
              <input
                type="text"
                value={sipConfig.ws_servers}
                onChange={(e) => handleSipConfigChange('ws_servers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="wss://domain:port"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                WebSocket server URL for SIP over WebRTC
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={sipConfig.display_name || ''}
                onChange={(e) => handleSipConfigChange('display_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Agent Name"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingConnection ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </button>
              
              {connectionStatus === 'success' && (
                <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Connection successful!</span>
                </div>
              )}
              
              {connectionStatus === 'error' && (
                <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Connection failed. Please check your settings.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call Center Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Call Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Call Recording
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically record all calls
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.recordingEnabled}
                onChange={(e) => handleSettingsChange('recordingEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto Answer
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically answer incoming calls
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAnswer}
                onChange={(e) => handleSettingsChange('autoAnswer', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show call notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Call Timeout (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={settings.callTimeout}
                onChange={(e) => handleSettingsChange('callTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Time to wait before timing out unanswered calls
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Call Duration (seconds)
              </label>
              <input
                type="number"
                min="60"
                max="7200"
                value={settings.maxCallDuration}
                onChange={(e) => handleSettingsChange('maxCallDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum duration for a single call (0 = unlimited)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Configuration Help</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• Make sure your SIP server supports WebRTC (WebSocket transport)</p>
          <p>• Test your connection before making calls</p>
          <p>• Contact your system administrator for SIP credentials</p>
          <p>• Browser must have microphone permissions for calling</p>
        </div>
      </div>
    </div>
  );
}

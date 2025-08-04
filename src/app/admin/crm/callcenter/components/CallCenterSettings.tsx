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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài Đặt Tổng Đài</h1>
        <p className="text-gray-600 dark:text-gray-400">Cấu hình kết nối SIP và tùy chọn tổng đài</p>
      </div>
      <div className="flex space-x-3">
        <button
        onClick={resetToDefaults}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
        Khôi Phục Mặc Định
        </button>
        <button
        onClick={saveConfiguration}
        disabled={isSaving}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {isSaving ? 'Đang Lưu...' : 'Lưu Cài Đặt'}
        </button>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SIP Configuration */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
        <ServerIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cấu Hình SIP</h2>
        </div>
        
        <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URI SIP
          </label>
          <input
          type="text"
          value={sipConfig.uri}
          onChange={(e) => handleSipConfigChange('uri', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="sip:user@domain"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Định dạng: sip:extension@domain
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mật Khẩu
          </label>
          <input
          type="password"
          value={sipConfig.password}
          onChange={(e) => handleSipConfigChange('password', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Mật khẩu SIP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Máy Chủ WebSocket
          </label>
          <input
          type="text"
          value={sipConfig.ws_servers}
          onChange={(e) => handleSipConfigChange('ws_servers', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="wss://domain:port"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          URL máy chủ WebSocket cho SIP qua WebRTC
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tên Hiển Thị (Tùy chọn)
          </label>
          <input
          type="text"
          value={sipConfig.display_name || ''}
          onChange={(e) => handleSipConfigChange('display_name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Tên Nhân Viên"
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
            Đang Kiểm Tra Kết Nối...
            </>
          ) : (
            <>
            <PhoneIcon className="h-4 w-4 mr-2" />
            Kiểm Tra Kết Nối
            </>
          )}
          </button>
          
          {connectionStatus === 'success' && (
          <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Kết nối thành công!</span>
          </div>
          )}
          
          {connectionStatus === 'error' && (
          <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Kết nối thất bại. Vui lòng kiểm tra lại cài đặt.</span>
          </div>
          )}
        </div>
        </div>
      </div>

      {/* Call Center Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
        <CogIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cài Đặt Cuộc Gọi</h2>
        </div>
        
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ghi Âm Cuộc Gọi
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tự động ghi âm tất cả cuộc gọi
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
            Tự Động Trả Lời
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tự động trả lời cuộc gọi đến
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
            Thông Báo
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hiển thị thông báo cuộc gọi
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
          Thời Gian Chờ (giây)
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
          Thời gian chờ trước khi hết thời gian cuộc gọi chưa trả lời
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Thời Gian Gọi Tối Đa (giây)
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
          Thời gian tối đa cho một cuộc gọi (0 = không giới hạn)
          </p>
        </div>
        </div>
      </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Hướng Dẫn Cấu Hình</h3>
      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <p>• Đảm bảo máy chủ SIP của bạn hỗ trợ WebRTC (giao thức WebSocket)</p>
        <p>• Kiểm tra kết nối trước khi thực hiện cuộc gọi</p>
        <p>• Liên hệ quản trị viên hệ thống để được cấp thông tin đăng nhập SIP</p>
        <p>• Trình duyệt phải được cấp quyền truy cập microphone để thực hiện cuộc gọi</p>
      </div>
      </div>
    </div>
  );
}

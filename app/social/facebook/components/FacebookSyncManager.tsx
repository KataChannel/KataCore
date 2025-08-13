'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Zap, 
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Activity,
  Database
} from 'lucide-react';

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncTypes: string[];
  notifications: boolean;
  realTime: boolean;
}

interface SyncLog {
  id: string;
  type: string;
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
  duration?: number;
  itemsProcessed?: number;
}

export default function FacebookSyncManager() {
  const [config, setConfig] = useState<SyncConfig>({
    autoSync: false,
    syncInterval: 15,
    syncTypes: ['comments', 'messages'],
    notifications: true,
    realTime: false
  });
  
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [nextSync, setNextSync] = useState<Date | null>(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [activeConnections, setActiveConnections] = useState(0);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('facebook-sync-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Load sync logs
    loadSyncLogs();

    // Setup auto-sync interval
    let interval: NodeJS.Timeout;
    if (config.autoSync) {
      interval = setInterval(() => {
        runAutoSync();
      }, config.syncInterval * 60 * 1000);
      
      // Set next sync time
      setNextSync(new Date(Date.now() + config.syncInterval * 60 * 1000));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.autoSync, config.syncInterval]);

  const saveConfig = (newConfig: SyncConfig) => {
    setConfig(newConfig);
    localStorage.setItem('facebook-sync-config', JSON.stringify(newConfig));
  };

  const loadSyncLogs = async () => {
    try {
      // Load recent sync logs from API or localStorage
      const savedLogs = localStorage.getItem('facebook-sync-logs');
      if (savedLogs) {
        setSyncLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const addSyncLog = (log: Omit<SyncLog, 'id' | 'timestamp'>) => {
    const newLog: SyncLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setSyncLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
      localStorage.setItem('facebook-sync-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const runAutoSync = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const startTime = Date.now();
    
    addSyncLog({
      type: 'auto',
      status: 'running',
      message: 'Bắt đầu đồng bộ tự động...'
    });

    try {
      let totalItems = 0;
      
      for (const syncType of config.syncTypes) {
        const response = await fetch('/api/social/facebook/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: syncType })
        });

        if (!response.ok) {
          throw new Error(`Lỗi đồng bộ ${syncType}`);
        }

        const result = await response.json();
        totalItems += result.result?.synced || 0;
      }

      const duration = Date.now() - startTime;
      
      addSyncLog({
        type: 'auto',
        status: 'success',
        message: `Đồng bộ thành công ${config.syncTypes.join(', ')}`,
        duration,
        itemsProcessed: totalItems
      });

      // Show notification if enabled
      if (config.notifications && 'Notification' in window) {
        new Notification('Facebook Sync', {
          body: `Đồng bộ thành công ${totalItems} items`,
          icon: '/favicon.ico'
        });
      }

      // Set next sync time
      setNextSync(new Date(Date.now() + config.syncInterval * 60 * 1000));
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      addSyncLog({
        type: 'auto',
        status: 'error',
        message: `Lỗi đồng bộ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runManualSync = async (type: string) => {
    setIsRunning(true);
    const startTime = Date.now();
    
    addSyncLog({
      type: 'manual',
      status: 'running',
      message: `Đồng bộ thủ công ${type}...`
    });

    try {
      const response = await fetch('/api/social/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error(`Lỗi đồng bộ ${type}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;
      
      addSyncLog({
        type: 'manual',
        status: 'success',
        message: `Đồng bộ thành công ${type}`,
        duration,
        itemsProcessed: result.result?.synced || 0
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      addSyncLog({
        type: 'manual',
        status: 'error',
        message: `Lỗi đồng bộ ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleRealTimeSync = async () => {
    try {
      if (!config.realTime) {
        // Enable real-time sync
        setRealTimeConnected(true);
        setActiveConnections(1);
        
        addSyncLog({
          type: 'realtime',
          status: 'success',
          message: 'Kết nối real-time đã được bật'
        });
      } else {
        // Disable real-time sync
        setRealTimeConnected(false);
        setActiveConnections(0);
        
        addSyncLog({
          type: 'realtime',
          status: 'success',
          message: 'Kết nối real-time đã được tắt'
        });
      }
      
      saveConfig({ ...config, realTime: !config.realTime });
    } catch (error) {
      addSyncLog({
        type: 'realtime',
        status: 'error',
        message: `Lỗi real-time: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      saveConfig({ ...config, notifications: permission === 'granted' });
    }
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatNextSync = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Facebook Sync Manager
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${realTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {realTimeConnected ? `Connected (${activeConnections})` : 'Offline'}
          </span>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cấu hình đồng bộ</h3>
          
          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Đồng bộ tự động</span>
            <button
              onClick={() => saveConfig({ ...config, autoSync: !config.autoSync })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoSync ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoSync ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sync Interval */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Khoảng thời gian (phút)</span>
            <select
              value={config.syncInterval}
              onChange={(e) => saveConfig({ ...config, syncInterval: parseInt(e.target.value) })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 phút</option>
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>1 giờ</option>
            </select>
          </div>

          {/* Sync Types */}
          <div>
            <span className="text-sm text-gray-700 dark:text-gray-300 block mb-2">Loại đồng bộ</span>
            <div className="space-y-2">
              {['comments', 'messages', 'posts', 'pages'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.syncTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        saveConfig({ ...config, syncTypes: [...config.syncTypes, type] });
                      } else {
                        saveConfig({ ...config, syncTypes: config.syncTypes.filter(t => t !== type) });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Thông báo</span>
            <button
              onClick={() => {
                if (!config.notifications) {
                  requestNotificationPermission();
                } else {
                  saveConfig({ ...config, notifications: false });
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thao tác nhanh</h3>
          
          {/* Manual Sync Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {['comments', 'messages', 'posts', 'pages'].map((type) => (
              <button
                key={type}
                onClick={() => runManualSync(type)}
                disabled={isRunning}
                className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          {/* Real-time Sync */}
          <button
            onClick={toggleRealTimeSync}
            className={`w-full px-4 py-3 rounded-md font-medium flex items-center justify-center space-x-2 ${
              config.realTime 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>{config.realTime ? 'Tắt' : 'Bật'} Real-time Sync</span>
          </button>

          {/* Status Info */}
          {config.autoSync && nextSync && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Đồng bộ tiếp theo: {formatNextSync(nextSync)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Logs */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lịch sử đồng bộ</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {syncLogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">Chưa có lịch sử đồng bộ</p>
          ) : (
            syncLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  {log.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                  {log.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                  {log.status === 'running' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mt-0.5" />}
                  
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                      {log.duration && <span>Thời gian: {formatDuration(log.duration)}</span>}
                      {log.itemsProcessed && <span>Items: {log.itemsProcessed}</span>}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  log.type === 'auto' ? 'bg-blue-100 text-blue-800' :
                  log.type === 'manual' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {log.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

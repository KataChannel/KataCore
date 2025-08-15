import { useState, useCallback, useEffect } from 'react';
import { FacebookApiService } from '../services/FacebookApiService';
import { FacebookApiConfig } from '../types';

export const useFacebookApi = () => {
  // Initialize with empty config
  const defaultConfig: FacebookApiConfig = {
    source: 'user_input',
    accessToken: '',
    appId: '',
    appSecret: ''
  };

  const [apiService] = useState(() => new FacebookApiService(defaultConfig));
  const [config, setConfig] = useState<FacebookApiConfig>(defaultConfig);
  const [isConfigured, setIsConfigured] = useState(false);

  const updateConfig = useCallback((newConfig: Partial<FacebookApiConfig>) => {
    apiService.updateConfig(newConfig);
    const updatedConfig = apiService.getConfig();
    setConfig(updatedConfig);
    setIsConfigured(!!(updatedConfig.accessToken && (updatedConfig.appId || updatedConfig.apiKey)));
  }, [apiService]);

  const refreshConfig = useCallback(() => {
    const currentConfig = apiService.getConfig();
    setConfig(currentConfig);
    setIsConfigured(!!(currentConfig.accessToken && (currentConfig.appId || currentConfig.apiKey)));
  }, [apiService]);

  // Check for config changes on mount
  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  return {
    apiService,
    config,
    isConfigured,
    updateConfig,
    refreshConfig
  };
};

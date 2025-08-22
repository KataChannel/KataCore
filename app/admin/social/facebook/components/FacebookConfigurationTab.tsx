'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/tailwind-ui';
import { TailwindCard } from '@/components/ui/TailwindCard';
import { usePermissions } from '@/hooks/usePermissions';

interface FacebookConfigProps {
  onConfigUpdate: (config: FacebookConfig) => void;
}

interface FacebookConfig {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
  longLivedToken: string;
  apiVersion: string;
  source: {
    appId: 'env' | 'localStorage' | 'user';
    appSecret: 'env' | 'localStorage' | 'user';
    shortLivedToken: 'env' | 'localStorage' | 'user';
    longLivedToken: 'env' | 'localStorage' | 'user';
    apiVersion: 'env' | 'localStorage' | 'user';
  };
}

export default function FacebookConfigurationTab({ onConfigUpdate }: FacebookConfigProps) {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  const [config, setConfig] = useState<FacebookConfig>({
    appId: '',
    appSecret: '',
    shortLivedToken: '',
    longLivedToken: '',
    apiVersion: 'v23.0',
    source: {
      appId: 'env',
      appSecret: 'env',
      shortLivedToken: 'env',
      longLivedToken: 'env',
      apiVersion: 'env'
    }
  });

  const [isEditing, setIsEditing] = useState({
    appId: false,
    appSecret: false,
    shortLivedToken: false,
    longLivedToken: false,
    apiVersion: false
  });

  const [showSecrets, setShowSecrets] = useState(false);

  // Permission check
  const canConfigureFacebook = hasPermission('admin.social.facebook.config');
  
  // Define loadConfiguration function BEFORE useEffect
  const loadConfiguration = () => {
    const newConfig: FacebookConfig = {
      appId: '',
      appSecret: '',
      shortLivedToken: '',
      longLivedToken: '',
      apiVersion: 'v23.0',
      source: {
        appId: 'env',
        appSecret: 'env',
        shortLivedToken: 'env',
        longLivedToken: 'env',
        apiVersion: 'env'
      }
    };

    // Load from environment variables first (highest priority)
    if (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      newConfig.appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      newConfig.source.appId = 'env';
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET) {
      newConfig.appSecret = process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET;
      newConfig.source.appSecret = 'env';
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN) {
      newConfig.shortLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN;
      newConfig.source.shortLivedToken = 'env';
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN) {
      newConfig.longLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
      newConfig.source.longLivedToken = 'env';
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION) {
      newConfig.apiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION;
      newConfig.source.apiVersion = 'env';
    }

    // Load from localStorage (fallback)
    if (typeof window !== 'undefined') {
      if (!newConfig.appId) {
        const storedAppId = localStorage.getItem('facebook_app_id');
        if (storedAppId) {
          newConfig.appId = storedAppId;
          newConfig.source.appId = 'localStorage';
        }
      }
      if (!newConfig.appSecret) {
        const storedAppSecret = localStorage.getItem('facebook_app_secret');
        if (storedAppSecret) {
          newConfig.appSecret = storedAppSecret;
          newConfig.source.appSecret = 'localStorage';
        }
      }
      if (!newConfig.shortLivedToken) {
        const storedToken = localStorage.getItem('facebook_access_token');
        if (storedToken) {
          newConfig.shortLivedToken = storedToken;
          newConfig.source.shortLivedToken = 'localStorage';
        }
      }
      if (!newConfig.longLivedToken) {
        const storedLongToken = localStorage.getItem('facebook_long_lived_token');
        if (storedLongToken) {
          newConfig.longLivedToken = storedLongToken;
          newConfig.source.longLivedToken = 'localStorage';
        }
      }
      if (newConfig.apiVersion === 'v23.0') {
        const storedVersion = localStorage.getItem('facebook_api_version');
        if (storedVersion) {
          newConfig.apiVersion = storedVersion;
          newConfig.source.apiVersion = 'localStorage';
        }
      }
    }

    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  if (!canConfigureFacebook) {
    return (
      <TailwindCard>
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You don't have permission to configure Facebook settings.
          </p>
        </div>
      </TailwindCard>
    );
  }

  const handleInputChange = (field: keyof FacebookConfig, value: string) => {
    const newConfig = {
      ...config,
      [field]: value,
      source: {
        ...config.source,
        [field]: 'user' as const
      }
    };
    setConfig(newConfig);
  };

  const saveToLocalStorage = (field: keyof FacebookConfig, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`facebook_${field}`, value);
    }
    onConfigUpdate(config);
  };

  const maskValue = (value: string, show: boolean) => {
    if (!value) return '';
    if (show) return value;
    return value.substring(0, 8) + '••••••••';
  };

  const getSourceBadge = (source: 'env' | 'localStorage' | 'user') => {
    const colors = {
      env: 'bg-green-100 text-green-800',
      localStorage: 'bg-yellow-100 text-yellow-800', 
      user: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[source]}`}>
        {source === 'env' ? 'ENV' : source === 'localStorage' ? 'LOCAL' : 'USER'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <TailwindCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Configuration Status</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? '🙈 Hide' : '👁️ Show'} Secrets
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">App ID</span>
              <div className="flex items-center gap-2">
                {getSourceBadge(config.source.appId)}
                <span className={config.appId ? 'text-green-600' : 'text-red-600'}>
                  {config.appId ? '✅' : '❌'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">App Secret</span>
              <div className="flex items-center gap-2">
                {getSourceBadge(config.source.appSecret)}
                <span className={config.appSecret ? 'text-green-600' : 'text-red-600'}>
                  {config.appSecret ? '✅' : '❌'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Short Live Access Token</span>
              <div className="flex items-center gap-2">
                {getSourceBadge(config.source.shortLivedToken)}
                <span className={config.shortLivedToken ? 'text-green-600' : 'text-red-600'}>
                  {config.shortLivedToken ? '✅' : '❌'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Long Live Access Token</span>
              <div className="flex items-center gap-2">
                {getSourceBadge(config.source.longLivedToken)}
                <span className={config.longLivedToken ? 'text-green-600' : 'text-red-600'}>
                  {config.longLivedToken ? '✅' : '❌'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">API Version</span>
              <div className="flex items-center gap-2">
                {getSourceBadge(config.source.apiVersion)}
                <span className="text-blue-600">
                  {config.apiVersion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </TailwindCard>

      {/* Configuration Fields */}
      <TailwindCard>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Facebook API Configuration</h3>
          
          <div className="space-y-4">
            {/* App ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook App ID
              </label>
              <div className="flex items-center gap-2">
                {isEditing.appId ? (
                  <>
                    <input
                      type="text"
                      value={config.appId}
                      onChange={(e) => handleInputChange('appId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Facebook App ID"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        saveToLocalStorage('appId', config.appId);
                        setIsEditing({...isEditing, appId: false});
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, appId: false})}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {config.appId || 'Not configured'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, appId: true})}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* App Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook App Secret
              </label>
              <div className="flex items-center gap-2">
                {isEditing.appSecret ? (
                  <>
                    <input
                      type="password"
                      value={config.appSecret}
                      onChange={(e) => handleInputChange('appSecret', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Facebook App Secret"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        saveToLocalStorage('appSecret', config.appSecret);
                        setIsEditing({...isEditing, appSecret: false});
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, appSecret: false})}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {config.appSecret ? maskValue(config.appSecret, showSecrets) : 'Not configured'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, appSecret: true})}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Short Live Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <div className="flex items-center gap-2">
                {isEditing.shortLivedToken ? (
                  <>
                    <input
                      type="password"
                      value={config.shortLivedToken}
                      onChange={(e) => handleInputChange('shortLivedToken', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Facebook Access Token"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        saveToLocalStorage('shortLivedToken', config.shortLivedToken);
                        setIsEditing({...isEditing, shortLivedToken: false});
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, shortLivedToken: false})}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {config.shortLivedToken ? maskValue(config.shortLivedToken, showSecrets) : 'Not configured'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, shortLivedToken: true})}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
            {/* Long Live Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long Live Access Token
              </label>
              <div className="flex items-center gap-2">
                {isEditing.longLivedToken ? ( 
                  <>
                    <input
                      type="password"
                      value={config.longLivedToken}
                      onChange={(e) => handleInputChange('longLivedToken', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Facebook Long Live Access Token"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        saveToLocalStorage('longLivedToken', config.longLivedToken);
                        setIsEditing({...isEditing, longLivedToken: false});
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, longLivedToken: false})}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {config.longLivedToken ? maskValue(config.longLivedToken, showSecrets) : 'Not configured'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, longLivedToken: true})}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
            

            {/* API Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Version
              </label>
              <div className="flex items-center gap-2">
                {isEditing.apiVersion ? (
                  <>
                    <select
                      value={config.apiVersion}
                      onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="v23.0">v23.0 (Latest)</option>
                      <option value="v22.0">v22.0</option>
                      <option value="v21.0">v21.0</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={() => {
                        saveToLocalStorage('apiVersion', config.apiVersion);
                        setIsEditing({...isEditing, apiVersion: false});
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, apiVersion: false})}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {config.apiVersion}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing({...isEditing, apiVersion: true})}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement connection test
                console.log('Testing Facebook API connection...');
              }}
              className="w-full"
            >
              🔗 Test Connection
            </Button>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}

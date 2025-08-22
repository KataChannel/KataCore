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
    if (process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN) {
      newConfig.shortLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
      newConfig.source.shortLivedToken = 'env';
    }
    if (process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION) {
      newConfig.apiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION;
      newConfig.source.apiVersion = 'env';
    }

    // Load from localStorage (fallback)
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

    // Fallback to localStorage if not in environment
    if (typeof window !== 'undefined') {
      if (!newConfig.appId) {
        const storedAppId = localStorage.getItem('NEXT_PUBLIC_FACEBOOK_APP_ID');
        if (storedAppId) {
          newConfig.appId = storedAppId;
          newConfig.source.appId = 'localStorage';
        }
      }

      if (!newConfig.appSecret) {
        const storedAppSecret = localStorage.getItem('NEXT_PUBLIC_FACEBOOK_APP_SECRET');
        if (storedAppSecret) {
          newConfig.appSecret = storedAppSecret;
          newConfig.source.appSecret = 'localStorage';
        }
      }

      if (!newConfig.shortLivedToken) {
        const storedShortToken = localStorage.getItem('NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN');
        if (storedShortToken) {
          newConfig.shortLivedToken = storedShortToken;
          newConfig.source.shortLivedToken = 'localStorage';
        }
      }

      if (!newConfig.longLivedToken) {
        const storedLongToken = localStorage.getItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN');
        if (storedLongToken) {
          newConfig.longLivedToken = storedLongToken;
          newConfig.source.longLivedToken = 'localStorage';
        }
      }

      if (!newConfig.apiVersion || newConfig.apiVersion === 'v23.0') {
        const storedApiVersion = localStorage.getItem('NEXT_PUBLIC_FACEBOOK_API_VERSION');
        if (storedApiVersion) {
          newConfig.apiVersion = storedApiVersion;
          newConfig.source.apiVersion = 'localStorage';
        }
      }
    }

    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

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

  const handleSave = (field: keyof FacebookConfig) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`NEXT_PUBLIC_FACEBOOK_${field.toUpperCase()}`, config[field] as string);
    }
    setIsEditing(prev => ({ ...prev, [field]: false }));
    onConfigUpdate(config);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'env': return 'bg-green-100 text-green-800';
      case 'localStorage': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const maskToken = (token: string) => {
    if (!token || showSecrets) return token;
    if (token.length <= 8) return token;
    return token.substring(0, 8) + '...' + token.substring(token.length - 8);
  };

  const ConfigField = ({ 
    label, 
    field, 
    type = 'text',
    placeholder 
  }: { 
    label: string; 
    field: keyof Omit<FacebookConfig, 'source'>; 
    type?: string;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getSourceBadgeColor(config.source[field as keyof typeof config.source])}`}>
            {config.source[field as keyof typeof config.source]}
          </span>
          {!isEditing[field as keyof typeof isEditing] && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(prev => ({ ...prev, [field]: true }))}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {isEditing[field as keyof typeof isEditing] ? (
        <div className="flex gap-2">
          <input
            type={type}
            value={config[field] as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave(field)}
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(prev => ({ ...prev, [field]: false }));
              loadConfiguration(); // Reset to original value
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
          {field.includes('Token') || field.includes('Secret') 
            ? maskToken(config[field] as string) || <span className="text-gray-400">Not configured</span>
            : (config[field] as string) || <span className="text-gray-400">Not configured</span>
          }
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facebook Configuration</h2>
          <p className="text-gray-600">Configure Facebook API credentials and settings</p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSecrets}
              onChange={(e) => setShowSecrets(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Show secrets</span>
          </label>
          
          <Button
            variant="outline"
            onClick={loadConfiguration}
          >
            Reload Config
          </Button>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Authentication Settings */}
        <TailwindCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
            <div className="space-y-4">
              <ConfigField
                label="Facebook App ID"
                field="appId"
                placeholder="Enter your Facebook App ID"
              />
              
              <ConfigField
                label="Facebook App Secret"
                field="appSecret"
                type="password"
                placeholder="Enter your Facebook App Secret"
              />
              
              <ConfigField
                label="API Version"
                field="apiVersion"
                placeholder="e.g., v23.0"
              />
            </div>
          </div>
        </TailwindCard>

        {/* Token Settings */}
        <TailwindCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Tokens</h3>
            <div className="space-y-4">
              <ConfigField
                label="Short-Lived Token"
                field="shortLivedToken"
                type="password"
                placeholder="Enter short-lived access token"
              />
              
              <ConfigField
                label="Long-Lived Token"
                field="longLivedToken"
                type="password"
                placeholder="Long-lived token (auto-generated or manual)"
              />
            </div>
          </div>
        </TailwindCard>
      </div>

      {/* Configuration Status */}
      <TailwindCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'App ID', value: !!config.appId },
              { label: 'App Secret', value: !!config.appSecret },
              { label: 'Short Token', value: !!config.shortLivedToken },
              { label: 'Long Token', value: !!config.longLivedToken },
              { label: 'API Version', value: !!config.apiVersion }
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                  value ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="text-sm text-gray-600">{label}</div>
                <div className={`text-xs font-medium ${
                  value ? 'text-green-600' : 'text-red-600'
                }`}>
                  {value ? 'Configured' : 'Missing'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>Configuration Priority:</strong> Environment Variables → localStorage → User Input
            </div>
          </div>
        </div>
      </TailwindCard>
    </div>
  );
}

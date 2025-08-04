'use client';

import React, { useEffect } from 'react';
import { AUTH_CONFIG, getProviderConfig } from '@/lib/auth/auth-config';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'apple' | 'microsoft';
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
}

export default function SocialLoginButton({
  provider,
  onSuccess,
  onError,
  disabled = false,
  text,
  size = 'medium',
  variant = 'button',
}: SocialLoginButtonProps) {
  const config = getProviderConfig(provider);

  useEffect(() => {
    // Load the appropriate SDK when component mounts
    switch (provider) {
      case 'google':
        loadGoogleSDK();
        break;
      case 'facebook':
        loadFacebookSDK();
        break;
      case 'apple':
        loadAppleSDK();
        break;
      case 'microsoft':
        loadMicrosoftSDK();
        break;
    }
  }, [provider]);

  const loadGoogleSDK = () => {
    if (typeof window === 'undefined' || window.google) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: 'clientId' in config ? config.clientId! : '',
        callback: handleGoogleResponse,
      });
    };
    document.head.appendChild(script);
  };

  const loadFacebookSDK = () => {
    if (typeof window === 'undefined' || window.FB) return;

    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: 'appId' in config ? config.appId! : '',
        cookie: true,
        xfbml: true,
        version: 'version' in config ? config.version : 'v18.0',
      });
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.head.appendChild(script);
  };

  const loadAppleSDK = () => {
    if (typeof window === 'undefined' || window.AppleID) return;

    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: 'clientId' in config ? config.clientId! : '',
        scope: config.scopes?.join(' ') || 'email name',
        redirectURI: 'redirectUri' in config ? config.redirectUri! : '',
        usePopup: true,
      });
    };
    document.head.appendChild(script);
  };

  const loadMicrosoftSDK = () => {
    // Microsoft MSAL.js would be loaded here
    // For now, we'll implement a basic version
    console.log('Microsoft SDK loading...');
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await result.json();
      if (result.ok) {
        onSuccess(data);
      } else {
        onError(data.error || 'Google login failed');
      }
    } catch (error) {
      onError('Google login failed');
    }
  };

  const handleClick = async () => {
    if (disabled || !config.enabled) return;

    try {
      switch (provider) {
        case 'google':
          window.google?.accounts.id.prompt();
          break;
        case 'facebook':
          handleFacebookLogin();
          break;
        case 'apple':
          handleAppleLogin();
          break;
        case 'microsoft':
          handleMicrosoftLogin();
          break;
      }
    } catch (error: any) {
      onError(error.message || `${provider} login failed`);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      onError('Facebook SDK not loaded');
      return;
    }

    window.FB.login(async (response: any) => {
      if (response.authResponse) {
        try {
          const result = await fetch('/api/auth/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.authResponse.accessToken }),
          });

          const data = await result.json();
          if (result.ok) {
            onSuccess(data);
          } else {
            onError(data.error || 'Facebook login failed');
          }
        } catch (error) {
          onError('Facebook login failed');
        }
      } else {
        onError('Facebook login was cancelled');
      }
    }, { scope: config.scopes?.join(',') || 'email' });
  };

  const handleAppleLogin = async () => {
    if (!window.AppleID) {
      onError('Apple ID SDK not loaded');
      return;
    }

    try {
      const data = await window.AppleID.auth.signIn();
      const result = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.authorization.id_token }),
      });

      const responseData = await result.json();
      if (result.ok) {
        onSuccess(responseData);
      } else {
        onError(responseData.error || 'Apple login failed');
      }
    } catch (error: any) {
      if (error.error !== 'popup_closed_by_user') {
        onError('Apple login failed');
      }
    }
  };

  const handleMicrosoftLogin = () => {
    onError('Microsoft login is not yet implemented');
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      case 'microsoft':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
          </svg>
        );
    }
  };

  const getProviderName = () => {
    switch (provider) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'apple': return 'Apple';
      case 'microsoft': return 'Microsoft';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'px-3 py-2 text-sm';
      case 'large': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  if (!config.enabled) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses()}`}
        title={`Đăng nhập bằng ${getProviderName()}`}
      >
        {getProviderIcon()}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full inline-flex justify-center items-center border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses()}`}
    >
      <span className="mr-2">{getProviderIcon()}</span>
      {text || `Đăng nhập bằng ${getProviderName()}`}
    </button>
  );
}

// Enhanced Social Login Panel Component
interface SocialLoginPanelProps {
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  title?: string;
  variant?: 'buttons' | 'icons';
  size?: 'small' | 'medium' | 'large';
}

export function SocialLoginPanel({
  onSuccess,
  onError,
  disabled = false,
  title = 'Hoặc đăng nhập bằng',
  variant = 'icons',
  size = 'medium',
}: SocialLoginPanelProps) {
  const enabledProviders = Object.entries(AUTH_CONFIG.socialProviders)
    .filter(([_, config]) => config.enabled)
    .map(([provider, _]) => provider as keyof typeof AUTH_CONFIG.socialProviders);

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{title}</span>
        </div>
      </div>

      <div className={`mt-6 ${variant === 'icons' ? `grid grid-cols-${enabledProviders.length} gap-3` : 'space-y-3'}`}>
        {enabledProviders.map((provider) => (
          <SocialLoginButton
            key={provider}
            provider={provider}
            onSuccess={onSuccess}
            onError={onError}
            disabled={disabled}
            size={size}
            variant={variant === 'buttons' ? 'button' : 'icon'}
          />
        ))}
      </div>
    </div>
  );
}

// Type declaration for window.fbAsyncInit
declare global {
  interface Window {
    fbAsyncInit?: () => void;
  }
}

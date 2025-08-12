// Utility functions for Facebook configuration management
// Handles priority: Environment Variables > localStorage
// Supports Long-Lived Token configuration

export interface FacebookConfig {
  pageId: string | null;
  accessToken: string | null;
  longLivedToken: string | null; // Added support for Long-Lived Token
  isLongLived: boolean; // Flag to indicate if current token is long-lived
  source: {
    pageId: 'environment' | 'localStorage' | 'none';
    accessToken: 'environment' | 'localStorage' | 'none';
    longLivedToken: 'environment' | 'localStorage' | 'none';
  };
}

/**
 * Get Facebook configuration with proper priority
 * Priority: Environment Variables > localStorage
 * Long-Lived Token takes priority over regular access token
 */
export function getFacebookConfig(): FacebookConfig {
  // Environment variables (highest priority)
  const envPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const envAccessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  const envLongLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
  
  // localStorage (lower priority)
  const localPageId = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID') 
    : null;
  const localAccessToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN') 
    : null;
  const localLongLivedToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN') 
    : null;
  
  // Determine final values and sources
  const finalPageId = envPageId || localPageId;
  const finalLongLivedToken = envLongLivedToken || localLongLivedToken;
  const finalAccessToken = envAccessToken || localAccessToken;
  
  // Priority: Long-Lived Token > Regular Access Token
  const effectiveToken = finalLongLivedToken || finalAccessToken;
  const isLongLived = !!finalLongLivedToken;
  
  return {
    pageId: finalPageId,
    accessToken: effectiveToken, // This will be the Long-Lived Token if available
    longLivedToken: finalLongLivedToken,
    isLongLived,
    source: {
      pageId: envPageId ? 'environment' : localPageId ? 'localStorage' : 'none',
      accessToken: envAccessToken ? 'environment' : localAccessToken ? 'localStorage' : 'none',
      longLivedToken: envLongLivedToken ? 'environment' : localLongLivedToken ? 'localStorage' : 'none'
    }
  };
}

/**
 * Get Facebook headers for API requests
 * Includes Long-Lived Token when available
 */
export function getFacebookHeaders(): Record<string, string> {
  const config = getFacebookConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (config.pageId) {
    headers['X-Facebook-Page-Id'] = config.pageId;
  }
  
  if (config.accessToken) {
    headers['X-Facebook-Access-Token'] = config.accessToken;
  }
  
  // Add Long-Lived Token indicator for debugging
  if (config.isLongLived) {
    headers['X-Facebook-Token-Type'] = 'long-lived';
  }
  
  return headers;
}

/**
 * Log Facebook configuration source for debugging
 * Includes Long-Lived Token information
 */
export function logFacebookConfigSource(): void {
  const config = getFacebookConfig();
  
  console.log('🔧 Facebook Configuration Source:', {
    pageId: config.source.pageId,
    accessToken: config.source.accessToken,
    longLivedToken: config.source.longLivedToken,
    hasPageId: !!config.pageId,
    hasAccessToken: !!config.accessToken,
    hasLongLivedToken: !!config.longLivedToken,
    isLongLived: config.isLongLived,
    tokenType: config.isLongLived ? 'Long-Lived Token (60 days)' : 'Regular Token (1-2 hours)'
  });
}

/**
 * Check if Facebook configuration is complete
 */
export function isFacebookConfigured(): boolean {
  const config = getFacebookConfig();
  return !!(config.pageId && config.accessToken);
}

/**
 * Check if Long-Lived Token is configured
 */
export function hasLongLivedToken(): boolean {
  const config = getFacebookConfig();
  return config.isLongLived;
}

/**
 * Get configuration status for UI display
 * Includes Long-Lived Token status
 */
export function getFacebookConfigStatus() {
  const envPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const envAccessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  const envLongLivedToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
  
  const localPageId = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID') 
    : null;
  const localAccessToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN') 
    : null;
  const localLongLivedToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN') 
    : null;
    
  const config = getFacebookConfig();
    
  return {
    environment: {
      pageId: !!envPageId,
      accessToken: !!envAccessToken,
      longLivedToken: !!envLongLivedToken
    },
    localStorage: {
      pageId: !!localPageId,
      accessToken: !!localAccessToken,
      longLivedToken: !!localLongLivedToken
    },
    current: {
      pageId: config.pageId,
      accessToken: config.accessToken,
      longLivedToken: config.longLivedToken,
      isLongLived: config.isLongLived,
      tokenType: config.isLongLived ? 'Long-Lived (60 days)' : 'Regular (1-2 hours)'
    }
  };
}

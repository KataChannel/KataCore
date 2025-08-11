// Utility functions for Facebook configuration management
// Handles priority: Environment Variables > localStorage

export interface FacebookConfig {
  pageId: string | null;
  accessToken: string | null;
  source: {
    pageId: 'environment' | 'localStorage' | 'none';
    accessToken: 'environment' | 'localStorage' | 'none';
  };
}

/**
 * Get Facebook configuration with proper priority
 * Priority: Environment Variables > localStorage
 */
export function getFacebookConfig(): FacebookConfig {
  // Environment variables (highest priority)
  const envPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const envAccessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  
  // localStorage (lower priority)
  const localPageId = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID') 
    : null;
  const localAccessToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN') 
    : null;
  
  // Determine final values and sources
  const finalPageId = envPageId || localPageId;
  const finalAccessToken = envAccessToken || localAccessToken;
  
  return {
    pageId: finalPageId,
    accessToken: finalAccessToken,
    source: {
      pageId: envPageId ? 'environment' : localPageId ? 'localStorage' : 'none',
      accessToken: envAccessToken ? 'environment' : localAccessToken ? 'localStorage' : 'none'
    }
  };
}

/**
 * Get Facebook headers for API requests
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
  
  return headers;
}

/**
 * Log Facebook configuration source for debugging
 */
export function logFacebookConfigSource(): void {
  const config = getFacebookConfig();
  
  console.log('🔧 Facebook Configuration Source:', {
    pageId: config.source.pageId,
    accessToken: config.source.accessToken,
    hasPageId: !!config.pageId,
    hasAccessToken: !!config.accessToken
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
 * Get configuration status for UI display
 */
export function getFacebookConfigStatus() {
  const envPageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
  const envAccessToken = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
  const localPageId = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_PAGE_ID') 
    : null;
  const localAccessToken = typeof window !== 'undefined' 
    ? localStorage.getItem('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN') 
    : null;
    
  return {
    environment: {
      pageId: !!envPageId,
      accessToken: !!envAccessToken
    },
    localStorage: {
      pageId: !!localPageId,
      accessToken: !!localAccessToken
    },
    current: {
      pageId: envPageId || localPageId || '',
      accessToken: envAccessToken || localAccessToken || ''
    }
  };
}

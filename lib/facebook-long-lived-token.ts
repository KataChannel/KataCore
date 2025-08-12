/**
 * Facebook Long-Lived Token Utilities
 * ===================================
 * 
 * Utilities for generating and managing Facebook Long-Lived Tokens
 * Long-Lived Tokens last for 60 days instead of 1-2 hours
 */

export interface TokenExchangeResult {
  success: boolean;
  longLivedToken?: string;
  expiresIn?: number;
  tokenType?: string;
  error?: string;
  details?: string;
}

/**
 * Exchange a short-lived token for a long-lived token
 * @param shortLivedToken - The short-lived access token from Facebook
 * @param appId - Facebook App ID
 * @param appSecret - Facebook App Secret
 * @returns Promise<TokenExchangeResult>
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<TokenExchangeResult> {
  try {
    const url = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
    url.searchParams.append('grant_type', 'fb_exchange_token');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('client_secret', appSecret);
    url.searchParams.append('fb_exchange_token', shortLivedToken);

    console.log('🔄 Exchanging short-lived token for long-lived token...');
    
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Token exchange failed',
        details: data.error?.type || 'Unknown error'
      };
    }

    console.log('✅ Successfully exchanged for long-lived token');
    console.log(`⏱️ Token expires in: ${data.expires_in} seconds (${Math.floor(data.expires_in / 86400)} days)`);

    return {
      success: true,
      longLivedToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || 'bearer'
    };

  } catch (error) {
    console.error('💥 Token exchange failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Network or parsing error'
    };
  }
}

/**
 * Get Page Access Token from Long-Lived User Token
 * Page tokens don't expire when generated from long-lived user tokens
 * @param longLivedUserToken - Long-lived user access token
 * @returns Promise<TokenExchangeResult>
 */
export async function getPageAccessToken(longLivedUserToken: string): Promise<TokenExchangeResult> {
  try {
    const url = `https://graph.facebook.com/v20.0/me/accounts?access_token=${longLivedUserToken}`;
    
    console.log('🔄 Getting page access token...');
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Failed to get page access token',
        details: data.error?.type || 'Unknown error'
      };
    }

    if (!data.data || data.data.length === 0) {
      return {
        success: false,
        error: 'No pages found',
        details: 'User has no pages or insufficient permissions'
      };
    }

    // Return the first page's access token
    const firstPage = data.data[0];
    
    console.log('✅ Successfully got page access token');
    console.log(`📄 Page: ${firstPage.name} (${firstPage.id})`);

    return {
      success: true,
      longLivedToken: firstPage.access_token,
      tokenType: 'page_access_token'
    };

  } catch (error) {
    console.error('💥 Failed to get page access token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Network or parsing error'
    };
  }
}

/**
 * Validate if a token is long-lived by checking its expiration
 * @param accessToken - The access token to validate
 * @returns Promise<{isLongLived: boolean, expiresIn?: number, error?: string}>
 */
export async function checkTokenExpiration(accessToken: string): Promise<{
  isLongLived: boolean;
  expiresIn?: number;
  error?: string;
}> {
  try {
    const url = `https://graph.facebook.com/v20.0/me?fields=id&access_token=${accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        isLongLived: false,
        error: data.error?.message || 'Token validation failed'
      };
    }

    // Get debug token info
    const debugUrl = `https://graph.facebook.com/v20.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (debugResponse.ok && debugData.data) {
      const expiresAt = debugData.data.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = expiresAt ? expiresAt - now : null;

      // Long-lived tokens typically have expiration > 30 days
      const isLongLived = expiresIn ? expiresIn > (30 * 24 * 60 * 60) : false;

      return {
        isLongLived,
        expiresIn: expiresIn || undefined
      };
    }

    return {
      isLongLived: false,
      error: 'Could not determine token expiration'
    };

  } catch (error) {
    return {
      isLongLived: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate Long-Lived Token setup instructions
 */
export function getLongLivedTokenInstructions(): string {
  return `
# Facebook Long-Lived Token Setup

## Method 1: Using Facebook Graph API Explorer (Recommended)

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your Facebook App
3. Choose "Get User Access Token"
4. Select required permissions:
   - pages_read_engagement
   - pages_manage_posts
   - pages_read_user_content
   - pages_show_list
5. Generate Access Token
6. Use the exchangeForLongLivedToken() function to convert it

## Method 2: Direct API Call

\`\`\`bash
curl -G "https://graph.facebook.com/v20.0/oauth/access_token" \\
  -d "grant_type=fb_exchange_token" \\
  -d "client_id=YOUR_APP_ID" \\
  -d "client_secret=YOUR_APP_SECRET" \\
  -d "fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
\`\`\`

## Environment Variables Setup

Add to your .env.local file:

\`\`\`
NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN=your_long_lived_token_here
NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
\`\`\`

## Priority Order:

1. NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN (Environment)
2. NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN (localStorage)
3. NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN (Environment)
4. NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN (localStorage)

Long-lived tokens last for 60 days and are much more reliable!
`;
}

export default {
  exchangeForLongLivedToken,
  getPageAccessToken,
  checkTokenExpiration,
  getLongLivedTokenInstructions
};

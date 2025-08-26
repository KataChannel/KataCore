/**
 * Facebook Token Validation and Management Utilities
 * =================================================
 * 
 * Helper functions for Facebook API token validation and error handling
 */

export interface TokenValidationResult {
  isValid: boolean;
  userInfo?: {
    id: string;
    name?: string;
    email?: string;
  };
  error?: {
    message: string;
    code: string;
    type: string;
  };
}

/**
 * Validate Facebook access token
 * @param accessToken - The Facebook access token to validate
 * @returns Promise<TokenValidationResult>
 */
export async function validateFacebookToken(accessToken: string): Promise<TokenValidationResult> {
  try {
    if (!accessToken || accessToken.trim() === '') {
      return {
        isValid: false,
        error: {
          message: 'Access token is empty or missing',
          code: 'MISSING_TOKEN',
          type: 'ValidationError'
        }
      };
    }

    // Use debug_token endpoint for more detailed validation
    const debugResponse = await fetch(`https://graph.facebook.com/v23.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`);
    const debugData = await debugResponse.json();
    
    if (debugData.error) {
      const errorInfo = formatFacebookError(debugData.error);
      return {
        isValid: false,
        error: {
          message: errorInfo.userMessage,
          code: debugData.error.code?.toString() || 'VALIDATION_ERROR',
          type: debugData.error.type || 'OAuthException'
        }
      };
    }

    // Check if token is valid according to debug endpoint
    const tokenData = debugData.data;
    if (!tokenData || !tokenData.is_valid) {
      return {
        isValid: false,
        error: {
          message: 'Access token is not valid or has expired',
          code: '190',
          type: 'OAuthException'
        }
      };
    }

    // Now try to get user info with the validated token
    const response = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${accessToken}&fields=id,name,email`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      const errorInfo = formatFacebookError(data.error);
      return {
        isValid: false,
        error: {
          message: errorInfo.userMessage,
          code: data.error?.code?.toString() || 'API_ERROR',
          type: data.error?.type || 'OAuthException'
        }
      };
    }
    
    return {
      isValid: true,
      userInfo: {
        id: data.id,
        name: data.name,
        email: data.email
      }
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isValid: false,
      error: {
        message: 'Unable to validate Facebook token. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        type: 'NetworkException'
      }
    };
  }
}

/**
 * Auto-refresh Facebook token when expired
 * @param currentToken - Current access token
 * @param appId - Facebook App ID
 * @param appSecret - Facebook App Secret
 * @returns Promise<{success: boolean, newToken?: string, error?: string}>
 */
export async function autoRefreshFacebookToken(
  currentToken: string, 
  appId?: string, 
  appSecret?: string
): Promise<{success: boolean, newToken?: string, error?: string}> {
  try {
    // First validate current token
    const validation = await validateFacebookToken(currentToken);
    
    if (validation.isValid) {
      return { success: true, newToken: currentToken };
    }

    // If token is invalid and we have app credentials, try to refresh
    if (!appId || !appSecret) {
      return { 
        success: false, 
        error: 'Cannot refresh token: App ID and App Secret are required' 
      };
    }

    // Check if this is a token-related error that can be refreshed
    const errorCode = parseInt(validation.error?.code || '0');
    const refreshableCodes = [190, 463, 464]; // Expired, expired session, invalidated session
    
    if (!refreshableCodes.includes(errorCode)) {
      return { 
        success: false, 
        error: `Cannot refresh token: ${validation.error?.message}` 
      };
    }

    // Try to exchange for long-lived token (this sometimes works for refreshing)
    const longLivedResult = await getLongLivedToken(currentToken, appId, appSecret);
    
    if (longLivedResult.success && longLivedResult.accessToken) {
      // Validate the new token
      const newValidation = await validateFacebookToken(longLivedResult.accessToken);
      
      if (newValidation.isValid) {
        return { 
          success: true, 
          newToken: longLivedResult.accessToken 
        };
      }
    }

    return { 
      success: false, 
      error: 'Token refresh failed. Please reconnect your Facebook account manually.' 
    };

  } catch (error) {
    return { 
      success: false, 
      error: `Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Check if Facebook token has required permissions
 * @param accessToken - The Facebook access token
 * @param requiredPermissions - Array of required permissions
 * @returns Promise<{hasPermissions: boolean, missingPermissions: string[]}>
 */
export async function checkTokenPermissions(
  accessToken: string, 
  requiredPermissions: string[] = ['pages_read_engagement', 'pages_manage_posts', 'pages_read_user_content']
): Promise<{hasPermissions: boolean, missingPermissions: string[]}> {
  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/me/permissions?access_token=${accessToken}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      return {
        hasPermissions: false,
        missingPermissions: requiredPermissions
      };
    }
    
    const grantedPermissions = data.data
      .filter((perm: any) => perm.status === 'granted')
      .map((perm: any) => perm.permission);
    
    const missingPermissions = requiredPermissions.filter(
      perm => !grantedPermissions.includes(perm)
    );
    
    return {
      hasPermissions: missingPermissions.length === 0,
      missingPermissions
    };
  } catch (error) {
    return {
      hasPermissions: false,
      missingPermissions: requiredPermissions
    };
  }
}

/**
 * Get long-lived access token from short-lived token
 * @param shortLivedToken - Short-lived access token
 * @param appId - Facebook App ID
 * @param appSecret - Facebook App Secret
 * @returns Promise<{success: boolean, accessToken?: string, error?: string}>
 */
export async function getLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<{success: boolean, accessToken?: string, error?: string}> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Failed to exchange token'
      };
    }
    
    return {
      success: true,
      accessToken: data.access_token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during token exchange'
    };
  }
}

/**
 * Debug Facebook API error and provide user-friendly message
 * @param error - Error response from Facebook API
 * @returns Formatted error information
 */
export function formatFacebookError(error: any): {
  userMessage: string;
  technicalMessage: string;
  code: string;
  isTokenRelated: boolean;
} {
  const code = error?.code || 'UNKNOWN_ERROR';
  const message = error?.message || 'Unknown error occurred';
  const type = error?.type || 'UnknownException';
  
  // Common Facebook API error codes
  const tokenRelatedCodes = [
    190, // Invalid access token
    102, // Session key invalid
    458, // App not installed
    460, // Password changed
    463, // Expired session
    464, // Session invalidated
    467  // Invalid access token signature
  ];
  
  const isTokenRelated = tokenRelatedCodes.includes(parseInt(code.toString()));
  
  let userMessage = 'An error occurred while connecting to Facebook.';
  
  switch (parseInt(code.toString())) {
    case 190:
      userMessage = 'Your Facebook access token has expired or is invalid. Please reconnect your account.';
      break;
    case 102:
      userMessage = 'Your Facebook session is invalid. Please log in again.';
      break;
    case 458:
      userMessage = 'The Facebook app is not properly installed. Please contact support.';
      break;
    case 460:
      userMessage = 'Your Facebook password has been changed. Please reconnect your account with the new credentials.';
      break;
    case 463:
      userMessage = 'Your Facebook session has expired due to inactivity. Please reconnect your account.';
      break;
    case 464:
      userMessage = 'Your Facebook session has been invalidated for security reasons. This can happen when you change your password or Facebook detects suspicious activity. Please reconnect your account.';
      break;
    case 467:
      userMessage = 'Invalid Facebook access token signature. Please reconnect your account.';
      break;
    case 4:
      userMessage = 'Too many requests to Facebook. Please try again later.';
      break;
    case 17:
      userMessage = 'Facebook user request limit reached. Please try again later.';
      break;
    default:
      if (isTokenRelated) {
        userMessage = 'There is an issue with your Facebook authentication. Please reconnect your account.';
      } else if (message.toLowerCase().includes('session') && message.toLowerCase().includes('invalidated')) {
        userMessage = 'Your Facebook session has been invalidated. This usually happens when you change your password or for security reasons. Please reconnect your account.';
      } else if (message.toLowerCase().includes('password') && message.toLowerCase().includes('changed')) {
        userMessage = 'Your Facebook password has been changed. Please reconnect your account with the new credentials.';
      }
      break;
  }
  
  return {
    userMessage,
    technicalMessage: message,
    code: code.toString(),
    isTokenRelated
  };
}

/**
 * Comprehensive Facebook API error handler for API routes
 * @param error - Error from Facebook API response
 * @param context - Additional context for debugging
 * @returns Formatted response object
 */
export function handleFacebookAPIError(error: any, context: string = '') {
  const formattedError = formatFacebookError(error);
  
  console.error(`❌ Facebook API Error ${context}:`, {
    code: formattedError.code,
    message: formattedError.technicalMessage,
    isTokenRelated: formattedError.isTokenRelated,
    context
  });
  
  return {
    error: formattedError.userMessage,
    code: formattedError.code,
    isTokenRelated: formattedError.isTokenRelated,
    technicalDetails: formattedError.technicalMessage
  };
}

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
    const response = await fetch(`https://graph.facebook.com/v20.0/me?access_token=${accessToken}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      return {
        isValid: false,
        error: {
          message: data.error?.message || 'Token validation failed',
          code: data.error?.code || 'INVALID_TOKEN',
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
    return {
      isValid: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error during token validation',
        code: 'NETWORK_ERROR',
        type: 'NetworkException'
      }
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
      userMessage = 'Your Facebook access token has expired. Please reconnect your account.';
      break;
    case 102:
      userMessage = 'Your Facebook session is invalid. Please log in again.';
      break;
    case 458:
      userMessage = 'The Facebook app is not properly installed. Please contact support.';
      break;
    case 460:
    case 463:
    case 464:
      userMessage = 'Your Facebook session has expired. Please reconnect your account.';
      break;
    case 467:
      userMessage = 'Invalid Facebook access token. Please reconnect your account.';
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

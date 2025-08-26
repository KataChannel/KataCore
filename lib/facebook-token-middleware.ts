/**
 * Facebook Token Middleware
 * Automatically handles token validation and refresh in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateFacebookToken, autoRefreshFacebookToken, formatFacebookError } from './facebook-token-utils';
import { prisma } from './prisma';

export interface FacebookTokenMiddlewareOptions {
  requireToken?: boolean;
  autoRefresh?: boolean;
  requiredPermissions?: string[];
}

/**
 * Middleware for Facebook API routes to handle token validation and refresh
 */
export async function withFacebookTokenValidation(
  request: NextRequest,
  handler: (req: NextRequest, validToken: string) => Promise<NextResponse>,
  options: FacebookTokenMiddlewareOptions = {}
) {
  const { requireToken = true, autoRefresh = true } = options;

  try {
    // Extract token from request (multiple sources)
    let accessToken = getTokenFromRequest(request);

    if (!accessToken && requireToken) {
      return NextResponse.json(
        { 
          error: 'Facebook access token is required',
          code: 'MISSING_TOKEN',
          action: 'reconnect'
        },
        { status: 401 }
      );
    }

    if (!accessToken) {
      // If token not required, proceed without validation
      return handler(request, '');
    }

    // Validate token
    console.log('🔍 Validating Facebook access token...');
    const validation = await validateFacebookToken(accessToken);

    if (validation.isValid) {
      console.log('✅ Token is valid');
      return handler(request, accessToken);
    }

    // Token is invalid
    console.log('❌ Token validation failed:', validation.error?.message);
    
    const errorCode = parseInt(validation.error?.code || '0');
    const isTokenExpired = [190, 460, 463, 464].includes(errorCode);

    if (isTokenExpired && autoRefresh) {
      console.log('🔄 Attempting token refresh...');
      
      // Try to refresh token
      const refreshResult = await attemptTokenRefresh(accessToken);
      
      if (refreshResult.success && refreshResult.newToken) {
        console.log('✅ Token refreshed successfully');
        return handler(request, refreshResult.newToken);
      }
      
      console.log('❌ Token refresh failed:', refreshResult.error);
    }

    // Return appropriate error response
    return NextResponse.json(
      {
        error: validation.error?.message || 'Facebook token validation failed',
        code: validation.error?.code || 'INVALID_TOKEN',
        type: validation.error?.type || 'OAuthException',
        action: isTokenExpired ? 'reconnect' : 'check_token',
        details: {
          isTokenExpired,
          canRefresh: isTokenExpired && autoRefresh,
          suggestion: isTokenExpired 
            ? 'Please reconnect your Facebook account'
            : 'Please check your Facebook token configuration'
        }
      },
      { status: 401 }
    );

  } catch (error) {
    console.error('❌ Facebook token middleware error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal error during token validation',
        code: 'MIDDLEWARE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extract access token from various sources in the request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  const url = new URL(request.url);
  
  // Check URL parameters
  const tokenFromQuery = url.searchParams.get('access_token');
  if (tokenFromQuery) return tokenFromQuery;
  
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check custom header
  const tokenHeader = request.headers.get('x-facebook-access-token');
  if (tokenHeader) return tokenHeader;
  
  return null;
}

/**
 * Attempt to refresh Facebook token using stored app credentials
 */
async function attemptTokenRefresh(currentToken: string): Promise<{
  success: boolean;
  newToken?: string;
  error?: string;
}> {
  try {
    // Get app credentials from environment or database
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appId || !appSecret) {
      return {
        success: false,
        error: 'Facebook app credentials not configured'
      };
    }

    // Use the autoRefreshFacebookToken function
    const result = await autoRefreshFacebookToken(currentToken, appId, appSecret);
    
    if (result.success && result.newToken) {
      // Optional: Store the new token in database if we have a way to identify the user/page
      await updateTokenInDatabase(result.newToken, currentToken);
    }
    
    return result;

  } catch (error) {
    return {
      success: false,
      error: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Update token in database (if we can identify the record)
 */
async function updateTokenInDatabase(newToken: string, oldToken: string): Promise<void> {
  try {
    // Try to update facebook_pages table
    const updatedPages = await prisma.facebook_pages.updateMany({
      where: { accessToken: oldToken },
      data: { 
        accessToken: newToken,
        updatedAt: new Date()
      }
    });

    if (updatedPages.count > 0) {
      console.log(`🔄 Updated ${updatedPages.count} page tokens in database`);
    }

    // Could also update other tables that store tokens
    
  } catch (error) {
    console.error('❌ Failed to update token in database:', error);
    // Don't throw error as token refresh was successful
  }
}

/**
 * Helper function to create error responses for Facebook API issues
 */
export function createFacebookErrorResponse(
  error: any,
  context: string = '',
  status: number = 400
): NextResponse {
  const formattedError = formatFacebookError(error);
  
  const isTokenIssue = [190, 102, 458, 460, 463, 464, 467].includes(
    parseInt(formattedError.code)
  );

  return NextResponse.json(
    {
      error: formattedError.userMessage,
      code: formattedError.code,
      type: 'FacebookAPIError',
      context,
      action: isTokenIssue ? 'reconnect' : 'retry',
      isTokenRelated: formattedError.isTokenRelated,
      technicalDetails: formattedError.technicalMessage
    },
    { status: isTokenIssue ? 401 : status }
  );
}

/**
 * Wrapper for Facebook API calls with automatic error handling
 */
export async function callFacebookAPI(
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<any> {
  const fullUrl = url.includes('access_token') 
    ? url 
    : `${url}${url.includes('?') ? '&' : '?'}access_token=${accessToken}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'User-Agent': 'TazaCore/1.0',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const formattedError = formatFacebookError(data.error);
    
    const error = new Error(formattedError.userMessage);
    (error as any).code = formattedError.code;
    (error as any).type = data.error?.type || 'FacebookAPIError';
    (error as any).isTokenRelated = formattedError.isTokenRelated;
    
    throw error;
  }

  return data;
}

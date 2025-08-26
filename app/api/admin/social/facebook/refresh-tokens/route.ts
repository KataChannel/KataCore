import { NextRequest, NextResponse } from 'next/server';
import { validateFacebookToken, autoRefreshFacebookToken } from '@/lib/facebook-token-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { autoRefresh = true, pageIds } = body;

    console.log('🔄 Starting Facebook token refresh process...');

    let refreshResults = [];
    let totalRefreshed = 0;
    let totalFailed = 0;

    // Get Facebook app credentials
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'Facebook app credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.',
        code: 'MISSING_CREDENTIALS'
      }, { status: 400 });
    }

    // Get pages to refresh (specific pages or all)
    const whereClause = pageIds?.length > 0 
      ? { facebookPageId: { in: pageIds } }
      : {};

    const pages = await prisma.facebook_pages.findMany({
      where: {
        ...whereClause,
        accessToken: { not: null }
      },
      select: {
        id: true,
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });

    console.log(`📄 Found ${pages.length} pages to check tokens for`);

    for (const page of pages) {
      try {
        console.log(`🔍 Checking token for page: ${page.name} (${page.facebookPageId})`);

        // Validate current token
        const validation = await validateFacebookToken(page.accessToken!);
        
        if (validation.isValid) {
          console.log(`✅ Token for ${page.name} is valid`);
          refreshResults.push({
            pageId: page.facebookPageId,
            pageName: page.name,
            status: 'valid',
            message: 'Token is already valid'
          });
          continue;
        }

        console.log(`❌ Token for ${page.name} is invalid: ${validation.error?.message}`);

        if (!autoRefresh) {
          refreshResults.push({
            pageId: page.facebookPageId,
            pageName: page.name,
            status: 'invalid',
            error: validation.error?.message,
            action: 'manual_refresh_required'
          });
          totalFailed++;
          continue;
        }

        // Attempt to refresh token
        console.log(`🔄 Attempting to refresh token for ${page.name}...`);
        
        const refreshResult = await autoRefreshFacebookToken(
          page.accessToken!,
          appId,
          appSecret
        );

        if (refreshResult.success && refreshResult.newToken) {
          // Update token in database
          await prisma.facebook_pages.update({
            where: { id: page.id },
            data: {
              accessToken: refreshResult.newToken,
              updatedAt: new Date()
            }
          });

          console.log(`✅ Token refreshed successfully for ${page.name}`);
          
          refreshResults.push({
            pageId: page.facebookPageId,
            pageName: page.name,
            status: 'refreshed',
            message: 'Token refreshed successfully',
            newTokenPreview: refreshResult.newToken.substring(0, 20) + '...'
          });
          
          totalRefreshed++;
        } else {
          console.log(`❌ Token refresh failed for ${page.name}: ${refreshResult.error}`);
          
          refreshResults.push({
            pageId: page.facebookPageId,
            pageName: page.name,
            status: 'refresh_failed',
            error: refreshResult.error,
            originalError: validation.error?.message,
            action: 'manual_reconnection_required'
          });
          
          totalFailed++;
        }

      } catch (error) {
        console.error(`❌ Error processing page ${page.name}:`, error);
        
        refreshResults.push({
          pageId: page.facebookPageId,
          pageName: page.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        totalFailed++;
      }
    }

    console.log(`🎯 Token refresh complete: ${totalRefreshed} refreshed, ${totalFailed} failed`);

    // Generate summary and recommendations
    const validTokens = refreshResults.filter(r => r.status === 'valid').length;
    const refreshedTokens = refreshResults.filter(r => r.status === 'refreshed').length;
    const failedTokens = refreshResults.filter(r => r.status === 'refresh_failed' || r.status === 'error').length;
    const invalidTokens = refreshResults.filter(r => r.status === 'invalid').length;

    const summary = {
      total: pages.length,
      valid: validTokens,
      refreshed: refreshedTokens,
      failed: failedTokens,
      invalid: invalidTokens,
      requiresManualAction: failedTokens + invalidTokens
    };

    const recommendations = [];
    
    if (failedTokens > 0) {
      recommendations.push({
        type: 'manual_reconnection',
        count: failedTokens,
        message: 'Some tokens could not be refreshed automatically. Manual reconnection required.',
        action: 'Go to Facebook settings and reconnect these pages'
      });
    }

    if (invalidTokens > 0 && !autoRefresh) {
      recommendations.push({
        type: 'enable_auto_refresh',
        count: invalidTokens,
        message: 'Invalid tokens found. Consider enabling auto-refresh.',
        action: 'Call this endpoint with autoRefresh: true'
      });
    }

    const isSuccessful = totalRefreshed > 0 || (totalFailed === 0 && validTokens > 0);

    return NextResponse.json({
      success: isSuccessful,
      summary,
      results: refreshResults,
      recommendations,
      message: isSuccessful 
        ? `Token refresh completed successfully. ${totalRefreshed} tokens refreshed, ${validTokens} already valid.`
        : `Token refresh completed with issues. ${totalFailed} tokens require manual attention.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Token refresh endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal error during token refresh',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'REFRESH_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token status for all pages
    const pages = await prisma.facebook_pages.findMany({
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true,
        updatedAt: true
      }
    });

    const tokenStatuses = [];

    for (const page of pages) {
      if (!page.accessToken) {
        tokenStatuses.push({
          pageId: page.facebookPageId,
          pageName: page.name,
          status: 'missing',
          message: 'No access token configured',
          lastUpdated: page.updatedAt
        });
        continue;
      }

      try {
        const validation = await validateFacebookToken(page.accessToken);
        
        tokenStatuses.push({
          pageId: page.facebookPageId,
          pageName: page.name,
          status: validation.isValid ? 'valid' : 'invalid',
          message: validation.isValid 
            ? 'Token is valid'
            : validation.error?.message,
          errorCode: validation.error?.code,
          lastUpdated: page.updatedAt,
          tokenPreview: page.accessToken.substring(0, 20) + '...'
        });

      } catch (error) {
        tokenStatuses.push({
          pageId: page.facebookPageId,
          pageName: page.name,
          status: 'error',
          message: 'Failed to validate token',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastUpdated: page.updatedAt
        });
      }
    }

    const summary = {
      total: tokenStatuses.length,
      valid: tokenStatuses.filter(t => t.status === 'valid').length,
      invalid: tokenStatuses.filter(t => t.status === 'invalid').length,
      missing: tokenStatuses.filter(t => t.status === 'missing').length,
      error: tokenStatuses.filter(t => t.status === 'error').length
    };

    return NextResponse.json({
      success: true,
      summary,
      tokens: tokenStatuses,
      message: `Token status retrieved for ${tokenStatuses.length} pages`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get token status error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve token status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

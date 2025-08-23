import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/social/facebook/debug-permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUserId = searchParams.get('userId') || '24271147095873149';
    
    console.log('🔍 Starting Facebook Permissions Debug...');
    
    // Get pages with access tokens
    const pages = await prisma.facebook_pages.findMany({
      select: {
        name: true,
        facebookPageId: true,
        accessToken: true,
        phone: true,
        category: true
      },
      take: 5
    });
    
    const debugResults: any = {
      timestamp: new Date().toISOString(),
      testUserId,
      pages: [],
      apiTests: [],
      summary: {
        totalPages: pages.length,
        pagesWithTokens: 0,
        workingTokens: 0,
        userProfileAccessible: false
      }
    };
    
    console.log(`📊 Found ${pages.length} pages in database`);
    
    for (const page of pages) {
      const pageResult: any = {
        name: page.name,
        pageId: page.facebookPageId,
        hasToken: !!page.accessToken,
        tokenLength: page.accessToken ? page.accessToken.length : 0,
        category: page.category,
        tests: {}
      };
      
      if (page.accessToken) {
        debugResults.summary.pagesWithTokens++;
        
        try {
          // Test 1: Page Info Access
          console.log(`🔸 Testing page info for ${page.name}...`);
          const pageInfoResponse = await fetch(
            `https://graph.facebook.com/v23.0/${page.facebookPageId}?access_token=${page.accessToken}&fields=id,name,category,fan_count`
          );
          
          if (pageInfoResponse.ok) {
            const pageInfo = await pageInfoResponse.json();
            pageResult.tests.pageInfo = {
              status: 'success',
              data: pageInfo
            };
            debugResults.summary.workingTokens++;
          } else {
            const error = await pageInfoResponse.json();
            pageResult.tests.pageInfo = {
              status: 'error',
              error: error.error?.message || 'Unknown error'
            };
          }
          
          // Test 2: Token Permissions
          console.log(`🔸 Testing token permissions for ${page.name}...`);
          const permissionsResponse = await fetch(
            `https://graph.facebook.com/v23.0/me/permissions?access_token=${page.accessToken}`
          );
          
          if (permissionsResponse.ok) {
            const permissions = await permissionsResponse.json();
            pageResult.tests.permissions = {
              status: 'success',
              data: permissions.data || []
            };
          } else {
            const error = await permissionsResponse.json();
            pageResult.tests.permissions = {
              status: 'error',
              error: error.error?.message || 'Unknown error'
            };
          }
          
          // Test 3: User Profile Access (should fail)
          console.log(`🔸 Testing user profile access with page token...`);
          const userProfileResponse = await fetch(
            `https://graph.facebook.com/v23.0/${testUserId}?access_token=${page.accessToken}&fields=id,name,picture`
          );
          
          if (userProfileResponse.ok) {
            const userProfile = await userProfileResponse.json();
            pageResult.tests.userProfile = {
              status: 'success',
              data: userProfile
            };
            debugResults.summary.userProfileAccessible = true;
          } else {
            const error = await userProfileResponse.json();
            pageResult.tests.userProfile = {
              status: 'error',
              error: error.error?.message || 'Unknown error',
              errorCode: error.error?.code || 'N/A'
            };
          }
          
          // Test 4: Public User Profile (no token)
          console.log(`🔸 Testing public user profile access...`);
          const publicProfileResponse = await fetch(
            `https://graph.facebook.com/v23.0/${testUserId}?fields=id,name,picture`
          );
          
          if (publicProfileResponse.ok) {
            const publicProfile = await publicProfileResponse.json();
            pageResult.tests.publicProfile = {
              status: 'success',
              data: publicProfile
            };
          } else {
            const error = await publicProfileResponse.json();
            pageResult.tests.publicProfile = {
              status: 'error',
              error: error.error?.message || 'Unknown error'
            };
          }
          
        } catch (error) {
          console.error(`❌ Error testing page ${page.name}:`, error);
          pageResult.tests.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }
      
      debugResults.pages.push(pageResult);
    }
    
    // Additional API tests
    const apiTests = [
      {
        name: 'Direct Facebook URL',
        url: `https://www.facebook.com/${testUserId}`,
        description: 'Test if user profile URL is accessible via browser'
      },
      {
        name: 'User Public Fields',
        url: `https://graph.facebook.com/v23.0/${testUserId}?fields=id,name`,
        description: 'Test minimal public fields without token'
      }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await fetch(test.url, { method: 'HEAD' });
        debugResults.apiTests.push({
          name: test.name,
          url: test.url,
          status: response.status,
          success: response.ok,
          description: test.description
        });
      } catch (error) {
        debugResults.apiTests.push({
          name: test.name,
          url: test.url,
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          description: test.description
        });
      }
    }
    
    // Analysis and recommendations
    debugResults.analysis = {
      issues: [],
      recommendations: [],
      nextSteps: []
    };
    
    if (debugResults.summary.pagesWithTokens === 0) {
      debugResults.analysis.issues.push('No pages have access tokens stored in database');
      debugResults.analysis.recommendations.push('Run Facebook pages sync to obtain page access tokens');
    }
    
    if (debugResults.summary.workingTokens === 0) {
      debugResults.analysis.issues.push('No working access tokens found');
      debugResults.analysis.recommendations.push('Verify Facebook app configuration and token validity');
    }
    
    if (!debugResults.summary.userProfileAccessible) {
      debugResults.analysis.issues.push('Cannot access user profiles with current tokens');
      debugResults.analysis.recommendations.push('Page access tokens cannot access user data - need user access tokens');
      debugResults.analysis.nextSteps.push('Implement Facebook Login for user consent');
      debugResults.analysis.nextSteps.push('Apply for user profile permissions from Meta');
    }
    
    debugResults.analysis.recommendations.push('Use text extraction from messages/comments for user data');
    debugResults.analysis.recommendations.push('Focus on available interaction data instead of profile API');
    
    console.log('✅ Debug completed successfully');
    
    return NextResponse.json({
      success: true,
      debug: debugResults
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

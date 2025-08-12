#!/usr/bin/env node

/**
 * Facebook Token Test Script
 * =========================
 * 
 * Quick script to test Facebook access token validity
 * Run: node scripts/test-facebook-token.cjs
 */

const { getFacebookConfig } = require('../lib/facebook-config');

async function testFacebookToken() {
  console.log('🧪 Testing Facebook Access Token...\n');

  try {
    // Get Facebook configuration
    const config = getFacebookConfig();
    
    if (!config.accessToken) {
      console.error('❌ No Facebook access token found');
      console.log('💡 Please set up your Facebook token:');
      console.log('   - Add to .env.local: NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN=your_token');
      console.log('   - Or set in localStorage: localStorage.setItem("NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN", "your_token")');
      process.exit(1);
    }

    console.log('✅ Access token found:', config.accessToken.substring(0, 20) + '...');
    
    // Test token validity with Facebook API
    console.log('\n🔍 Validating token with Facebook Graph API...');
    
    const response = await fetch(
      `https://graph.facebook.com/v20.0/me?access_token=${config.accessToken}`
    );
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('❌ Token validation failed:');
      console.error('Status:', response.status);
      console.error('Error:', data.error);
      
      if (data.error) {
        console.log('\n💡 Common solutions:');
        switch (data.error.code) {
          case 190:
            console.log('   - Token is invalid or expired. Generate a new token from Facebook Graph API Explorer');
            break;
          case 102:
            console.log('   - Session key is invalid. Get a new access token');
            break;
          case 463:
            console.log('   - Session has expired. Refresh your access token');
            break;
          case 464:
            console.log('   - Session was invalidated. Generate a completely new token');
            break;
          default:
            console.log('   - Check Facebook Graph API Explorer: https://developers.facebook.com/tools/explorer/');
        }
      }
      
      process.exit(1);
    }
    
    console.log('✅ Token is valid!');
    console.log('User:', data.name || data.id);
    
    // Test token permissions
    console.log('\n🔍 Checking token permissions...');
    
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/permissions?access_token=${config.accessToken}`
    );
    
    const permissionsData = await permissionsResponse.json();
    
    if (permissionsResponse.ok && permissionsData.data) {
      console.log('📋 Token permissions:');
      permissionsData.data
        .filter(p => p.status === 'granted')
        .forEach(permission => {
          console.log(`   ✅ ${permission.permission}`);
        });
      
      const declined = permissionsData.data.filter(p => p.status === 'declined');
      if (declined.length > 0) {
        console.log('\n⚠️  Declined permissions:');
        declined.forEach(permission => {
          console.log(`   ❌ ${permission.permission}`);
        });
      }
    }
    
    // Test page access if pageId is available
    if (config.pageId) {
      console.log(`\n🔍 Testing access to page: ${config.pageId}...`);
      
      const pageResponse = await fetch(
        `https://graph.facebook.com/v20.0/${config.pageId}?fields=id,name,category&access_token=${config.accessToken}`
      );
      
      const pageData = await pageResponse.json();
      
      if (pageResponse.ok && !pageData.error) {
        console.log('✅ Page access confirmed:');
        console.log(`   📄 ${pageData.name} (${pageData.id})`);
        console.log(`   📂 Category: ${pageData.category || 'N/A'}`);
      } else {
        console.warn('⚠️  Page access limited or denied:');
        console.warn('   ', pageData.error?.message || 'Unknown error');
      }
    } else {
      console.log('\n💡 No page ID configured. Set NEXT_PUBLIC_FACEBOOK_PAGE_ID to test page access.');
    }
    
    console.log('\n🎉 Facebook token test completed successfully!');
    console.log('\n💡 You can now use the sync endpoints:');
    console.log('   - GET /api/admin/social/facebook/database?action=pages');
    console.log('   - GET /api/admin/social/facebook/database?action=sync-posts');
    console.log('   - GET /api/admin/social/facebook/database?action=sync-all-posts');
    console.log('   - GET /api/admin/social/facebook/database?action=sync-all-messages');
    console.log('   - GET /api/admin/social/facebook/database?action=sync-all-data');
    
  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Network error - check your internet connection');
    } else if (error.code === 'ECONNRESET') {
      console.log('\n💡 Connection reset - try again in a moment');
    }
    
    process.exit(1);
  }
}

// Run the test
testFacebookToken();

#!/usr/bin/env node

/**
 * Facebook Sync Diagnostic Script
 * ===============================
 * 
 * Diagnose Facebook sync issues
 * Run: node scripts/diagnose-facebook-sync.cjs
 */

const { getFacebookConfig } = require('../lib/facebook-config');

async function diagnoseFacebookSync() {
  console.log('🔍 Facebook Sync Diagnostic Tool\n');

  try {
    // Check Facebook configuration
    console.log('1. 📋 Checking Facebook Configuration...');
    const config = getFacebookConfig();
    
    console.log('   - Page ID:', config.pageId ? '✅ Configured' : '❌ Missing');
    console.log('   - Access Token:', config.accessToken ? `✅ Configured (${config.accessToken.length} chars)` : '❌ Missing');
    console.log('   - Long-Lived Token:', config.longLivedToken ? '✅ Configured' : '⚠️ Not configured');
    console.log('   - Token Type:', config.isLongLived ? 'Long-Lived (60 days)' : 'Regular (1-2 hours)');
    console.log('   - Token Source:', config.source.accessToken);
    
    if (!config.accessToken) {
      console.error('\n❌ No access token found! Please configure:');
      console.log('   - Environment: NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN');
      console.log('   - Or localStorage: NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN');
      process.exit(1);
    }
    
    // Test token validation
    console.log('\n2. 🔍 Testing Token Validation...');
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v20.0/me?access_token=${config.accessToken}`
    );
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok || tokenData.error) {
      console.error('❌ Token validation failed:');
      console.error('   Error:', tokenData.error?.message);
      console.error('   Code:', tokenData.error?.code);
      console.error('   Type:', tokenData.error?.type);
      
      if (tokenData.error?.code === 190) {
        console.log('\n💡 Solutions:');
        console.log('   1. Generate new token: https://developers.facebook.com/tools/explorer/');
        console.log('   2. Check token permissions');
        console.log('   3. Make sure app is not in development mode restrictions');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Token is valid');
    console.log('   User:', tokenData.name || tokenData.id);
    
    // Test page access
    if (config.pageId) {
      console.log('\n3. 📄 Testing Page Access...');
      const pageResponse = await fetch(
        `https://graph.facebook.com/v20.0/${config.pageId}?fields=id,name,category&access_token=${config.accessToken}`
      );
      const pageData = await pageResponse.json();
      
      if (!pageResponse.ok || pageData.error) {
        console.error('❌ Page access failed:');
        console.error('   Error:', pageData.error?.message);
        console.error('   Code:', pageData.error?.code);
        
        if (pageData.error?.code === 803) {
          console.log('\n💡 Page access issue:');
          console.log('   - Make sure you have admin access to the page');
          console.log('   - Check page permissions in token');
        }
      } else {
        console.log('✅ Page access confirmed');
        console.log('   Page:', pageData.name);
        console.log('   Category:', pageData.category);
      }
    }
    
    // Test posts access
    if (config.pageId) {
      console.log('\n4. 📝 Testing Posts Access...');
      const postsResponse = await fetch(
        `https://graph.facebook.com/v20.0/${config.pageId}/posts?fields=id,message,created_time&access_token=${config.accessToken}&limit=5`
      );
      const postsData = await postsResponse.json();
      
      if (!postsResponse.ok || postsData.error) {
        console.error('❌ Posts access failed:');
        console.error('   Error:', postsData.error?.message);
        console.error('   Code:', postsData.error?.code);
        console.error('   Subcode:', postsData.error?.error_subcode);
        
        if (postsData.error?.code === 200) {
          console.log('\n💡 Permissions issue:');
          console.log('   - Token needs pages_read_engagement permission');
          console.log('   - Regenerate token with correct permissions');
        }
      } else {
        console.log('✅ Posts access confirmed');
        console.log('   Posts found:', postsData.data?.length || 0);
      }
    }
    
    // Test messages access
    if (config.pageId) {
      console.log('\n5. 💬 Testing Messages Access...');
      const messagesResponse = await fetch(
        `https://graph.facebook.com/v20.0/${config.pageId}/conversations?fields=id,participants&access_token=${config.accessToken}&limit=5`
      );
      const messagesData = await messagesResponse.json();
      
      if (!messagesResponse.ok || messagesData.error) {
        console.error('❌ Messages access failed:');
        console.error('   Error:', messagesData.error?.message);
        console.error('   Code:', messagesData.error?.code);
        
        if (messagesData.error?.code === 200) {
          console.log('\n💡 Messages permissions issue:');
          console.log('   - Token needs pages_messaging permission');
          console.log('   - Some messages APIs require business verification');
        }
      } else {
        console.log('✅ Messages access confirmed');
        console.log('   Conversations found:', messagesData.data?.length || 0);
      }
    }
    
    // Test API endpoints
    console.log('\n6. 🌐 Testing Local API Endpoints...');
    
    const testCases = [
      {
        name: 'Sync Posts',
        method: 'POST',
        url: 'http://localhost:3905/api/admin/social/facebook/database',
        body: { action: 'sync-posts', data: { pageId: config.pageId } }
      },
      {
        name: 'Sync Messages',
        method: 'POST',
        url: 'http://localhost:3905/api/admin/social/facebook/database',
        body: { action: 'sync-messages', data: { pageId: config.pageId } }
      }
    ];
    
    for (const test of testCases) {
      console.log(`\n   Testing ${test.name}...`);
      
      try {
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
            'X-Facebook-Page-Id': config.pageId || '',
            'X-Facebook-Access-Token': config.accessToken || ''
          },
          body: JSON.stringify(test.body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`   ✅ ${test.name} endpoint working`);
        } else {
          console.log(`   ❌ ${test.name} endpoint failed:`);
          console.log(`      Status: ${response.status}`);
          console.log(`      Error: ${data.error || 'Unknown error'}`);
          console.log(`      Details: ${data.details || 'No details'}`);
        }
      } catch (error) {
        console.log(`   💥 ${test.name} network error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Diagnostic completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. If token validation failed, get new token');
    console.log('   2. If permissions failed, check token permissions');
    console.log('   3. If API endpoints failed, check server logs');
    console.log('   4. Make sure development server is running on port 3905');
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error.message);
    process.exit(1);
  }
}

// Run the diagnostic
diagnoseFacebookSync();

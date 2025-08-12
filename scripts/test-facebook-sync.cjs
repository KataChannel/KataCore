#!/usr/bin/env node

/**
 * Test Facebook Sync Functions
 * ============================
 * 
 * Quick test script for Facebook sync actions
 * Run: node scripts/test-facebook-sync.cjs
 */

console.log('🧪 Testing Facebook Sync Functions...\n');

// Test URLs (adjust port if needed)
const BASE_URL = 'http://localhost:3900';
const TEST_PAGE_ID = '593555107170691'; // Default test page ID

const testEndpoints = [
  {
    name: 'Sync All Posts',
    url: `${BASE_URL}/api/admin/social/facebook/database?action=sync-all-posts`,
    method: 'GET'
  },
  {
    name: 'Sync All Messages', 
    url: `${BASE_URL}/api/admin/social/facebook/database?action=sync-all-messages`,
    method: 'GET'
  },
  {
    name: 'Sync All Data',
    url: `${BASE_URL}/api/admin/social/facebook/database?action=sync-all-data`,
    method: 'GET'
  },
  {
    name: 'Sync Single Page Posts',
    url: `${BASE_URL}/api/admin/social/facebook/database`,
    method: 'POST',
    body: {
      action: 'sync-posts',
      data: { pageId: TEST_PAGE_ID }
    }
  },
  {
    name: 'Sync Single Page Messages',
    url: `${BASE_URL}/api/admin/social/facebook/database`,
    method: 'POST', 
    body: {
      action: 'sync-messages',
      data: { pageId: TEST_PAGE_ID }
    }
  }
];

async function testEndpoint(test) {
  console.log(`\n🔍 Testing: ${test.name}`);
  console.log(`📡 ${test.method} ${test.url}`);
  
  try {
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
      console.log('📋 Request body:', JSON.stringify(test.body, null, 2));
    }
    
    const response = await fetch(test.url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed!');
      console.log('🔢 Status:', response.status);
      console.log('📄 Error:', JSON.stringify(data, null, 2));
      
      // Provide specific guidance for common errors
      if (data.code === 'INVALID_TOKEN') {
        console.log('\n💡 Token Issue Detected:');
        console.log('   1. Check your Facebook access token');
        console.log('   2. Generate new token: https://developers.facebook.com/tools/explorer/');
        console.log('   3. Set NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN in .env.local');
      }
    }
    
  } catch (error) {
    console.log('💥 Request failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - is your development server running?');
      console.log('   Run: bun run dev');
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Facebook sync function tests...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📄 Test Page ID: ${TEST_PAGE_ID}\n`);
  
  for (const test of testEndpoints) {
    await testEndpoint(test);
    
    // Add delay between tests
    if (testEndpoints.indexOf(test) < testEndpoints.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - Check each test result above');
  console.log('   - ✅ = Success, ❌ = Failed, 💥 = Network error');
  console.log('   - For token errors, update your Facebook access token');
  console.log('   - For connection errors, make sure your dev server is running');
}

// Run the tests
runTests().catch(console.error);

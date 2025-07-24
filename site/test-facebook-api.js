#!/usr/bin/env node

// Test the Facebook API endpoints
console.log('🧪 Testing Facebook Social Module API...\n');

const baseUrl = 'http://localhost:3000';
const endpoints = [
  '/api/social/facebook?type=pages',
  '/api/social/facebook?type=interactions&page=1&limit=5',
  '/api/social/facebook?type=comments&pageId=test',
  '/api/social/facebook?type=messages&pageId=test',
  '/api/social/facebook?type=posts'
];

async function testEndpoint(endpoint) {
  try {
    const url = `${baseUrl}${endpoint}`;
    console.log(`📡 Testing: ${endpoint}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).slice(0, 200)}...`);
    console.log('');
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }
  
  console.log('✅ API tests completed!');
}

// Check if server is running first
fetch(`${baseUrl}/api/social/facebook?type=pages`)
  .then(() => {
    runTests();
  })
  .catch(() => {
    console.log('❌ Development server not running at http://localhost:3000');
    console.log('Please start the server first with: npm run dev');
  });

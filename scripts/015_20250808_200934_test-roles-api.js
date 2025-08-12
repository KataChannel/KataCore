// Test script to debug roles API
import fetch from 'node-fetch';

async function testRolesAPI() {
  try {
    console.log('🧪 Testing Roles API...');
    
    const response = await fetch('http://localhost:3901/api/admin/roles', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));
    
    // Check structure
    console.log('\n🔍 Data Analysis:');
    console.log('- Type:', typeof data);
    console.log('- Is Array:', Array.isArray(data));
    console.log('- Has roles property:', 'roles' in data);
    console.log('- Roles type:', typeof data.roles);
    console.log('- Roles is Array:', Array.isArray(data.roles));
    
    if (data.roles && Array.isArray(data.roles)) {
      console.log('- Roles count:', data.roles.length);
      if (data.roles.length > 0) {
        console.log('- First role:', data.roles[0]);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testRolesAPI();

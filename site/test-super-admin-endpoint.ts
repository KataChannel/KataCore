#!/usr/bin/env ts-node
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '.env') });
config({ path: join(__dirname, '../shared/.env') });

import { authService } from './src/lib/auth/unified-auth.service';

async function testSuperAdminAPI() {
  try {
    console.log('🔍 Testing Super Admin API Endpoint...');
    
    // Step 1: Login to get a valid token
    const credentials = {
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
      provider: 'email' as const
    };
    
    console.log('🔐 Step 1: Logging in...');
    const loginResult = await authService.login(credentials);
    console.log('✅ Login successful!');
    
    const token = loginResult.tokens.accessToken;
    console.log('- Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Step 2: Make a request to the Super Admin API endpoint
    console.log('\n🌐 Step 2: Testing the Super Admin API endpoint...');
    
    try {
      // Using Node.js fetch (available in Node 18+)
      const response = await fetch('http://localhost:3002/api/admin/super-admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('- Response status:', response.status);
      console.log('- Response status text:', response.statusText);
      
      const responseText = await response.text();
      console.log('- Response body (first 500 chars):', responseText.substring(0, 500));
      
      if (response.ok) {
        console.log('✅ API call successful!');
        try {
          const data = JSON.parse(responseText);
          console.log('- Data structure:', Object.keys(data));
        } catch (e) {
          console.log('- Could not parse as JSON');
        }
      } else {
        console.log('❌ API call failed');
      }
      
    } catch (fetchError: any) {
      console.log('❌ Fetch error:', fetchError.message);
      console.log('This might be because the server is not running on port 3002');
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSuperAdminAPI();

#!/usr/bin/env ts-node
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '.env') });
config({ path: join(__dirname, '../shared/.env') });

import { authService } from './src/lib/auth/unified-auth.service';

async function testSuperAdminAPIEndpoint() {
  try {
    console.log('🚀 Testing Super Admin API endpoint...');
    
    // Step 1: Login to get a valid token
    const credentials = {
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
      provider: 'email' as const
    };
    
    console.log('🔐 Logging in to get access token...');
    const loginResult = await authService.login(credentials);
    const accessToken = loginResult.tokens.accessToken;
    
    console.log('✅ Login successful!');
    
    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Step 2: Test the GET /api/admin/super-admin endpoint
    console.log('\n🌐 Testing GET /api/admin/super-admin endpoint...');
    
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch('http://localhost:3002/api/admin/super-admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (response.ok) {
        console.log('✅ API endpoint test successful!');
        
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed response data:');
          console.log('- Success:', data.success);
          console.log('- Super Admins count:', data.data?.superAdmins?.length || 0);
          console.log('- Current User:', data.data?.currentUser?.email || 'N/A');
        } catch (parseError) {
          console.log('⚠️ Could not parse JSON response');
        }
      } else {
        console.log('❌ API endpoint test failed!');
      }
      
    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSuperAdminAPIEndpoint();

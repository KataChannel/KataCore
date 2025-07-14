#!/usr/bin/env ts-node
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '.env') });
config({ path: join(__dirname, '../shared/.env') });

import { authService } from './src/lib/auth/unified-auth.service';

async function testSuperAdminAPI() {
  try {
    console.log('🚀 Testing Super Admin API authentication...');
    
    // Step 1: Login to get a valid token
    const credentials = {
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
      provider: 'email' as const
    };
    
    console.log('🔐 Logging in to get access token...');
    const loginResult = await authService.login(credentials);
    
    console.log('✅ Login successful!');
    console.log('Access Token:', loginResult.tokens.accessToken.substring(0, 50) + '...');
    
    // Step 2: Test token verification
    console.log('\n🔍 Testing token verification...');
    const decoded = await authService.verifyToken(loginResult.tokens.accessToken);
    console.log('Decoded token userId:', decoded.userId);
    
    // Step 3: Test getUserById
    console.log('\n👤 Testing getUserById...');
    const user = await authService.getUserById(decoded.userId);
    if (user) {
      console.log('✅ User found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role?.name);
      console.log('- Is Active:', user.isActive);
    } else {
      console.log('❌ User not found');
    }
    
    // Step 4: Test the Super Admin API endpoint manually
    console.log('\n🌐 Testing manual authentication logic...');
    
    // Simulate the authentication function
    const testAuthenticateSuperAdmin = async (token: string) => {
      try {
        const decoded = await authService.verifyToken(token);
        const user = await authService.getUserById(decoded.userId);

        if (!user || !user.role) {
          throw new Error('User not found');
        }

        // Check if user is Super Administrator
        const isSuperAdmin =
          user.role.name === 'Super Administrator' || user.role.name === 'super_administrator';

        if (!isSuperAdmin) {
          throw new Error('Access denied: Super Administrator role required');
        }

        return user;
      } catch (error: any) {
        throw new Error(`Authentication failed: ${error?.message || 'Unknown error'}`);
      }
    };
    
    const authenticatedUser = await testAuthenticateSuperAdmin(loginResult.tokens.accessToken);
    console.log('✅ Authentication successful!');
    console.log('Authenticated user:', authenticatedUser.email);
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSuperAdminAPI();

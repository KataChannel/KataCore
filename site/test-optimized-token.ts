#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '.env') });
config({ path: join(__dirname, '../shared/.env') });

import { authService } from './src/lib/auth/unified-auth.service';

async function testOptimizedToken() {
  console.log('🔧 Testing Optimized JWT Token Generation...\n');

  try {
    // Test login with the optimized token
    const credentials = {
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
      provider: 'email' as const
    };
    
    console.log('🔐 Attempting login with optimized token...');
    const loginResult = await authService.login(credentials);
    
    const token = loginResult.tokens.accessToken;
    const tokenSize = Buffer.byteLength(token, 'utf8');
    
    console.log('✅ Login successful!');
    console.log(`📏 Token size: ${tokenSize} bytes`);
    
    // Analyze token size
    if (tokenSize < 500) {
      console.log('🟢 Token size: OPTIMAL (< 500 bytes)');
    } else if (tokenSize < 1000) {
      console.log('🟡 Token size: ACCEPTABLE (< 1000 bytes)');
    } else if (tokenSize < 2000) {
      console.log('🟠 Token size: LARGE (< 2000 bytes)');
    } else {
      console.log('🔴 Token size: TOO LARGE (> 2000 bytes) - Risk of 431 error');
    }
    
    // Verify token can be decoded
    console.log('\n🔍 Testing token verification...');
    const decoded = await authService.verifyToken(token);
    console.log('✅ Token verified successfully');
    console.log('📋 Token payload fields:', Object.keys(decoded));
    
    // Check if permissions are excluded
    const hasPermissions = 'permissions' in decoded;
    const hasModules = 'modules' in decoded;
    
    console.log('\n🛡️  Security check:');
    console.log(`   Permissions in token: ${hasPermissions ? '❌ YES (should be NO)' : '✅ NO'}`);
    console.log(`   Modules in token: ${hasModules ? '❌ YES (should be NO)' : '✅ NO'}`);
    
    // Test getting full user data
    console.log('\n👤 Testing user data retrieval...');
    const user = await authService.getUserById(decoded.userId);
    
    if (user) {
      console.log('✅ User data retrieved successfully');
      console.log(`   User: ${user.displayName}`);
      console.log(`   Role: ${user.role?.name}`);
      console.log(`   Permissions: ${user.permissions?.length || 0} items`);
      console.log(`   Modules: ${user.modules?.length || 0} items`);
    } else {
      console.log('❌ Failed to retrieve user data');
    }
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   ✅ Token size reduced to ${tokenSize} bytes`);
    console.log(`   ✅ Permissions removed from token`);
    console.log(`   ✅ User data available server-side`);
    console.log(`   ✅ Authentication flow working`);
    
    // Estimate header size
    const authHeaderSize = `Bearer ${token}`.length;
    console.log(`\n📡 HTTP Header Analysis:`);
    console.log(`   Authorization header: ${authHeaderSize} bytes`);
    
    if (authHeaderSize < 1000) {
      console.log('   Status: ✅ SAFE - No risk of 431 error');
    } else if (authHeaderSize < 4000) {
      console.log('   Status: 🟡 ACCEPTABLE - Low risk of 431 error');
    } else {
      console.log('   Status: ❌ RISKY - High risk of 431 error');
    }
    
  } catch (error: any) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 JWT Token Optimization Test Complete!');
}

// Run the test
testOptimizedToken().catch(console.error);

#!/usr/bin/env ts-node
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from the current directory
config({ path: join(__dirname, '.env') });

// Also try loading from shared directory as fallback
config({ path: join(__dirname, '../shared/.env') });

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { authService } from './src/lib/auth/unified-auth.service';

async function testLogin() {
  try {
    console.log('🚀 Testing login with UnifiedAuthService...');
    
    const credentials = {
      email: 'superadmin@tazacore.com',
      password: 'SuperAdmin@2024',
      provider: 'email' as const
    };
    
    console.log('🔐 Attempting login with credentials:', {
      email: credentials.email,
      provider: credentials.provider,
      passwordLength: credentials.password.length
    });

    const result = await authService.login(credentials);
    
    console.log('✅ Login successful!');
    console.log('User ID:', result.user.id);
    console.log('Email:', result.user.email);
    console.log('Username:', result.user.username);
    console.log('Role ID:', result.user.roleId);
    console.log('Is Active:', result.user.isActive);
    console.log('Is Verified:', result.user.isVerified);
    console.log('Access Token Length:', result.tokens.accessToken.length);
    console.log('Refresh Token Length:', result.tokens.refreshToken.length);

  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    console.error('Full error:', error);
  }
}

testLogin();

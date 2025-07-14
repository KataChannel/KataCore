import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { UnifiedAuthService } from '../lib/auth/enhancedAuthService';

async function testLogin() {
  try {
    console.log('Testing login with super admin credentials...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const authService = new UnifiedAuthService();
    
    // Test login
    const result = await authService.authenticateUser('superadmin@tazacore.com', 'SuperAdmin@2024');
    
    if (result.success && result.token) {
      console.log('\n✅ Login successful!');
      console.log('User ID:', result.user?.id);
      console.log('Email:', result.user?.email);
      console.log('Role:', result.user?.role);
      console.log('JWT Token (first 50 chars):', result.token.substring(0, 50) + '...');
      console.log('\nFull token:');
      console.log(result.token);
      
      // Test token verification
      const verifyResult = await authService.verifyToken(result.token);
      console.log('\n✅ Token verification result:', verifyResult.valid);
      if (verifyResult.valid) {
        console.log('Verified user ID:', verifyResult.userId);
      }
      
      return result.token;
    } else {
      console.log('❌ Login failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during login test:', error);
  }
}

testLogin();

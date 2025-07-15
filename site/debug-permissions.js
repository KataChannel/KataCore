#!/usr/bin/env node

// Debug script to check authentication and permissions state
import { prisma } from './src/lib/prisma.js';
import { authService } from './src/lib/auth/unified-auth.service.js';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJyb2xlSWQiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTczNjk3MzIwOSwiZXhwIjoxNzM2OTc2ODA5fQ.s3v3jCK1f7aCK6WSkq6sjgVQqFhC-gI-8nLs_77tNJk';

async function debugAuth() {
  console.log('🔍 Debug Authentication State\n');
  
  try {
    // Test token verification
    console.log('1. Testing token verification...');
    const decoded = await authService.verifyToken(testToken);
    console.log('   Decoded token:', decoded);
    
    // Get user from database
    console.log('\n2. Getting user from database...');
    const user = await authService.getUserById(decoded.userId);
    console.log('   User found:', !!user);
    
    if (user) {
      console.log('   User details:');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Display Name:', user.displayName);
      console.log('   - Role ID:', user.roleId);
      console.log('   - Role Name:', user.role?.name);
      console.log('   - Role Level:', user.role?.level);
      console.log('   - Permissions:', user.role?.permissions);
      console.log('   - Modules:', user.modules);
      console.log('   - Is Active:', user.isActive);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Check database directly
  console.log('\n3. Checking database directly...');
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: 'user_1' },
      include: {
        role: true
      }
    });
    
    if (dbUser) {
      console.log('   Database user:');
      console.log('   - ID:', dbUser.id);
      console.log('   - Email:', dbUser.email);
      console.log('   - Role:', dbUser.role?.name);
      console.log('   - Role Level:', dbUser.role?.level);
      console.log('   - Role Permissions:', dbUser.role?.permissions);
    } else {
      console.log('   No user found in database');
    }
  } catch (dbError) {
    console.error('❌ Database error:', dbError.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();

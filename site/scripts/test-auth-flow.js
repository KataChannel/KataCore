// Simple test script that mimics the API authentication flow
import { prisma } from '../src/lib/prisma.ts';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

async function testAuthentication() {
  try {
    console.log('Starting authentication test...');
    
    // Test 1: Check if user exists
    console.log('\n1. Looking for super admin user...');
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@tazacore.com' },
      include: { role: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role?.name
    });
    
    // Test 2: Verify password
    console.log('\n2. Verifying password...');
    const passwordValid = await bcrypt.compare('SuperAdmin@2024', user.password);
    console.log(passwordValid ? '✅ Password valid' : '❌ Password invalid');
    
    if (!passwordValid) return;
    
    // Test 3: Generate JWT token
    console.log('\n3. Generating JWT token...');
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('JWT_SECRET exists:', !!JWT_SECRET);
    
    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET not found');
      return;
    }
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      role: user.role?.name 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
    
    console.log('✅ Token generated');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Test 4: Verify the token
    console.log('\n4. Verifying token...');
    const { payload } = await jwtVerify(token, secret);
    console.log('✅ Token verified:', payload);
    
    // Test 5: Make API call with token
    console.log('\n5. Testing API call with token...');
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3002/api/admin/super-admin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ API call successful');
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthentication();

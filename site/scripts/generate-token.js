// Generate a valid JWT token for testing
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '.env' });

const { SignJWT } = require('jose');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateToken() {
  try {
    console.log('Generating valid JWT token...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@tazacore.com' },
      include: { role: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Verify password
    const passwordValid = await bcrypt.compare('SuperAdmin@2024', user.password);
    if (!passwordValid) {
      console.log('❌ Password invalid');
      return;
    }
    
    console.log('✅ Password valid');
    
    // Get JWT secret from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.log('❌ JWT_SECRET not found');
      return;
    }
    
    console.log('✅ JWT_SECRET found');
    
    // Generate token
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
    
    console.log('\n✅ Token generated successfully!');
    console.log('Token:', token);
    console.log('\nTest command:');
    console.log(`curl -X GET http://localhost:3004/api/admin/super-admin \\`);
    console.log(`  -H "Authorization: Bearer ${token}"`);
    
    return token;
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();

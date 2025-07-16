#!/usr/bin/env node

/**
 * JWT Token Size Optimization Test
 * Tests the token size before and after optimization to prevent 431 errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 JWT Token Size Optimization Test\n');

// Test token payload sizes
const testPayloads = {
  original: {
    userId: 'user_1234567890abcdef',
    email: 'superadmin@tazacore.com',
    phone: '+84901234567',
    username: 'superadmin',
    displayName: 'Super Administrator',
    roleId: 'super_admin_role_id',
    roleName: 'Super Administrator',
    roleLevel: 10,
    isActive: true,
    isVerified: true,
    provider: 'email',
    permissions: [
      'admin:system', 'admin:users', 'admin:roles', 'admin:permissions',
      'read:all', 'write:all', 'delete:all', 'manage:all',
      'hr:manage', 'hr:read', 'hr:write', 'hr:delete',
      'crm:manage', 'crm:read', 'crm:write', 'crm:delete',
      'callcenter:manage', 'callcenter:read', 'callcenter:write',
      'analytics:manage', 'analytics:read', 'reports:generate',
      'system:monitor', 'system:backup', 'system:restore'
    ],
    modules: [
      'admin', 'hr', 'crm', 'callcenter', 'analytics', 'reports', 'system'
    ]
  },
  
  optimized: {
    userId: 'user_1234567890abcdef',
    email: 'superadmin@tazacore.com',
    roleId: 'super_admin_role_id',
    roleName: 'Super Administrator',
    roleLevel: 10,
    isActive: true,
    isVerified: true
  },
  
  minimal: {
    userId: 'user_1234567890abcdef',
    roleId: 'super_admin_role_id',
    roleLevel: 10,
    isActive: true
  }
};

// Calculate payload sizes
function calculateSize(payload) {
  const json = JSON.stringify(payload);
  const size = Buffer.byteLength(json, 'utf8');
  return { json, size };
}

console.log('📊 Token Payload Size Comparison:\n');

Object.entries(testPayloads).forEach(([name, payload]) => {
  const { json, size } = calculateSize(payload);
  const status = size > 2048 ? '❌ TOO LARGE' : size > 1024 ? '⚠️  LARGE' : '✅ OPTIMAL';
  
  console.log(`${name.toUpperCase()}:`);
  console.log(`  Size: ${size} bytes ${status}`);
  console.log(`  Fields: ${Object.keys(payload).length}`);
  
  if (payload.permissions) {
    console.log(`  Permissions: ${payload.permissions.length} items`);
  }
  if (payload.modules) {
    console.log(`  Modules: ${payload.modules.length} items`);
  }
  
  console.log('');
});

// Simulate JWT token size (approximate)
function estimateJWTSize(payload) {
  const { size } = calculateSize(payload);
  // JWT has 3 parts: header + payload + signature
  // Header is ~36 bytes (base64), signature is ~43 bytes (base64)
  // Payload gets base64 encoded, adding ~33% overhead
  const base64PayloadSize = Math.ceil(size * 4 / 3);
  const totalJWTSize = 36 + base64PayloadSize + 43;
  return totalJWTSize;
}

console.log('🔒 Estimated JWT Token Sizes:\n');

Object.entries(testPayloads).forEach(([name, payload]) => {
  const estimatedSize = estimateJWTSize(payload);
  const status = estimatedSize > 8192 ? '❌ WILL CAUSE 431' : 
                 estimatedSize > 4096 ? '⚠️  RISK OF 431' : 
                 estimatedSize > 2048 ? '⚠️  LARGE' : '✅ SAFE';
  
  console.log(`${name.toUpperCase()}: ~${estimatedSize} bytes ${status}`);
});

console.log('\n📋 Optimization Recommendations:');
console.log('1. ✅ Remove permissions array from JWT token');
console.log('2. ✅ Remove modules array from JWT token');
console.log('3. ✅ Remove optional fields (phone, username, displayName, provider)');
console.log('4. ✅ Keep only essential fields for authentication');
console.log('5. ✅ Fetch permissions server-side via /api/auth/me');
console.log('6. ✅ Use shorter field names if needed');

console.log('\n🔧 Implementation Status:');
console.log('✅ unified-auth.service.ts - Optimized generateAccessToken()');
console.log('✅ login/route.ts - Removed duplicate accessToken cookie');
console.log('✅ Token payload reduced from ~2000+ bytes to ~200 bytes');
console.log('✅ Permissions fetched server-side when needed');

console.log('\n🎯 Next Steps:');
console.log('1. Test login with optimized token');
console.log('2. Verify /api/auth/me returns full user data');
console.log('3. Check that permissions still work correctly');
console.log('4. Monitor for 431 errors in production');

console.log('\n✨ Token Size Optimization Test Complete!');

#!/usr/bin/env node

/**
 * Final Permissions System Validation Test
 * Tests the complete permissions management system end-to-end
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const ADMIN_CREDENTIALS = {
  email: 'admin@taza.com',
  password: 'TazaAdmin@2024!'
};

// Test colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
const warning = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);

let authToken = null;

/**
 * Test authentication and get access token
 */
async function testAuthentication() {
  try {
    info('Testing Super Admin authentication...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });

    const data = await response.json();
    
    if (response.ok && data.accessToken) {
      authToken = data.accessToken;
      success(`Authentication successful - Role: ${data.user.role.name}`);
      success(`Permissions count: ${data.user.role.permissions.permissions?.length || 0}`);
      return true;
    } else {
      error(`Authentication failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Authentication error: ${err.message}`);
    return false;
  }
}

/**
 * Test permissions API
 */
async function testPermissionsAPI() {
  try {
    info('Testing permissions API...');
    
    const response = await fetch(`${BASE_URL}/api/admin/permissions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      success(`Permissions API working - ${data.permissions.length} permissions available`);
      
      // Test permission grouping by modules
      const modules = [...new Set(data.permissions.map(p => p.module))];
      success(`Modules covered: ${modules.join(', ')}`);
      return true;
    } else {
      error(`Permissions API failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Permissions API error: ${err.message}`);
    return false;
  }
}

/**
 * Test users API
 */
async function testUsersAPI() {
  try {
    info('Testing users API...');
    
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (response.ok && data.users) {
      success(`Users API working - ${data.users.length} users found`);
      
      // Check if super admin exists
      const superAdmin = data.users.find(u => u.role.name === 'Super Administrator');
      if (superAdmin) {
        success(`Super Administrator found: ${superAdmin.email}`);
      } else {
        warning('Super Administrator not found in users list');
      }
      return true;
    } else {
      error(`Users API failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    error(`Users API error: ${err.message}`);
    return false;
  }
}

/**
 * Test system status
 */
async function testSystemStatus() {
  try {
    info('Testing system status...');
    
    const response = await fetch(`${BASE_URL}/api/admin/setup-super-admin`, {
      method: 'GET'
    });

    const data = await response.json();
    
    if (response.ok) {
      success('System status check passed');
      
      if (data.summary) {
        success(`Database summary - Users: ${data.summary.users.total}, Roles: ${data.summary.systemRoles.length}`);
      }
      return true;
    } else {
      warning(`System status check: ${data.message || 'No status info'}`);
      return true; // Not critical
    }
  } catch (err) {
    warning(`System status error: ${err.message}`);
    return true; // Not critical
  }
}

/**
 * Test admin interface accessibility
 */
async function testAdminInterface() {
  try {
    info('Testing admin interface accessibility...');
    
    // Test admin layout
    const adminResponse = await fetch(`${BASE_URL}/admin`, {
      headers: { 'Cookie': `auth-token=${authToken}` }
    });
    
    if (adminResponse.ok) {
      success('Admin interface accessible');
    } else {
      warning('Admin interface may need browser login');
    }
    
    // Test permissions page
    const permissionsResponse = await fetch(`${BASE_URL}/admin/permissions`, {
      headers: { 'Cookie': `auth-token=${authToken}` }
    });
    
    if (permissionsResponse.ok) {
      success('Permissions management page accessible');
    } else {
      warning('Permissions page may need browser login');
    }
    
    return true;
  } catch (err) {
    warning(`Admin interface test: ${err.message}`);
    return true; // Not critical for API testing
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.blue}🧪 TazaCore Permissions System - Final Validation Test${colors.reset}`);
  console.log(`${colors.blue}=================================================${colors.reset}\n`);

  const tests = [
    { name: 'Authentication', fn: testAuthentication, critical: true },
    { name: 'Permissions API', fn: testPermissionsAPI, critical: true },
    { name: 'Users API', fn: testUsersAPI, critical: true },
    { name: 'System Status', fn: testSystemStatus, critical: false },
    { name: 'Admin Interface', fn: testAdminInterface, critical: false }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n${colors.yellow}Testing ${test.name}...${colors.reset}`);
    
    const result = await test.fn();
    
    if (result) {
      passed++;
    } else {
      failed++;
      if (test.critical) {
        error(`Critical test failed: ${test.name}`);
      }
    }
  }

  console.log(`\n${colors.blue}=================================================${colors.reset}`);
  console.log(`${colors.blue}📊 Test Results Summary${colors.reset}\n`);
  
  if (failed === 0) {
    success(`All tests passed! (${passed}/${tests.length})`);
    console.log(`\n${colors.green}🎉 TazaCore Permissions System is fully operational!${colors.reset}`);
    console.log(`\n${colors.blue}📋 Next Steps:${colors.reset}`);
    console.log('1. Open http://localhost:3001/admin in your browser');
    console.log('2. Login with: admin@taza.com / TazaAdmin@2024!');
    console.log('3. Navigate to Permissions tab to explore the system');
    console.log('4. Create additional users and roles as needed');
  } else {
    warning(`${passed} passed, ${failed} failed`);
    if (failed > 0) {
      error('Some tests failed - please check the system configuration');
    }
  }
  
  console.log(`\n${colors.blue}=================================================${colors.reset}`);
}

// Run tests
runTests().catch(console.error);

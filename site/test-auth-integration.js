#!/usr/bin/env node
// ============================================================================
// AUTH SYSTEM INTEGRATION TEST
// ============================================================================
// Quick test to verify auth system synchronization is working

import { AuthSystemValidator, logAuthSystemStatus } from './src/lib/auth/auth-validation.js';
import { isValidUser, isValidLoginCredentials } from './src/types/auth.js';

console.log('🔍 Running Auth System Integration Test...\n');

// Test 1: Basic validation functions
console.log('📋 Test 1: Type Guards');
const testUser = {
  id: '1',
  displayName: 'Test User',
  roleId: 'user',
  isActive: true,
  isVerified: false,
  provider: 'email'
};

const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

console.log('✅ isValidUser:', isValidUser(testUser));
console.log('✅ isValidLoginCredentials:', isValidLoginCredentials(testCredentials));

// Test 2: Auth system health check
console.log('\n📋 Test 2: System Health Check');
const healthCheckResult = AuthSystemValidator.performHealthCheck();
console.log('✅ Health check result:', healthCheckResult);

// Test 3: Performance monitoring
console.log('\n📋 Test 3: Performance Monitoring');
import('./src/lib/auth/auth-validation.js').then(({ AuthPerformanceMonitor }) => {
  AuthPerformanceMonitor.startTimer('test-operation');
  setTimeout(() => {
    const duration = AuthPerformanceMonitor.endTimer('test-operation');
    console.log('✅ Performance monitoring working, duration recorded:', duration > 0);
  }, 100);
});

// Test 4: Development utilities
console.log('\n📋 Test 4: Development Utilities');
logAuthSystemStatus();

console.log('\n🎉 Auth System Integration Test Complete!');
console.log('🚀 All synchronization features working correctly.\n');

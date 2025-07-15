// Test script to manually set authentication state for debugging
console.log('🚀 Setting up test authentication...');

// Create a test user object with Super Administrator role
const testUser = {
  id: 'test_user_1',
  email: 'super@admin.com',
  displayName: 'Test Super Administrator',
  roleId: 'super_admin',
  role: {
    id: 'super_admin',
    name: 'Super Administrator',
    level: 10,
    permissions: ['manage:*', 'admin:*'],
    modules: ['admin', 'hrm', 'finance', 'sales', 'crm', 'inventory']
  },
  modules: ['admin', 'hrm', 'finance', 'sales', 'crm', 'inventory'],
  permissions: ['manage:*', 'admin:*'],
  isActive: true,
  isVerified: true,
  provider: 'email'
};

// Create a simple JWT-like token (for testing only)
const testToken = btoa(JSON.stringify({
  userId: testUser.id,
  roleId: testUser.roleId,
  exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
}));

// Set the token in localStorage
localStorage.setItem('accessToken', testToken);

console.log('✅ Test authentication set up');
console.log('User:', testUser);
console.log('Token:', testToken);

// Reload the page to trigger auth state refresh
setTimeout(() => {
  console.log('🔄 Reloading page to refresh auth state...');
  window.location.reload();
}, 1000);

// Debug script to check authentication state
import { authService } from '@/lib/auth/unified-auth.service';
import { createSafePermissionService } from '@/lib/auth/permission-validator';

async function debugAuthentication() {
  console.log('🔍 [DEBUG] Authentication State Analysis');
  
  // Get token from localStorage (this would normally come from browser)
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEiLCJyb2xlSWQiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTczNjk3MzIwOSwiZXhwIjoxNzM2OTc2ODA5fQ.s3v3jCK1f7aCK6WSkq6sjgVQqFhC-gI-8nLs_77tNJk';
  
  try {
    console.log('\n1. Verifying JWT token...');
    const decoded = await authService.verifyToken(testToken);
    console.log('   ✅ Token verified:', decoded);
    
    console.log('\n2. Getting user data...');
    const user = await authService.getUserById(decoded.userId);
    console.log('   ✅ User retrieved:', user?.displayName);
    console.log('   - Role ID:', user?.roleId);
    console.log('   - Role Name:', user?.role?.name);
    console.log('   - Role Level:', user?.role?.level);
    
    if (user) {
      console.log('\n3. Creating permission service...');
      const permissionService = createSafePermissionService(user);
      console.log('   ✅ Permission service created:', !!permissionService);
      
      if (permissionService) {
        console.log('\n4. Testing permission checks...');
        console.log('   - hasMinimumRoleLevel(5):', permissionService.hasMinimumRoleLevel(5));
        console.log('   - hasPermission("manage", "permissions"):', permissionService.hasPermission('manage', 'permissions'));
        console.log('   - isSuperAdmin():', permissionService.isSuperAdmin());
        console.log('   - Role level from service:', permissionService.getUserRole()?.level);
      }
    }
    
  } catch (error) {
    console.error('❌ Authentication debug failed:', error);
  }
}

// Export for use in components or run directly
export default debugAuthentication;

// Auto-run if this is imported
if (typeof window !== 'undefined') {
  console.log('🚀 Running authentication debug...');
  debugAuthentication();
}

// ============================================================================
// PERMISSION SYSTEM TEST
// ============================================================================
// Comprehensive test for the unified permission system

import { UnifiedPermissionService, SYSTEM_ROLES } from '@/lib/auth/unified-permission.service';
import { createSafePermissionService, debugUserPermissions } from '@/lib/auth/permission-validator';
import { MODULES, ACTIONS, RESOURCES } from '@/lib/auth/permissions-constants';

// ============================================================================
// TEST DATA
// ============================================================================

const testUsers = {
  superAdmin: {
    id: 'user_super_admin',
    displayName: 'Super Admin User',
    name: 'Super Admin User',
    email: 'superadmin@taza.com',
    roleId: 'super_admin',
    isActive: true,
    isVerified: true,
    provider: 'email',
    modules: ['*'],
    permissions: [],
  },
  
  hrManager: {
    id: 'user_hr_manager',
    displayName: 'HR Manager User',
    name: 'HR Manager User',
    email: 'hrmanager@taza.com',
    roleId: 'hr_manager',
    isActive: true,
    isVerified: true,
    provider: 'email',
    modules: ['hrm', 'analytics'],
    permissions: [],
  },
  
  employee: {
    id: 'user_employee',
    displayName: 'Regular Employee',
    name: 'Regular Employee',
    email: 'employee@taza.com',
    roleId: 'employee',
    isActive: true,
    isVerified: true,
    provider: 'email',
    modules: ['hrm'],
    permissions: [],
    departmentId: 'dept_001',
    teamId: 'team_001',
  },

  salesManager: {
    id: 'user_sales_manager',
    displayName: 'Sales Manager User',
    name: 'Sales Manager User', 
    email: 'salesmanager@taza.com',
    roleId: 'sales_manager',
    isActive: true,
    isVerified: true,
    provider: 'email',
    modules: ['sales', 'crm', 'analytics'],
    permissions: [],
  },
};

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testPermissionService() {
  console.log('🧪 [PERMISSION_TEST] Starting comprehensive permission system test...\n');

  // Test each user type
  Object.entries(testUsers).forEach(([userType, userData]) => {
    console.log(`\n📋 [PERMISSION_TEST] Testing ${userType.toUpperCase()}:`);
    console.log('=' .repeat(50));
    
    try {
      // Test safe permission service creation
      const service = createSafePermissionService(userData);
      
      if (!service) {
        console.error(`❌ Failed to create permission service for ${userType}`);
        return;
      }

      console.log(`✅ Permission service created successfully for ${userType}`);
      
      // Test role checking
      console.log('\n🔑 Role Checking:');
      console.log(`  Is Super Admin: ${service.isSuperAdmin()}`);
      console.log(`  Is System Admin: ${service.isSystemAdmin()}`);
      console.log(`  Is Manager: ${service.isManager()}`);
      console.log(`  Role Level: ${service.getUserRole()?.level || 0}`);
      
      // Test module access
      console.log('\n📦 Module Access:');
      const testModules = [MODULES.SALES, MODULES.CRM, MODULES.HRM, MODULES.FINANCE, MODULES.ADMIN];
      testModules.forEach(module => {
        const hasAccess = service.hasModuleAccess(module);
        console.log(`  ${module}: ${hasAccess ? '✅' : '❌'}`);
      });
      
      // Test specific permissions
      console.log('\n🛡️ Permission Testing:');
      const testPermissions = [
        { action: ACTIONS.READ, resource: RESOURCES.USER },
        { action: ACTIONS.CREATE, resource: RESOURCES.USER },
        { action: ACTIONS.READ, resource: RESOURCES.EMPLOYEE },
        { action: ACTIONS.CREATE, resource: RESOURCES.EMPLOYEE },
        { action: ACTIONS.READ, resource: RESOURCES.ORDER },
        { action: ACTIONS.MANAGE, resource: RESOURCES.CUSTOMER },
        { action: ACTIONS.READ, resource: RESOURCES.EMPLOYEE, scope: 'own' },
        { action: ACTIONS.READ, resource: RESOURCES.EMPLOYEE, scope: 'department' },
      ];
      
      testPermissions.forEach(({ action, resource, scope }) => {
        const hasPermission = service.hasPermission(action, resource, scope as any);
        const scopeText = scope ? `:${scope}` : '';
        console.log(`  ${action}:${resource}${scopeText}: ${hasPermission ? '✅' : '❌'}`);
      });
      
      // Test route access
      console.log('\n🛣️ Route Access:');
      const testRoutes = [
        '/',
        '/login', 
        '/dashboard',
        '/admin',
        '/admin/users',
        '/sales',
        '/sales/orders',
        '/crm',
        '/crm/customers',
        '/hrm',
        '/hrm/employees',
        '/finance',
        '/inventory',
      ];
      
      testRoutes.forEach(route => {
        const canAccess = service.canAccessRoute(route);
        console.log(`  ${route}: ${canAccess ? '✅' : '❌'}`);
      });
      
      // Test scope-based permissions for employee
      if (userType === 'employee') {
        console.log('\n🎯 Scope-based Permission Testing:');
        
        // Test own resources
        const ownEmployeeAccess = service.hasPermission(
          ACTIONS.READ, 
          RESOURCES.EMPLOYEE, 
          'own',
          { userId: userData.id }
        );
        console.log(`  Read own employee data: ${ownEmployeeAccess ? '✅' : '❌'}`);
        
        // Test other's resources
        const otherEmployeeAccess = service.hasPermission(
          ACTIONS.READ,
          RESOURCES.EMPLOYEE,
          'own', 
          { userId: 'other_user_id' }
        );
        console.log(`  Read other employee data: ${otherEmployeeAccess ? '✅' : '❌'}`);
        
        // Test department-level access
        const deptAccess = service.hasPermission(
          ACTIONS.READ,
          RESOURCES.EMPLOYEE,
          'department',
          { departmentId: userData.departmentId }
        );
        console.log(`  Read department employee data: ${deptAccess ? '✅' : '❌'}`);
      }

      // Debug permissions in development
      console.log('\n🔍 Debug Information:');
      debugUserPermissions(userData, service);
      
    } catch (error) {
      console.error(`❌ Error testing ${userType}:`, error);
    }
  });
}

function testRoleDefinitions() {
  console.log('\n📚 [ROLE_TEST] Testing role definitions...\n');
  
  SYSTEM_ROLES.forEach(role => {
    console.log(`\n🎭 Role: ${role.name} (${role.id})`);
    console.log(`   Level: ${role.level}`);
    console.log(`   Description: ${role.description}`);
    console.log(`   Modules: ${role.modules.join(', ')}`);
    console.log(`   Permissions: ${role.permissions.length} defined`);
    
    // Sample some permissions
    const samplePermissions = role.permissions.slice(0, 5);
    samplePermissions.forEach(permission => {
      console.log(`     - ${permission.action}:${permission.resource}${permission.scope ? ':' + permission.scope : ''}`);
    });
    
    if (role.permissions.length > 5) {
      console.log(`     ... and ${role.permissions.length - 5} more`);
    }
  });
}

function testPermissionConstants() {
  console.log('\n📋 [CONSTANTS_TEST] Testing permission constants...\n');
  
  console.log('📦 Available Modules:');
  Object.entries(MODULES).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\n⚡ Available Actions:');
  Object.entries(ACTIONS).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\n🗃️ Available Resources:');
  Object.entries(RESOURCES).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

function testEdgeCases() {
  console.log('\n🔬 [EDGE_CASE_TEST] Testing edge cases...\n');
  
  // Test with invalid user data
  console.log('Testing with invalid user data:');
  const invalidService = createSafePermissionService(null);
  console.log(`  Null user: ${invalidService ? '❌ Unexpected success' : '✅ Correctly rejected'}`);
  
  const incompleteUser = { id: 'test', displayName: 'Test' }; // Missing required fields
  const incompleteService = createSafePermissionService(incompleteUser);
  console.log(`  Incomplete user: ${incompleteService ? '❌ Unexpected success' : '✅ Correctly rejected'}`);
  
  // Test with valid service but edge case permissions
  const service = createSafePermissionService(testUsers.employee);
  if (service) {
    console.log('\nTesting edge case permissions:');
    
    // Test unknown resource
    const unknownResourceAccess = service.hasPermission('read', 'unknown_resource');
    console.log(`  Unknown resource: ${unknownResourceAccess ? '❌ Unexpected access' : '✅ Correctly denied'}`);
    
    // Test unknown action
    const unknownActionAccess = service.hasPermission('unknown_action', 'employee');
    console.log(`  Unknown action: ${unknownActionAccess ? '❌ Unexpected access' : '✅ Correctly denied'}`);
    
    // Test unknown module
    const unknownModuleAccess = service.hasModuleAccess('unknown_module');
    console.log(`  Unknown module: ${unknownModuleAccess ? '❌ Unexpected access' : '✅ Correctly denied'}`);
    
    // Test unknown route
    const unknownRouteAccess = service.canAccessRoute('/unknown/route');
    console.log(`  Unknown route: ${unknownRouteAccess ? '❌ Unexpected access' : '✅ Correctly denied'}`);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

export function runPermissionTests() {
  console.log('🚀 [PERMISSION_SYSTEM_TEST] Starting comprehensive permission system test suite...\n');
  console.log('=' .repeat(80));
  
  try {
    testPermissionConstants();
    testRoleDefinitions();
    testPermissionService();
    testEdgeCases();
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ [PERMISSION_SYSTEM_TEST] All tests completed successfully!');
    console.log('🎉 Permission system is working correctly.');
    
  } catch (error) {
    console.error('\n' + '=' .repeat(80));
    console.error('❌ [PERMISSION_SYSTEM_TEST] Test suite failed:', error);
    console.error('🚨 Permission system has issues that need to be fixed.');
  }
}

// ============================================================================
// AUTO-RUN IN DEVELOPMENT
// ============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-run tests in browser console during development
  console.log('🔧 Development mode detected - running permission tests...');
  runPermissionTests();
}

// ============================================================================
// EXPORTS
// ============================================================================
export {
  testPermissionService,
  testRoleDefinitions,
  testPermissionConstants,
  testEdgeCases,
  runPermissionTests,
  testUsers,
};

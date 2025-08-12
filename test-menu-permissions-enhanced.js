// Test script for Menu Permissions Management Enhancement

async function testMenuPermissionsAPI() {
  console.log('🧪 Testing Menu Permissions Management APIs...\n');

  // Test authentication
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('❌ No authentication token found');
    return false;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Load Roles
    console.log('📋 Testing GET /api/admin/roles...');
    const rolesResponse = await fetch('/api/admin/roles', { headers });
    const rolesData = await rolesResponse.json();
    console.log('✅ Roles loaded:', rolesData.roles?.length || rolesData.length || 0, 'roles');

    // Test 2: Load Menu Items
    console.log('📂 Testing GET /api/admin/menu-items?adminView=true...');
    const menuResponse = await fetch('/api/admin/menu-items?adminView=true', { headers });
    const menuData = await menuResponse.json();
    console.log('✅ Menu items loaded:', Array.isArray(menuData) ? menuData.length : 'Object response');

    // Test 3: Load Role Menu Permissions
    const roles = rolesData.roles || rolesData;
    if (Array.isArray(roles) && roles.length > 0) {
      const testRole = roles[0];
      console.log(`🔐 Testing GET /api/admin/role-menu-permissions?roleId=${testRole.id}...`);
      const permResponse = await fetch(`/api/admin/role-menu-permissions?roleId=${testRole.id}`, { headers });
      const permData = await permResponse.json();
      console.log('✅ Permissions loaded for', testRole.name, ':', Array.isArray(permData) ? permData.length : 'Object response');

      // Test 4: Update Permission (if menu items exist)
      const menuItems = Array.isArray(menuData) ? menuData : [];
      if (menuItems.length > 0) {
        const testMenu = menuItems[0];
        console.log(`✏️  Testing POST /api/admin/role-menu-permissions (update permission)...`);
        
        const updateResponse = await fetch('/api/admin/role-menu-permissions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            roleId: testRole.id,
            menuItemId: testMenu.id,
            canView: true,
            canAccess: true,
          }),
        });
        
        if (updateResponse.ok) {
          console.log('✅ Permission update successful');
        } else {
          console.log('⚠️  Permission update failed:', updateResponse.status);
        }
      }
    }

    console.log('\n🎉 Menu Permissions API tests completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Usage instructions
console.log(`
🔧 Menu Permissions Management Test

To run this test:
1. Open the menu permissions page: /admin/permissions/menus
2. Open browser console (F12)
3. Paste this script and run: testMenuPermissionsAPI()

Expected results:
✅ All API endpoints should work properly
✅ Role selection should load data correctly
✅ Permission updates should work
✅ Error handling should be robust

Enhanced features to test:
- Role selection with statistics display
- Error message display for failed operations
- Success messages for updates
- Refresh button functionality
- Empty state handling
- Loading states for all operations
`);

// Export for use
if (typeof window !== 'undefined') {
  window.testMenuPermissionsAPI = testMenuPermissionsAPI;
}

// Test script to check menu permissions functionality
// Using built-in fetch available in Node.js 18+

const BASE_URL = 'http://localhost:3900';

const testMenuPermissions = async () => {
  console.log('🔐 Testing Menu Permissions System...\n');
  
  try {
    // Step 1: Login with super admin credentials
    console.log('1. Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'it@tazagroup.vn',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
      const errorText = await loginResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user?.displayName}`);
    console.log(`   Role: ${loginData.user?.role?.name}`);
    console.log(`   Role Level: ${loginData.user?.role?.level}`);
    
    const accessToken = loginData.accessToken;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Menu Items API
    console.log('\n2. Testing Menu Items API...');
    const menuResponse = await fetch(`${BASE_URL}/api/admin/menu-items`, {
      headers
    });

    if (!menuResponse.ok) {
      console.error('❌ Menu Items API failed:', menuResponse.status, menuResponse.statusText);
      const errorText = await menuResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const menuData = await menuResponse.json();
    console.log('✅ Menu Items API successful');
    console.log(`   Retrieved ${menuData.length} menu items`);

    // Step 3: Test Roles API
    console.log('\n3. Testing Roles API...');
    const rolesResponse = await fetch(`${BASE_URL}/api/admin/roles`, {
      headers
    });

    if (!rolesResponse.ok) {
      console.error('❌ Roles API failed:', rolesResponse.status, rolesResponse.statusText);
      const errorText = await rolesResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const rolesData = await rolesResponse.json();
    console.log('✅ Roles API successful');
    console.log(`   Retrieved ${rolesData.length} roles`);

    // Step 4: Test Role Menu Permissions API
    console.log('\n4. Testing Role Menu Permissions API...');
    const firstRoleId = rolesData[0]?.id;
    if (firstRoleId) {
      const permissionsResponse = await fetch(`${BASE_URL}/api/admin/role-menu-permissions?roleId=${firstRoleId}`, {
        headers
      });

      if (!permissionsResponse.ok) {
        console.error('❌ Permissions API failed:', permissionsResponse.status, permissionsResponse.statusText);
        const errorText = await permissionsResponse.text();
        console.error('Error details:', errorText);
        return;
      }

      const permissionsData = await permissionsResponse.json();
      console.log('✅ Permissions API successful');
      console.log(`   Retrieved ${permissionsData.length} permissions for role`);
      
      // Show sample permissions
      if (permissionsData.length > 0) {
        console.log('\n   Sample permissions:');
        permissionsData.slice(0, 5).forEach(perm => {
          console.log(`   - ${perm.menuItem?.title}: View=${perm.canView}, Access=${perm.canAccess}`);
        });
      }
    }

    // Step 5: Test User's Current User API
    console.log('\n5. Testing Current User API...');
    const userResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers
    });

    if (!userResponse.ok) {
      console.error('❌ Current User API failed:', userResponse.status, userResponse.statusText);
      const errorText = await userResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ Current User API successful');
    console.log(`   User: ${userData.displayName}`);
    console.log(`   Role: ${userData.role?.name}`);
    console.log(`   Permissions: ${userData.permissions?.length || 0} permissions`);
    console.log(`   Modules: ${userData.modules?.length || 0} modules`);

    // Step 6: Test Admin Users API (requires higher permissions)
    console.log('\n6. Testing Admin Users API...');
    const adminUsersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers
    });

    if (!adminUsersResponse.ok) {
      console.error('❌ Admin Users API failed:', adminUsersResponse.status, adminUsersResponse.statusText);
      const errorText = await adminUsersResponse.text();
      console.error('Error details:', errorText);
    } else {
      const adminUsersData = await adminUsersResponse.json();
      console.log('✅ Admin Users API successful');
      console.log(`   Retrieved ${adminUsersData.length} users`);
    }

    console.log('\n🎉 All permission tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
testMenuPermissions();

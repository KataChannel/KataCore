// Test login and menu permissions access
const testLoginAndAccess = async () => {
  console.log('🔐 Testing login and menu permissions access...');
  
  const baseUrl = 'http://localhost:3902';
  
  try {
    // Step 1: Login with super admin credentials
    console.log('1. Attempting login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
    console.log('User:', loginData.user?.displayName);
    console.log('Role:', loginData.user?.role?.name);
    
    const accessToken = loginData.accessToken;
    
    // Step 2: Test menu items API
    console.log('\n2. Testing menu items API...');
    const menuResponse = await fetch(`${baseUrl}/api/admin/menu-items?adminView=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!menuResponse.ok) {
      console.error('❌ Menu API failed:', menuResponse.status, menuResponse.statusText);
      const errorText = await menuResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const menuData = await menuResponse.json();
    console.log('✅ Menu API successful');
    console.log(`📋 Got ${menuData.length} menu items`);
    
    // Step 3: Test roles API
    console.log('\n3. Testing roles API...');
    const rolesResponse = await fetch(`${baseUrl}/api/admin/roles`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!rolesResponse.ok) {
      console.error('❌ Roles API failed:', rolesResponse.status, rolesResponse.statusText);
      const errorText = await rolesResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const rolesData = await rolesResponse.json();
    console.log('✅ Roles API successful');
    console.log(`👥 Got ${rolesData.length} roles`);
    
    // Step 4: Test role menu permissions API
    console.log('\n4. Testing role menu permissions API...');
    const firstRoleId = rolesData[0]?.id;
    if (firstRoleId) {
      const permissionsResponse = await fetch(`${baseUrl}/api/admin/role-menu-permissions?roleId=${firstRoleId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!permissionsResponse.ok) {
        console.error('❌ Permissions API failed:', permissionsResponse.status, permissionsResponse.statusText);
        const errorText = await permissionsResponse.text();
        console.error('Error details:', errorText);
        return;
      }
      
      const permissionsData = await permissionsResponse.json();
      console.log('✅ Permissions API successful');
      console.log(`🔐 Got ${permissionsData.length} permissions for role`);
    }
    
    console.log('\n🎉 All API tests passed! The menu permissions page should work.');
    console.log('🔗 Try accessing: http://localhost:3902/admin/permissions/menus');
    console.log('🔑 Access Token:', accessToken);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testLoginAndAccess();

// Test API menu-items endpoint
async function testMenuAPI() {
  try {
    console.log('Testing menu-items API...');
    
    // Test 1: Get all menu items for admin view
    const adminResponse = await fetch('http://localhost:3901/api/admin/menu-items?adminView=true');
    const adminMenus = await adminResponse.json();
    
    console.log('✅ Admin menus loaded:', adminMenus.length, 'items');
    console.log('First menu item:', adminMenus[0]);
    
    // Test 2: Get menu items for a specific role (example: role ID from database)
    const roleResponse = await fetch('http://localhost:3901/api/admin/menu-items?roleId=clix0ym930000v1dgjvkgexel');
    const roleMenus = await roleResponse.json();
    
    console.log('✅ Role menus loaded:', roleMenus.length, 'items');
    if (roleMenus.length > 0) {
      console.log('First role menu:', roleMenus[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing menu API:', error);
  }
}

testMenuAPI();

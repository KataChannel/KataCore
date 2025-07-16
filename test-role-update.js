const API_BASE = 'http://localhost:3000';

async function testRoleUpdate() {
  try {
    console.log('🧪 Testing role update...');

    // First, login to get token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@taza.com',
        password: 'TazaAdmin@2024!',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login');
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.accessToken;

    if (!token) {
      throw new Error('No access token received');
    }

    console.log('✅ Login successful!');

    // Get existing roles
    const rolesResponse = await fetch(`${API_BASE}/api/admin/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!rolesResponse.ok) {
      const errorText = await rolesResponse.text();
      console.log('❌ Roles fetch error status:', rolesResponse.status);
      console.log('❌ Roles fetch error body:', errorText);
      throw new Error('Failed to fetch roles: ' + errorText);
    }

    const rolesData = await rolesResponse.json();
    console.log('✅ Roles fetched:', rolesData.roles?.length || 0, 'roles found');

    // Find a role to update (or create one if none exist)
    let roleToUpdate = rolesData.roles?.[0];

    if (!roleToUpdate) {
      console.log('📝 Creating a test role...');
      // Create a test role first
      const createResponse = await fetch(`${API_BASE}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Test Role',
          description: 'A test role for updating',
          permissions: ['read:users', 'read:roles'],
          modules: ['admin'],
          level: 5,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error('Failed to create test role: ' + error);
      }

      const createResult = await createResponse.json();
      roleToUpdate = createResult;
      console.log('✅ Test role created:', createResult.id);
    }

    console.log('📝 Updating role:', roleToUpdate.id);

    // Test the PUT request
    const updateResponse = await fetch(`${API_BASE}/api/admin/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        roleId: roleToUpdate.id,
        name: roleToUpdate.name + ' (Updated)',
        description: 'Updated description for testing',
        permissions: ['read:users', 'read:roles', 'update:users'],
        modules: ['admin', 'hrm'],
        level: 6,
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.log('❌ Update failed:', error);
      throw new Error('Failed to update role: ' + error);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Role updated successfully!');
    console.log('📊 Updated role data:', JSON.stringify(updateResult, null, 2));

    // Verify the update by fetching the role again
    const verifyResponse = await fetch(`${API_BASE}/api/admin/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const updatedRole = verifyData.roles?.find(r => r.id === roleToUpdate.id);
      
      if (updatedRole) {
        console.log('✅ Verification successful! Updated role found in list.');
        console.log('📋 Final role state:', {
          name: updatedRole.name,
          description: updatedRole.description,
          level: updatedRole.level,
          modules: updatedRole.modules,
          permissions: updatedRole.permissions?.length || 0
        });
      } else {
        console.log('⚠️ Role not found in verification list');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoleUpdate();

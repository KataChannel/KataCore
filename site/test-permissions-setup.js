// Test script to set up Super Administrator
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3002';

async function setupSuperAdmin() {
  try {
    console.log('🚀 Setting up Super Administrator...');

    const response = await fetch(`${API_BASE}/api/admin/setup-super-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@taza.com',
        username: 'superadmin',
        password: 'TazaAdmin@2024!',
        displayName: 'Super Administrator',
        phone: '+1-555-0100',
        force: false,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Super Administrator created successfully!');
      console.log('📧 Email:', result.data?.user?.email);
      console.log('👤 Username:', result.data?.user?.username);
      console.log('🔐 Password: TazaAdmin@2024!');
      console.log('🏷️ Role:', result.data?.user?.role);
      console.log('🔗 Admin URL: http://localhost:3002/admin');
      console.log('🔑 Permissions:', result.data?.permissions?.length || 0, 'permissions');
      console.log('📦 Modules:', result.data?.modules?.length || 0, 'modules');
    } else {
      console.log('⚠️ Response:', result);
      if (result.existing) {
        console.log('ℹ️ Super Administrator already exists!');
        console.log('📧 Email:', result.existing.email);
        console.log('👤 Display Name:', result.existing.displayName);
        console.log('📅 Created:', result.existing.createdAt);
        console.log('🔗 Admin URL: http://localhost:3002/admin');
      }
    }
  } catch (error) {
    console.error('❌ Error setting up Super Administrator:', error);
  }
}

async function testPermissionsAPI() {
  try {
    console.log('\n🧪 Testing permissions system...');

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

    // Test roles API
    const rolesResponse = await fetch(`${API_BASE}/api/admin/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Roles API working:', rolesData.roles?.length || 0, 'roles found');
    } else {
      console.log('❌ Roles API failed:', await rolesResponse.text());
    }

    // Test users API
    const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users API working:', usersData.users?.length || 0, 'users found');
    } else {
      console.log('❌ Users API failed:', await usersResponse.text());
    }

    // Test permissions API
    const permissionsResponse = await fetch(`${API_BASE}/api/admin/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('✅ Permissions API working:', permissionsData.permissions?.length || 0, 'permissions found');
      console.log('📦 Available modules:', permissionsData.modules?.join(', ') || 'none');
    } else {
      console.log('❌ Permissions API failed:', await permissionsResponse.text());
    }

  } catch (error) {
    console.error('❌ Error testing permissions API:', error);
  }
}

async function main() {
  await setupSuperAdmin();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  await testPermissionsAPI();
  
  console.log('\n🎉 Setup complete! You can now:');
  console.log('1. Open http://localhost:3002/admin');
  console.log('2. Login with: admin@taza.com / TazaAdmin@2024!');
  console.log('3. Navigate to Permissions page to manage roles and users');
}

main();

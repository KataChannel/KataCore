// Test script to verify user creation functionality

async function testUserCreation() {
  try {
    // Step 1: Login with default super user
    console.log('🔐 Logging in with default super user...');
    const loginResponse = await fetch('http://localhost:3900/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'it@tazagroup.vn',
        password: '123456'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful');

    // Step 2: Get available roles
    console.log('📋 Fetching available roles...');
    const rolesResponse = await fetch('http://localhost:3900/api/admin/roles', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!rolesResponse.ok) {
      throw new Error(`Failed to fetch roles: ${rolesResponse.status}`);
    }

    const rolesData = await rolesResponse.json();
    console.log(`✅ Found ${rolesData.roles.length} roles`);
    
    // Find a suitable role (not super admin)
    const testRole = rolesData.roles.find(role => 
      role.name !== 'Super Administrator' && role.level < 10
    );
    
    if (!testRole) {
      throw new Error('No suitable test role found');
    }
    
    console.log(`📝 Using role: ${testRole.name} (Level ${testRole.level})`);

    // Step 3: Create a test user
    console.log('👤 Creating test user...');
    const createUserResponse = await fetch('http://localhost:3900/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: 'testuser@tazagroup.vn',
        displayName: 'Test User',
        username: 'testuser',
        password: 'testpass123',
        roleId: testRole.id,
        isActive: true
      }),
    });

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      throw new Error(`User creation failed: ${errorData.error || createUserResponse.status}`);
    }

    const userData = await createUserResponse.json();
    console.log('✅ User created successfully:', userData.user.email);

    // Step 4: Verify user was created by fetching users list
    console.log('🔍 Verifying user creation...');
    const usersResponse = await fetch('http://localhost:3900/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    const createdUser = usersData.users.find(user => user.email === 'testuser@tazagroup.vn');
    
    if (createdUser) {
      console.log('✅ User verification successful');
      console.log(`   Email: ${createdUser.email}`);
      console.log(`   Name: ${createdUser.displayName}`);
      console.log(`   Role: ${createdUser.role.name}`);
      console.log(`   Active: ${createdUser.isActive}`);
    } else {
      throw new Error('Created user not found in users list');
    }

    console.log('\n🎉 All tests passed! User creation functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testUserCreation();

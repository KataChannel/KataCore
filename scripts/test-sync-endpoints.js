async function testSyncEndpoints() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Testing Facebook sync endpoints...\n');

    // Test data
    const testPageId = '466695290195705'; // Use our configured page ID

    // Test 1: Sync Pages (working)
    console.log('1️⃣ Testing Sync Pages (should work)...');
    try {
        const response = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sync-pages'
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('✅ Sync Pages test completed\n');
    } catch (error) {
        console.log('❌ Sync Pages error:', error.message, '\n');
    }

    // Test 2: Sync Posts (failing)
    console.log('2️⃣ Testing Sync Posts (failing)...');
    try {
        const response = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sync-posts',
                pageId: testPageId
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('✅ Sync Posts test completed\n');
    } catch (error) {
        console.log('❌ Sync Posts error:', error.message, '\n');
    }

    // Test 3: Sync Messages (failing)
    console.log('3️⃣ Testing Sync Messages (failing)...');
    try {
        const response = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sync-messages',
                pageId: testPageId
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('✅ Sync Messages test completed\n');
    } catch (error) {
        console.log('❌ Sync Messages error:', error.message, '\n');
    }

    console.log('🏁 All tests completed!');
}

testSyncEndpoints().catch(console.error);

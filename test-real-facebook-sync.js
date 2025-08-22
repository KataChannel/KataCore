async function testRealFacebookSync() {
  try {
    console.log('🧪 Testing Facebook Sync with Real Page IDs...\n');
    
    // Get real page IDs from database
    const response = await fetch('http://localhost:3900/api/admin/social/facebook/test-sync');
    const testData = await response.json();
    
    if (!testData.success) {
      console.log('❌ Failed to get test data:', testData.error);
      return;
    }
    
    console.log('📊 Test page found:', testData.page);
    
    // Now test sync with real page ID
    const syncData = {
      accessToken: 'dummy-token', // Will use page-specific token from DB
      pageIds: [testData.page.id]
    };
    
    console.log('📤 Sending sync request...');
    
    const syncResponse = await fetch('http://localhost:3900/api/admin/social/facebook/sync/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncData)
    });
    
    if (syncResponse.ok) {
      const result = await syncResponse.json();
      console.log('✅ Sync result:', {
        success: result.success,
        message: result.message,
        totalPosts: result.total,
        validPages: result.validPages
      });
      
      if (result.posts && result.posts.length > 0) {
        console.log('📄 First synced post:', {
          id: result.posts[0].id,
          facebookPostId: result.posts[0].facebookPostId,
          message: result.posts[0].message?.substring(0, 80) + '...',
          createdTime: result.posts[0].createdTime
        });
      }
    } else {
      const error = await syncResponse.json();
      console.log('❌ Sync failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealFacebookSync();

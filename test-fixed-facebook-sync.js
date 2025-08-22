async function testFixedFacebookSync() {
  try {
    console.log('🧪 Testing Fixed Facebook Sync API...\n');
    
    // Test data based on debug results
    const testData = {
      accessToken: 'test-token', // Will use page-specific tokens from DB
      pageIds: [
        '593555107170691', // This one doesn't exist in DB - should be skipped
        '535760069613309', // This one exists and works
        '577766219585950'  // This one also exists
      ]
    };
    
    console.log('📤 Sending request to sync API...');
    console.log('Page IDs:', testData.pageIds);
    
    const response = await fetch('http://localhost:3900/api/admin/social/facebook/sync/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync successful:', {
        success: result.success,
        message: result.message,
        totalPosts: result.total,
        validPages: result.validPages,
        totalPages: result.totalPages,
        missingPages: result.missingPages
      });
      
      if (result.posts && result.posts.length > 0) {
        console.log('📄 Sample synced post:', {
          id: result.posts[0].id,
          facebookPostId: result.posts[0].facebookPostId,
          message: result.posts[0].message?.substring(0, 50) + '...',
          likesCount: result.posts[0].likesCount
        });
      }
    } else {
      const error = await response.json();
      console.log('❌ Sync failed:', {
        status: response.status,
        error: error
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedFacebookSync();

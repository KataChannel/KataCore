/**
 * FACEBOOK COMPREHENSIVE SYNC TEST SCRIPT
 * ======================================
 * 
 * Test script for the new comprehensive sync functionality
 */

const testComprehensiveSync = async () => {
  const baseUrl = 'http://localhost:3900';
  
  console.log('🧪 Testing Facebook Comprehensive Sync API...');
  
  try {
    // Test 1: Sync all posts
    console.log('\n📝 Test 1: Sync All Posts');
    const postsResponse = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-all-posts'
      })
    });
    
    if (postsResponse.ok) {
      const postsResult = await postsResponse.json();
      console.log('✅ Posts sync result:', {
        success: postsResult.success,
        totalPages: postsResult.summary?.totalPages,
        totalPosts: postsResult.summary?.totalPostsSynced,
        totalComments: postsResult.summary?.totalCommentsSynced
      });
    } else {
      console.log('❌ Posts sync failed:', await postsResponse.text());
    }

    // Test 2: Sync all messages
    console.log('\n💬 Test 2: Sync All Messages');
    const messagesResponse = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-all-messages'
      })
    });
    
    if (messagesResponse.ok) {
      const messagesResult = await messagesResponse.json();
      console.log('✅ Messages sync result:', {
        success: messagesResult.success,
        totalPages: messagesResult.summary?.totalPages,
        totalConversations: messagesResult.summary?.totalConversationsSynced,
        totalMessages: messagesResult.summary?.totalMessagesSynced
      });
    } else {
      console.log('❌ Messages sync failed:', await messagesResponse.text());
    }

    // Test 3: Comprehensive sync (comment out for regular testing due to long execution time)
    /*
    console.log('\n🔄 Test 3: Comprehensive All Data Sync');
    const allDataResponse = await fetch(`${baseUrl}/api/admin/social/facebook/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-all-data'
      })
    });
    
    if (allDataResponse.ok) {
      const allDataResult = await allDataResponse.json();
      console.log('✅ Comprehensive sync result:', {
        success: allDataResult.success,
        duration: allDataResult.duration,
        summary: allDataResult.summary,
        phases: allDataResult.phases.length,
        errors: allDataResult.errorCount
      });
    } else {
      console.log('❌ Comprehensive sync failed:', await allDataResponse.text());
    }
    */

    // Test 4: Get synced data
    console.log('\n📊 Test 4: Verify Synced Data');
    
    // Check posts
    const getPostsResponse = await fetch(`${baseUrl}/api/admin/social/facebook/database?action=posts&limit=5`);
    if (getPostsResponse.ok) {
      const postsData = await getPostsResponse.json();
      console.log('✅ Posts in database:', postsData.pagination?.total || 0);
    }
    
    // Check messages
    const getMessagesResponse = await fetch(`${baseUrl}/api/admin/social/facebook/database?action=messages&limit=5`);
    if (getMessagesResponse.ok) {
      const messagesData = await getMessagesResponse.json();
      console.log('✅ Conversations in database:', messagesData.pagination?.total || 0);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Uncomment to run the test
// testComprehensiveSync();

console.log('📋 Comprehensive Sync Test Script Ready');
console.log('💡 Uncomment testComprehensiveSync() to run tests');
console.log('⚠️  Make sure server is running on localhost:3900');
console.log('🔑 Ensure Facebook configuration is properly set');

export { testComprehensiveSync };

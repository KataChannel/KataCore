const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCommentsSync() {
  try {
    // Test problematic post IDs from the error
    const problemPosts = [
      '593555107170691_122141026556789688',
      '535760069613309_122136615230657417'
    ];

    // Get page info from database
    const page = await prisma.facebook_pages.findFirst({
      where: {
        OR: [
          { facebookPageId: '593555107170691' },
          { facebookPageId: '535760069613309' }
        ]
      }
    });

    if (!page) {
      console.log('❌ No pages found in database for these posts');
      return;
    }

    console.log('📄 Using page:', {
      id: page.facebookPageId,
      name: page.name,
      hasAccessToken: !!page.accessToken
    });

    for (const postId of problemPosts) {
      console.log(`\n🧪 Testing comments for post: ${postId}`);
      
      // Test different API endpoints
      const testUrls = [
        // 1. Basic comments
        `https://graph.facebook.com/v23.0/${postId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time&limit=10`,
        
        // 2. With likes summary
        `https://graph.facebook.com/v23.0/${postId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time,likes.summary(true)&limit=10`,
        
        // 3. Full fields (like in the code)
        `https://graph.facebook.com/v23.0/${postId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=10`,
        
        // 4. Check if post exists
        `https://graph.facebook.com/v23.0/${postId}?access_token=${page.accessToken}&fields=id,message,created_time`
      ];

      for (let i = 0; i < testUrls.length; i++) {
        const testType = ['Basic comments', 'With likes', 'Full fields', 'Post exists'][i];
        console.log(`  📊 Test ${i + 1}: ${testType}`);
        
        try {
          const response = await fetch(testUrls[i]);
          console.log(`    Status: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const data = await response.json();
            if (i === 3) {
              // Post exists check
              console.log(`    ✅ Post exists: ${data.id}`);
            } else {
              // Comments check
              console.log(`    ✅ Found ${data.data ? data.data.length : 0} comments`);
              if (data.data && data.data.length > 0) {
                console.log(`    📝 Sample comment: ${data.data[0].message?.substring(0, 50)}...`);
              }
            }
          } else {
            const errorData = await response.text();
            console.log(`    ❌ Error: ${errorData.substring(0, 200)}`);
          }
        } catch (error) {
          console.log(`    💥 Network error: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCommentsSync();

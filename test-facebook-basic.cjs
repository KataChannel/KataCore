const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBasicAPI() {
  try {
    // Get page info from database
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: '272459726955766' }
    });

    if (!page) {
      console.log('❌ Page not found in database');
      return;
    }

    console.log('📄 Page info:', {
      id: page.facebookPageId,
      name: page.name,
      hasAccessToken: !!page.accessToken
    });

    // Test very basic fields
    const testAPIs = [
      // 1. Minimal fields
      `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=id,message&limit=5`,
      
      // 2. No fields parameter (default)
      `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&limit=5`,
      
      // 3. Just basic info
      `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=id,created_time&limit=5`,
      
      // 4. Test page info instead of posts
      `https://graph.facebook.com/v23.0/${page.facebookPageId}?access_token=${page.accessToken}&fields=id,name,posts.limit(3)`
    ];

    for (let i = 0; i < testAPIs.length; i++) {
      const apiUrl = testAPIs[i];
      console.log(`\n🧪 Test ${i + 1}:`);
      console.log(`🔗 URL: ${apiUrl.replace(page.accessToken, 'TOKEN')}`);
      
      try {
        const response = await fetch(apiUrl);
        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log(`📄 Response:`, JSON.stringify(data, null, 2));
        
        if (response.ok && data.data && data.data.length > 0) {
          console.log(`✅ Success! Found ${data.data.length} posts`);
          break;
        }
        
      } catch (error) {
        console.log(`💥 Error with test ${i + 1}:`, error.message);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBasicAPI();

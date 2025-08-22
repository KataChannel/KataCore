const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFacebookAPI() {
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

    // Test Facebook API call
    const apiUrl = `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,attachments{media,target,type,url,title,description},permalink_url,is_published&limit=10`;
    
    console.log('🔗 API URL:', apiUrl.replace(page.accessToken, 'ACCESS_TOKEN'));

    const response = await fetch(apiUrl);
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ Error response:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      console.log(`📊 Found ${data.data.length} posts`);
      console.log('🔍 First post:', data.data[0]);
    } else {
      console.log('⚠️ No posts found in response');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFacebookAPI();

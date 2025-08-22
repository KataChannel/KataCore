const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFacebookAPIFormats() {
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

    // Test different field formats
    const testFormats = [
      // 1. Basic fields without attachments
      'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,permalink_url,is_published',
      
      // 2. With simplified attachments
      'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,attachments,permalink_url,is_published',
      
      // 3. With structured attachments (current format)
      'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,attachments{media,target,type,url,title,description},permalink_url,is_published',
      
      // 4. Without attachments completely
      'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,permalink_url,is_published'
    ];

    for (let i = 0; i < testFormats.length; i++) {
      const fields = testFormats[i];
      console.log(`\n🧪 Test ${i + 1}: Testing fields format`);
      console.log(`📝 Fields: ${fields}`);
      
      const apiUrl = `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=${fields}&limit=5`;
      
      try {
        const response = await fetch(apiUrl);
        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.log(`❌ Error: ${errorData}`);
          continue;
        }

        const data = await response.json();
        console.log(`✅ Success! Found ${data.data ? data.data.length : 0} posts`);
        
        if (data.data && data.data.length > 0) {
          console.log('🔍 First post sample:', {
            id: data.data[0].id,
            hasMessage: !!data.data[0].message,
            hasAttachments: !!data.data[0].attachments,
            attachmentsType: typeof data.data[0].attachments
          });
          
          // If this format works, save it and break
          if (data.data.length > 0) {
            console.log(`🎉 This format works! Found ${data.data.length} posts`);
            break;
          }
        }
        
      } catch (error) {
        console.log(`💥 Error with format ${i + 1}:`, error.message);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFacebookAPIFormats();

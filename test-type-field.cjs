const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTypeField() {
  try {
    // Get page info from database
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: '272459726955766' }
    });

    if (!page) {
      console.log('❌ Page not found in database');
      return;
    }

    console.log('📄 Testing TYPE field specifically...\n');

    // Test type field specifically
    const tests = [
      // Basic fields that work
      'id,message,created_time,story,updated_time',
      
      // Add type field
      'id,message,created_time,story,updated_time,type',
      
      // Test just type field
      'id,type',
      
      // Test with other fields but no type
      'id,message,created_time,story,updated_time,likes.summary(true),comments.summary(true),shares,permalink_url,is_published',
      
      // Test attachments without type
      'id,message,created_time,attachments',
      
      // Test with structured attachments but no type
      'id,message,created_time,attachments{media,target,type,url,title,description}',
      
      // Final working combination
      'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published'
    ];

    for (let i = 0; i < tests.length; i++) {
      const fields = tests[i];
      console.log(`🧪 Test ${i + 1}: ${fields}`);
      
      const apiUrl = `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=${fields}&limit=2`;
      
      try {
        const response = await fetch(apiUrl);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS! Found ${data.data ? data.data.length : 0} posts`);
          if (data.data && data.data[0]) {
            console.log(`📝 Sample keys: ${Object.keys(data.data[0]).join(', ')}`);
          }
        } else {
          const errorData = await response.text();
          console.log(`❌ FAILED: ${errorData.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`💥 Network error:`, error.message);
      }
      
      console.log(''); // Add blank line
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTypeField();

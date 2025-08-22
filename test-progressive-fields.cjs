const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWorkingFields() {
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

    // Test adding fields one by one to find which one causes the error
    const progressiveFields = [
      // Start with basic that works
      'id,message,created_time',
      
      // Add more fields one by one
      'id,message,created_time,story',
      'id,message,created_time,story,updated_time',
      'id,message,created_time,story,updated_time,type',
      'id,message,created_time,story,updated_time,type,permalink_url',
      'id,message,created_time,story,updated_time,type,permalink_url,is_published',
      
      // Now try the problematic ones
      'id,message,created_time,likes',
      'id,message,created_time,likes.summary(true)',
      'id,message,created_time,comments',
      'id,message,created_time,comments.summary(true)',
      'id,message,created_time,shares',
    ];

    for (let i = 0; i < progressiveFields.length; i++) {
      const fields = progressiveFields[i];
      console.log(`\n🧪 Test ${i + 1}: ${fields}`);
      
      const apiUrl = `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${page.accessToken}&fields=${fields}&limit=2`;
      
      try {
        const response = await fetch(apiUrl);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Success! Found ${data.data ? data.data.length : 0} posts`);
          if (data.data && data.data[0]) {
            console.log(`📝 Sample keys: ${Object.keys(data.data[0]).join(', ')}`);
          }
        } else {
          const errorData = await response.text();
          console.log(`❌ Error: ${errorData.substring(0, 200)}`);
          // If this field causes error, record it
          console.log(`🚨 PROBLEM FIELD IDENTIFIED: ${fields}`);
        }
        
      } catch (error) {
        console.log(`💥 Network error:`, error.message);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkingFields();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugMessagesSync() {
  try {
    const problemPageId = '1655536381418678';
    
    console.log(`🔍 Debugging messages sync for page: ${problemPageId}\n`);

    // Get page info from database
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: problemPageId }
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

    if (!page.accessToken) {
      console.log('❌ No access token for this page');
      return;
    }

    console.log('🔑 Testing with access token...\n');

    // Test different API versions and endpoints
    const testEndpoints = [
      // Current v20.0 (from error)
      `https://graph.facebook.com/v20.0/${problemPageId}/conversations?fields=id,participants,snippet,updated_time&access_token=${page.accessToken}&limit=5`,
      
      // Updated v23.0
      `https://graph.facebook.com/v23.0/${problemPageId}/conversations?fields=id,participants,snippet,updated_time&access_token=${page.accessToken}&limit=5`,
      
      // Basic conversations
      `https://graph.facebook.com/v23.0/${problemPageId}/conversations?access_token=${page.accessToken}&limit=5`,
      
      // Check if page exists
      `https://graph.facebook.com/v23.0/${problemPageId}?access_token=${page.accessToken}&fields=id,name`,
      
      // Test permissions
      `https://graph.facebook.com/v23.0/me/permissions?access_token=${page.accessToken}`
    ];

    const testNames = [
      'v20.0 with fields',
      'v23.0 with fields', 
      'v23.0 basic',
      'Page info',
      'Token permissions'
    ];

    for (let i = 0; i < testEndpoints.length; i++) {
      console.log(`🧪 Test ${i + 1}: ${testNames[i]}`);
      
      try {
        const response = await fetch(testEndpoints[i]);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (i === 3) {
            // Page info
            console.log(`   ✅ Page exists: ${data.name || data.id}`);
          } else if (i === 4) {
            // Permissions
            console.log(`   ✅ Permissions:`, data.data?.map(p => p.permission).join(', ') || 'No permissions data');
          } else {
            // Conversations
            console.log(`   ✅ Found ${data.data ? data.data.length : 0} conversations`);
            if (data.data && data.data.length > 0) {
              console.log(`   📝 Sample conversation: ${data.data[0].id}`);
            }
          }
        } else {
          const errorData = await response.text();
          console.log(`   ❌ Error: ${errorData.substring(0, 200)}`);
          
          // Check for specific error types
          if (errorData.includes('permission')) {
            console.log(`   🔒 Permission issue detected`);
          } else if (errorData.includes('OAuth')) {
            console.log(`   🔑 OAuth/Token issue detected`);
          } else if (errorData.includes('deprecated')) {
            console.log(`   📅 API deprecation issue detected`);
          }
        }
      } catch (error) {
        console.log(`   💥 Network error: ${error.message}`);
      }
      
      console.log(''); // blank line
    }

    // Check existing conversations in database
    const existingConversations = await prisma.facebook_conversations.findMany({
      where: { facebookPageId: problemPageId },
      take: 5
    });

    console.log(`📊 Existing conversations in DB: ${existingConversations.length}`);
    if (existingConversations.length > 0) {
      existingConversations.forEach((conv, i) => {
        console.log(`  ${i + 1}. ${conv.facebookConversationId} - ${conv.snippet?.substring(0, 50) || 'No snippet'}...`);
      });
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMessagesSync();

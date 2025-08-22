import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugFacebookSync() {
  try {
    console.log('🔍 Debug Facebook Sync Issue...\n');
    
    // 1. Check Facebook pages in database
    console.log('1. 📊 Checking Facebook pages in database...');
    const pages = await prisma.facebook_pages.findMany({
      select: {
        id: true,
        facebookPageId: true,
        name: true,
        accessToken: true
      },
      take: 5
    });
    
    console.log(`Found ${pages.length} Facebook pages:`);
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.name} (${page.facebookPageId}) - Token: ${page.accessToken ? 'Has token' : 'No token'}`);
    });
    
    if (pages.length === 0) {
      console.log('❌ No Facebook pages found in database!');
      return;
    }
    
    // 2. Test Facebook API with first page
    const testPage = pages[0];
    if (!testPage) {
      console.log('❌ No test page available');
      return;
    }
    
    console.log(`\n2. 🧪 Testing Facebook API with page: ${testPage.name}`);
    
    if (!testPage.accessToken) {
      console.log('❌ No access token for this page');
      return;
    }
    
    // Test basic page info
    console.log('   Testing basic page info...');
    try {
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/v23.0/${testPage.facebookPageId}?access_token=${testPage.accessToken}&fields=id,name,category`
      );
      
      if (pageInfoResponse.ok) {
        const pageInfo = await pageInfoResponse.json();
        console.log('   ✅ Page info retrieved:', pageInfo);
      } else {
        const error = await pageInfoResponse.json();
        console.log('   ❌ Page info failed:', pageInfoResponse.status, error);
      }
    } catch (error) {
      console.log('   ❌ Network error:', error);
    }
    
    // Test posts endpoint
    console.log('\n   Testing posts endpoint...');
    try {
      const postsResponse = await fetch(
        `https://graph.facebook.com/v23.0/${testPage.facebookPageId}/posts?access_token=${testPage.accessToken}&fields=id,message,created_time&limit=5`
      );
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log(`   ✅ Posts retrieved: ${postsData.data?.length || 0} posts`);
        if (postsData.data?.length > 0) {
          console.log('   First post:', {
            id: postsData.data[0].id,
            message: postsData.data[0].message?.substring(0, 50) + '...',
            created_time: postsData.data[0].created_time
          });
        }
      } else {
        const error = await postsResponse.json();
        console.log('   ❌ Posts failed:', postsResponse.status, error);
        
        // Analyze common errors
        if (error.error?.code === 190) {
          console.log('   🔑 Error 190: Access token issue');
          console.log('   Solution: Refresh or regenerate access token');
        } else if (error.error?.code === 100) {
          console.log('   🚫 Error 100: Invalid parameter or permission issue');
          console.log('   Solution: Check page permissions or API version');
        } else if (error.error?.code === 4) {
          console.log('   ⏰ Error 4: Rate limiting');
          console.log('   Solution: Wait and retry later');
        }
      }
    } catch (error) {
      console.log('   ❌ Network error:', error);
    }
    
    // 3. Test with specific pages from error
    console.log('\n3. 🎯 Testing specific pages from error...');
    const errorPageIds = ['593555107170691', '535760069613309'];
    
    for (const pageId of errorPageIds) {
      console.log(`\n   Testing page ID: ${pageId}`);
      
      // Find page in database
      const dbPage = pages.find(p => p.facebookPageId === pageId);
      if (!dbPage) {
        console.log(`   ❌ Page ${pageId} not found in database`);
        continue;
      }
      
      try {
        const testResponse = await fetch(
          `https://graph.facebook.com/v23.0/${pageId}/posts?access_token=${dbPage.accessToken}&fields=id,message&limit=1`
        );
        
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log(`   ✅ Page ${pageId} works, ${data.data?.length || 0} posts`);
        } else {
          const error = await testResponse.json();
          console.log(`   ❌ Page ${pageId} failed:`, error);
        }
      } catch (error) {
        console.log(`   ❌ Network error for page ${pageId}:`, error);
      }
    }
    
    console.log('\n📋 Summary and Recommendations:');
    console.log('1. Check if access tokens are valid and not expired');
    console.log('2. Verify page permissions (posts read permission)');
    console.log('3. Check Facebook API rate limits');
    console.log('4. Ensure page IDs are correct');
    console.log('5. Consider updating to newer Facebook API version');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFacebookSync();

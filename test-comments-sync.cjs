const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCommentsSync() {
  try {
    // Get a post that's likely to have comments
    const postWithComments = await prisma.facebook_posts.findFirst({
      where: {
        facebookPageId: '272459726955766',
        message: {
          not: null
        }
      },
      orderBy: {
        createdTime: 'desc'
      }
    });

    if (!postWithComments) {
      console.log('❌ No posts found for Timona Academy page');
      return;
    }

    console.log('📄 Testing post:', {
      id: postWithComments.facebookPostId,
      message: postWithComments.message?.substring(0, 100) + '...',
      createdTime: postWithComments.createdTime
    });

    // Get page access token
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: '272459726955766' }
    });

    if (!page || !page.accessToken) {
      console.log('❌ No access token for page');
      return;
    }

    console.log('🔑 Using access token for:', page.name);

    // Test comments API call
    const commentsUrl = `https://graph.facebook.com/v23.0/${postWithComments.facebookPostId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time,likes.summary(true)&limit=10`;
    
    console.log('🌐 Testing comments API...');
    
    const response = await fetch(commentsUrl);
    console.log(`📊 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Found ${data.data ? data.data.length : 0} comments`);
      
      if (data.data && data.data.length > 0) {
        console.log('📝 Sample comments:');
        data.data.slice(0, 3).forEach((comment, i) => {
          console.log(`  ${i + 1}. From: ${comment.from?.name || 'Unknown'}`);
          console.log(`     Message: ${comment.message?.substring(0, 100) || '(no message)'}...`);
          console.log(`     Likes: ${comment.likes?.summary?.total_count || 0}`);
        });
        
        // Try to save one comment to test database
        const firstComment = data.data[0];
        console.log('\n💾 Testing database save...');
        
        try {
          const savedComment = await prisma.facebook_comments.upsert({
            where: { facebookCommentId: firstComment.id },
            update: {
              fromId: firstComment.from?.id || '',
              fromName: firstComment.from?.name || '',
              message: firstComment.message || '',
              createdTime: firstComment.created_time ? new Date(firstComment.created_time) : null,
              likesCount: firstComment.likes?.summary?.total_count || 0,
              updatedAt: new Date()
            },
            create: {
              facebookCommentId: firstComment.id,
              facebookPostId: postWithComments.facebookPostId,
              fromId: firstComment.from?.id || '',
              fromName: firstComment.from?.name || '',
              message: firstComment.message || '',
              createdTime: firstComment.created_time ? new Date(firstComment.created_time) : null,
              likesCount: firstComment.likes?.summary?.total_count || 0
            }
          });
          
          console.log('✅ Database save successful:', savedComment.facebookCommentId);
          
        } catch (dbError) {
          console.error('❌ Database save failed:', dbError);
        }
        
      } else {
        console.log('ℹ️ This post has no comments');
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ API Error:', errorData);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCommentsSync();

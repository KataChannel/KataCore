const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findPostsWithComments() {
  try {
    // Get all pages we have access tokens for
    const pages = await prisma.facebook_pages.findMany({
      where: {
        accessToken: {
          not: null
        }
      },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });

    console.log(`🔍 Testing ${pages.length} pages for posts with comments...\n`);

    for (const page of pages) {
      console.log(`📄 Testing page: ${page.name} (${page.facebookPageId})`);
      
      // Get some recent posts from this page
      const posts = await prisma.facebook_posts.findMany({
        where: {
          facebookPageId: page.facebookPageId
        },
        orderBy: {
          createdTime: 'desc'
        },
        take: 3
      });

      console.log(`  📊 Found ${posts.length} posts to test`);

      for (const post of posts) {
        try {
          const commentsUrl = `https://graph.facebook.com/v23.0/${post.facebookPostId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time&limit=5`;
          
          const response = await fetch(commentsUrl);
          
          if (response.ok) {
            const data = await response.json();
            const commentsCount = data.data ? data.data.length : 0;
            
            if (commentsCount > 0) {
              console.log(`  ✅ Post ${post.facebookPostId} has ${commentsCount} comments`);
              console.log(`     Message: ${post.message?.substring(0, 80) || 'No message'}...`);
              
              // Show sample comments
              data.data.slice(0, 2).forEach((comment, i) => {
                console.log(`       ${i + 1}. ${comment.from?.name}: ${comment.message?.substring(0, 50) || 'No text'}...`);
              });
              
              // Try to sync these comments
              console.log(`  💾 Syncing ${commentsCount} comments...`);
              
              let syncedCount = 0;
              for (const comment of data.data) {
                try {
                  await prisma.facebook_comments.upsert({
                    where: { facebookCommentId: comment.id },
                    update: {
                      fromId: comment.from?.id || '',
                      fromName: comment.from?.name || '',
                      message: comment.message || '',
                      createdTime: comment.created_time ? new Date(comment.created_time) : null,
                      updatedAt: new Date()
                    },
                    create: {
                      facebookCommentId: comment.id,
                      facebookPostId: post.facebookPostId,
                      fromId: comment.from?.id || '',
                      fromName: comment.from?.name || '',
                      message: comment.message || '',
                      createdTime: comment.created_time ? new Date(comment.created_time) : null
                    }
                  });
                  syncedCount++;
                } catch (syncError) {
                  console.error(`     ❌ Failed to sync comment ${comment.id}:`, syncError.message);
                }
              }
              
              console.log(`  ✅ Successfully synced ${syncedCount}/${commentsCount} comments\n`);
              
            } else {
              console.log(`  ℹ️ Post ${post.facebookPostId} has no comments`);
            }
          } else {
            const errorData = await response.text();
            if (errorData.includes('permission')) {
              console.log(`  ⚠️ Permission denied for post ${post.facebookPostId}`);
            } else {
              console.log(`  ❌ API error for post ${post.facebookPostId}: ${response.status}`);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`  💥 Error testing post ${post.facebookPostId}:`, error.message);
        }
      }
      
      console.log(''); // blank line between pages
    }

    // Show final stats
    const totalComments = await prisma.facebook_comments.count();
    console.log(`📊 Total comments in database: ${totalComments}`);

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findPostsWithComments();

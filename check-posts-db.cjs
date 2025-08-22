const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPostsInDB() {
  try {
    const problemPosts = [
      '593555107170691_122141026556789688',
      '535760069613309_122136615230657417'
    ];

    console.log('🔍 Checking posts in database...\n');

    for (const postId of problemPosts) {
      const pageId = postId.split('_')[0];
      console.log(`📄 Post: ${postId}`);
      console.log(`📄 Page ID: ${pageId}`);
      
      // Check if post exists in database
      const post = await prisma.facebook_posts.findUnique({
        where: { facebookPostId: postId }
      });
      
      console.log(`📊 Post in DB: ${post ? 'YES' : 'NO'}`);
      if (post) {
        console.log(`📝 Message: ${post.message?.substring(0, 100)}...`);
      }
      
      // Check if page exists in database
      const page = await prisma.facebook_pages.findUnique({
        where: { facebookPageId: pageId }
      });
      
      console.log(`📊 Page in DB: ${page ? 'YES' : 'NO'}`);
      if (page) {
        console.log(`📝 Page name: ${page.name}`);
        console.log(`🔑 Has access token: ${!!page.accessToken}`);
      }
      
      console.log(''); // blank line
    }

    // Also check how many posts have comments
    const postsWithComments = await prisma.facebook_posts.findMany({
      include: {
        _count: {
          select: { facebook_comments: true }
        }
      },
      where: {
        facebook_comments: {
          some: {}
        }
      },
      take: 5
    });

    console.log(`📊 Posts with comments in DB: ${postsWithComments.length}`);
    postsWithComments.forEach((post, i) => {
      console.log(`  ${i + 1}. ${post.facebookPostId} - ${post._count.facebook_comments} comments`);
    });

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPostsInDB();

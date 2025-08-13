import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFacebookIntegration() {
  try {
    console.log('🔗 Testing Facebook database integration...');

    // Test database connection
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('✅ Database connected:', result);

    // Check Facebook tables
    console.log('\n📊 Checking Facebook tables...');
    
    const [
      pagesCount,
      postsCount,
      commentsCount,
      messagesCount,
      conversationsCount,
      interactionsCount
    ] = await Promise.all([
      prisma.facebook_pages.count(),
      prisma.facebook_posts.count(),
      prisma.facebook_comments.count(),
      prisma.facebook_messages.count(),
      prisma.facebook_conversations.count(),
      prisma.facebook_interactions.count()
    ]);

    console.log('📄 Pages:', pagesCount);
    console.log('📝 Posts:', postsCount);
    console.log('💬 Comments:', commentsCount);
    console.log('✉️ Messages:', messagesCount);
    console.log('🗨️ Conversations:', conversationsCount);
    console.log('👥 Interactions:', interactionsCount);

    // Test sample data if available
    if (pagesCount > 0) {
      const samplePage = await prisma.facebook_pages.findFirst({
        select: {
          name: true,
          facebookPageId: true,
          fanCount: true,
          _count: {
            select: {
              facebook_posts: true,
              facebook_messages: true,
              facebook_interactions: true
            }
          }
        }
      });
      console.log('\n📋 Sample page:', samplePage);
    }

    console.log('\n✅ Facebook integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Facebook integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFacebookIntegration();

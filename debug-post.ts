import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPost() {
  try {
    console.log('🔍 Debug Post Creation...');
    
    // Check if users exist
    const users = await prisma.users.findMany({
      take: 3,
      select: { id: true, email: true, displayName: true }
    });
    
    console.log('👤 Available users:', users);
    
    if (users.length === 0) {
      console.log('❌ No users found! Creating a test user...');
      
      const testUser = await prisma.users.create({
        data: {
          email: 'test@example.com',
          displayName: 'Test User',
          password: 'hashed_password',
          roleId: 'clix0ym930000v1dgjvkgexel' // Admin role
        }
      });
      
      console.log('✅ Test user created:', testUser);
    }
    
    // Test creating a post
    const testPost = {
      title: 'Test SEO Post',
      slug: 'test-seo-post',
      content: 'This is test content for SEO post',
      authorId: users[0]?.id || 'test-user-id'
    };
    
    console.log('📝 Attempting to create post:', testPost);
    
    const newPost = await prisma.post.create({
      data: testPost,
      include: {
        author: {
          select: { id: true, displayName: true }
        }
      }
    });
    
    console.log('✅ Post created successfully:', newPost);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPost();

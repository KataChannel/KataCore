import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pageIds } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Page IDs array is required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting Facebook posts sync for ${pageIds.length} pages...`);

    const allPosts = [];

    for (const pageId of pageIds) {
      try {
        console.log(`📄 Syncing posts for page: ${pageId}`);

        // Get posts for this page
        const response = await fetch(
          `https://graph.facebook.com/v23.0/${pageId}/posts?access_token=${accessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,attachments,permalink_url,is_published&limit=50`
        );

        if (!response.ok) {
          console.error(`Failed to fetch posts for page ${pageId}`);
          continue;
        }

        const data = await response.json();
        const posts = data.data || [];

        console.log(`📊 Found ${posts.length} posts for page ${pageId}`);

        // Store/update posts in database
        for (const post of posts) {
          try {
            const savedPost = await prisma.facebook_posts.upsert({
              where: { facebookPostId: post.id },
              update: {
                message: post.message || null,
                story: post.story || null,
                createdTime: post.created_time ? new Date(post.created_time) : null,
                updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                likesCount: post.likes?.summary?.total_count || 0,
                commentsCount: post.comments?.summary?.total_count || 0,
                sharesCount: post.shares?.count || 0,
                postType: post.type || null,
                attachments: post.attachments || null,
                permalink: post.permalink_url || null,
                isPublished: post.is_published !== false,
                updatedAt: new Date()
              },
              create: {
                facebookPostId: post.id,
                facebookPageId: pageId,
                message: post.message || null,
                story: post.story || null,
                createdTime: post.created_time ? new Date(post.created_time) : null,
                updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                likesCount: post.likes?.summary?.total_count || 0,
                commentsCount: post.comments?.summary?.total_count || 0,
                sharesCount: post.shares?.count || 0,
                postType: post.type || null,
                attachments: post.attachments || null,
                permalink: post.permalink_url || null,
                isPublished: post.is_published !== false
              }
            });

            allPosts.push(savedPost);
          } catch (error) {
            console.error(`Failed to save post ${post.id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error syncing posts for page ${pageId}:`, error);
      }
    }

    console.log(`✅ Successfully synced ${allPosts.length} posts`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allPosts.length} Facebook posts`,
      posts: allPosts,
      total: allPosts.length
    });

  } catch (error: any) {
    console.error('Facebook posts sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook posts'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

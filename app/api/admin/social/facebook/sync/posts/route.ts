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

    // First, get valid pages from database with their access tokens
    const validPages = await prisma.facebook_pages.findMany({
      where: {
        facebookPageId: {
          in: pageIds
        }
      },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });

    if (validPages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid pages found in database for the provided page IDs'
      }, { status: 400 });
    }

    console.log(`📊 Found ${validPages.length} valid pages in database`);

    // Log any missing pages
    const validPageIds = validPages.map(p => p.facebookPageId);
    const missingPageIds = pageIds.filter(id => !validPageIds.includes(id));
    if (missingPageIds.length > 0) {
      console.log(`⚠️ Warning: ${missingPageIds.length} pages not found in database:`, missingPageIds);
    }

    const allPosts = [];

    for (const page of validPages) {
      try {
        console.log(`📄 Syncing posts for page: ${page.facebookPageId} (${page.name})`);

        // Use page-specific access token if available, otherwise use provided token
        const pageAccessToken = page.accessToken || accessToken;

        if (!pageAccessToken) {
          console.log(`❌ No access token available for page ${page.facebookPageId}`);
          continue;
        }

        // Get posts for this page
        const response = await fetch(
          `https://graph.facebook.com/v23.0/${page.facebookPageId}/posts?access_token=${pageAccessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published&limit=50`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Failed to fetch posts for page ${page.facebookPageId}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          continue;
        }

        const data = await response.json();
        const posts = data.data || [];

        console.log(`📊 Found ${posts.length} posts for page ${page.facebookPageId}`);
        console.log(`🔍 First post sample:`, posts[0] ? {
          id: posts[0].id,
          hasMessage: !!posts[0].message,
          hasStory: !!posts[0].story,
          created_time: posts[0].created_time,
          hasAttachments: !!posts[0].attachments
        } : 'No posts found');

        // Store/update posts in database
        for (const post of posts) {
          try {
            console.log(`💾 Saving post ${post.id} for page ${page.facebookPageId}`);
            
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
                attachments: post.attachments || null,
                permalink: post.permalink_url || null,
                isPublished: post.is_published !== false,
                updatedAt: new Date()
              },
              create: {
                facebookPostId: post.id,
                facebookPageId: page.facebookPageId,
                message: post.message || null,
                story: post.story || null,
                createdTime: post.created_time ? new Date(post.created_time) : null,
                updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                likesCount: post.likes?.summary?.total_count || 0,
                commentsCount: post.comments?.summary?.total_count || 0,
                sharesCount: post.shares?.count || 0,
                attachments: post.attachments || null,
                permalink: post.permalink_url || null,
                isPublished: post.is_published !== false
              }
            });

            console.log(`✅ Successfully saved post ${post.id}`);
            allPosts.push(savedPost);
          } catch (error) {
            console.error(`❌ Failed to save post ${post.id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error syncing posts for page ${page.facebookPageId}:`, error);
      }
    }

    console.log(`✅ Successfully synced ${allPosts.length} posts`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allPosts.length} Facebook posts from ${validPages.length} pages`,
      posts: allPosts,
      total: allPosts.length,
      validPages: validPages.length,
      totalPages: pageIds.length,
      missingPages: missingPageIds
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

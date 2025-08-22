import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { pageIds, limit = 50 } = await request.json();

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Page IDs array is required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting smart Facebook comments sync for ${pageIds.length} pages...`);

    const allComments = [];
    const failedPosts = [];
    const stats = {
      pagesProcessed: 0,
      postsProcessed: 0,
      commentsFound: 0,
      permissionErrors: 0,
      otherErrors: 0
    };

    for (const pageId of pageIds) {
      try {
        // Get page info from database
        const page = await prisma.facebook_pages.findUnique({
          where: { facebookPageId: pageId },
          select: {
            facebookPageId: true,
            name: true,
            accessToken: true
          }
        });

        if (!page || !page.accessToken) {
          console.log(`⚠️ Skipping page ${pageId} - no access token`);
          continue;
        }

        console.log(`📄 Processing page: ${page.name} (${page.facebookPageId})`);
        stats.pagesProcessed++;

        // Get posts for this page
        const posts = await prisma.facebook_posts.findMany({
          where: { facebookPageId: pageId },
          select: { facebookPostId: true },
          take: limit,
          orderBy: { createdTime: 'desc' }
        });

        console.log(`📊 Found ${posts.length} posts for page ${page.facebookPageId}`);

        for (const post of posts) {
          try {
            console.log(`💭 Syncing comments for post: ${post.facebookPostId}`);
            stats.postsProcessed++;

            // Get comments for this post using page's access token
            const response = await fetch(
              `https://graph.facebook.com/v23.0/${post.facebookPostId}/comments?access_token=${page.accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=50`
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error(`Failed to fetch comments for post ${post.facebookPostId}:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorData
              });

              if (response.status === 400 && errorData.error?.message?.includes('permission')) {
                stats.permissionErrors++;
                failedPosts.push({
                  postId: post.facebookPostId,
                  pageId: pageId,
                  reason: 'permission_denied',
                  error: errorData.error?.message
                });
              } else {
                stats.otherErrors++;
                failedPosts.push({
                  postId: post.facebookPostId,
                  pageId: pageId,
                  reason: 'api_error',
                  error: errorData.error?.message || 'Unknown error'
                });
              }
              continue;
            }

            const data = await response.json();
            const comments = data.data || [];

            console.log(`📊 Found ${comments.length} comments for post ${post.facebookPostId}`);
            stats.commentsFound += comments.length;

            // Store/update comments in database
            for (const comment of comments) {
              try {
                const savedComment = await prisma.facebook_comments.upsert({
                  where: { facebookCommentId: comment.id },
                  update: {
                    fromId: comment.from?.id || '',
                    fromName: comment.from?.name || '',
                    message: comment.message || '',
                    createdTime: comment.created_time ? new Date(comment.created_time) : null,
                    likesCount: comment.likes?.summary?.total_count || 0,
                    canReply: comment.can_reply !== false,
                    canHide: comment.can_hide === true,
                    canLike: comment.can_like !== false,
                    isHidden: comment.is_hidden === true,
                    parentCommentId: comment.parent?.id || null,
                    updatedAt: new Date()
                  },
                  create: {
                    facebookCommentId: comment.id,
                    facebookPostId: post.facebookPostId,
                    fromId: comment.from?.id || '',
                    fromName: comment.from?.name || '',
                    message: comment.message || '',
                    createdTime: comment.created_time ? new Date(comment.created_time) : null,
                    likesCount: comment.likes?.summary?.total_count || 0,
                    canReply: comment.can_reply !== false,
                    canHide: comment.can_hide === true,
                    canLike: comment.can_like !== false,
                    isHidden: comment.is_hidden === true,
                    parentCommentId: comment.parent?.id || null
                  }
                });

                allComments.push(savedComment);
              } catch (error) {
                console.error(`Failed to save comment ${comment.id}:`, error);
              }
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (error) {
            console.error(`Error syncing comments for post ${post.facebookPostId}:`, error);
            stats.otherErrors++;
            failedPosts.push({
              postId: post.facebookPostId,
              pageId: pageId,
              reason: 'sync_error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

      } catch (error) {
        console.error(`Error processing page ${pageId}:`, error);
        stats.otherErrors++;
      }
    }

    console.log(`✅ Smart comments sync completed:`, stats);
    
    if (failedPosts.length > 0) {
      console.log(`⚠️ Failed posts breakdown:`, {
        permission_errors: failedPosts.filter(p => p.reason === 'permission_denied').length,
        api_errors: failedPosts.filter(p => p.reason === 'api_error').length,
        sync_errors: failedPosts.filter(p => p.reason === 'sync_error').length
      });
    }

    return NextResponse.json({
      success: true,
      message: `Smart sync completed: ${allComments.length} comments from ${stats.postsProcessed} posts across ${stats.pagesProcessed} pages`,
      comments: allComments,
      total: allComments.length,
      failed: failedPosts,
      stats
    });

  } catch (error: any) {
    console.error('Smart Facebook comments sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook comments'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

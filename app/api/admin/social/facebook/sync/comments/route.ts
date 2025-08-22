import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { postIds, pageId } = await request.json();

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to sync comments for',
        comments: [],
        total: 0
      });
    }

    console.log(`🔄 Starting Facebook comments sync for ${postIds.length} posts...`);

    // Get page access tokens from database for all affected pages
    const pageIds = new Set();
    postIds.forEach(postId => {
      const extractedPageId = postId.split('_')[0];
      if (extractedPageId) pageIds.add(extractedPageId);
    });

    // If pageId is provided, filter to that specific page
    let targetPageIds = Array.from(pageIds);
    if (pageId) {
      targetPageIds = targetPageIds.filter(id => id === pageId);
      console.log(`🔍 Filtering to specific page: ${pageId}`);
    }

    // Get page access tokens from database
    const pages = await prisma.facebook_pages.findMany({
      where: { facebookPageId: { in: targetPageIds as string[] } },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });

    const pageTokenMap = new Map<string, string>();
    pages.forEach(page => {
      if (page.accessToken) {
        pageTokenMap.set(page.facebookPageId, page.accessToken);
      }
    });

    console.log(`📄 Found access tokens for ${pageTokenMap.size} pages`);

    // Filter posts to only those we have access tokens for
    const filteredPostIds = postIds.filter(postId => {
      const extractedPageId = postId.split('_')[0];
      return pageTokenMap.has(extractedPageId);
    });

    console.log(`🔍 Filtered to ${filteredPostIds.length} posts with valid access tokens`);

    const allComments: any[] = [];
    const failedPosts: any[] = [];

    for (const postId of filteredPostIds) {
      try {
        console.log(`💭 Syncing comments for post: ${postId}`);

        // Get page access token for this post
        const postPageId = postId.split('_')[0];
        const accessToken = pageTokenMap.get(postPageId);

        if (!accessToken) {
          console.log(`⚠️ Skipping post ${postId} - no access token for page ${postPageId}`);
          failedPosts.push({ postId, reason: 'no_access_token', error: 'No access token found for page' });
          continue;
        }

        // Get comments for this post using page access token
        const response = await fetch(
          `https://graph.facebook.com/v23.0/${postId}/comments?access_token=${accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=50`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Failed to fetch comments for post ${postId}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Skip if permission error or post not accessible
          if (response.status === 400 && errorData.error?.message?.includes('permission')) {
            console.log(`⚠️ Skipping post ${postId} - insufficient permissions`);
            failedPosts.push({ postId, reason: 'permission_denied', error: errorData.error?.message });
          } else if (response.status === 404) {
            console.log(`⚠️ Skipping post ${postId} - post not found`);
            failedPosts.push({ postId, reason: 'not_found', error: 'Post not found' });
          } else {
            failedPosts.push({ postId, reason: 'api_error', error: errorData.error?.message || 'Unknown error' });
          }
          continue;
        }

        const data = await response.json();
        const comments = data.data || [];

        console.log(`📊 Found ${comments.length} comments for post ${postId}`);

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
                facebookPostId: postId,
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
      } catch (error) {
        console.error(`Error syncing comments for post ${postId}:`, error);
      }
    }

    console.log(`✅ Successfully synced ${allComments.length} comments`);
    
    if (failedPosts.length > 0) {
      console.log(`⚠️ Failed to sync ${failedPosts.length} posts:`, failedPosts);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allComments.length} Facebook comments from ${filteredPostIds.length - failedPosts.length}/${filteredPostIds.length} posts`,
      comments: allComments,
      total: allComments.length,
      failed: failedPosts,
      stats: {
        processed: filteredPostIds.length,
        successful: filteredPostIds.length - failedPosts.length,
        failed: failedPosts.length
      }
    });

  } catch (error: any) {
    console.error('Facebook comments sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook comments'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

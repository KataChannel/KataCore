import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, postIds } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to sync comments for',
        comments: [],
        total: 0
      });
    }

    console.log(`🔄 Starting Facebook comments sync for ${postIds.length} posts...`);

    const allComments = [];

    for (const postId of postIds) {
      try {
        console.log(`💭 Syncing comments for post: ${postId}`);

        // Get comments for this post
        const response = await fetch(
          `https://graph.facebook.com/v23.0/${postId}/comments?access_token=${accessToken}&fields=id,from,message,created_time,likes.summary(true),can_reply,can_hide,can_like,is_hidden,parent&limit=50`
        );

        if (!response.ok) {
          console.error(`Failed to fetch comments for post ${postId}`);
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

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allComments.length} Facebook comments`,
      comments: allComments,
      total: allComments.length
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

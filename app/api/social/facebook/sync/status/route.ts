import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get last sync time from various tables
    const [lastComment, lastMessage, lastPost, lastPage] = await Promise.all([
      prisma.facebook_comments.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.facebook_messages.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.facebook_posts.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.facebook_pages.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    // Find the most recent sync time
    const syncTimes = [
      lastComment?.updatedAt,
      lastMessage?.updatedAt,
      lastPost?.updatedAt,
      lastPage?.updatedAt
    ].filter(Boolean);

    const lastSync = syncTimes.length > 0 
      ? Math.max(...syncTimes.map(date => date!.getTime()))
      : null;

    // Get counts for each type
    const [commentCount, messageCount, postCount, pageCount, conversationCount, interactionCount] = await Promise.all([
      prisma.facebook_comments.count(),
      prisma.facebook_messages.count(),
      prisma.facebook_posts.count(),
      prisma.facebook_pages.count(),
      prisma.facebook_conversations.count(),
      prisma.facebook_interactions.count()
    ]);

    return NextResponse.json({
      lastSync: lastSync ? new Date(lastSync).toISOString() : null,
      counts: {
        comments: commentCount,
        messages: messageCount,
        posts: postCount,
        pages: pageCount,
        conversations: conversationCount,
        interactions: interactionCount
      },
      syncStatus: {
        isHealthy: true,
        lastSyncFormatted: lastSync ? new Date(lastSync).toLocaleString('vi-VN') : 'Chưa có dữ liệu',
        syncAge: lastSync ? Date.now() - lastSync : null
      }
    });

  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error',
      lastSync: null,
      counts: {
        comments: 0,
        messages: 0,
        posts: 0,
        pages: 0,
        conversations: 0,
        interactions: 0
      },
      syncStatus: {
        isHealthy: false,
        lastSyncFormatted: 'Lỗi',
        syncAge: null
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, status } = body;

    // This could be used to update sync status in a dedicated sync_status table
    // For now, we'll just return current time as new sync time
    const currentTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      lastSync: currentTime,
      type,
      status: status || 'completed'
    });

  } catch (error) {
    console.error('Sync status update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

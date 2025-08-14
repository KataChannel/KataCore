import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncStatusResponse {
  success: boolean;
  lastSync?: string;
  isActive: boolean;
  activeOperation?: {
    type: string;
    progress: number;
    currentOperation: string;
    startTime: string;
    errors: string[];
  };
  stats?: {
    totalSyncs: number;
    lastSyncType: string;
    lastSyncDuration?: number;
    breakdown?: {
      pages: number;
      posts: number;
      comments: number;
      messages: number;
      conversations: number;
      interactions: number;
    };
  };
  error?: string;
}

// GET - Get current sync status
export async function GET(request: NextRequest): Promise<NextResponse<SyncStatusResponse>> {
  try {
    // Get the most recent sync data from various Facebook tables
    const [lastPageUpdate, lastPostUpdate, lastCommentUpdate, lastMessageUpdate, lastConversationUpdate] = await Promise.all([
      prisma.facebook_pages.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true, name: true }
      }),
      prisma.facebook_posts.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, createdTime: true }
      }),
      prisma.facebook_comments.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, createdTime: true }
      }),
      prisma.facebook_messages.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, createdTime: true }
      }),
      prisma.facebook_conversations.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    // Find the most recent update time from all sources
    const updateTimes = [
      lastPageUpdate?.updatedAt,
      lastPostUpdate?.createdAt,
      lastCommentUpdate?.createdAt,
      lastMessageUpdate?.createdAt,
      lastConversationUpdate?.updatedAt
    ].filter(Boolean);

    const lastSync = updateTimes.length > 0 
      ? new Date(Math.max(...updateTimes.map(date => date!.getTime())))
      : null;

    // Get comprehensive sync statistics
    const [
      totalPages,
      totalPosts, 
      totalComments, 
      totalMessages, 
      totalConversations,
      totalInteractions
    ] = await Promise.all([
      prisma.facebook_pages.count(),
      prisma.facebook_posts.count(),
      prisma.facebook_comments.count(),
      prisma.facebook_messages.count(),
      prisma.facebook_conversations.count(),
      prisma.facebook_interactions.count()
    ]);

    // Check if any sync operation is currently active
    // In a real implementation, you might store active sync status in Redis or database
    const isActive = false; // Default to false since we don't have active sync tracking

    // Determine last sync type based on most recent activity
    let lastSyncType = 'none';
    if (lastSync) {
      if (lastPageUpdate?.updatedAt && lastPageUpdate.updatedAt.getTime() === lastSync.getTime()) {
        lastSyncType = 'pages';
      } else if (lastPostUpdate?.createdAt && lastPostUpdate.createdAt.getTime() === lastSync.getTime()) {
        lastSyncType = 'posts';
      } else if (lastCommentUpdate?.createdAt && lastCommentUpdate.createdAt.getTime() === lastSync.getTime()) {
        lastSyncType = 'comments';
      } else if (lastMessageUpdate?.createdAt && lastMessageUpdate.createdAt.getTime() === lastSync.getTime()) {
        lastSyncType = 'messages';
      } else if (lastConversationUpdate?.updatedAt && lastConversationUpdate.updatedAt.getTime() === lastSync.getTime()) {
        lastSyncType = 'conversations';
      }
    }

    const response: SyncStatusResponse = {
      success: true,
      lastSync: lastSync?.toISOString(),
      isActive,
      stats: {
        totalSyncs: totalPages + totalPosts + totalComments + totalMessages + totalConversations + totalInteractions,
        lastSyncType,
        // Add detailed breakdown
        breakdown: {
          pages: totalPages,
          posts: totalPosts,
          comments: totalComments,
          messages: totalMessages,
          conversations: totalConversations,
          interactions: totalInteractions
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to get sync status:', error);
    
    const errorResponse: SyncStatusResponse = {
      success: false,
      isActive: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Update sync status (for active sync operations)
export async function POST(request: NextRequest): Promise<NextResponse<SyncStatusResponse>> {
  try {
    const body = await request.json();
    const { type, progress, currentOperation, isActive, errors } = body;

    // In a real implementation, you would store this in Redis or a sync_status table
    // For now, we'll just return the received data
    
    if (isActive) {
      // Store active sync information
      // await redis.set('facebook_sync_status', JSON.stringify({
      //   type,
      //   progress,
      //   currentOperation,
      //   startTime: new Date().toISOString(),
      //   errors: errors || []
      // }), 'EX', 3600); // Expire in 1 hour
    }

    const response: SyncStatusResponse = {
      success: true,
      isActive,
      activeOperation: isActive ? {
        type,
        progress: progress || 0,
        currentOperation: currentOperation || 'Processing...',
        startTime: new Date().toISOString(),
        errors: errors || []
      } : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to update sync status:', error);
    
    const errorResponse: SyncStatusResponse = {
      success: false,
      isActive: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE - Clear sync status (stop active operations)
export async function DELETE(request: NextRequest): Promise<NextResponse<SyncStatusResponse>> {
  try {
    // Clear active sync status
    // await redis.del('facebook_sync_status');

    const response: SyncStatusResponse = {
      success: true,
      isActive: false
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to clear sync status:', error);
    
    const errorResponse: SyncStatusResponse = {
      success: false,
      isActive: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/social/facebook/user-search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const pageId = searchParams.get('pageId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const typeParam = searchParams.get('type') || 'all';
    const type: 'all' | 'name' | 'phone' | 'message' = ['all', 'name', 'phone', 'message'].includes(typeParam) 
      ? typeParam as any 
      : 'all';
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      }, { status: 400 });
    }

    console.log(`🔍 Searching users with query: "${query}", type: ${type}, pageId: ${pageId}`);

    const users = new Map();
    
    // Search in facebook_interactions table
    if (type === 'all' || type === 'name' || type === 'message' || type === 'phone') {
      const whereClause: any = {
        ...(pageId && { facebookPageId: pageId }),
        OR: []
      };

      if (type === 'all' || type === 'name') {
        whereClause.OR.push({
          userName: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      if (type === 'all' || type === 'message') {
        whereClause.OR.push({
          message: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      // Search for phone numbers with regex pattern
      if (type === 'all' || type === 'phone') {
        // Remove spaces and special characters from query for phone search
        const cleanQuery = query.replace(/[^\d+]/g, '');
        if (cleanQuery.length >= 3) {
          whereClause.OR.push({
            message: {
              contains: cleanQuery,
              mode: 'insensitive'
            }
          });
        }
      }

      const interactions = await prisma.facebook_interactions.findMany({
        where: whereClause,
        include: {
          facebook_pages: {
            select: {
              name: true,
              facebookPageId: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit * 2, // Get more to account for deduplication
        skip: offset
      });

      // Group by user
      for (const interaction of interactions) {
        const userKey = `${interaction.userId}_${interaction.facebookPageId}`;
        
        if (!users.has(userKey)) {
          // Extract phone from message
          const phoneMatch = interaction.message?.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/) || null;
          
          users.set(userKey, {
            userId: interaction.userId,
            userName: interaction.userName,
            facebookLink: `https://facebook.com/${interaction.userId}`,
            fanpage: interaction.facebook_pages?.name,
            facebookPageId: interaction.facebookPageId,
            phoneNumber: phoneMatch ? phoneMatch[0] : null,
            lastMessage: interaction.message,
            lastInteractionDate: interaction.updatedAt,
            interactionType: interaction.type,
            matchType: 'interaction',
            matchReason: []
          });
        }
        
        const user = users.get(userKey);
        
        // Track why this user matched
        if (type === 'all' || type === 'name') {
          if (interaction.userName.toLowerCase().includes(query.toLowerCase())) {
            user.matchReason.push('name');
          }
        }
        
        if (type === 'all' || type === 'message') {
          if (interaction.message?.toLowerCase().includes(query.toLowerCase())) {
            user.matchReason.push('message');
          }
        }
        
        if (type === 'all' || type === 'phone') {
          const cleanQuery = query.replace(/[^\d+]/g, '');
          if (interaction.message?.includes(cleanQuery)) {
            user.matchReason.push('phone');
          }
        }
        
        // Update latest info if this interaction is more recent
        if (interaction.updatedAt > new Date(user.lastInteractionDate)) {
          user.lastMessage = interaction.message;
          user.lastInteractionDate = interaction.updatedAt;
          user.interactionType = interaction.type;
        }
      }
    }

    // Search in facebook_comments table
    if (type === 'all' || type === 'name' || type === 'message') {
      const commentsWhereClause: any = {
        ...(pageId && { facebook_posts: { facebookPageId: pageId } }),
        OR: []
      };

      if (type === 'all' || type === 'name') {
        commentsWhereClause.OR.push({
          fromName: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      if (type === 'all' || type === 'message') {
        commentsWhereClause.OR.push({
          message: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      const comments = await prisma.facebook_comments.findMany({
        where: commentsWhereClause,
        include: {
          facebook_posts: {
            select: {
              facebookPageId: true,
              message: true
            }
          }
        },
        orderBy: {
          createdTime: 'desc'
        },
        take: limit
      });

      for (const comment of comments) {
        const userKey = `${comment.fromId}_${comment.facebook_posts?.facebookPageId}`;
        
        if (!users.has(userKey)) {
          // Extract phone from comment
          const phoneMatch = comment.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/) || null;
          
          users.set(userKey, {
            userId: comment.fromId,
            userName: comment.fromName,
            facebookLink: `https://facebook.com/${comment.fromId}`,
            fanpage: 'N/A', // Will get from page data if available
            facebookPageId: comment.facebook_posts?.facebookPageId,
            phoneNumber: phoneMatch ? phoneMatch[0] : null,
            lastMessage: comment.message,
            lastInteractionDate: comment.createdTime || comment.updatedAt,
            interactionType: 'COMMENT',
            matchType: 'comment',
            matchReason: []
          });
        }
        
        const user = users.get(userKey);
        
        // Track match reasons
        if (comment.fromName.toLowerCase().includes(query.toLowerCase())) {
          user.matchReason.push('name');
        }
        if (comment.message.toLowerCase().includes(query.toLowerCase())) {
          user.matchReason.push('message');
        }
      }
    }

    // Search in facebook_messages table
    if (type === 'all' || type === 'name' || type === 'message') {
      const messagesWhereClause: any = {
        ...(pageId && { facebookPageId: pageId }),
        OR: []
      };

      if (type === 'all' || type === 'name') {
        messagesWhereClause.OR.push({
          fromName: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      if (type === 'all' || type === 'message') {
        messagesWhereClause.OR.push({
          message: {
            contains: query,
            mode: 'insensitive'
          }
        });
      }

      const messages = await prisma.facebook_messages.findMany({
        where: messagesWhereClause,
        orderBy: {
          createdTime: 'desc'
        },
        take: limit
      });

      for (const message of messages) {
        const userKey = `${message.fromId}_${message.facebookPageId}`;
        
        if (!users.has(userKey)) {
          // Extract phone from message
          const phoneMatch = message.message?.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/) || null;
          
          users.set(userKey, {
            userId: message.fromId,
            userName: message.fromName,
            facebookLink: `https://facebook.com/${message.fromId}`,
            fanpage: 'N/A',
            facebookPageId: message.facebookPageId,
            phoneNumber: phoneMatch ? phoneMatch[0] : null,
            lastMessage: message.message,
            lastInteractionDate: message.createdTime || message.updatedAt,
            interactionType: 'MESSAGE',
            matchType: 'message',
            matchReason: []
          });
        }
        
        const user = users.get(userKey);
        
        // Track match reasons
        if (message.fromName?.toLowerCase().includes(query.toLowerCase())) {
          user.matchReason.push('name');
        }
        if (message.message?.toLowerCase().includes(query.toLowerCase())) {
          user.matchReason.push('message');
        }
      }
    }

    // Convert map to array and apply final pagination
    const allUsers = Array.from(users.values());
    const totalResults = allUsers.length;
    const results = allUsers.slice(0, limit);

    // Get fanpage names for users that don't have it
    for (const user of results) {
      if (user.fanpage === 'N/A' && user.facebookPageId) {
        const page = await prisma.facebook_pages.findUnique({
          where: { facebookPageId: user.facebookPageId },
          select: { name: true }
        });
        user.fanpage = page?.name || 'Unknown Page';
      }
    }

    console.log(`🎯 Found ${totalResults} users matching "${query}"`);

    return NextResponse.json({
      success: true,
      query: query,
      type: type,
      pageId: pageId,
      results: results,
      pagination: {
        total: totalResults,
        limit: limit,
        offset: offset,
        hasMore: totalResults > limit
      }
    });

  } catch (error) {
    console.error('❌ Error searching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error while searching users'
    }, { status: 500 });
  }
}

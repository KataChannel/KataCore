import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pageId = searchParams.get('pageId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let data: any[] = [];
    let total: number = 0;

    switch (type) {
      case 'comments':
        // Comments don't have direct pageId, need to join through posts
        const commentWhere = pageId ? {
          facebook_posts: {
            facebookPageId: pageId
          }
        } : {};
        [data, total] = await Promise.all([
          prisma.facebook_comments.findMany({
            where: commentWhere,
            orderBy: { createdTime: 'desc' },
            take: limit,
            skip: offset,
            include: {
              facebook_posts: {
                select: {
                  facebookPostId: true,
                  message: true,
                  facebookPageId: true
                }
              }
            }
          }),
          prisma.facebook_comments.count({ where: commentWhere })
        ]);
        break;

      case 'messages':
        const messageWhere = pageId ? { facebookPageId: pageId } : {};
        [data, total] = await Promise.all([
          prisma.facebook_messages.findMany({
            where: messageWhere,
            orderBy: { createdTime: 'desc' },
            take: limit,
            skip: offset,
            include: {
              facebook_conversations: {
                select: {
                  facebookConversationId: true,
                  participants: true,
                  messageCount: true
                }
              }
            }
          }),
          prisma.facebook_messages.count({ where: messageWhere })
        ]);
        break;

      case 'posts':
        const postWhere = pageId ? { facebookPageId: pageId } : {};
        [data, total] = await Promise.all([
          prisma.facebook_posts.findMany({
            where: postWhere,
            orderBy: { createdTime: 'desc' },
            take: limit,
            skip: offset,
            include: {
              facebook_pages: {
                select: {
                  name: true,
                  facebookPageId: true
                }
              }
            }
          }),
          prisma.facebook_posts.count({ where: postWhere })
        ]);
        break;

      case 'pages':
        [data, total] = await Promise.all([
          prisma.facebook_pages.findMany({
            orderBy: { fanCount: 'desc' },
            take: limit,
            skip: offset,
            include: {
              _count: {
                select: {
                  facebook_posts: true,
                  facebook_messages: true,
                  facebook_interactions: true
                }
              }
            }
          }),
          prisma.facebook_pages.count()
        ]);
        break;

      case 'conversations':
        const conversationWhere = pageId ? { facebookPageId: pageId } : {};
        [data, total] = await Promise.all([
          prisma.facebook_conversations.findMany({
            where: conversationWhere,
            orderBy: { updatedTime: 'desc' },
            take: limit,
            skip: offset,
            include: {
              facebook_messages: {
                orderBy: { createdTime: 'desc' },
                take: 1
              }
            }
          }),
          prisma.facebook_conversations.count({ where: conversationWhere })
        ]);
        break;

      case 'interactions':
        const interactionWhere = pageId ? { facebookPageId: pageId } : {};
        [data, total] = await Promise.all([
          prisma.facebook_interactions.findMany({
            where: interactionWhere,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
              facebook_pages: {
                select: {
                  name: true,
                  facebookPageId: true
                }
              }
            }
          }),
          prisma.facebook_interactions.count({ where: interactionWhere })
        ]);
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid type. Must be one of: comments, messages, posts, pages, conversations, interactions' 
        }, { status: 400 });
    }

    return NextResponse.json({
      data,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      type
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST method for bulk operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, data: requestData } = body;

    switch (action) {
      case 'bulk_insert':
        let result;
        
        switch (type) {
          case 'comments':
            result = await prisma.facebook_comments.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          case 'messages':
            result = await prisma.facebook_messages.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          case 'posts':
            result = await prisma.facebook_posts.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          case 'pages':
            result = await prisma.facebook_pages.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          case 'conversations':
            result = await prisma.facebook_conversations.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          case 'interactions':
            result = await prisma.facebook_interactions.createMany({
              data: requestData,
              skipDuplicates: true
            });
            break;
            
          default:
            return NextResponse.json({ 
              error: 'Invalid type for bulk insert' 
            }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          inserted: result.count,
          type
        });

      case 'update_sync_time':
        // Update last sync time in a metadata table or return current time
        const syncTime = new Date().toISOString();
        
        return NextResponse.json({
          success: true,
          lastSync: syncTime
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Must be one of: bulk_insert, update_sync_time' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json({ 
      error: 'Database operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE method for data cleanup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pageId = searchParams.get('pageId');
    const olderThan = searchParams.get('olderThan'); // ISO date string

    if (!type) {
      return NextResponse.json({ 
        error: 'Type parameter is required' 
      }, { status: 400 });
    }

    const where: any = {};
    if (pageId) where.facebookPageId = pageId;
    if (olderThan) {
      const date = new Date(olderThan);
      where.createdTime = { lt: date };
    }

    let deleteResult;

    switch (type) {
      case 'comments':
        deleteResult = await prisma.facebook_comments.deleteMany({ where });
        break;
        
      case 'messages':
        deleteResult = await prisma.facebook_messages.deleteMany({ where });
        break;
        
      case 'posts':
        deleteResult = await prisma.facebook_posts.deleteMany({ where });
        break;
        
      case 'interactions':
        const interactionWhere = { ...where };
        if (olderThan) {
          interactionWhere.interactionTime = where.createdTime;
          delete interactionWhere.createdTime;
        }
        deleteResult = await prisma.facebook_interactions.deleteMany({ 
          where: interactionWhere 
        });
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid type for deletion' 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deleted: deleteResult.count,
      type
    });

  } catch (error) {
    console.error('Database deletion error:', error);
    return NextResponse.json({ 
      error: 'Database deletion failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

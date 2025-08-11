import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'pages';

    switch (action) {
      case 'pages':
        // Get pages from database with sync status
        const pages = await prisma.facebook_pages.findMany({
          include: {
            facebook_interactions: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            },
            facebook_posts: {
              take: 3,
              orderBy: { createdAt: 'desc' }
            },
            facebook_messages: {
              take: 3,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        // Transform to match frontend interface
        const transformedPages = pages.map(page => ({
          id: page.facebookPageId,
          name: page.name,
          category: page.category,
          fan_count: page.fanCount,
          followers_count: page.followersCount,
          link: page.link,
          about: page.about,
          phone: page.phone,
          website: page.website,
          // Add sync status
          lastSyncAt: page.updatedAt,
          interactionCount: page.facebook_interactions.length,
          postsCount: page.facebook_posts.length,
          messagesCount: page.facebook_messages.length,
          isSynced: true, // Data from database is considered synced
          dbId: page.id
        }));

        return NextResponse.json({ data: transformedPages });

      case 'posts':
        const postsPage = searchParams.get('page') || '1';
        const postsLimit = parseInt(searchParams.get('limit') || '10');
        const postsPageId = searchParams.get('pageId') || '';

        const postsOffset = (parseInt(postsPage) - 1) * postsLimit;

        // Build where clause for posts
        const postsWhere: any = {};
        if (postsPageId) {
          postsWhere.facebookPageId = postsPageId;
        }

        const [posts, postsTotal] = await Promise.all([
          prisma.facebook_posts.findMany({
            where: postsWhere,
            include: {
              facebook_pages: true,
              facebook_comments: {
                take: 5,
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { createdTime: 'desc' },
            skip: postsOffset,
            take: postsLimit
          }),
          prisma.facebook_posts.count({ where: postsWhere })
        ]);

        // Transform posts to match frontend interface
        const transformedPosts = posts.map(post => ({
          id: post.facebookPostId,
          message: post.message,
          story: post.story,
          created_time: post.createdTime?.toISOString(),
          updated_time: post.updatedTime?.toISOString(),
          likes: {
            summary: {
              total_count: post.likesCount
            }
          },
          comments: {
            summary: {
              total_count: post.commentsCount
            }
          },
          shares: {
            count: post.sharesCount
          },
          permalink_url: post.permalink,
          attachments: post.attachments,
          isSynced: true,
          dbId: post.id
        }));

        return NextResponse.json({
          data: transformedPosts,
          pagination: {
            current: parseInt(postsPage),
            limit: postsLimit,
            total: postsTotal,
            pages: Math.ceil(postsTotal / postsLimit)
          }
        });

      case 'comments':
        const commentsPostId = searchParams.get('postId') || '';
        const commentsPage = searchParams.get('page') || '1';
        const commentsLimit = parseInt(searchParams.get('limit') || '20');

        if (!commentsPostId) {
          return NextResponse.json({ error: 'Post ID required for comments' }, { status: 400 });
        }

        const commentsOffset = (parseInt(commentsPage) - 1) * commentsLimit;

        const [comments, commentsTotal] = await Promise.all([
          prisma.facebook_comments.findMany({
            where: {
              facebookPostId: commentsPostId
            },
            include: {
              replies: {
                take: 3,
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { createdTime: 'desc' },
            skip: commentsOffset,
            take: commentsLimit
          }),
          prisma.facebook_comments.count({
            where: {
              facebookPostId: commentsPostId
            }
          })
        ]);

        // Transform comments to match frontend interface
        const transformedComments = comments.map(comment => ({
          id: comment.facebookCommentId,
          message: comment.message,
          created_time: comment.createdTime?.toISOString(),
          from: {
            name: comment.fromName,
            id: comment.fromId
          },
          likes: {
            summary: {
              total_count: comment.likesCount
            }
          },
          can_reply: comment.canReply,
          can_hide: comment.canHide,
          can_like: comment.canLike,
          is_hidden: comment.isHidden,
          isSynced: true,
          dbId: comment.id
        }));

        return NextResponse.json({
          data: transformedComments,
          pagination: {
            current: parseInt(commentsPage),
            limit: commentsLimit,
            total: commentsTotal,
            pages: Math.ceil(commentsTotal / commentsLimit)
          }
        });

      case 'messages':
        const messagesPage = searchParams.get('page') || '1';
        const messagesLimit = parseInt(searchParams.get('limit') || '10');
        const messagesPageId = searchParams.get('pageId') || '';

        const messagesOffset = (parseInt(messagesPage) - 1) * messagesLimit;

        // Build where clause for messages
        const messagesWhere: any = {};
        if (messagesPageId) {
          messagesWhere.facebookPageId = messagesPageId;
        }

        const [conversations, conversationsTotal] = await Promise.all([
          prisma.facebook_conversations.findMany({
            include: {
              facebook_messages: {
                orderBy: { createdTime: 'desc' },
                take: 10
              }
            },
            orderBy: { updatedTime: 'desc' },
            skip: messagesOffset,
            take: messagesLimit
          }),
          prisma.facebook_conversations.count()
        ]);

        // Transform conversations to match frontend interface
        const transformedConversations = conversations.map(conversation => ({
          id: conversation.facebookConversationId,
          participants: conversation.participants,
          snippet: conversation.snippet,
          updated_time: conversation.updatedTime?.toISOString(),
          unread_count: conversation.unreadCount,
          message_count: conversation.messageCount,
          can_reply: conversation.canReply,
          messages: {
            data: conversation.facebook_messages.map(message => ({
              id: message.facebookMessageId,
              message: message.message,
              created_time: message.createdTime?.toISOString(),
              from: {
                name: message.fromName,
                id: message.fromId
              },
              attachments: message.attachments,
              tags: message.tags,
              is_echo: message.isEcho
            }))
          },
          isSynced: true,
          dbId: conversation.id
        }));

        return NextResponse.json({
          data: transformedConversations,
          pagination: {
            current: parseInt(messagesPage),
            limit: messagesLimit,
            total: conversationsTotal,
            pages: Math.ceil(conversationsTotal / messagesLimit)
          }
        });

      case 'interactions':
        const page = searchParams.get('page') || '1';
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const pageId = searchParams.get('pageId') || '';

        const offset = (parseInt(page) - 1) * limit;

        // Build where clause
        const where: any = {};
        if (search) {
          where.OR = [
            { userName: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } }
          ];
        }
        if (pageId) {
          where.facebookPageId = pageId;
        }

        const [interactions, total] = await Promise.all([
          prisma.facebook_interactions.findMany({
            where,
            include: {
              facebook_pages: true
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit
          }),
          prisma.facebook_interactions.count({ where })
        ]);

        // Transform to match frontend interface
        const transformedInteractions = interactions.map(interaction => ({
          fanpage: interaction.facebook_pages.name,
          fullName: interaction.userName,
          phoneNumber: '', // Not stored in current schema
          facebookLink: `https://facebook.com/${interaction.userId}`,
          firstInteractionDate: interaction.createdAt.toISOString(),
          lastInteractionDate: interaction.updatedAt.toISOString(),
          totalInteractions: 1, // Individual interaction record
          latestMessage: interaction.message || '',
          interactionType: interaction.type
        }));

        return NextResponse.json({
          data: transformedInteractions,
          pagination: {
            current: parseInt(page),
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'sync_pages':
        // Sync pages from Facebook API to database
        const facebookApiUrl = '/api/social/facebook?type=pages';
        const facebookResponse = await fetch(
          new URL(facebookApiUrl, request.url).toString(),
          {
            headers: {
              'X-Facebook-Page-Id': request.headers.get('X-Facebook-Page-Id') || '',
              'X-Facebook-Access-Token': request.headers.get('X-Facebook-Access-Token') || ''
            }
          }
        );

        if (!facebookResponse.ok) {
          throw new Error('Failed to fetch from Facebook API');
        }

        const facebookData = await facebookResponse.json();
        const facebookPages = facebookData.data || [];

        // Update or create pages in database
        const syncResults = [];
        for (const fbPage of facebookPages) {
          try {
            const existingPage = await prisma.facebook_pages.findUnique({
              where: { facebookPageId: fbPage.id }
            });

            if (existingPage) {
              // Update existing page
              const updatedPage = await prisma.facebook_pages.update({
                where: { facebookPageId: fbPage.id },
                data: {
                  name: fbPage.name,
                  category: fbPage.category,
                  fanCount: fbPage.fan_count || 0,
                  followersCount: fbPage.followers_count || 0,
                  link: fbPage.link,
                  about: fbPage.about,
                  phone: fbPage.phone,
                  website: fbPage.website,
                  updatedAt: new Date()
                }
              });
              syncResults.push({ status: 'updated', page: updatedPage });
            } else {
              // Create new page
              const newPage = await prisma.facebook_pages.create({
                data: {
                  facebookPageId: fbPage.id,
                  name: fbPage.name,
                  category: fbPage.category,
                  fanCount: fbPage.fan_count || 0,
                  followersCount: fbPage.followers_count || 0,
                  link: fbPage.link,
                  about: fbPage.about,
                  phone: fbPage.phone,
                  website: fbPage.website
                }
              });
              syncResults.push({ status: 'created', page: newPage });
            }
          } catch (pageError) {
            console.error(`Error syncing page ${fbPage.id}:`, pageError);
            syncResults.push({ 
              status: 'error', 
              pageId: fbPage.id, 
              error: pageError instanceof Error ? pageError.message : 'Unknown error' 
            });
          }
        }

        return NextResponse.json({
          message: 'Sync completed',
          results: syncResults,
          synced: syncResults.filter(r => r.status !== 'error').length,
          errors: syncResults.filter(r => r.status === 'error').length
        });

      case 'sync-posts':
        if (!data?.pageId) {
          return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
        }

        // Get page access token and sync posts from Facebook API
        const { getFacebookConfig } = await import('@/lib/facebook-config');
        const config = getFacebookConfig();
        
        if (!config.accessToken || !config.pageId) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        const postsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${data.pageId}/posts?fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares&access_token=${config.accessToken}&limit=50`
        );

        if (!postsResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch posts from Facebook' }, { status: 500 });
        }

        const postsData = await postsResponse.json();
        let syncedCount = 0;

        // Sync posts to database
        for (const post of postsData.data || []) {
          await prisma.facebook_posts.upsert({
            where: { facebookPostId: post.id },
            create: {
              facebookPostId: post.id,
              facebookPageId: data.pageId,
              message: post.message || null,
              story: post.story || null,
              createdTime: new Date(post.created_time),
              updatedTime: post.updated_time ? new Date(post.updated_time) : null,
              likesCount: post.likes?.summary?.total_count || 0,
              commentsCount: post.comments?.summary?.total_count || 0,
              sharesCount: post.shares?.count || 0,
              permalink: `https://facebook.com/${post.id}`
            },
            update: {
              message: post.message || null,
              story: post.story || null,
              updatedTime: post.updated_time ? new Date(post.updated_time) : null,
              likesCount: post.likes?.summary?.total_count || 0,
              commentsCount: post.comments?.summary?.total_count || 0,
              sharesCount: post.shares?.count || 0
            }
          });
          syncedCount++;
        }

        return NextResponse.json({ 
          success: true, 
          message: `Synced ${syncedCount} posts`,
          syncedCount 
        });

      case 'sync-comments':
        if (!data?.postId) {
          return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
        }

        const { getFacebookConfig: getConfigForComments } = await import('@/lib/facebook-config');
        const configForComments = getConfigForComments();
        
        if (!configForComments.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        const commentsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${data.postId}/comments?fields=id,message,created_time,from,likes.summary(true),can_reply,can_hide,can_like,is_hidden&access_token=${configForComments.accessToken}&limit=100`
        );

        if (!commentsResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch comments from Facebook' }, { status: 500 });
        }

        const commentsData = await commentsResponse.json();
        let commentsSyncedCount = 0;

        // Sync comments to database
        for (const comment of commentsData.data || []) {
          await prisma.facebook_comments.upsert({
            where: { facebookCommentId: comment.id },
            create: {
              facebookCommentId: comment.id,
              facebookPostId: data.postId,
              message: comment.message || '',
              createdTime: new Date(comment.created_time),
              fromId: comment.from?.id || '',
              fromName: comment.from?.name || '',
              likesCount: comment.likes?.summary?.total_count || 0,
              canReply: comment.can_reply || false,
              canHide: comment.can_hide || false,
              canLike: comment.can_like || false,
              isHidden: comment.is_hidden || false
            },
            update: {
              message: comment.message || '',
              likesCount: comment.likes?.summary?.total_count || 0,
              canReply: comment.can_reply || false,
              canHide: comment.can_hide || false,
              canLike: comment.can_like || false,
              isHidden: comment.is_hidden || false
            }
          });
          commentsSyncedCount++;
        }

        return NextResponse.json({ 
          success: true, 
          message: `Synced ${commentsSyncedCount} comments`,
          syncedCount: commentsSyncedCount 
        });

      case 'sync-messages':
        if (!data?.pageId) {
          return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
        }

        const { getFacebookConfig: getConfigForMessages } = await import('@/lib/facebook-config');
        const configForMessages = getConfigForMessages();
        
        if (!configForMessages.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        const conversationsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${data.pageId}/conversations?fields=id,participants,snippet,updated_time,unread_count,message_count,can_reply&access_token=${configForMessages.accessToken}&limit=50`
        );

        if (!conversationsResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch conversations from Facebook' }, { status: 500 });
        }

        const conversationsData = await conversationsResponse.json();
        let conversationsSyncedCount = 0;
        let messagesSyncedCount = 0;

        // Sync conversations and messages to database
        for (const conversation of conversationsData.data || []) {
          // Upsert conversation
          await prisma.facebook_conversations.upsert({
            where: { facebookConversationId: conversation.id },
            create: {
              facebookConversationId: conversation.id,
              facebookPageId: data.pageId,
              participants: conversation.participants || {},
              snippet: conversation.snippet || '',
              updatedTime: conversation.updated_time ? new Date(conversation.updated_time) : new Date(),
              unreadCount: conversation.unread_count || 0,
              messageCount: conversation.message_count || 0,
              canReply: conversation.can_reply || false
            },
            update: {
              participants: conversation.participants || {},
              snippet: conversation.snippet || '',
              updatedTime: conversation.updated_time ? new Date(conversation.updated_time) : new Date(),
              unreadCount: conversation.unread_count || 0,
              messageCount: conversation.message_count || 0,
              canReply: conversation.can_reply || false
            }
          });
          conversationsSyncedCount++;

          // Fetch and sync messages for this conversation
          const messagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/${conversation.id}/messages?fields=id,message,created_time,from,attachments,tags,is_echo&access_token=${configForMessages.accessToken}&limit=50`
          );

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            
            for (const message of messagesData.data || []) {
              await prisma.facebook_messages.upsert({
                where: { facebookMessageId: message.id },
                create: {
                  facebookMessageId: message.id,
                  conversationId: conversation.id,
                  facebookPageId: data.pageId,
                  message: message.message || '',
                  createdTime: new Date(message.created_time),
                  fromId: message.from?.id || '',
                  fromName: message.from?.name || '',
                  attachments: message.attachments || {},
                  tags: message.tags || {},
                  isEcho: message.is_echo || false
                },
                update: {
                  message: message.message || '',
                  attachments: message.attachments || {},
                  tags: message.tags || {},
                  isEcho: message.is_echo || false
                }
              });
              messagesSyncedCount++;
            }
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: `Synced ${conversationsSyncedCount} conversations and ${messagesSyncedCount} messages`,
          syncedCount: { conversations: conversationsSyncedCount, messages: messagesSyncedCount }
        });

      case 'sync_interactions':
        const { pageId } = data;
        if (!pageId) {
          return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
        }

        // Fetch interactions from Facebook API
        const interactionsUrl = `/api/social/facebook?type=messages&pageId=${pageId}`;
        const interactionsResponse = await fetch(
          new URL(interactionsUrl, request.url).toString(),
          {
            headers: {
              'X-Facebook-Page-Id': request.headers.get('X-Facebook-Page-Id') || '',
              'X-Facebook-Access-Token': request.headers.get('X-Facebook-Access-Token') || ''
            }
          }
        );

        if (!interactionsResponse.ok) {
          throw new Error('Failed to fetch interactions from Facebook API');
        }

        const interactionsData = await interactionsResponse.json();
        const conversations = interactionsData.data || [];

        // Process and store interactions
        const interactionResults = [];
        for (const conversation of conversations) {
          if (conversation.messages?.data) {
            for (const message of conversation.messages.data) {
              try {
                const existingInteraction = await prisma.facebook_interactions.findUnique({
                  where: { facebookInteractionId: message.id }
                });

                if (!existingInteraction) {
                  const newInteraction = await prisma.facebook_interactions.create({
                    data: {
                      facebookInteractionId: message.id,
                      facebookPageId: pageId,
                      type: 'MESSAGE',
                      userName: message.from?.name || 'Unknown',
                      userId: message.from?.id || 'unknown',
                      message: message.message,
                      createdAt: message.created_time ? new Date(message.created_time) : new Date()
                    }
                  });
                  interactionResults.push({ status: 'created', interaction: newInteraction });
                }
              } catch (interactionError) {
                console.error(`Error syncing interaction ${message.id}:`, interactionError);
                interactionResults.push({ 
                  status: 'error', 
                  messageId: message.id, 
                  error: interactionError instanceof Error ? interactionError.message : 'Unknown error' 
                });
              }
            }
          }
        }

        return NextResponse.json({
          message: 'Interactions sync completed',
          results: interactionResults,
          synced: interactionResults.filter(r => r.status !== 'error').length,
          errors: interactionResults.filter(r => r.status === 'error').length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}

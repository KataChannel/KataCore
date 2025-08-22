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

      case 'users':
        const usersPage = searchParams.get('page') || '1';
        const usersLimit = parseInt(searchParams.get('limit') || '10');
        const usersSearch = searchParams.get('search') || '';
        const usersPageId = searchParams.get('pageId') || '';
        const usersSort = searchParams.get('sort') || 'firstInteractionDate';
        const usersOrder = searchParams.get('order') || 'desc';

        const usersOffset = (parseInt(usersPage) - 1) * usersLimit;

        // Build where clause for users (interactions)
        const usersWhere: any = {};
        if (usersSearch) {
          usersWhere.OR = [
            { userName: { contains: usersSearch, mode: 'insensitive' } },
            { message: { contains: usersSearch, mode: 'insensitive' } }
          ];
        }
        if (usersPageId) {
          usersWhere.facebookPageId = usersPageId;
        }

        // Get unique users from interactions
        const uniqueUsers = await prisma.facebook_interactions.groupBy({
          by: ['userId', 'userName', 'facebookPageId'],
          where: usersWhere,
          _count: {
            id: true
          },
          _min: {
            createdAt: true
          },
          _max: {
            updatedAt: true
          }
        });

        // Get page names for the results
        const pageIds = [...new Set(uniqueUsers.map(u => u.facebookPageId))];
        const userPages = await prisma.facebook_pages.findMany({
          where: { facebookPageId: { in: pageIds } },
          select: { facebookPageId: true, name: true }
        });
        const pageMap = new Map(userPages.map(p => [p.facebookPageId, p.name]));

        // Get latest message for each user
        const userIds = uniqueUsers.map(u => u.userId);
        const latestMessages = await prisma.facebook_interactions.findMany({
          where: {
            userId: { in: userIds },
            ...(usersPageId ? { facebookPageId: usersPageId } : {})
          },
          orderBy: { createdAt: 'desc' },
          distinct: ['userId']
        });
        const messageMap = new Map(latestMessages.map(m => [m.userId, m.message || '']));

        // Transform to match frontend interface
        const transformedUsers = uniqueUsers.map(user => ({
          fanpage: pageMap.get(user.facebookPageId) || 'Unknown Page',
          fullName: user.userName || 'Unknown User',
          phoneNumber: '', // Not available in current schema
          facebookLink: `https://facebook.com/${user.userId}`,
          firstInteractionDate: user._min.createdAt?.toISOString() || '',
          lastInteractionDate: user._max.updatedAt?.toISOString() || '',
          totalInteractions: user._count.id,
          latestMessage: messageMap.get(user.userId) || '',
          interactionType: 'VARIOUS' // Mixed types for users
        }));

        // Sort results
        const sortField = usersSort === 'firstInteractionDate' ? 'firstInteractionDate' :
                         usersSort === 'lastInteractionDate' ? 'lastInteractionDate' :
                         usersSort === 'totalInteractions' ? 'totalInteractions' :
                         usersSort === 'fullName' ? 'fullName' : 'firstInteractionDate';

        transformedUsers.sort((a, b) => {
          const aVal = a[sortField as keyof typeof a];
          const bVal = b[sortField as keyof typeof b];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return usersOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return usersOrder === 'desc' ? bVal - aVal : aVal - bVal;
          }
          return 0;
        });

        // Apply pagination
        const paginatedUsers = transformedUsers.slice(usersOffset, usersOffset + usersLimit);

        return NextResponse.json({
          data: paginatedUsers,
          pagination: {
            current: parseInt(usersPage),
            limit: usersLimit,
            total: transformedUsers.length,
            pages: Math.ceil(transformedUsers.length / usersLimit)
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
        const { validateFacebookToken, handleFacebookAPIError } = await import('@/lib/facebook-token-utils');
        const config = getFacebookConfig();
        
        if (!config.accessToken || !config.pageId) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }
        
        console.log('🔄 Attempting to sync posts for page:', data.pageId);
        console.log('📋 Access token source:', config.source.accessToken);
        console.log('🔑 User token length:', config.accessToken?.length || 0);
        
        // Validate user access token first
        const tokenValidation = await validateFacebookToken(config.accessToken);
        
        if (!tokenValidation.isValid) {
          console.error('❌ Token validation failed:', tokenValidation.error);
          const errorResponse = handleFacebookAPIError(tokenValidation.error, 'token validation');
          return NextResponse.json(errorResponse, { status: 401 });
        }
        
        console.log('✅ User token validated for:', tokenValidation.userInfo?.name || tokenValidation.userInfo?.id);

        // Get page access token for the specific page
        console.log('🔄 Getting page access tokens...');
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v20.0/me/accounts?access_token=${config.accessToken}`
        );
        
        if (!pagesResponse.ok) {
          const errorData = await pagesResponse.json().catch(() => null);
          console.error('❌ Failed to get page access tokens:', errorData);
          return NextResponse.json({ 
            error: 'Failed to get page access tokens',
            details: errorData?.error?.message || 'Unknown error'
          }, { status: 401 });
        }

        const pagesData = await pagesResponse.json();
        
        if (!pagesData.data || pagesData.data.length === 0) {
          return NextResponse.json({ 
            error: 'No pages found',
            details: 'User has no pages or insufficient permissions'
          }, { status: 403 });
        }

        // Find the token for the requested page
        const pageToken = pagesData.data.find((page: any) => page.id === data.pageId);
        if (!pageToken) {
          console.error('❌ No access token found for page:', data.pageId);
          return NextResponse.json({ 
            error: 'No access token found for the requested page',
            availablePages: pagesData.data.map((page: any) => ({ id: page.id, name: page.name }))
          }, { status: 403 });
        }

        console.log('✅ Got page access token for:', pageToken.name);
        
        const postsResponse = await fetch(
          `https://graph.facebook.com/v20.0/${data.pageId}/posts?fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares&access_token=${pageToken.access_token}&limit=50`
        );
        
        console.log('📡 Posts API Response Status:', postsResponse.status);
        
        if (!postsResponse.ok) {
          const errorData = await postsResponse.json().catch(() => null);
          console.error('❌ Posts fetch failed:', errorData);
          
          const errorResponse = handleFacebookAPIError(errorData?.error, 'posts fetch');
          return NextResponse.json({
            ...errorResponse,
            status: postsResponse.status
          }, { status: postsResponse.status >= 500 ? 500 : 400 });
        }

        const postsData = await postsResponse.json();
        let syncedCount = 0;

        console.log(`📊 Found ${postsData.data?.length || 0} posts to sync`);

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
          `https://graph.facebook.com/v20.0/${data.postId}/comments?fields=id,message,created_time,from,likes.summary(true),can_reply,can_hide,can_like,is_hidden&access_token=${configForComments.accessToken}&limit=100`
        );

        if (!commentsResponse.ok) {
          return NextResponse.json({ error: 'Failed to fetch comments from Facebook' }, { status: 500 });
        }

        const commentsData = await commentsResponse.json();
        let commentsSyncedCount = 0;
        console.log(commentsData.data.length, `Syncing ${commentsData.data.length} comments for post ${data.postId}`);
        
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
        const { validateFacebookToken: validateTokenForMessages, handleFacebookAPIError: handleErrorForMessages } = await import('@/lib/facebook-token-utils');
        const configForMessages = getConfigForMessages();
        
        if (!configForMessages.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        console.log('🔄 Attempting to sync messages for page:', data.pageId);
        console.log('📋 Access token source:', configForMessages.source.accessToken);
        console.log('🔑 User token length:', configForMessages.accessToken?.length || 0);

        // Validate user access token first
        const tokenValidationForMessages = await validateTokenForMessages(configForMessages.accessToken);
        
        if (!tokenValidationForMessages.isValid) {
          console.error('❌ Token validation failed:', tokenValidationForMessages.error);
          const errorResponse = handleErrorForMessages(tokenValidationForMessages.error, 'token validation');
          return NextResponse.json(errorResponse, { status: 401 });
        }
        
        console.log('✅ User token validated for messages sync:', tokenValidationForMessages.userInfo?.name || tokenValidationForMessages.userInfo?.id);

        // Get page access token for the specific page
        console.log('🔄 Getting page access tokens for messages...');
        const pagesResponseForMessages = await fetch(
          `https://graph.facebook.com/v20.0/me/accounts?access_token=${configForMessages.accessToken}`
        );
        
        if (!pagesResponseForMessages.ok) {
          const errorData = await pagesResponseForMessages.json().catch(() => null);
          console.error('❌ Failed to get page access tokens for messages:', errorData);
          return NextResponse.json({ 
            error: 'Failed to get page access tokens',
            details: errorData?.error?.message || 'Unknown error'
          }, { status: 401 });
        }

        const pagesDataForMessages = await pagesResponseForMessages.json();
        
        if (!pagesDataForMessages.data || pagesDataForMessages.data.length === 0) {
          return NextResponse.json({ 
            error: 'No pages found',
            details: 'User has no pages or insufficient permissions'
          }, { status: 403 });
        }

        // Find the token for the requested page
        const pageTokenForMessages = pagesDataForMessages.data.find((page: any) => page.id === data.pageId);
        if (!pageTokenForMessages) {
          console.error('❌ No access token found for page:', data.pageId);
          return NextResponse.json({ 
            error: 'No access token found for the requested page',
            availablePages: pagesDataForMessages.data.map((page: any) => ({ id: page.id, name: page.name }))
          }, { status: 403 });
        }

        console.log('✅ Got page access token for messages:', pageTokenForMessages.name);

        const conversationsResponse = await fetch(
          `https://graph.facebook.com/v20.0/${data.pageId}/conversations?fields=id,participants,snippet,updated_time,unread_count,message_count,can_reply&access_token=${pageTokenForMessages.access_token}&limit=50`
        );

        console.log('📡 Conversations API Response Status:', conversationsResponse.status);

        if (!conversationsResponse.ok) {
          const errorData = await conversationsResponse.json().catch(() => null);
          console.error('❌ Conversations fetch failed:', errorData);
          
          const errorResponse = handleErrorForMessages(errorData?.error, 'conversations fetch');
          return NextResponse.json({
            ...errorResponse,
            status: conversationsResponse.status
          }, { status: conversationsResponse.status >= 500 ? 500 : 400 });
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
            `https://graph.facebook.com/v20.0/${conversation.id}/messages?fields=id,message,created_time,from,attachments,tags,is_echo&access_token=${pageTokenForMessages.access_token}&limit=50`
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

      case 'sync-all-posts':
        // Comprehensive sync of all posts from all pages
        const { getFacebookConfig: getConfigForAllPosts } = await import('@/lib/facebook-config');
        const configForAllPosts = getConfigForAllPosts();
        
        if (!configForAllPosts.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        // Validate access token first
        console.log('🔍 Validating Facebook access token...');
        try {
          const tokenValidationResponse = await fetch(
            `https://graph.facebook.com/v20.0/me?access_token=${configForAllPosts.accessToken}`
          );
          const tokenValidationData = await tokenValidationResponse.json();
          
          if (!tokenValidationResponse.ok || tokenValidationData.error) {
            return NextResponse.json({ 
              error: 'Facebook access token is invalid or expired',
              details: tokenValidationData.error?.message || 'Token validation failed',
              code: tokenValidationData.error?.code || 'INVALID_TOKEN'
            }, { status: 401 });
          }
          
          console.log('✅ Token validated for user:', tokenValidationData.name || tokenValidationData.id);
        } catch (tokenError) {
          return NextResponse.json({ 
            error: 'Failed to validate Facebook access token',
            details: tokenError instanceof Error ? tokenError.message : 'Unknown validation error'
          }, { status: 500 });
        }

        // Get all Facebook pages from database
        const allPages = await prisma.facebook_pages.findMany({
          select: { facebookPageId: true, name: true }
        });

        if (allPages.length === 0) {
          return NextResponse.json({ error: 'No Facebook pages found. Please sync pages first.' }, { status: 400 });
        }

        let totalPostsSynced = 0;
        let totalCommentsSynced = 0;
        const pageResults = [];

        // Sync posts for each page
        for (const page of allPages) {
          try {
            console.log(`🔄 Syncing posts for page: ${page.name} (${page.facebookPageId})`);

            // Fetch posts with pagination
            let nextUrl = `https://graph.facebook.com/v20.0/${page.facebookPageId}/posts?fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments,permalink_url&access_token=${configForAllPosts.accessToken}&limit=100`;
            let pagePostsCount = 0;
            let pageCommentsCount = 0;

            while (nextUrl) {
              const postsResponse = await fetch(nextUrl);
              
              if (!postsResponse.ok) {
                console.error(`Failed to fetch posts for page ${page.facebookPageId}:`, await postsResponse.text());
                break;
              }

              const postsData = await postsResponse.json();
              
              // Sync posts to database
              for (const post of postsData.data || []) {
                const upsertedPost = await prisma.facebook_posts.upsert({
                  where: { facebookPostId: post.id },
                  create: {
                    facebookPostId: post.id,
                    facebookPageId: page.facebookPageId,
                    message: post.message || null,
                    story: post.story || null,
                    createdTime: new Date(post.created_time),
                    updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                    likesCount: post.likes?.summary?.total_count || 0,
                    commentsCount: post.comments?.summary?.total_count || 0,
                    sharesCount: post.shares?.count || 0,
                    permalink: post.permalink_url || `https://facebook.com/${post.id}`,
                    attachments: post.attachments || {}
                  },
                  update: {
                    message: post.message || null,
                    story: post.story || null,
                    updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                    likesCount: post.likes?.summary?.total_count || 0,
                    commentsCount: post.comments?.summary?.total_count || 0,
                    sharesCount: post.shares?.count || 0,
                    permalink: post.permalink_url || `https://facebook.com/${post.id}`,
                    attachments: post.attachments || {}
                  }
                });
                pagePostsCount++;

                // Sync comments for this post if it has comments
                if (post.comments?.summary?.total_count > 0) {
                    try {
                      const commentsResponse = await fetch(
                        `https://graph.facebook.com/v20.0/${post.id}/comments?fields=id,message,created_time,from,likes.summary(true),can_reply,can_hide,can_like,is_hidden&access_token=${configForAllPosts.accessToken}&limit=100`
                      );                    if (commentsResponse.ok) {
                      const commentsData = await commentsResponse.json();
                      
                      for (const comment of commentsData.data || []) {
                        await prisma.facebook_comments.upsert({
                          where: { facebookCommentId: comment.id },
                          create: {
                            facebookCommentId: comment.id,
                            facebookPostId: post.id,
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
                        pageCommentsCount++;
                      }
                    }
                  } catch (commentError) {
                    console.error(`Error syncing comments for post ${post.id}:`, commentError);
                  }
                }

                // Rate limiting - small delay between requests
                await new Promise(resolve => setTimeout(resolve, 100));
              }

              // Check for next page
              nextUrl = postsData.paging?.next || null;
              
              // Safety limit to prevent infinite loops
              if (pagePostsCount > 1000) {
                console.log(`Reached safety limit of 1000 posts for page ${page.name}`);
                break;
              }
            }

            totalPostsSynced += pagePostsCount;
            totalCommentsSynced += pageCommentsCount;
            
            pageResults.push({
              pageId: page.facebookPageId,
              pageName: page.name,
              postsSynced: pagePostsCount,
              commentsSynced: pageCommentsCount,
              status: 'success'
            });

            console.log(`✅ Completed page ${page.name}: ${pagePostsCount} posts, ${pageCommentsCount} comments`);

          } catch (pageError) {
            console.error(`Error syncing page ${page.facebookPageId}:`, pageError);
            pageResults.push({
              pageId: page.facebookPageId,
              pageName: page.name,
              postsSynced: 0,
              commentsSynced: 0,
              status: 'error',
              error: pageError instanceof Error ? pageError.message : 'Unknown error'
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: `Comprehensive posts sync completed`,
          summary: {
            totalPages: allPages.length,
            totalPostsSynced,
            totalCommentsSynced,
            successfulPages: pageResults.filter(r => r.status === 'success').length,
            failedPages: pageResults.filter(r => r.status === 'error').length
          },
          details: pageResults
        });

      case 'sync-all-messages':
        // Comprehensive sync of all messages from all pages
        const { getFacebookConfig: getConfigForAllMessages } = await import('@/lib/facebook-config');
        const configForAllMessages = getConfigForAllMessages();
        
        if (!configForAllMessages.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        // Validate access token first
        console.log('🔍 Validating Facebook access token for messages sync...');
        try {
          const tokenValidationResponse = await fetch(
            `https://graph.facebook.com/v20.0/me?access_token=${configForAllMessages.accessToken}`
          );
          const tokenValidationData = await tokenValidationResponse.json();
          
          if (!tokenValidationResponse.ok || tokenValidationData.error) {
            return NextResponse.json({ 
              error: 'Facebook access token is invalid or expired',
              details: tokenValidationData.error?.message || 'Token validation failed',
              code: tokenValidationData.error?.code || 'INVALID_TOKEN'
            }, { status: 401 });
          }
          
          console.log('✅ Token validated for messages sync:', tokenValidationData.name || tokenValidationData.id);
        } catch (tokenError) {
          return NextResponse.json({ 
            error: 'Failed to validate Facebook access token',
            details: tokenError instanceof Error ? tokenError.message : 'Unknown validation error'
          }, { status: 500 });
        }

        // Get all Facebook pages from database
        const allPagesForMessages = await prisma.facebook_pages.findMany({
          select: { facebookPageId: true, name: true }
        });

        if (allPagesForMessages.length === 0) {
          return NextResponse.json({ error: 'No Facebook pages found. Please sync pages first.' }, { status: 400 });
        }

        let totalConversationsSynced = 0;
        let totalMessagesSynced = 0;
        const messagePageResults = [];

        // Sync messages for each page
        for (const page of allPagesForMessages) {
          try {
            console.log(`🔄 Syncing messages for page: ${page.name} (${page.facebookPageId})`);

            // Fetch conversations with pagination
            let nextConversationsUrl = `https://graph.facebook.com/v20.0/${page.facebookPageId}/conversations?fields=id,participants,snippet,updated_time,unread_count,message_count,can_reply&access_token=${configForAllMessages.accessToken}&limit=100`;
            let pageConversationsCount = 0;
            let pageMessagesCount = 0;

            while (nextConversationsUrl) {
              const conversationsResponse = await fetch(nextConversationsUrl);
              
              if (!conversationsResponse.ok) {
                console.error(`Failed to fetch conversations for page ${page.facebookPageId}:`, await conversationsResponse.text());
                break;
              }

              const conversationsData = await conversationsResponse.json();
              
              // Sync conversations and their messages
              for (const conversation of conversationsData.data || []) {
                // Upsert conversation
                await prisma.facebook_conversations.upsert({
                  where: { facebookConversationId: conversation.id },
                  create: {
                    facebookConversationId: conversation.id,
                    facebookPageId: page.facebookPageId,
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
                pageConversationsCount++;

                // Fetch and sync messages for this conversation with pagination
                let nextMessagesUrl = `https://graph.facebook.com/v20.0/${conversation.id}/messages?fields=id,message,created_time,from,attachments,tags,is_echo&access_token=${configForAllMessages.accessToken}&limit=100`;
                let conversationMessagesCount = 0;

                while (nextMessagesUrl && conversationMessagesCount < 500) { // Limit messages per conversation
                  try {
                    const messagesResponse = await fetch(nextMessagesUrl);
                    
                    if (!messagesResponse.ok) break;

                    const messagesData = await messagesResponse.json();
                    
                    for (const message of messagesData.data || []) {
                      await prisma.facebook_messages.upsert({
                        where: { facebookMessageId: message.id },
                        create: {
                          facebookMessageId: message.id,
                          conversationId: conversation.id,
                          facebookPageId: page.facebookPageId,
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
                      conversationMessagesCount++;
                      pageMessagesCount++;
                    }

                    nextMessagesUrl = messagesData.paging?.next || null;
                    
                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 50));

                  } catch (messageError) {
                    console.error(`Error syncing messages for conversation ${conversation.id}:`, messageError);
                    break;
                  }
                }

                // Rate limiting between conversations
                await new Promise(resolve => setTimeout(resolve, 100));
              }

              // Check for next page of conversations
              nextConversationsUrl = conversationsData.paging?.next || null;
              
              // Safety limit
              if (pageConversationsCount > 500) {
                console.log(`Reached safety limit of 500 conversations for page ${page.name}`);
                break;
              }
            }

            totalConversationsSynced += pageConversationsCount;
            totalMessagesSynced += pageMessagesCount;
            
            messagePageResults.push({
              pageId: page.facebookPageId,
              pageName: page.name,
              conversationsSynced: pageConversationsCount,
              messagesSynced: pageMessagesCount,
              status: 'success'
            });

            console.log(`✅ Completed page ${page.name}: ${pageConversationsCount} conversations, ${pageMessagesCount} messages`);

          } catch (pageError) {
            console.error(`Error syncing messages for page ${page.facebookPageId}:`, pageError);
            messagePageResults.push({
              pageId: page.facebookPageId,
              pageName: page.name,
              conversationsSynced: 0,
              messagesSynced: 0,
              status: 'error',
              error: pageError instanceof Error ? pageError.message : 'Unknown error'
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: `Comprehensive messages sync completed`,
          summary: {
            totalPages: allPagesForMessages.length,
            totalConversationsSynced,
            totalMessagesSynced,
            successfulPages: messagePageResults.filter(r => r.status === 'success').length,
            failedPages: messagePageResults.filter(r => r.status === 'error').length
          },
          details: messagePageResults
        });

      case 'sync-all-data':
        // Ultimate comprehensive sync: pages, posts, comments, messages, and interactions
        const { getFacebookConfig: getConfigForAll } = await import('@/lib/facebook-config');
        const configForAll = getConfigForAll();
        
        if (!configForAll.accessToken) {
          return NextResponse.json({ error: 'Facebook configuration not valid' }, { status: 400 });
        }

        // Validate access token first
        console.log('🔍 Validating Facebook access token for comprehensive sync...');
        try {
          const tokenValidationResponse = await fetch(
            `https://graph.facebook.com/v20.0/me?access_token=${configForAll.accessToken}`
          );
          const tokenValidationData = await tokenValidationResponse.json();
          
          if (!tokenValidationResponse.ok || tokenValidationData.error) {
            return NextResponse.json({ 
              error: 'Facebook access token is invalid or expired',
              details: tokenValidationData.error?.message || 'Token validation failed',
              code: tokenValidationData.error?.code || 'INVALID_TOKEN'
            }, { status: 401 });
          }
          
          console.log('✅ Token validated for comprehensive sync:', tokenValidationData.name || tokenValidationData.id);
        } catch (tokenError) {
          return NextResponse.json({ 
            error: 'Failed to validate Facebook access token',
            details: tokenError instanceof Error ? tokenError.message : 'Unknown validation error'
          }, { status: 500 });
        }

        interface SyncPhase {
          phase: string;
          status: 'started' | 'completed' | 'error';
          startTime: Date;
          endTime?: Date;
        }

        interface SyncError {
          phase: string;
          postId?: string;
          pageId?: string;
          conversationId?: string;
          error: string;
        }

        const syncReport: {
          startTime: Date;
          endTime?: Date;
          phases: SyncPhase[];
          summary: {
            totalPages: number;
            totalPosts: number;
            totalComments: number;
            totalConversations: number;
            totalMessages: number;
            totalInteractions: number;
          };
          errors: SyncError[];
        } = {
          startTime: new Date(),
          phases: [],
          summary: {
            totalPages: 0,
            totalPosts: 0,
            totalComments: 0,
            totalConversations: 0,
            totalMessages: 0,
            totalInteractions: 0
          },
          errors: []
        };

        try {
          // Phase 1: Sync Pages
          console.log('🔄 Phase 1: Syncing Facebook Pages...');
          syncReport.phases.push({ phase: 'pages', status: 'started', startTime: new Date() });
          
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,category,fan_count,followers_count,link,about,phone,website&access_token=${configForAll.accessToken}`
          );

          if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            const pages = pagesData.data || [];
            
            for (const fbPage of pages) {
              await prisma.facebook_pages.upsert({
                where: { facebookPageId: fbPage.id },
                create: {
                  facebookPageId: fbPage.id,
                  name: fbPage.name,
                  category: fbPage.category,
                  fanCount: fbPage.fan_count || 0,
                  followersCount: fbPage.followers_count || 0,
                  link: fbPage.link,
                  about: fbPage.about,
                  phone: fbPage.phone,
                  website: fbPage.website
                },
                update: {
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
              syncReport.summary.totalPages++;
            }
            
            const lastPhase = syncReport.phases[syncReport.phases.length - 1];
            if (lastPhase) {
              lastPhase.status = 'completed';
              lastPhase.endTime = new Date();
            }
            console.log(`✅ Phase 1 completed: ${syncReport.summary.totalPages} pages synced`);
          }

          // Phase 2: Get all pages for subsequent syncs
          const allPagesForSync = await prisma.facebook_pages.findMany({
            select: { facebookPageId: true, name: true }
          });

          // Phase 3: Sync Posts and Comments
          console.log('🔄 Phase 2: Syncing Posts and Comments...');
          syncReport.phases.push({ phase: 'posts_comments', status: 'started', startTime: new Date() });

          for (const page of allPagesForSync) {
            try {
              let nextPostsUrl = `https://graph.facebook.com/v20.0/${page.facebookPageId}/posts?fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments,permalink_url&access_token=${configForAll.accessToken}&limit=50`;
              let pagePostsCount = 0;

              while (nextPostsUrl && pagePostsCount < 200) { // Limit posts per page for performance
                const postsResponse = await fetch(nextPostsUrl);
                if (!postsResponse.ok) break;

                const postsData = await postsResponse.json();
                
                for (const post of postsData.data || []) {
                  await prisma.facebook_posts.upsert({
                    where: { facebookPostId: post.id },
                    create: {
                      facebookPostId: post.id,
                      facebookPageId: page.facebookPageId,
                      message: post.message || null,
                      story: post.story || null,
                      createdTime: new Date(post.created_time),
                      updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                      likesCount: post.likes?.summary?.total_count || 0,
                      commentsCount: post.comments?.summary?.total_count || 0,
                      sharesCount: post.shares?.count || 0,
                      permalink: post.permalink_url || `https://facebook.com/${post.id}`,
                      attachments: post.attachments || {}
                    },
                    update: {
                      message: post.message || null,
                      story: post.story || null,
                      updatedTime: post.updated_time ? new Date(post.updated_time) : null,
                      likesCount: post.likes?.summary?.total_count || 0,
                      commentsCount: post.comments?.summary?.total_count || 0,
                      sharesCount: post.shares?.count || 0,
                      permalink: post.permalink_url || `https://facebook.com/${post.id}`,
                      attachments: post.attachments || {}
                    }
                  });
                  pagePostsCount++;
                  syncReport.summary.totalPosts++;

                  // Sync comments for posts with comments
                  if (post.comments?.summary?.total_count > 0) {
                    try {
                      const commentsResponse = await fetch(
                        `https://graph.facebook.com/v20.0/${post.id}/comments?fields=id,message,created_time,from,likes.summary(true),can_reply,can_hide,can_like,is_hidden&access_token=${configForAll.accessToken}&limit=50`
                      );

                      if (commentsResponse.ok) {
                        const commentsData = await commentsResponse.json();
                        
                        for (const comment of commentsData.data || []) {
                          await prisma.facebook_comments.upsert({
                            where: { facebookCommentId: comment.id },
                            create: {
                              facebookCommentId: comment.id,
                              facebookPostId: post.id,
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
                          syncReport.summary.totalComments++;
                        }
                      }
                    } catch (commentError) {
                      syncReport.errors.push({
                        phase: 'comments',
                        postId: post.id,
                        error: commentError instanceof Error ? commentError.message : 'Unknown error'
                      });
                    }
                  }

                  // Rate limiting
                  await new Promise(resolve => setTimeout(resolve, 100));
                }

                nextPostsUrl = postsData.paging?.next || null;
              }
            } catch (pageError) {
              syncReport.errors.push({
                phase: 'posts',
                pageId: page.facebookPageId,
                error: pageError instanceof Error ? pageError.message : 'Unknown error'
              });
            }
          }

          const postsPhase = syncReport.phases[syncReport.phases.length - 1];
          if (postsPhase) {
            postsPhase.status = 'completed';
            postsPhase.endTime = new Date();
          }
          console.log(`✅ Phase 2 completed: ${syncReport.summary.totalPosts} posts, ${syncReport.summary.totalComments} comments synced`);

          // Phase 3: Sync Messages and Conversations
          console.log('🔄 Phase 3: Syncing Conversations and Messages...');
          syncReport.phases.push({ phase: 'messages_conversations', status: 'started', startTime: new Date() });

          for (const page of allPagesForSync) {
            try {
              let nextConversationsUrl = `https://graph.facebook.com/v20.0/${page.facebookPageId}/conversations?fields=id,participants,snippet,updated_time,unread_count,message_count,can_reply&access_token=${configForAll.accessToken}&limit=50`;
              let pageConversationsCount = 0;

              while (nextConversationsUrl && pageConversationsCount < 100) { // Limit conversations per page
                const conversationsResponse = await fetch(nextConversationsUrl);
                if (!conversationsResponse.ok) break;

                const conversationsData = await conversationsResponse.json();
                
                for (const conversation of conversationsData.data || []) {
                  await prisma.facebook_conversations.upsert({
                    where: { facebookConversationId: conversation.id },
                    create: {
                      facebookConversationId: conversation.id,
                      facebookPageId: page.facebookPageId,
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
                  pageConversationsCount++;
                  syncReport.summary.totalConversations++;

                  // Sync messages for this conversation
                  try {
                    let nextMessagesUrl = `https://graph.facebook.com/v20.0/${conversation.id}/messages?fields=id,message,created_time,from,attachments,tags,is_echo&access_token=${configForAll.accessToken}&limit=30`;
                    let conversationMessagesCount = 0;

                    while (nextMessagesUrl && conversationMessagesCount < 100) { // Limit messages per conversation
                      const messagesResponse = await fetch(nextMessagesUrl);
                      if (!messagesResponse.ok) break;

                      const messagesData = await messagesResponse.json();
                      
                      for (const message of messagesData.data || []) {
                        await prisma.facebook_messages.upsert({
                          where: { facebookMessageId: message.id },
                          create: {
                            facebookMessageId: message.id,
                            conversationId: conversation.id,
                            facebookPageId: page.facebookPageId,
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
                        conversationMessagesCount++;
                        syncReport.summary.totalMessages++;

                        // Create interaction record
                        if (!message.is_echo && message.from?.id && message.from?.name) {
                          await prisma.facebook_interactions.upsert({
                            where: { facebookInteractionId: message.id },
                            create: {
                              facebookInteractionId: message.id,
                              facebookPageId: page.facebookPageId,
                              type: 'MESSAGE',
                              userName: message.from.name,
                              userId: message.from.id,
                              message: message.message || '',
                              createdAt: new Date(message.created_time)
                            },
                            update: {
                              userName: message.from.name,
                              message: message.message || '',
                              updatedAt: new Date()
                            }
                          });
                          syncReport.summary.totalInteractions++;
                        }
                      }

                      nextMessagesUrl = messagesData.paging?.next || null;
                      
                      // Rate limiting
                      await new Promise(resolve => setTimeout(resolve, 50));
                    }
                  } catch (messageError) {
                    syncReport.errors.push({
                      phase: 'messages',
                      conversationId: conversation.id,
                      error: messageError instanceof Error ? messageError.message : 'Unknown error'
                    });
                  }

                  // Rate limiting between conversations
                  await new Promise(resolve => setTimeout(resolve, 100));
                }

                nextConversationsUrl = conversationsData.paging?.next || null;
              }
            } catch (pageError) {
              syncReport.errors.push({
                phase: 'conversations',
                pageId: page.facebookPageId,
                error: pageError instanceof Error ? pageError.message : 'Unknown error'
              });
            }
          }

          const messagesPhase = syncReport.phases[syncReport.phases.length - 1];
          if (messagesPhase) {
            messagesPhase.status = 'completed';
            messagesPhase.endTime = new Date();
          }
          console.log(`✅ Phase 3 completed: ${syncReport.summary.totalConversations} conversations, ${syncReport.summary.totalMessages} messages synced`);

          // Final summary
          syncReport.endTime = new Date();
          const duration = (syncReport.endTime.getTime() - syncReport.startTime.getTime()) / 1000;

          return NextResponse.json({
            success: true,
            message: 'Comprehensive Facebook data sync completed successfully',
            duration: `${duration} seconds`,
            summary: syncReport.summary,
            phases: syncReport.phases,
            errors: syncReport.errors,
            errorCount: syncReport.errors.length
          });

        } catch (error) {
          console.error('Error in comprehensive sync:', error);
          return NextResponse.json({
            success: false,
            message: 'Comprehensive sync failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            partialResults: syncReport
          }, { status: 500 });
        }

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

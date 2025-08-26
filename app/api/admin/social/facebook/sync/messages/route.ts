import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { pageIds } = await request.json();

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Page IDs array is required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting Facebook messages sync for ${pageIds.length} pages...`);

    // Get page access tokens from database
    const pages = await prisma.facebook_pages.findMany({
      where: { facebookPageId: { in: pageIds as string[] } },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });

    const pageTokenMap = new Map<string, { token: string, name: string }>();
    pages.forEach(page => {
      if (page.accessToken) {
        pageTokenMap.set(page.facebookPageId, { 
          token: page.accessToken, 
          name: page.name || 'Unknown Page' 
        });
      }
    });

    console.log(`� Found access tokens for ${pageTokenMap.size}/${pageIds.length} pages`);

    // Filter to only pages we have access tokens for
    const validPageIds = pageIds.filter(pageId => pageTokenMap.has(pageId));
    
    // Track pages without access tokens
    const pagesWithoutTokens = pageIds.filter(pageId => !pageTokenMap.has(pageId));
    pagesWithoutTokens.forEach(pageId => {
      console.log(`⚠️ Skipping page ${pageId} - no access token in database`);
      failedPages.push({ pageId, reason: 'no_access_token', error: 'No access token found in database' });
    });
    
    console.log(`🔍 Processing ${validPageIds.length} pages with valid access tokens`);

    const allMessages: any[] = [];
    const allConversations: any[] = [];
    const failedPages: any[] = [];

    for (const pageId of validPageIds) {
      try {
        const pageInfo = pageTokenMap.get(pageId)!;
        console.log(`💬 Syncing messages for page: ${pageInfo.name} (${pageId})`);

        // Get conversations for this page using page access token
        const conversationsResponse = await fetch(
          `https://graph.facebook.com/v23.0/${pageId}/conversations?access_token=${pageInfo.token}&fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=50`
        );

        if (!conversationsResponse.ok) {
          const errorData = await conversationsResponse.json().catch(() => ({}));
          console.error(`Failed to fetch conversations for page ${pageId}:`, {
            status: conversationsResponse.status,
            statusText: conversationsResponse.statusText,
            error: errorData
          });
          
          // Categorize and track failed pages
          if (conversationsResponse.status === 400 && errorData.error?.message?.includes('permission')) {
            console.log(`⚠️ Skipping page ${pageId} - insufficient permissions`);
            failedPages.push({ pageId, reason: 'permission_denied', error: errorData.error?.message });
          } else if (conversationsResponse.status === 429) {
            console.log(`⚠️ Skipping page ${pageId} - rate limited`);
            failedPages.push({ pageId, reason: 'rate_limited', error: 'Rate limit exceeded' });
          } else if (conversationsResponse.status === 404) {
            console.log(`⚠️ Skipping page ${pageId} - page not found`);
            failedPages.push({ pageId, reason: 'not_found', error: 'Page not found' });
          } else {
            failedPages.push({ pageId, reason: 'api_error', error: errorData.error?.message || 'Unknown API error' });
          }
          continue;
        }

        const conversationsData = await conversationsResponse.json();
        const conversations = conversationsData.data || [];

        console.log(`📊 Found ${conversations.length} conversations for page ${pageId}`);

        // Store/update conversations
        for (const conversation of conversations) {
          try {
            const savedConversation = await prisma.facebook_conversations.upsert({
              where: { facebookConversationId: conversation.id },
              update: {
                facebookPageId: pageId,
                participants: conversation.participants || null,
                messageCount: conversation.message_count || 0,
                unreadCount: conversation.unread_count || 0,
                canReply: conversation.can_reply !== false,
                snippet: conversation.snippet || null,
                updatedTime: conversation.updated_time ? new Date(conversation.updated_time) : null,
                updatedAt: new Date()
              },
              create: {
                facebookConversationId: conversation.id,
                facebookPageId: pageId,
                participants: conversation.participants || null,
                messageCount: conversation.message_count || 0,
                unreadCount: conversation.unread_count || 0,
                canReply: conversation.can_reply !== false,
                snippet: conversation.snippet || null,
                updatedTime: conversation.updated_time ? new Date(conversation.updated_time) : null
              }
            });

            allConversations.push(savedConversation);

            // Get messages for this conversation using page access token
            const messagesResponse = await fetch(
              `https://graph.facebook.com/v23.0/${conversation.id}/messages?access_token=${pageInfo.token}&fields=id,from,message,attachments,created_time,tags,is_echo&limit=50`
            );

            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              const messages = messagesData.data || [];

              for (const message of messages) {
                try {
                  const savedMessage = await prisma.facebook_messages.upsert({
                    where: { facebookMessageId: message.id },
                    update: {
                      fromId: message.from?.id || '',
                      fromName: message.from?.name || '',
                      message: message.message || null,
                      attachments: message.attachments || null,
                      createdTime: message.created_time ? new Date(message.created_time) : null,
                      tags: message.tags || null,
                      messageType: message.attachments ? 'ATTACHMENT' : 'TEXT',
                      isEcho: message.is_echo === true,
                      isRead: false, // Default to unread
                      updatedAt: new Date()
                    },
                    create: {
                      facebookMessageId: message.id,
                      facebookPageId: pageId,
                      conversationId: conversation.id,
                      fromId: message.from?.id || '',
                      fromName: message.from?.name || '',
                      message: message.message || null,
                      attachments: message.attachments || null,
                      createdTime: message.created_time ? new Date(message.created_time) : null,
                      tags: message.tags || null,
                      messageType: message.attachments ? 'ATTACHMENT' : 'TEXT',
                      isEcho: message.is_echo === true,
                      isRead: false
                    }
                  });

                  allMessages.push(savedMessage);
                } catch (error) {
                  console.error(`Failed to save message ${message.id}:`, error);
                }
              }
            }
          } catch (error) {
            console.error(`Failed to save conversation ${conversation.id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error syncing messages for page ${pageId}:`, error);
        failedPages.push({ 
          pageId, 
          reason: 'processing_error', 
          error: error instanceof Error ? error.message : 'Unknown processing error' 
        });
      }
    }

    console.log(`✅ Successfully synced ${allConversations.length} conversations and ${allMessages.length} messages`);
    console.log(allMessages);
    
    if (failedPages.length > 0) {
      console.log(`⚠️ Failed to sync ${failedPages.length} pages:`, failedPages);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allConversations.length} conversations and ${allMessages.length} messages from ${validPageIds.length - failedPages.filter(p => p.reason !== 'no_access_token').length}/${pageIds.length} pages`,
      conversations: allConversations,
      messages: allMessages,
      total: allMessages.length,
      failed: failedPages,
      stats: {
        totalPages: pageIds.length,
        processedPages: validPageIds.length,
        successfulPages: validPageIds.length - failedPages.filter(p => p.reason !== 'no_access_token').length,
        failedPages: failedPages.length,
        noTokenPages: pagesWithoutTokens.length
      }
    });

  } catch (error: any) {
    console.error('Facebook messages sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook messages'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

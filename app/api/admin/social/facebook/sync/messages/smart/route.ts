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

    console.log(`🔄 Starting smart Facebook messages sync for ${pageIds.length} pages...`);

    const allMessages = [];
    const allConversations = [];
    const failedPages = [];
    const stats = {
      pagesProcessed: 0,
      conversationsFound: 0,
      messagesFound: 0,
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
          failedPages.push({
            pageId,
            reason: 'no_access_token',
            error: 'Page not found or no access token'
          });
          continue;
        }

        console.log(`📄 Processing page: ${page.name} (${page.facebookPageId})`);
        stats.pagesProcessed++;

        // Get conversations for this page using page's access token
        const conversationsResponse = await fetch(
          `https://graph.facebook.com/v23.0/${pageId}/conversations?access_token=${page.accessToken}&fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=${limit}`
        );

        if (!conversationsResponse.ok) {
          const errorData = await conversationsResponse.json().catch(() => ({}));
          console.error(`Failed to fetch conversations for page ${pageId}:`, {
            status: conversationsResponse.status,
            statusText: conversationsResponse.statusText,
            error: errorData
          });

          if (conversationsResponse.status === 400 && errorData.error?.message?.includes('permission')) {
            stats.permissionErrors++;
            failedPages.push({
              pageId,
              reason: 'permission_denied',
              error: errorData.error?.message
            });
          } else if (conversationsResponse.status === 429) {
            stats.otherErrors++;
            failedPages.push({
              pageId,
              reason: 'rate_limited',
              error: 'Rate limit exceeded'
            });
          } else {
            stats.otherErrors++;
            failedPages.push({
              pageId,
              reason: 'api_error',
              error: errorData.error?.message || 'Unknown API error'
            });
          }
          continue;
        }

        const conversationsData = await conversationsResponse.json();
        const conversations = conversationsData.data || [];

        console.log(`📊 Found ${conversations.length} conversations for page ${pageId}`);
        stats.conversationsFound += conversations.length;

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

            // Get messages for this conversation (limit to recent messages)
            const messagesResponse = await fetch(
              `https://graph.facebook.com/v23.0/${conversation.id}/messages?access_token=${page.accessToken}&fields=id,from,message,attachments,created_time,tags,is_echo&limit=10`
            );

            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              const messages = messagesData.data || [];

              console.log(`💬 Found ${messages.length} messages for conversation ${conversation.id}`);
              stats.messagesFound += messages.length;

              // Store/update messages
              for (const message of messages) {
                try {
                  const savedMessage = await prisma.facebook_messages.upsert({
                    where: { facebookMessageId: message.id },
                    update: {
                      conversationId: conversation.id,
                      facebookPageId: pageId,
                      fromId: message.from?.id || '',
                      fromName: message.from?.name || 'Unknown',
                      message: message.message || null,
                      attachments: message.attachments || undefined,
                      createdTime: message.created_time ? new Date(message.created_time) : null,
                      tags: message.tags || undefined,
                      isEcho: message.is_echo === true,
                      updatedAt: new Date()
                    },
                    create: {
                      facebookMessageId: message.id,
                      conversationId: conversation.id,
                      facebookPageId: pageId,
                      fromId: message.from?.id || '',
                      fromName: message.from?.name || 'Unknown',
                      message: message.message || null,
                      attachments: message.attachments || undefined,
                      createdTime: message.created_time ? new Date(message.created_time) : null,
                      tags: message.tags || undefined,
                      isEcho: message.is_echo === true
                    }
                  });

                  allMessages.push(savedMessage);
                } catch (messageError) {
                  console.error(`Failed to save message ${message.id}:`, messageError);
                }
              }
            } else {
              console.log(`⚠️ Failed to fetch messages for conversation ${conversation.id}`);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (conversationError) {
            console.error(`Failed to save conversation ${conversation.id}:`, conversationError);
          }
        }

        // Add delay between pages
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing page ${pageId}:`, error);
        stats.otherErrors++;
        failedPages.push({
          pageId,
          reason: 'processing_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Smart messages sync completed:`, stats);
    
    if (failedPages.length > 0) {
      console.log(`⚠️ Failed pages breakdown:`, {
        permission_errors: failedPages.filter(p => p.reason === 'permission_denied').length,
        rate_limit_errors: failedPages.filter(p => p.reason === 'rate_limited').length,
        api_errors: failedPages.filter(p => p.reason === 'api_error').length,
        no_token_errors: failedPages.filter(p => p.reason === 'no_access_token').length,
        processing_errors: failedPages.filter(p => p.reason === 'processing_error').length
      });
    }

    return NextResponse.json({
      success: true,
      message: `Smart messages sync completed: ${allMessages.length} messages and ${allConversations.length} conversations from ${stats.pagesProcessed} pages`,
      messages: allMessages,
      conversations: allConversations,
      totalMessages: allMessages.length,
      totalConversations: allConversations.length,
      failed: failedPages,
      stats
    });

  } catch (error: any) {
    console.error('Smart Facebook messages sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook messages'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

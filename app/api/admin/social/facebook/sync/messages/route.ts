import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pageIds } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Page IDs array is required'
      }, { status: 400 });
    }

    console.log(`🔄 Starting Facebook messages sync for ${pageIds.length} pages...`);

    const allMessages = [];
    const allConversations = [];

    for (const pageId of pageIds) {
      try {
        console.log(`💬 Syncing messages for page: ${pageId}`);

        // Get conversations for this page
        const conversationsResponse = await fetch(
          `https://graph.facebook.com/v23.0/${pageId}/conversations?access_token=${accessToken}&fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=50`
        );

        if (!conversationsResponse.ok) {
          console.error(`Failed to fetch conversations for page ${pageId}`);
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

            // Get messages for this conversation
            const messagesResponse = await fetch(
              `https://graph.facebook.com/v23.0/${conversation.id}/messages?access_token=${accessToken}&fields=id,from,message,attachments,created_time,tags,is_echo&limit=50`
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
      }
    }

    console.log(`✅ Successfully synced ${allConversations.length} conversations and ${allMessages.length} messages`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${allConversations.length} conversations and ${allMessages.length} messages`,
      conversations: allConversations,
      messages: allMessages,
      total: allMessages.length
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

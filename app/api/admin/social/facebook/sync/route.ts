import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Facebook Graph API configuration
const FACEBOOK_API_VERSION = 'v21.0';
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface FacebookCredentials {
  accessToken: string;
  pageId?: string;
}

interface SyncResult {
  success: boolean;
  type: string;
  synced: number;
  processed: number;
  errors: string[];
  userDataExtracted: number;
  message: string;
}

// Helper function to get Facebook credentials
async function getFacebookCredentials(pageId?: string): Promise<FacebookCredentials> {
  if (pageId) {
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: pageId },
      select: { accessToken: true }
    });
    
    if (!page?.accessToken) {
      throw new Error(`Access token not found for page ${pageId}`);
    }
    
    return {
      accessToken: page.accessToken,
      pageId
    };
  }
  
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('Facebook access token not configured');
  }

  return {
    accessToken,
    pageId
  };
}

// Helper function to make Facebook API requests with retry logic
async function fetchFacebookAPI(endpoint: string, accessToken: string, retries = 3) {
  const url = `${FACEBOOK_BASE_URL}${endpoint}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 429) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}/${retries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000;
      console.log(`Request failed, retrying in ${delay}ms (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Helper function to extract phone numbers from text
function extractPhoneNumber(text: string): string | null {
  const phonePattern = /(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/g;
  const match = text.match(phonePattern);
  if (match) {
    let phone = match[0];
    if (phone.startsWith('84') && !phone.startsWith('+84')) {
      phone = '+' + phone;
    } else if (phone.startsWith('0')) {
      phone = '+84' + phone.substring(1);
    }
    return phone;
  }
  return null;
}

// Enhanced sync fanpages
async function syncFanpages(accessToken: string): Promise<SyncResult> {
  try {
    console.log('🔄 Starting fanpages sync...');
    
    const pagesData = await fetchFacebookAPI(`/me/accounts?access_token=${accessToken}`, accessToken);
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return {
        success: true,
        type: 'fanpages',
        synced: 0,
        processed: 0,
        errors: [],
        userDataExtracted: 0,
        message: 'No fanpages found'
      };
    }

    const pages = [];
    const errors: string[] = [];
    
    for (const page of pagesData.data) {
      try {
        const pageDetails = await fetchFacebookAPI(
          `/${page.id}?fields=id,name,category,fan_count,followers_count,link,about,phone,website,picture&access_token=${page.access_token}`,
          page.access_token
        );

        pages.push({
          facebookPageId: pageDetails.id,
          name: pageDetails.name,
          category: pageDetails.category,
          fanCount: pageDetails.fan_count || 0,
          followersCount: pageDetails.followers_count || 0,
          link: pageDetails.link,
          about: pageDetails.about,
          phone: pageDetails.phone,
          website: pageDetails.website,
          accessToken: page.access_token,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error(`Error syncing page ${page.id}:`, error);
        errors.push(`Page ${page.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    for (const page of pages) {
      await prisma.facebook_pages.upsert({
        where: { facebookPageId: page.facebookPageId },
        update: {
          name: page.name,
          category: page.category,
          fanCount: page.fanCount,
          followersCount: page.followersCount,
          link: page.link,
          about: page.about,
          phone: page.phone,
          website: page.website,
          accessToken: page.accessToken,
          updatedAt: page.updatedAt
        },
        create: page
      });
    }

    console.log(`✅ Fanpages sync completed: ${pages.length} pages processed`);
    
    return {
      success: true,
      type: 'fanpages',
      synced: pages.length,
      processed: pagesData.data.length,
      errors,
      userDataExtracted: 0,
      message: `Successfully synced ${pages.length} fanpages`
    };
  } catch (error) {
    console.error('❌ Fanpages sync failed:', error);
    return {
      success: false,
      type: 'fanpages',
      synced: 0,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      userDataExtracted: 0,
      message: 'Fanpages sync failed'
    };
  }
}

// Enhanced sync comments
async function syncComments(accessToken: string, pageId?: string, limit: number = 100): Promise<SyncResult> {
  try {
    console.log(`🔄 Starting comments sync... (page: ${pageId || 'all'}, limit: ${limit})`);
    
    let pages: any[] = [];
    
    if (pageId) {
      const page = await prisma.facebook_pages.findUnique({
        where: { facebookPageId: pageId }
      });
      if (page) pages = [page];
    } else {
      pages = await prisma.facebook_pages.findMany({
        where: { accessToken: { not: null } }
      });
    }

    if (pages.length === 0) {
      return {
        success: false,
        type: 'comments',
        synced: 0,
        processed: 0,
        errors: ['No pages found or configured'],
        userDataExtracted: 0,
        message: 'No pages available for comment sync'
      };
    }

    let totalSynced = 0;
    let totalProcessed = 0;
    let totalUserDataExtracted = 0;
    const errors: string[] = [];

    for (const page of pages) {
      try {
        console.log(`📝 Syncing comments for page: ${page.name} (${page.facebookPageId})`);
        
        const postsData = await fetchFacebookAPI(
          `/${page.facebookPageId}/posts?fields=id,message,created_time,updated_time&limit=${limit}&access_token=${page.accessToken}`,
          page.accessToken
        );

        if (!postsData.data) continue;

        for (const post of postsData.data) {
          try {
            // Upsert post
            await prisma.facebook_posts.upsert({
              where: { facebookPostId: post.id },
              update: {
                message: post.message,
                updatedTime: new Date(post.updated_time),
                updatedAt: new Date()
              },
              create: {
                facebookPostId: post.id,
                facebookPageId: page.facebookPageId,
                message: post.message,
                createdTime: new Date(post.created_time),
                updatedTime: new Date(post.updated_time)
              }
            });

            // Get comments for this post
            const commentsData = await fetchFacebookAPI(
              `/${post.id}/comments?fields=id,message,created_time,from&limit=${limit}&access_token=${page.accessToken}`,
              page.accessToken
            );

            if (!commentsData.data) continue;

            for (const comment of commentsData.data) {
              try {
                totalProcessed++;

                // Upsert comment
                await prisma.facebook_comments.upsert({
                  where: { facebookCommentId: comment.id },
                  update: {
                    message: comment.message,
                    updatedAt: new Date()
                  },
                  create: {
                    facebookCommentId: comment.id,
                    facebookPostId: post.id,
                    fromId: comment.from?.id || 'unknown',
                    fromName: comment.from?.name || 'Unknown User',
                    message: comment.message,
                    createdTime: new Date(comment.created_time)
                  }
                });

                totalSynced++;

                // Extract user data and create interaction record
                if (comment.message) {
                  const extractedPhone = extractPhoneNumber(comment.message);
                  
                  if (extractedPhone) {
                    totalUserDataExtracted++;
                    
                    // Create interaction record
                    await prisma.facebook_interactions.upsert({
                      where: {
                        facebookInteractionId: `comment-${comment.id}`
                      },
                      update: {
                        message: comment.message,
                        updatedAt: new Date()
                      },
                      create: {
                        facebookInteractionId: `comment-${comment.id}`,
                        facebookPageId: page.facebookPageId,
                        type: 'COMMENT',
                        userName: comment.from?.name || 'Unknown User',
                        userId: comment.from?.id || 'unknown',
                        message: `${comment.message}\n[EXTRACTED_PHONE: ${extractedPhone}]`,
                        createdAt: new Date(comment.created_time)
                      }
                    });
                  }
                }
              } catch (commentError) {
                console.error(`Error processing comment ${comment.id}:`, commentError);
                errors.push(`Comment ${comment.id}: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`);
              }
            }
          } catch (postError) {
            console.error(`Error processing post ${post.id}:`, postError);
            errors.push(`Post ${post.id}: ${postError instanceof Error ? postError.message : 'Unknown error'}`);
          }
        }
      } catch (pageError) {
        console.error(`Error syncing page ${page.facebookPageId}:`, pageError);
        errors.push(`Page ${page.facebookPageId}: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Comments sync completed: ${totalSynced} comments synced, ${totalUserDataExtracted} user data extracted`);
    
    return {
      success: true,
      type: 'comments',
      synced: totalSynced,
      processed: totalProcessed,
      errors,
      userDataExtracted: totalUserDataExtracted,
      message: `Successfully synced ${totalSynced} comments with ${totalUserDataExtracted} user data extractions`
    };
  } catch (error) {
    console.error('❌ Comments sync failed:', error);
    return {
      success: false,
      type: 'comments',
      synced: 0,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      userDataExtracted: 0,
      message: 'Comments sync failed'
    };
  }
}

// Enhanced sync messages
async function syncMessages(accessToken: string, pageId?: string, limit: number = 100): Promise<SyncResult> {
  try {
    console.log(`🔄 Starting messages sync... (page: ${pageId || 'all'}, limit: ${limit})`);
    
    let pages: any[] = [];
    
    if (pageId) {
      const page = await prisma.facebook_pages.findUnique({
        where: { facebookPageId: pageId }
      });
      if (page) pages = [page];
    } else {
      pages = await prisma.facebook_pages.findMany({
        where: { accessToken: { not: null } }
      });
    }

    if (pages.length === 0) {
      return {
        success: false,
        type: 'messages',
        synced: 0,
        processed: 0,
        errors: ['No pages found or configured'],
        userDataExtracted: 0,
        message: 'No pages available for message sync'
      };
    }

    let totalSynced = 0;
    let totalProcessed = 0;
    let totalUserDataExtracted = 0;
    const errors: string[] = [];

    for (const page of pages) {
      try {
        console.log(`💬 Syncing messages for page: ${page.name} (${page.facebookPageId})`);
        
        // Get conversations for this page
        const conversationsData = await fetchFacebookAPI(
          `/${page.facebookPageId}/conversations?fields=id,updated_time,participants&limit=${limit}&access_token=${page.accessToken}`,
          page.accessToken
        );

        if (!conversationsData.data) continue;

        for (const conversation of conversationsData.data) {
          try {
            // Upsert conversation
            await prisma.facebook_conversations.upsert({
              where: { facebookConversationId: conversation.id },
              update: {
                updatedAt: new Date(conversation.updated_time)
              },
              create: {
                facebookConversationId: conversation.id,
                facebookPageId: page.facebookPageId,
                participants: conversation.participants?.data || [],
                createdAt: new Date(conversation.updated_time),
                updatedAt: new Date(conversation.updated_time)
              }
            });

            // Get messages for this conversation
            const messagesData = await fetchFacebookAPI(
              `/${conversation.id}/messages?fields=id,message,created_time,from&limit=${limit}&access_token=${page.accessToken}`,
              page.accessToken
            );

            if (!messagesData.data) continue;

            for (const message of messagesData.data) {
              try {
                totalProcessed++;

                // Skip messages from the page itself
                if (message.from?.id === page.facebookPageId) continue;

                // Upsert message
                await prisma.facebook_messages.upsert({
                  where: { facebookMessageId: message.id },
                  update: {
                    message: message.message,
                    updatedAt: new Date()
                  },
                  create: {
                    facebookMessageId: message.id,
                    facebookPageId: page.facebookPageId,
                    conversationId: conversation.id,
                    fromId: message.from?.id || 'unknown',
                    fromName: message.from?.name || 'Unknown User',
                    message: message.message,
                    createdTime: new Date(message.created_time)
                  }
                });

                totalSynced++;

                // Extract user data and create interaction record
                if (message.message) {
                  const extractedPhone = extractPhoneNumber(message.message);
                  
                  if (extractedPhone) {
                    totalUserDataExtracted++;
                    
                    // Create interaction record
                    await prisma.facebook_interactions.upsert({
                      where: {
                        facebookInteractionId: `message-${message.id}`
                      },
                      update: {
                        message: message.message,
                        updatedAt: new Date()
                      },
                      create: {
                        facebookInteractionId: `message-${message.id}`,
                        facebookPageId: page.facebookPageId,
                        type: 'MESSAGE',
                        userName: message.from?.name || 'Unknown User',
                        userId: message.from?.id || 'unknown',
                        message: `${message.message}\n[EXTRACTED_PHONE: ${extractedPhone}]`,
                        createdAt: new Date(message.created_time)
                      }
                    });
                  }
                }
              } catch (messageError) {
                console.error(`Error processing message ${message.id}:`, messageError);
                errors.push(`Message ${message.id}: ${messageError instanceof Error ? messageError.message : 'Unknown error'}`);
              }
            }
          } catch (conversationError) {
            console.error(`Error processing conversation ${conversation.id}:`, conversationError);
            errors.push(`Conversation ${conversation.id}: ${conversationError instanceof Error ? conversationError.message : 'Unknown error'}`);
          }
        }
      } catch (pageError) {
        console.error(`Error syncing page ${page.facebookPageId}:`, pageError);
        errors.push(`Page ${page.facebookPageId}: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Messages sync completed: ${totalSynced} messages synced, ${totalUserDataExtracted} user data extracted`);
    
    return {
      success: true,
      type: 'messages',
      synced: totalSynced,
      processed: totalProcessed,
      errors,
      userDataExtracted: totalUserDataExtracted,
      message: `Successfully synced ${totalSynced} messages with ${totalUserDataExtracted} user data extractions`
    };
  } catch (error) {
    console.error('❌ Messages sync failed:', error);
    return {
      success: false,
      type: 'messages',
      synced: 0,
      processed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      userDataExtracted: 0,
      message: 'Messages sync failed'
    };
  }
}

// POST handler for sync operations
export async function POST(request: NextRequest) {
  let requestBody: any;
  
  try {
    requestBody = await request.json();
    
    const { type, pageId, limit = 100 } = requestBody;
    
    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Sync type is required',
        validTypes: ['fanpages', 'comments', 'messages', 'all']
      }, { status: 400 });
    }

    console.log(`🚀 Starting Facebook sync: ${type}${pageId ? ` for page ${pageId}` : ''}`);
    
    let result: SyncResult;
    
    switch (type) {
      case 'fanpages':
        const { accessToken } = await getFacebookCredentials();
        result = await syncFanpages(accessToken);
        break;
        
      case 'comments':
        const commentsCredentials = await getFacebookCredentials(pageId);
        result = await syncComments(commentsCredentials.accessToken, pageId, limit);
        break;
        
      case 'messages':
        const messagesCredentials = await getFacebookCredentials(pageId);
        result = await syncMessages(messagesCredentials.accessToken, pageId, limit);
        break;
        
      case 'all':
        const allCredentials = await getFacebookCredentials(pageId);
        const fanpagesResult = await syncFanpages(allCredentials.accessToken);
        const commentsResult = await syncComments(allCredentials.accessToken, pageId, limit);
        const messagesResult = await syncMessages(allCredentials.accessToken, pageId, limit);
        
        result = {
          success: fanpagesResult.success && commentsResult.success && messagesResult.success,
          type: 'all',
          synced: fanpagesResult.synced + commentsResult.synced + messagesResult.synced,
          processed: fanpagesResult.processed + commentsResult.processed + messagesResult.processed,
          errors: [...fanpagesResult.errors, ...commentsResult.errors, ...messagesResult.errors],
          userDataExtracted: commentsResult.userDataExtracted + messagesResult.userDataExtracted,
          message: `Complete sync: ${fanpagesResult.synced} fanpages, ${commentsResult.synced} comments, ${messagesResult.synced} messages, ${commentsResult.userDataExtracted + messagesResult.userDataExtracted} user data extractions`
        };
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: `Invalid sync type: ${type}`,
          validTypes: ['fanpages', 'comments', 'messages', 'all']
        }, { status: 400 });
    }

    console.log(`✅ Facebook sync completed:`, result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Facebook sync error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestData: requestBody || null
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET handler for sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    
    const stats = await Promise.all([
      prisma.facebook_pages.count(),
      prisma.facebook_posts.count(),
      prisma.facebook_comments.count(),
      prisma.facebook_messages.count(),
      prisma.facebook_conversations.count(),
      prisma.facebook_interactions.count(),
      
      prisma.facebook_interactions.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          facebook_pages: {
            select: { name: true, facebookPageId: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPages: stats[0],
        totalPosts: stats[1],
        totalComments: stats[2],
        totalMessages: stats[3],
        totalConversations: stats[4],
        totalInteractions: stats[5]
      },
      recentActivity: stats[6]
    });
    
  } catch (error) {
    console.error('Sync status error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

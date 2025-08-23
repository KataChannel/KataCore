import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { userDataExtractor, UserInteractionData } from '../services/UserDataExtractor';

const prisma = new PrismaClient();

// Facebook Graph API configuration
const FACEBOOK_API_VERSION = 'v21.0';
const FACEBOOK_BASE_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface FacebookCredentials {
  accessToken: string;
  pageId?: string;
}

// Helper function to get Facebook credentials
async function getFacebookCredentials(pageId?: string): Promise<FacebookCredentials> {
  // Get access token from environment or database
  const accessToken = process.env.NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN;
  
  if (!accessToken) {
    throw new Error('Facebook access token not configured');
  }

  return {
    accessToken,
    pageId
  };
}

// Helper function to make Facebook API requests
async function fetchFacebookAPI(endpoint: string, accessToken: string) {
  const url = `${FACEBOOK_BASE_URL}${endpoint}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
  }
  
  return response.json();
}

// Enhanced function to fetch ALL data with pagination support
async function fetchAllFacebookData(endpoint: string, accessToken: string, maxPages = 10): Promise<any[]> {
  const allData: any[] = [];
  let nextUrl = `${FACEBOOK_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;
  let pageCount = 0;
  
  while (nextUrl && pageCount < maxPages) {
    try {
      console.log(`📄 Fetching page ${pageCount + 1} for ${endpoint}...`);
      
      const response = await fetch(nextUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        allData.push(...data.data);
        console.log(`✅ Page ${pageCount + 1}: ${data.data.length} items fetched (Total: ${allData.length})`);
      }
      
      // Check for next page
      nextUrl = data.paging?.next || null;
      pageCount++;
      
      // Add small delay to avoid rate limiting
      if (nextUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error: any) {
      console.error(`❌ Error fetching page ${pageCount + 1}:`, error.message);
      break;
    }
  }
  
  console.log(`🎯 Total fetched for ${endpoint}: ${allData.length} items across ${pageCount} pages`);
  return allData;
}

// Sync Facebook Pages
async function syncPages(accessToken: string) {
  try {
    console.log('Starting pages sync...');
    
    // Get pages the app has access to
    const pagesData = await fetchFacebookAPI(`/me/accounts?access_token=${accessToken}`, accessToken);
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return { synced: 0, message: 'No pages found' };
    }

    const pages = [];
    
    for (const page of pagesData.data) {
      // Get detailed page information
      const pageDetails = await fetchFacebookAPI(
        `/${page.id}?fields=id,name,category,fan_count,followers_count,link,about,phone,website&access_token=${page.access_token}`,
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
    }

    // Bulk insert/update pages
    await prisma.facebook_pages.createMany({
      data: pages,
      skipDuplicates: true
    });

    // Update existing pages
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

    console.log(`Synced ${pages.length} pages`);
    return { synced: pages.length, data: pages };

  } catch (error) {
    console.error('Pages sync error:', error);
    throw error;
  }
}

// Sync Facebook Posts
async function syncPosts(pageId?: string) {
  try {
    console.log('Starting posts sync...');
    
    const pages = pageId 
      ? await prisma.facebook_pages.findMany({ where: { facebookPageId: pageId } })
      : await prisma.facebook_pages.findMany();

    if (pages.length === 0) {
      return { synced: 0, message: 'No pages found to sync posts' };
    }

    let totalSynced = 0;

    for (const page of pages) {
      if (!page.accessToken) continue;

      console.log(`📊 Syncing posts for page: ${page.name || page.facebookPageId}`);
      
      // Get ALL posts from the page using pagination
      const allPosts = await fetchAllFacebookData(
        `/${page.facebookPageId}/posts?fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,type,attachments,permalink_url,is_published&limit=100`,
        page.accessToken,
        20 // Max 20 pages of posts per page
      );

      console.log(`📈 Found ${allPosts.length} total posts for page ${page.name || page.facebookPageId}`);

      const posts = allPosts.map((post: any) => ({
        facebookPostId: post.id,
        facebookPageId: page.facebookPageId,
        message: post.message,
        story: post.story,
        createdTime: post.created_time ? new Date(post.created_time) : null,
        updatedTime: post.updated_time ? new Date(post.updated_time) : null,
        likesCount: post.likes?.summary?.total_count || 0,
        commentsCount: post.comments?.summary?.total_count || 0,
        sharesCount: post.shares?.count || 0,
        postType: post.type,
        attachments: post.attachments ? JSON.stringify(post.attachments) : undefined,
        permalink: post.permalink_url,
        isPublished: post.is_published !== false,
        updatedAt: new Date()
      }));

      // Bulk insert posts
      await prisma.facebook_posts.createMany({
        data: posts,
        skipDuplicates: true
      });

      // Update existing posts
      for (const post of posts) {
        await prisma.facebook_posts.upsert({
          where: { facebookPostId: post.facebookPostId },
          update: {
            message: post.message,
            story: post.story,
            updatedTime: post.updatedTime,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            updatedAt: post.updatedAt
          },
          create: post
        });
      }

      totalSynced += posts.length;
      console.log(`Synced ${posts.length} posts for page ${page.name}`);
    }

    return { synced: totalSynced };

  } catch (error) {
    console.error('Posts sync error:', error);
    throw error;
  }
}

// Sync Facebook Comments
async function syncComments(pageId?: string) {
  try {
    console.log('Starting comments sync...');
    
    const posts = pageId 
      ? await prisma.facebook_posts.findMany({ 
          where: { facebookPageId: pageId },
          include: { facebook_pages: true }
        })
      : await prisma.facebook_posts.findMany({ 
          include: { facebook_pages: true }
        });

    if (posts.length === 0) {
      return { synced: 0, message: 'No posts found to sync comments' };
    }

    let totalSynced = 0;

    for (const post of posts) {
      if (!post.facebook_pages?.accessToken) continue;

      console.log(`💬 Syncing comments for post: ${post.facebookPostId}`);
      
      // Get ALL comments for the post using pagination
      const allComments = await fetchAllFacebookData(
        `/${post.facebookPostId}/comments?fields=id,from,message,created_time,like_count,can_reply,can_hide,can_like,is_hidden,parent&limit=100`,
        post.facebook_pages.accessToken,
        10 // Max 10 pages of comments per post
      );

      console.log(`💭 Found ${allComments.length} total comments for post ${post.facebookPostId}`);

      const comments = allComments.map((comment: any) => ({
        facebookCommentId: comment.id,
        facebookPostId: post.facebookPostId,
        parentCommentId: comment.parent?.id || null,
        fromId: comment.from?.id || '',
        fromName: comment.from?.name || 'Unknown',
        message: comment.message || '',
        createdTime: comment.created_time ? new Date(comment.created_time) : null,
        likesCount: comment.like_count || 0,
        canReply: comment.can_reply !== false,
        canHide: comment.can_hide === true,
        canLike: comment.can_like !== false,
        isHidden: comment.is_hidden === true,
        updatedAt: new Date()
      }));

      // Bulk insert comments
      await prisma.facebook_comments.createMany({
        data: comments,
        skipDuplicates: true
      });

      // Update existing comments and extract user data
      for (const comment of comments) {
        await prisma.facebook_comments.upsert({
          where: { facebookCommentId: comment.facebookCommentId },
          update: {
            message: comment.message,
            likesCount: comment.likesCount,
            isHidden: comment.isHidden,
            updatedAt: comment.updatedAt
          },
          create: comment
        });

        // Extract user data from comment
        if (comment.fromId && comment.fromName && comment.message) {
          try {
            const userInteraction: UserInteractionData = {
              facebookUserId: comment.fromId,
              facebookUserName: comment.fromName,
              facebookProfileLink: `https://facebook.com/${comment.fromId}`,
              facebookPageId: post.facebookPageId,
              interactionType: 'COMMENT',
              content: comment.message,
              sourceId: comment.facebookCommentId,
              sourceType: 'POST_COMMENT',
              interactionTime: comment.createdTime || new Date()
            };

            await userDataExtractor.processUserInteraction(userInteraction);
          } catch (error) {
            console.error(`Error processing user data for comment ${comment.facebookCommentId}:`, error);
          }
        }
      }

      totalSynced += comments.length;
      console.log(`Synced ${comments.length} comments for post ${post.facebookPostId}`);
    }

    return { synced: totalSynced };

  } catch (error) {
    console.error('Comments sync error:', error);
    throw error;
  }
}

// Sync Facebook Messages
async function syncMessages(pageId?: string) {
  try {
    console.log('Starting messages sync...');
    
    const pages = pageId 
      ? await prisma.facebook_pages.findMany({ where: { facebookPageId: pageId } })
      : await prisma.facebook_pages.findMany();

    if (pages.length === 0) {
      return { synced: 0, message: 'No pages found to sync messages' };
    }

    let totalSynced = 0;

    for (const page of pages) {
      if (!page.accessToken) continue;

      console.log(`💬 Syncing conversations for page: ${page.name || page.facebookPageId}`);
      
      // Get ALL conversations for the page using pagination
      const allConversations = await fetchAllFacebookData(
        `/${page.facebookPageId}/conversations?fields=id,participants,message_count,unread_count,can_reply,snippet,updated_time&limit=100`,
        page.accessToken,
        15 // Max 15 pages of conversations per page
      );

      console.log(`📞 Found ${allConversations.length} total conversations for page ${page.name || page.facebookPageId}`);

      // Sync conversations first
      const conversations = allConversations.map((conv: any) => ({
        facebookConversationId: conv.id,
        facebookPageId: page.facebookPageId,
        participants: conv.participants ? JSON.stringify(conv.participants) : null,
        messageCount: conv.message_count || 0,
        unreadCount: conv.unread_count || 0,
        canReply: conv.can_reply !== false,
        snippet: conv.snippet,
        updatedTime: conv.updated_time ? new Date(conv.updated_time) : null,
        updatedAt: new Date()
      }));

      await prisma.facebook_conversations.createMany({
        data: conversations,
        skipDuplicates: true
      });

      // Sync messages for each conversation
      for (const conv of allConversations) {
        console.log(`💌 Syncing messages for conversation: ${conv.id}`);
        
        const allMessages = await fetchAllFacebookData(
          `/${conv.id}/messages?fields=id,from,message,attachments,created_time,tags&limit=100`,
          page.accessToken,
          5 // Max 5 pages of messages per conversation
        );

        console.log(`📨 Found ${allMessages.length} total messages for conversation ${conv.id}`);

        const messages = allMessages.map((msg: any) => ({
          facebookMessageId: msg.id,
          facebookPageId: page.facebookPageId,
          conversationId: conv.id,
          fromId: msg.from?.id || '',
          fromName: msg.from?.name || 'Unknown',
          message: msg.message,
          attachments: msg.attachments ? JSON.stringify(msg.attachments) : undefined,
          createdTime: msg.created_time ? new Date(msg.created_time) : null,
          tags: msg.tags ? JSON.stringify(msg.tags) : null,
          messageType: msg.attachments?.length > 0 ? 'ATTACHMENT' : 'TEXT',
          isEcho: false,
          isRead: true,
          updatedAt: new Date()
        }));

        await prisma.facebook_messages.createMany({
          data: messages,
          skipDuplicates: true
        });

        // Process each message for user data extraction
        for (const msg of messages) {
          try {
            const userInteraction: UserInteractionData = {
              facebookUserId: msg.fromId,
              facebookUserName: msg.fromName,
              facebookProfileLink: `https://facebook.com/${msg.fromId}`,
              facebookPageId: page.facebookPageId,
              interactionType: 'MESSAGE',
              content: msg.message || '',
              sourceId: msg.facebookMessageId,
              sourceType: 'PRIVATE_MESSAGE',
              interactionTime: msg.createdTime || new Date()
            };

            await userDataExtractor.processUserInteraction(userInteraction);
          } catch (error) {
            console.error(`Error processing user data for message ${msg.facebookMessageId}:`, error);
          }
        }

        totalSynced += messages.length;
      }

      console.log(`Synced messages for page ${page.name}`);
    }

    return { synced: totalSynced };

  } catch (error) {
    console.error('Messages sync error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, pageId } = body;

    console.log(`Starting Facebook sync for type: ${type}, pageId: ${pageId || 'all'}`);

    const credentials = await getFacebookCredentials(pageId);
    let result;

    switch (type) {
      case 'pages':
        result = await syncPages(credentials.accessToken);
        break;
        
      case 'posts':
        result = await syncPosts(pageId);
        break;
        
      case 'comments':
        result = await syncComments(pageId);
        break;
        
      case 'messages':
        result = await syncMessages(pageId);
        break;
        
      case 'full':
        // Full sync - do all types in sequence
        const pagesResult = await syncPages(credentials.accessToken);
        const postsResult = await syncPosts(pageId);
        const commentsResult = await syncComments(pageId);
        const messagesResult = await syncMessages(pageId);
        
        result = {
          pages: pagesResult,
          posts: postsResult,
          comments: commentsResult,
          messages: messagesResult,
          totalSynced: (pagesResult.synced || 0) + (postsResult.synced || 0) + 
                      (commentsResult.synced || 0) + (messagesResult.synced || 0)
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid sync type. Must be one of: pages, posts, comments, messages, full' 
        }, { status: 400 });
    }

    // Update sync status
    await fetch(`${request.url.replace('/sync', '/sync/status')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, status: 'completed' })
    });

    return NextResponse.json({
      success: true,
      type,
      pageId: pageId || 'all',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Facebook sync error:', error);
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      requestBody = {};
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: requestBody?.type || 'unknown'
    }, { status: 500 });
  }
}

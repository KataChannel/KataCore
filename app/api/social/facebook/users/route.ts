import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { userDataExtractor } from '../services/UserDataExtractor';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const type = searchParams.get('type') || 'summary';

    switch (type) {
      case 'summary':
        return await getUserInteractionsSummary(pageId);
      
      case 'analytics':
        return await getUserAnalytics(pageId);
      
      case 'extraction_test':
        return await testDataExtraction(searchParams.get('text') || '');
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error) {
    console.error('User data API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getUserInteractionsSummary(pageId?: string | null) {
  const whereClause = pageId ? { facebookPageId: pageId } : {};

  // Get interactions from existing tables
  const [comments, messages, interactions] = await Promise.all([
    prisma.facebook_comments.findMany({
      where: pageId ? {
        facebook_posts: {
          facebookPageId: pageId
        }
      } : {},
      select: {
        fromId: true,
        fromName: true,
        message: true,
        createdTime: true,
        facebook_posts: {
          select: {
            facebookPageId: true
          }
        }
      }
    }),
    
    prisma.facebook_messages.findMany({
      where: whereClause,
      select: {
        fromId: true,
        fromName: true,
        message: true,
        createdTime: true,
        facebookPageId: true
      }
    }),
    
    prisma.facebook_interactions.findMany({
      where: whereClause,
      select: {
        userId: true,
        userName: true,
        message: true,
        type: true,
        createdAt: true,
        facebookPageId: true
      }
    })
  ]);

  // Analyze user data
  const userStats = analyzeUserData(comments, messages, interactions);

  return NextResponse.json({
    success: true,
    summary: userStats,
    counts: {
      uniqueCommentUsers: new Set(comments.map(c => c.fromId)).size,
      uniqueMessageUsers: new Set(messages.map(m => m.fromId)).size,
      totalComments: comments.length,
      totalMessages: messages.length,
      totalInteractions: interactions.length
    }
  });
}

async function getUserAnalytics(pageId?: string | null) {
  const whereClause = pageId ? { facebookPageId: pageId } : {};

  // Get recent comments and messages for analysis
  const [recentComments, recentMessages] = await Promise.all([
    prisma.facebook_comments.findMany({
      where: pageId ? {
        facebook_posts: {
          facebookPageId: pageId
        }
      } : {},
      orderBy: { createdTime: 'desc' },
      take: 100,
      select: {
        fromId: true,
        fromName: true,
        message: true,
        createdTime: true,
        facebook_posts: {
          select: {
            facebookPageId: true
          }
        }
      }
    }),
    
    prisma.facebook_messages.findMany({
      where: whereClause,
      orderBy: { createdTime: 'desc' },
      take: 100,
      select: {
        fromId: true,
        fromName: true,
        message: true,
        createdTime: true,
        facebookPageId: true
      }
    })
  ]);

  // Extract data from recent interactions
  const extractedData = [];
  
  for (const comment of recentComments) {
    if (comment.message) {
      const data = userDataExtractor.extractAllData(comment.message);
      if (data.confidence > 0.1) {
        extractedData.push({
          userId: comment.fromId,
          userName: comment.fromName,
          source: 'comment',
          pageId: comment.facebook_posts?.facebookPageId,
          extractedData: data,
          content: comment.message,
          timestamp: comment.createdTime
        });
      }
    }
  }

  for (const message of recentMessages) {
    if (message.message) {
      const data = userDataExtractor.extractAllData(message.message);
      if (data.confidence > 0.1) {
        extractedData.push({
          userId: message.fromId,
          userName: message.fromName,
          source: 'message',
          pageId: message.facebookPageId,
          extractedData: data,
          content: message.message,
          timestamp: message.createdTime
        });
      }
    }
  }

  // Aggregate analytics
  const analytics = {
    totalProcessed: extractedData.length,
    phoneExtracted: extractedData.filter(d => d.extractedData.phone).length,
    emailExtracted: extractedData.filter(d => d.extractedData.email).length,
    ageExtracted: extractedData.filter(d => d.extractedData.age).length,
    locationExtracted: extractedData.filter(d => d.extractedData.location).length,
    interestsExtracted: extractedData.filter(d => d.extractedData.interests?.length).length,
    
    averageConfidence: extractedData.length > 0 
      ? extractedData.reduce((sum, d) => sum + d.extractedData.confidence, 0) / extractedData.length 
      : 0,
    
    topInterests: getTopInterests(extractedData),
    topLocations: getTopLocations(extractedData),
    ageDistribution: getAgeDistribution(extractedData),
    
    recentExtractions: extractedData
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 20)
  };

  return NextResponse.json({
    success: true,
    analytics
  });
}

async function testDataExtraction(text: string) {
  if (!text) {
    return NextResponse.json({ 
      error: 'No text provided. Use ?text=your_text_here' 
    }, { status: 400 });
  }

  const extractedData = userDataExtractor.extractAllData(text);
  
  return NextResponse.json({
    success: true,
    inputText: text,
    extractedData,
    details: {
      phone: userDataExtractor.extractPhone(text),
      email: userDataExtractor.extractEmail(text),
      age: userDataExtractor.extractAge(text),
      location: userDataExtractor.extractLocation(text),
      interests: userDataExtractor.extractInterests(text)
    }
  });
}

function analyzeUserData(comments: any[], messages: any[], interactions: any[]) {
  const allUsers = new Map();

  // Process comments
  comments.forEach(comment => {
    const pageId = comment.facebook_posts?.facebookPageId;
    const key = `${comment.fromId}_${pageId}`;
    
    if (!allUsers.has(key)) {
      allUsers.set(key, {
        userId: comment.fromId,
        userName: comment.fromName,
        pageId,
        firstInteraction: comment.createdTime,
        lastInteraction: comment.createdTime,
        totalComments: 0,
        totalMessages: 0,
        interactions: []
      });
    }
    
    const user = allUsers.get(key);
    user.totalComments++;
    user.interactions.push({
      type: 'COMMENT',
      content: comment.message,
      timestamp: comment.createdTime
    });
    
    if (comment.createdTime) {
      if (!user.firstInteraction || comment.createdTime < user.firstInteraction) {
        user.firstInteraction = comment.createdTime;
      }
      if (!user.lastInteraction || comment.createdTime > user.lastInteraction) {
        user.lastInteraction = comment.createdTime;
      }
    }
  });

  // Process messages
  messages.forEach(message => {
    const key = `${message.fromId}_${message.facebookPageId}`;
    
    if (!allUsers.has(key)) {
      allUsers.set(key, {
        userId: message.fromId,
        userName: message.fromName,
        pageId: message.facebookPageId,
        firstInteraction: message.createdTime,
        lastInteraction: message.createdTime,
        totalComments: 0,
        totalMessages: 0,
        interactions: []
      });
    }
    
    const user = allUsers.get(key);
    user.totalMessages++;
    user.interactions.push({
      type: 'MESSAGE',
      content: message.message,
      timestamp: message.createdTime
    });
    
    if (message.createdTime) {
      if (!user.firstInteraction || message.createdTime < user.firstInteraction) {
        user.firstInteraction = message.createdTime;
      }
      if (!user.lastInteraction || message.createdTime > user.lastInteraction) {
        user.lastInteraction = message.createdTime;
      }
    }
  });

  return {
    totalUniqueUsers: allUsers.size,
    users: Array.from(allUsers.values()).slice(0, 50), // Return top 50 users
    topUsers: Array.from(allUsers.values())
      .sort((a, b) => (b.totalComments + b.totalMessages) - (a.totalComments + a.totalMessages))
      .slice(0, 10)
  };
}

function getTopInterests(extractedData: any[]) {
  const interests = new Map();
  
  extractedData.forEach(d => {
    if (d.extractedData.interests) {
      d.extractedData.interests.forEach((interest: string) => {
        interests.set(interest, (interests.get(interest) || 0) + 1);
      });
    }
  });
  
  return Array.from(interests.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([interest, count]) => ({ interest, count }));
}

function getTopLocations(extractedData: any[]) {
  const locations = new Map();
  
  extractedData.forEach(d => {
    if (d.extractedData.location) {
      locations.set(d.extractedData.location, (locations.get(d.extractedData.location) || 0) + 1);
    }
  });
  
  return Array.from(locations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([location, count]) => ({ location, count }));
}

function getAgeDistribution(extractedData: any[]) {
  const ages = extractedData
    .filter(d => d.extractedData.age)
    .map(d => d.extractedData.age);
  
  const distribution = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '56+': 0
  };
  
  ages.forEach(age => {
    if (age <= 25) distribution['18-25']++;
    else if (age <= 35) distribution['26-35']++;
    else if (age <= 45) distribution['36-45']++;
    else if (age <= 55) distribution['46-55']++;
    else distribution['56+']++;
  });
  
  return distribution;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'bulk_extract':
        return await bulkExtractUserData(data);
      
      case 'reprocess':
        return await reprocessExistingData(data.pageId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('User data POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function bulkExtractUserData(interactions: any[]) {
  const results = [];
  
  for (const interaction of interactions) {
    try {
      const extractedData = userDataExtractor.extractAllData(interaction.content || '');
      
      results.push({
        userId: interaction.userId,
        userName: interaction.userName,
        extractedData,
        originalContent: interaction.content
      });
      
    } catch (error) {
      console.error(`Error extracting data for user ${interaction.userId}:`, error);
    }
  }
  
  return NextResponse.json({
    success: true,
    processed: results.length,
    results
  });
}

async function reprocessExistingData(pageId?: string) {
  // Reprocess existing comments and messages for user data extraction
  const whereClause = pageId ? { facebookPageId: pageId } : {};
  
  const comments = await prisma.facebook_comments.findMany({
    where: pageId ? {
      facebook_posts: {
        facebookPageId: pageId
      }
    } : {},
    include: {
      facebook_posts: {
        select: {
          facebookPageId: true
        }
      }
    }
  });

  const messages = await prisma.facebook_messages.findMany({
    where: whereClause
  });

  let processed = 0;

  // Process comments
  for (const comment of comments) {
    try {
      if (comment.fromId && comment.fromName && comment.message) {
        const userInteraction = {
          facebookUserId: comment.fromId,
          facebookUserName: comment.fromName,
          facebookProfileLink: `https://facebook.com/${comment.fromId}`,
          facebookPageId: comment.facebook_posts?.facebookPageId || '',
          interactionType: 'COMMENT' as const,
          content: comment.message,
          sourceId: comment.facebookCommentId,
          sourceType: 'POST_COMMENT',
          interactionTime: comment.createdTime || new Date()
        };

        await userDataExtractor.processUserInteraction(userInteraction);
        processed++;
      }
    } catch (error) {
      console.error(`Error reprocessing comment ${comment.id}:`, error);
    }
  }

  // Process messages
  for (const message of messages) {
    try {
      if (message.fromId && message.fromName) {
        const userInteraction = {
          facebookUserId: message.fromId,
          facebookUserName: message.fromName,
          facebookProfileLink: `https://facebook.com/${message.fromId}`,
          facebookPageId: message.facebookPageId,
          interactionType: 'MESSAGE' as const,
          content: message.message || '',
          sourceId: message.facebookMessageId,
          sourceType: 'PRIVATE_MESSAGE',
          interactionTime: message.createdTime || new Date()
        };

        await userDataExtractor.processUserInteraction(userInteraction);
        processed++;
      }
    } catch (error) {
      console.error(`Error reprocessing message ${message.id}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    commentsProcessed: comments.length,
    messagesProcessed: messages.length
  });
}

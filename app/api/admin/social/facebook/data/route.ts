import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserDataSummary {
  pageId: string;
  pageName: string;
  userId: string;
  userName: string;
  userLink: string;
  phone?: string;
  firstTime: Date;
  lastTime: Date;
  totalInteractions: number;
  commentCount: number;
  messageCount: number;
}

// GET handler for data retrieval
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const type = searchParams.get('type') || 'summary';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter');
    const isExport = searchParams.get('export') === 'true';

    switch (type) {
      case 'summary':
        return await getUserDataSummary(pageId, limit, offset, search, filter, isExport);
      case 'pages':
        return await getPagesData();
      case 'interactions':
        return await getInteractionsData(pageId, limit, offset);
      case 'stats':
        return await getStatsData(pageId);
      default:
        return NextResponse.json({
          success: false,
          error: `Invalid type: ${type}`,
          validTypes: ['summary', 'pages', 'interactions', 'stats']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserDataSummary(
  pageId?: string | null, 
  limit: number = 100, 
  offset: number = 0,
  search?: string | null,
  filter?: string | null,
  isExport: boolean = false
) {
  // Get user interactions from comments and messages
  const [comments, messages, pages] = await Promise.all([
    prisma.facebook_comments.findMany({
      where: pageId ? {
        facebook_posts: {
          facebookPageId: pageId
        }
      } : undefined,
      include: {
        facebook_posts: {
          include: {
            facebook_pages: true
          }
        }
      },
      orderBy: { createdTime: 'desc' }
    }),
    prisma.facebook_messages.findMany({
      where: pageId ? { facebookPageId: pageId } : undefined,
      include: {
        facebook_pages: true
      },
      orderBy: { createdTime: 'desc' }
    }),
    prisma.facebook_pages.findMany({
      where: pageId ? { facebookPageId: pageId } : undefined
    })
  ]);

  // Process and aggregate user data
  const userMap = new Map<string, UserDataSummary>();

  // Process comments
  comments.forEach(comment => {
    if (!comment.facebook_posts?.facebook_pages) return;
    
    const key = `${comment.facebook_posts.facebook_pages.facebookPageId}-${comment.fromId}`;
    const page = comment.facebook_posts.facebook_pages;
    
    if (!userMap.has(key)) {
      userMap.set(key, {
        pageId: page.facebookPageId,
        pageName: page.name,
        userId: comment.fromId,
        userName: comment.fromName,
        userLink: `https://facebook.com/${comment.fromId}`,
        firstTime: comment.createdTime || comment.createdAt,
        lastTime: comment.createdTime || comment.createdAt,
        totalInteractions: 0,
        commentCount: 0,
        messageCount: 0
      });
    }

    const userData = userMap.get(key)!;
    userData.commentCount++;
    userData.totalInteractions++;
    
    const commentTime = comment.createdTime || comment.createdAt;
    if (commentTime < userData.firstTime) userData.firstTime = commentTime;
    if (commentTime > userData.lastTime) userData.lastTime = commentTime;

    // Extract phone number from comment message
    if (comment.message && !userData.phone) {
      const phoneMatch = comment.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
      if (phoneMatch) {
        let phone = phoneMatch[0];
        if (phone.startsWith('84') && !phone.startsWith('+84')) {
          phone = '+' + phone;
        } else if (phone.startsWith('0')) {
          phone = '+84' + phone.substring(1);
        }
        userData.phone = phone;
      }
    }
  });

  // Process messages
  messages.forEach(message => {
    if (!message.facebook_pages) return;
    
    const key = `${message.facebook_pages.facebookPageId}-${message.fromId}`;
    const page = message.facebook_pages;
    
    if (!userMap.has(key)) {
      userMap.set(key, {
        pageId: page.facebookPageId,
        pageName: page.name,
        userId: message.fromId,
        userName: message.fromName,
        userLink: `https://facebook.com/${message.fromId}`,
        firstTime: message.createdTime || message.createdAt,
        lastTime: message.createdTime || message.createdAt,
        totalInteractions: 0,
        commentCount: 0,
        messageCount: 0
      });
    }

    const userData = userMap.get(key)!;
    userData.messageCount++;
    userData.totalInteractions++;
    
    const messageTime = message.createdTime || message.createdAt;
    if (messageTime < userData.firstTime) userData.firstTime = messageTime;
    if (messageTime > userData.lastTime) userData.lastTime = messageTime;

    // Extract phone number from message
    if (message.message && !userData.phone) {
      const phoneMatch = message.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
      if (phoneMatch) {
        let phone = phoneMatch[0];
        if (phone.startsWith('84') && !phone.startsWith('+84')) {
          phone = '+' + phone;
        } else if (phone.startsWith('0')) {
          phone = '+84' + phone.substring(1);
        }
        userData.phone = phone;
      }
    }
  });

  // Convert to array and sort by last interaction
  let userData = Array.from(userMap.values())
    .sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime());

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    userData = userData.filter(user => 
      user.userName.toLowerCase().includes(searchLower) ||
      user.pageName.toLowerCase().includes(searchLower) ||
      user.userId.includes(search) ||
      user.phone?.includes(search)
    );
  }

  // Apply type filter
  if (filter && filter !== 'all') {
    userData = userData.filter(user => {
      switch (filter) {
        case 'phone':
          return !!user.phone;
        case 'no-phone':
          return !user.phone;
        case 'comment':
          return user.commentCount > 0;
        case 'message':
          return user.messageCount > 0;
        default:
          return true;
      }
    });
  }

  if (isExport) {
    // Generate CSV
    const csvHeaders = [
      'Tên Fanpage',
      'ID Fanpage', 
      'Họ tên User',
      'ID User',
      'Link Facebook User',
      'Phone User',
      'FirstTime',
      'LastTime',
      'Total Interactions',
      'Comment Count',
      'Message Count'
    ];
    
    const csvRows = userData.map(user => [
      user.pageName,
      user.pageId,
      user.userName,
      user.userId,
      user.userLink,
      user.phone || '',
      user.firstTime.toISOString(),
      user.lastTime.toISOString(),
      user.totalInteractions.toString(),
      user.commentCount.toString(),
      user.messageCount.toString()
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="facebook-user-data-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  }

  // Apply pagination
  const paginatedData = userData.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    userData: paginatedData,
    total: userData.length,
    limit,
    offset,
    pages: pages.map(p => ({
      facebookPageId: p.facebookPageId,
      name: p.name,
      fanCount: p.fanCount,
      followersCount: p.followersCount
    }))
  });
}

async function getPagesData() {
  const pages = await prisma.facebook_pages.findMany({
    select: {
      id: true,
      facebookPageId: true,
      name: true,
      category: true,
      fanCount: true,
      followersCount: true,
      link: true,
      _count: {
        select: {
          facebook_posts: true,
          facebook_messages: true,
          facebook_interactions: true
        }
      }
    },
    orderBy: { fanCount: 'desc' }
  });

  return NextResponse.json({
    success: true,
    data: pages
  });
}

async function getInteractionsData(pageId?: string | null, limit: number = 100, offset: number = 0) {
  const interactions = await prisma.facebook_interactions.findMany({
    where: pageId ? { facebookPageId: pageId } : undefined,
    include: {
      facebook_pages: {
        select: { name: true, facebookPageId: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  const total = await prisma.facebook_interactions.count({
    where: pageId ? { facebookPageId: pageId } : undefined
  });

  return NextResponse.json({
    success: true,
    data: interactions,
    total,
    limit,
    offset
  });
}

async function getStatsData(pageId?: string | null) {
  const whereClause = pageId ? { facebookPageId: pageId } : undefined;
  const pageWhereClause = pageId ? { facebookPageId: pageId } : undefined;

  const [
    totalPages,
    totalPosts,
    totalComments,
    totalMessages,
    totalConversations,
    totalInteractions,
    recentActivity
  ] = await Promise.all([
    prisma.facebook_pages.count({ where: pageWhereClause }),
    prisma.facebook_posts.count({
      where: pageId ? { facebookPageId: pageId } : undefined
    }),
    prisma.facebook_comments.count({
      where: pageId ? {
        facebook_posts: { facebookPageId: pageId }
      } : undefined
    }),
    prisma.facebook_messages.count({ where: whereClause }),
    prisma.facebook_conversations.count({
      where: pageId ? { facebookPageId: pageId } : undefined
    }),
    prisma.facebook_interactions.count({ where: whereClause }),
    prisma.facebook_interactions.findMany({
      where: whereClause,
      include: {
        facebook_pages: {
          select: { name: true, facebookPageId: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      totalPages,
      totalPosts,
      totalComments,
      totalMessages,
      totalConversations,
      totalInteractions
    },
    recentActivity
  });
}

// POST handler for data operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'extract_user_data':
        return await extractUserDataFromExisting(data);
      case 'update_user_info':
        return await updateUserInfo(data);
      default:
        return NextResponse.json({
          success: false,
          error: `Invalid action: ${action}`,
          validActions: ['extract_user_data', 'update_user_info']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Data POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function extractUserDataFromExisting(data: any) {
  // Re-process existing comments and messages to extract user data
  const { pageId } = data;
  
  const comments = await prisma.facebook_comments.findMany({
    where: pageId ? {
      facebook_posts: { facebookPageId: pageId }
    } : undefined,
    include: {
      facebook_posts: {
        include: { facebook_pages: true }
      }
    }
  });

  const messages = await prisma.facebook_messages.findMany({
    where: pageId ? { facebookPageId: pageId } : undefined,
    include: { facebook_pages: true }
  });

  let processed = 0;
  let extracted = 0;

  // Process comments
  for (const comment of comments) {
    if (comment.message && comment.facebook_posts?.facebook_pages) {
      processed++;
      
      // Extract phone numbers, emails, etc.
      const phoneMatch = comment.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
      const emailMatch = comment.message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (phoneMatch || emailMatch) {
        extracted++;
        
        // Store extracted data in interaction record
        await prisma.facebook_interactions.upsert({
          where: {
            facebookInteractionId: `comment-${comment.facebookCommentId}`
          },
          update: {
            message: comment.message,
            updatedAt: new Date()
          },
          create: {
            facebookInteractionId: `comment-${comment.facebookCommentId}`,
            facebookPageId: comment.facebook_posts.facebook_pages.facebookPageId,
            type: 'COMMENT',
            userName: comment.fromName,
            userId: comment.fromId,
            message: comment.message,
            createdAt: comment.createdTime || comment.createdAt
          }
        });
      }
    }
  }

  // Process messages
  for (const message of messages) {
    if (message.message && message.facebook_pages) {
      processed++;
      
      const phoneMatch = message.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
      const emailMatch = message.message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (phoneMatch || emailMatch) {
        extracted++;
        
        await prisma.facebook_interactions.upsert({
          where: {
            facebookInteractionId: `message-${message.facebookMessageId}`
          },
          update: {
            message: message.message,
            updatedAt: new Date()
          },
          create: {
            facebookInteractionId: `message-${message.facebookMessageId}`,
            facebookPageId: message.facebook_pages.facebookPageId,
            type: 'MESSAGE',
            userName: message.fromName,
            userId: message.fromId,
            message: message.message,
            createdAt: message.createdTime || message.createdAt
          }
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    extracted,
    message: `Processed ${processed} items, extracted data from ${extracted} interactions`
  });
}

async function updateUserInfo(data: any) {
  const { interactionId, phone, notes } = data;
  
  await prisma.facebook_interactions.update({
    where: { id: interactionId },
    data: {
      message: notes ? `${data.originalMessage || ''}\n[PHONE: ${phone}]\n[NOTES: ${notes}]` : `${data.originalMessage || ''}\n[PHONE: ${phone}]`,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({
    success: true,
    message: 'User information updated successfully'
  });
}

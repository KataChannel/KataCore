import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const userId = searchParams.get('userId');
    const includeProfile = searchParams.get('includeProfile') === 'true';
    const format = searchParams.get('format') || 'json';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`🔍 Fetching user interactions - pageId: ${pageId}, limit: ${limit}, offset: ${offset}`);

    // Build where clause for interactions
    const whereClause: any = {};
    if (pageId) whereClause.facebookPageId = pageId;
    if (userId) whereClause.userId = userId;

    // Get user interactions from database and group by user
    const interactions = await prisma.facebook_interactions.findMany({
      where: whereClause,
      include: {
        facebook_pages: {
          select: {
            name: true,
            facebookPageId: true,
            accessToken: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit * 10, // Get more records to ensure we can group by unique users
      skip: offset
    });

    console.log(`📊 Found ${interactions.length} user interactions`);

    // Group interactions by user
    const userMap = new Map();
    
    for (const interaction of interactions) {
      const userKey = `${interaction.userId}_${interaction.facebookPageId}`;
      
      if (!userMap.has(userKey)) {
        // Extract phone number from message if exists
        const phoneMatch = interaction.message?.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/) || null;
        
        userMap.set(userKey, {
          userId: interaction.userId,
          fullName: interaction.userName,
          phoneNumber: phoneMatch ? phoneMatch[0] : 'N/A',
          facebookLink: `https://facebook.com/${interaction.userId}`,
          fanpage: interaction.facebook_pages?.name,
          facebookPageId: interaction.facebookPageId,
          totalInteractions: 1,
          firstInteractionDate: interaction.createdAt,
          lastInteractionDate: interaction.createdAt,
          interactionType: interaction.type,
          latestMessage: interaction.message || '',
          accessToken: interaction.facebook_pages?.accessToken
        });
      } else {
        // Update existing user data
        const userData = userMap.get(userKey);
        userData.totalInteractions++;
        
        if (interaction.createdAt < userData.firstInteractionDate) {
          userData.firstInteractionDate = interaction.createdAt;
        }
        if (interaction.createdAt > userData.lastInteractionDate) {
          userData.lastInteractionDate = interaction.createdAt;
          userData.latestMessage = interaction.message || '';
          userData.interactionType = interaction.type;
        }
        
        // Update phone if found and not already set
        if (userData.phoneNumber === 'N/A' && interaction.message) {
          const phoneMatch = interaction.message.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
          if (phoneMatch) {
            userData.phoneNumber = phoneMatch[0];
          }
        }
      }
    }

    // Convert map to array and apply pagination
    const allUsers = Array.from(userMap.values());
    const userInteractions = allUsers.slice(0, limit);

    console.log(`👥 Found ${allUsers.length} unique users, returning ${userInteractions.length}`);

    for (const userInfo of userInteractions) {

      // If includeProfile=true, fetch additional Facebook profile info
      if (includeProfile && userInfo.accessToken) {
        try {
          console.log(`🔍 Fetching profile for user ${userInfo.userId}`);
          
          const profileResponse = await fetch(
            `https://graph.facebook.com/v23.0/${userInfo.userId}?access_token=${userInfo.accessToken}&fields=id,name,email,picture,location,hometown,work,education,relationship_status,birthday,about,age_range,locale,updated_time`
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            userInfo.facebookProfile = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              picture: profileData.picture?.data?.url,
              location: profileData.location?.name,
              hometown: profileData.hometown?.name,
              work: profileData.work,
              education: profileData.education,
              relationshipStatus: profileData.relationship_status,
              birthday: profileData.birthday,
              about: profileData.about,
              ageRange: profileData.age_range ? `${profileData.age_range.min}-${profileData.age_range.max || 'unknown'}` : null,
              locale: profileData.locale,
              lastUpdated: profileData.updated_time
            };
          }
        } catch (error) {
          console.error(`Failed to fetch profile for user ${userInfo.userId}:`, error);
          userInfo.profileError = 'Failed to fetch profile data';
        }
      }
      
      // Remove sensitive access token
      delete userInfo.accessToken;
    }

    // Get additional interaction details
    const enrichedData = [];
    for (const user of userInteractions) {
      // Get comments by this user  
      const comments = await prisma.facebook_comments.findMany({
        where: {
          fromId: user.userId,
          facebook_posts: pageId ? { facebookPageId: pageId } : undefined
        },
        include: {
          facebook_posts: {
            select: {
              facebookPageId: true,
              message: true
            }
          }
        },
        orderBy: {
          createdTime: 'desc'
        },
        take: 5
      });

      // Get messages by this user
      const messages = await prisma.facebook_messages.findMany({
        where: {
          fromId: user.userId,
          ...(user.facebookPageId && { facebookPageId: user.facebookPageId })
        },
        select: {
          message: true,
          createdTime: true,
          attachments: true,
          conversationId: true
        },
        orderBy: {
          createdTime: 'desc'
        },
        take: 5
      });

      enrichedData.push({
        ...user,
        recentComments: comments,
        recentMessages: messages,
        stats: {
          totalComments: comments.length,
          totalMessages: messages.length,
          avgCommentsPerPost: comments.length > 0 ? comments.length / new Set(comments.map(c => c.facebookPostId)).size : 0
        }
      });
    }

    // Format response based on requested format
    if (format === 'csv') {
      const csvData = enrichedData.map(user => ({
        'User ID': user.userId,
        'Full Name': user.fullName,
        'Phone Number': user.phoneNumber || 'N/A',
        'Facebook Link': user.facebookLink || 'N/A',
        'Fanpage': user.fanpage,
        'Total Interactions': user.totalInteractions,
        'First Interaction': user.firstInteractionDate,
        'Last Interaction': user.lastInteractionDate,
        'Interaction Type': user.interactionType,
        'Recent Comments': user.stats.totalComments,
        'Recent Messages': user.stats.totalMessages,
        'Profile Email': user.facebookProfile?.email || 'N/A',
        'Profile Location': user.facebookProfile?.location || 'N/A'
      }));

      return new NextResponse(convertToCSV(csvData), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="facebook-user-interactions-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: enrichedData,
      pagination: {
        total: enrichedData.length,
        limit,
        offset,
        hasMore: enrichedData.length === limit
      },
      extractedAt: new Date(),
      pageInfo: pageId ? {
        pageId,
        totalUsers: enrichedData.length
      } : null
    });

  } catch (error: any) {
    console.error('Error fetching user interactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user interactions',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Utility function to convert JSON to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

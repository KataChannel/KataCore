import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/social/facebook/user-profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pageId = searchParams.get('pageId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId parameter'
      }, { status: 400 });
    }

    console.log(`🔍 Fetching profile for user ${userId} on page ${pageId}`);

    // Get user interactions and page access token
    const userInteraction = await prisma.facebook_interactions.findFirst({
      where: {
        userId: userId,
        ...(pageId && { facebookPageId: pageId })
      },
      include: {
        facebook_pages: {
          select: {
            name: true,
            accessToken: true
          }
        }
      }
    });

    if (!userInteraction) {
      return NextResponse.json({
        success: false,
        error: 'User interaction not found'
      }, { status: 404 });
    }

    const response: any = {
      success: true,
      user: {
        userId: userInteraction.userId,
        userName: userInteraction.userName,
        facebookLink: `https://facebook.com/${userInteraction.userId}`,
        fanpage: userInteraction.facebook_pages?.name,
        facebookPageId: userInteraction.facebookPageId,
        lastMessage: userInteraction.message,
        lastInteractionDate: userInteraction.updatedAt
      }
    };

    // Try to fetch Facebook profile data if access token is available
    if (userInteraction.facebook_pages?.accessToken) {
      try {
        console.log(`📡 Fetching Facebook profile for ${userId}`);
        
        const profileResponse = await fetch(
          `https://graph.facebook.com/v23.0/${userId}?access_token=${userInteraction.facebook_pages.accessToken}&fields=id,name,email,picture,location,hometown,work,education,relationship_status,birthday,gender,about,phone,locale,timezone,updated_time`
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          response.user.facebookProfile = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email || null,
            picture: profileData.picture?.data?.url || null,
            location: profileData.location?.name || null,
            hometown: profileData.hometown?.name || null,
            work: profileData.work ? profileData.work.map((w: any) => ({
              employer: w.employer?.name,
              position: w.position?.name,
              startDate: w.start_date,
              endDate: w.end_date
            })) : [],
            education: profileData.education ? profileData.education.map((e: any) => ({
              school: e.school?.name,
              type: e.type,
              year: e.year?.name
            })) : [],
            relationshipStatus: profileData.relationship_status || null,
            birthday: profileData.birthday || null,
            gender: profileData.gender || null,
            about: profileData.about || null,
            phone: profileData.phone || null,
            locale: profileData.locale || null,
            timezone: profileData.timezone || null,
            lastUpdated: profileData.updated_time || null
          };
          
          console.log(`✅ Facebook profile fetched successfully for ${profileData.name}`);
        } else {
          const errorData = await profileResponse.json();
          console.warn(`⚠️ Failed to fetch Facebook profile: ${errorData.error?.message || 'Unknown error'}`);
          response.user.profileError = errorData.error?.message || 'Failed to fetch profile';
        }
      } catch (error) {
        console.error(`❌ Error fetching Facebook profile:`, error);
        response.user.profileError = 'Network error while fetching profile';
      }
    } else {
      response.user.profileError = 'No access token available for this page';
    }

    // Get interaction history
    const interactionHistory = await prisma.facebook_interactions.findMany({
      where: {
        userId: userId,
        ...(pageId && { facebookPageId: pageId })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      select: {
        type: true,
        message: true,
        createdAt: true,
        updatedAt: true
      }
    });

    response.user.interactionHistory = interactionHistory;

    // Get comments history if exists  
    const commentsHistory = await prisma.facebook_comments.findMany({
      where: {
        fromId: userId,
        facebook_posts: pageId ? { facebookPageId: pageId } : undefined
      },
      include: {
        facebook_posts: {
          select: {
            facebookPageId: true,
            message: true,
            facebookPostId: true
          }
        }
      },
      orderBy: {
        createdTime: 'desc'
      },
      take: 10
    });

    response.user.commentsHistory = commentsHistory.map(comment => ({
      message: comment.message,
      createdTime: comment.createdTime,
      likesCount: comment.likesCount,
      postId: comment.facebookPostId,
      postMessage: comment.facebook_posts?.message?.substring(0, 100) + '...' || 'N/A'
    }));

    // Get messages history
    const messagesHistory = await prisma.facebook_messages.findMany({
      where: {
        fromId: userId,
        ...(pageId && { facebookPageId: pageId })
      },
      orderBy: {
        createdTime: 'desc'
      },
      take: 10,
      select: {
        message: true,
        createdTime: true,
        messageType: true,
        attachments: true
      }
    });

    response.user.messagesHistory = messagesHistory;

    // Calculate interaction stats
    const totalInteractions = await prisma.facebook_interactions.count({
      where: {
        userId: userId,
        ...(pageId && { facebookPageId: pageId })
      }
    });

    const totalComments = await prisma.facebook_comments.count({
      where: {
        fromId: userId,
        facebook_posts: pageId ? { facebookPageId: pageId } : undefined
      }
    });

    const totalMessages = await prisma.facebook_messages.count({
      where: {
        fromId: userId,
        ...(pageId && { facebookPageId: pageId })
      }
    });

    response.user.stats = {
      totalInteractions,
      totalComments,
      totalMessages,
      totalActivities: totalInteractions + totalComments + totalMessages
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error while fetching user profile'
    }, { status: 500 });
  }
}

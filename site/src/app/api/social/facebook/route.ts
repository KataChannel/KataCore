import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FACEBOOK_PAGE_ID = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v18.0';

// Helper function to get page access token
async function getPageAccessToken(pageId: string): Promise<string | null> {
  try {
    const page = await prisma.facebook_pages.findUnique({
      where: { facebookPageId: pageId },
    });
    return page?.accessToken || FACEBOOK_ACCESS_TOKEN || null;
  } catch (error) {
    console.error('Error getting page access token:', error);
    return FACEBOOK_ACCESS_TOKEN || null;
  }
}

// Helper function to extract phone from text
function extractPhoneFromText(text: string): string | null {
  const phoneRegex = /(?:\+84|84|0)[0-9]{9,10}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0].replace(/^(84|\+84)/, '0') : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pageId = searchParams.get('pageId');
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Check if credentials are configured
    const hasCredentials = FACEBOOK_PAGE_ID && FACEBOOK_ACCESS_TOKEN;

    // console.log(FACEBOOK_ACCESS_TOKEN, FACEBOOK_PAGE_ID, FACEBOOK_API_VERSION);
    
    if (!hasCredentials && type !== 'interactions') {
      console.log('Facebook credentials not configured');
      return NextResponse.json({
        data: [],
        message: 'Facebook API credentials not configured. No data available.',
        status: 'no_credentials',
      });
    }

    // 1. List fanpages
    if (type === 'pages' || type === 'fanpages') {
      try {
        const response = await fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts?` +
            new URLSearchParams({
              fields: 'id,name,access_token,category,category_list,fan_count,followers_count,link,picture,about,phone,emails,website',
              access_token: FACEBOOK_ACCESS_TOKEN!,
            })
        );

        if (!response.ok) {
          console.log(`Facebook API error: ${response.status}`);
          return NextResponse.json({
            data: [],
            message: 'Unable to fetch pages from Facebook. No information available.',
            status: 'api_error',
            error_code: response.status,
          });
        }

        const data = await response.json();
        
        // Store pages in database
        if (data.data) {
          for (const page of data.data) {
            await prisma.facebook_pages.upsert({
              where: { facebookPageId: page.id },
              update: {
                name: page.name,
                category: page.category,
                fanCount: page.fan_count || 0,
                followersCount: page.followers_count || 0,
                link: page.link,
                about: page.about,
                phone: page.phone,
                website: page.website,
                accessToken: page.access_token,
                updatedAt: new Date(),
              },
              create: {
                facebookPageId: page.id,
                name: page.name,
                category: page.category,
                fanCount: page.fan_count || 0,
                followersCount: page.followers_count || 0,
                link: page.link,
                about: page.about,
                phone: page.phone,
                website: page.website,
                accessToken: page.access_token,
                updatedAt: new Date(),
              },
            });
          }
        }

        console.log('Fetched pages from Facebook API:', data);
        return NextResponse.json(data);
      } catch (error) {
        console.log('Facebook API error:', error);
        return NextResponse.json({
          data: [],
          message: 'Failed to connect to Facebook API. No pages information available.',
          status: 'connection_error',
        });
      }
    }

    // 2. List comments for specific fanpage
    if (type === 'comments') {
      if (!pageId && !postId) {
        return NextResponse.json({ error: 'pageId or postId is required for comments' }, { status: 400 });
      }

      try {
        const accessToken = await getPageAccessToken(pageId || '');
        let url: string;
        
        if (postId) {
          // Get comments for a specific post
          url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}/comments?` +
            new URLSearchParams({
              fields: 'id,from,message,created_time,likes.summary(true),attachment,parent',
              access_token: accessToken!,
              limit: limit.toString(),
            });
        } else {
          // Get all comments for all posts on a page
          url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/feed?` +
            new URLSearchParams({
              fields: 'id,comments{id,from,message,created_time,likes.summary(true),attachment,parent}',
              access_token: accessToken!,
              limit: limit.toString(),
            });
        }

        const response = await fetch(url);

        if (!response.ok) {
          console.log(`Facebook API error: ${response.status}`);
          return NextResponse.json({
            data: [],
            message: 'Unable to fetch comments from Facebook. No information available.',
            status: 'api_error',
            error_code: response.status,
          });
        }

        const data = await response.json();
        
        // Store interactions in database
        if (data.data) {
          const comments = postId ? data.data : data.data.flatMap((post: any) => post.comments?.data || []);
          
          for (const comment of comments) {
            if (comment.from) {
              const phone = extractPhoneFromText(comment.message || '');
              
              await prisma.facebook_interactions.upsert({
                where: { facebookInteractionId: comment.id },
                update: {
                  message: comment.message,
                  updatedAt: new Date(),
                },
                create: {
                  facebookInteractionId: comment.id,
                  facebookPageId: pageId || FACEBOOK_PAGE_ID!,
                  type: 'COMMENT',
                  userName: comment.from.name,
                  userId: comment.from.id,
                  message: comment.message,
                  createdAt: new Date(comment.created_time),
                  updatedAt: new Date(),
                },
              });
            }
          }
        }

        console.log('Fetched comments from Facebook API:', data);
        return NextResponse.json(data);
      } catch (error) {
        console.log('Facebook API error:', error);
        return NextResponse.json({
          data: [],
          message: 'Failed to connect to Facebook API. No comments information available.',
          status: 'connection_error',
        });
      }
    }

    // 3. List messages for specific fanpage
    if (type === 'messages') {
      if (!pageId) {
        return NextResponse.json({ error: 'pageId is required for messages' }, { status: 400 });
      }

      try {
        const accessToken = await getPageAccessToken(pageId);
        
        const response = await fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/conversations?` +
            new URLSearchParams({
              fields: 'id,participants,messages{id,from,message,created_time}',
              access_token: accessToken!,
              limit: limit.toString(),
            })
        );

        if (!response.ok) {
          console.log(`Facebook API error: ${response.status}`);
          return NextResponse.json({
            data: [],
            message: 'Unable to fetch messages from Facebook. No information available.',
            status: 'api_error',
            error_code: response.status,
          });
        }

        const data = await response.json();
        
        // Store message interactions in database
        if (data.data) {
          for (const conversation of data.data) {
            if (conversation.messages?.data) {
              for (const message of conversation.messages.data) {
                if (message.from && message.from.id !== pageId) {
                  const phone = extractPhoneFromText(message.message || '');
                  
                  await prisma.facebook_interactions.upsert({
                    where: { facebookInteractionId: message.id },
                    update: {
                      message: message.message,
                      updatedAt: new Date(),
                    },
                    create: {
                      facebookInteractionId: message.id,
                      facebookPageId: pageId,
                      type: 'MESSAGE',
                      userName: message.from.name,
                      userId: message.from.id,
                      message: message.message,
                      createdAt: new Date(message.created_time),
                      updatedAt: new Date(),
                    },
                  });
                }
              }
            }
          }
        }

        console.log('Fetched messages from Facebook API:', data);
        return NextResponse.json(data);
      } catch (error) {
        console.log('Facebook API error:', error);
        return NextResponse.json({
          data: [],
          message: 'Failed to connect to Facebook API. No messages information available.',
          status: 'connection_error',
        });
      }
    }

    // 4. Get comprehensive data table with pagination and search
    if (type === 'interactions') {
      try {
        const skip = (page - 1) * limit;
        
        const where: any = {};
        if (search) {
          where.OR = [
            { userName: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ];
        }
        if (pageId) {
          where.facebookPageId = pageId;
        }

        const [interactions, total] = await Promise.all([
          prisma.facebook_interactions.findMany({
            where,
            include: {
              facebook_pages: {
                select: {
                  name: true,
                  phone: true,
                  link: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.facebook_interactions.count({ where }),
        ]);

        // Group interactions by user to get first and last interaction dates
        const userInteractions: Record<string, any> = {};
        
        for (const interaction of interactions) {
          const key = `${interaction.userId}_${interaction.facebookPageId}`;
          if (!userInteractions[key]) {
            userInteractions[key] = {
              fanpage: interaction.facebook_pages?.name || 'Unknown Page',
              fullName: interaction.userName,
              phoneNumber: extractPhoneFromText(interaction.message || '') || 'N/A',
              facebookLink: `https://www.facebook.com/profile.php?id=${interaction.userId}`,
              firstInteractionDate: interaction.createdAt,
              lastInteractionDate: interaction.createdAt,
              totalInteractions: 1,
              latestMessage: interaction.message,
              interactionType: interaction.type,
            };
          } else {
            userInteractions[key].totalInteractions++;
            if (interaction.createdAt < userInteractions[key].firstInteractionDate) {
              userInteractions[key].firstInteractionDate = interaction.createdAt;
            }
            if (interaction.createdAt > userInteractions[key].lastInteractionDate) {
              userInteractions[key].lastInteractionDate = interaction.createdAt;
              userInteractions[key].latestMessage = interaction.message;
              userInteractions[key].interactionType = interaction.type;
            }
            // Update phone number if found in newer messages
            const phone = extractPhoneFromText(interaction.message || '');
            if (phone && userInteractions[key].phoneNumber === 'N/A') {
              userInteractions[key].phoneNumber = phone;
            }
          }
        }

        const tableData = Object.values(userInteractions);

        return NextResponse.json({
          data: tableData,
          pagination: {
            current: page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          status: 'success',
        });
      } catch (error) {
        console.log('Database error:', error);
        return NextResponse.json({
          data: [],
          message: 'Failed to fetch interaction data from database.',
          status: 'database_error',
        });
      }
    }

    // Original posts endpoint (keeping for backward compatibility)
    if (type === 'posts') {
      try {
        const response = await fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PAGE_ID}/posts?` +
            new URLSearchParams({
              fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
              access_token: FACEBOOK_ACCESS_TOKEN!,
            })
        );

        if (!response.ok) {
          console.log(`Facebook API error: ${response.status}`);
          return NextResponse.json({
            data: [],
            message: 'Unable to fetch posts from Facebook. No information available.',
            status: 'api_error',
            error_code: response.status,
          });
        }

        const data = await response.json();
        console.log('Fetched posts from Facebook API:', data);
        return NextResponse.json(data);
      } catch (error) {
        console.log('Facebook API error:', error);
        return NextResponse.json({
          data: [],
          message: 'Failed to connect to Facebook API. No posts information available.',
          status: 'connection_error',
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use: pages, comments, messages, interactions, or posts' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Facebook API Error:', error);
    return NextResponse.json({
      data: [],
      message: 'Facebook API service unavailable. No information available at this time.',
      status: 'service_unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

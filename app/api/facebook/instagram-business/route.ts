import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Instagram Basic Display API Integration  
class InstagramBusinessService {
  private baseUrl = 'https://graph.facebook.com/v23.0';
  
  async makeApiRequest(endpoint: string, params: any = {}) {
    const { access_token, method = 'GET', ...otherParams } = params;
    
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (method === 'GET') {
      Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      url.searchParams.append('access_token', access_token);
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST') {
      requestInit.body = JSON.stringify({
        access_token,
        ...otherParams
      });
    }

    const response = await fetch(url.toString(), requestInit);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Instagram API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }
}

const instagramService = new InstagramBusinessService();

// GET - Lấy thông tin Instagram Business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    const igUserId = searchParams.get('igUserId');
    
    switch (action) {
      case 'accounts':
        return await getInstagramBusinessAccounts();
      case 'user':
        if (igUserId) {
          return await getInstagramUserInfo(igUserId);
        }
        return NextResponse.json({ success: false, error: 'igUserId required' }, { status: 400 });
      case 'media':
        if (igUserId) {
          return await getInstagramUserMedia(igUserId);
        }
        return NextResponse.json({ success: false, error: 'igUserId required' }, { status: 400 });
      case 'insights':
        if (igUserId) {
          return await getInstagramInsights(igUserId);
        }
        return NextResponse.json({ success: false, error: 'igUserId required' }, { status: 400 });
      default:
        return await getAllInstagramData();
    }
  } catch (error) {
    console.error('Instagram Business API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Instagram Business data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy tất cả Instagram Business Accounts
async function getInstagramBusinessAccounts() {
  const pages = await prisma.facebook_pages.findMany({
    where: {
      accessToken: { not: null }
    }
  });

  const instagramAccounts = [];

  for (const page of pages) {
    try {
      // Lấy Instagram Business Account connected với Facebook Page
      const igAccount = await instagramService.makeApiRequest(
        `/${page.facebookPageId}`,
        {
          fields: 'instagram_business_account',
          access_token: page.accessToken
        }
      );

      if (igAccount.instagram_business_account) {
        const igAccountDetails = await instagramService.makeApiRequest(
          `/${igAccount.instagram_business_account.id}`,
          {
            fields: 'id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url',
            access_token: page.accessToken
          }
        );

        instagramAccounts.push({
          ...igAccountDetails,
          connectedPage: {
            id: page.facebookPageId,
            name: page.name
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching Instagram account for page ${page.facebookPageId}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      instagramAccounts,
      summary: {
        totalAccounts: instagramAccounts.length,
        pagesProcessed: pages.length
      }
    }
  });
}

// Lấy thông tin Instagram User cụ thể
async function getInstagramUserInfo(igUserId: string) {
  try {
    const page = await prisma.facebook_pages.findFirst({
      where: { accessToken: { not: null } }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'No Facebook page with access token found'
      }, { status: 404 });
    }

    const userInfo = await instagramService.makeApiRequest(
      `/${igUserId}`,
      {
        fields: 'id,username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url',
        access_token: page.accessToken
      }
    );

    return NextResponse.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error(`Error fetching Instagram user info for ${igUserId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Instagram user info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy media của Instagram User
async function getInstagramUserMedia(igUserId: string) {
  try {
    const page = await prisma.facebook_pages.findFirst({
      where: { accessToken: { not: null } }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'No Facebook page with access token found'
      }, { status: 404 });
    }

    const media = await instagramService.makeApiRequest(
      `/${igUserId}/media`,
      {
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count',
        limit: 50,
        access_token: page.accessToken
      }
    );

    // Lấy comments từ mỗi media để extract user data
    const mediaWithComments = [];
    
    for (const mediaItem of media.data || []) {
      try {
        const comments = await instagramService.makeApiRequest(
          `/${mediaItem.id}/comments`,
          {
            fields: 'id,text,timestamp,username,like_count',
            limit: 20,
            access_token: page.accessToken
          }
        );

        mediaWithComments.push({
          ...mediaItem,
          comments: comments.data || []
        });

        // Extract user data từ comments
        for (const comment of comments.data || []) {
          await extractInstagramUserData(comment, mediaItem.id);
        }
      } catch (error) {
        // Skip nếu không thể lấy comments
        mediaWithComments.push(mediaItem);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        media: mediaWithComments,
        summary: {
          totalMedia: mediaWithComments.length,
          totalComments: mediaWithComments.reduce((sum: number, item: any) => sum + (item.comments?.length || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching Instagram media for ${igUserId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Instagram media',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy Instagram Insights
async function getInstagramInsights(igUserId: string) {
  try {
    const page = await prisma.facebook_pages.findFirst({
      where: { accessToken: { not: null } }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'No Facebook page with access token found'
      }, { status: 404 });
    }

    // Account insights
    const accountInsights = await instagramService.makeApiRequest(
      `/${igUserId}/insights`,
      {
        metric: 'audience_gender_age,audience_locale,audience_country',
        period: 'lifetime',
        access_token: page.accessToken
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        insights: accountInsights.data || [],
        summary: {
          totalInsights: accountInsights.data?.length || 0
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching Instagram insights for ${igUserId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Instagram insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Extract user data từ Instagram comments
async function extractInstagramUserData(comment: any, mediaId: string) {
  try {
    // Extract phone/email từ comment text nếu có
    const phoneMatch = comment.text.match(/(?:\+84|84|0)(?:1[2689]|9[0-9]|3[2-9]|5[689]|7[06-9]|8[1-9])[\d]{7,8}/);
    const emailMatch = comment.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    // Extract basic info từ comment
    const extractedData: any = {
      username: comment.username,
      comment: comment.text,
      timestamp: comment.timestamp,
      mediaId: mediaId,
      platform: 'INSTAGRAM'
    };

    if (phoneMatch || emailMatch) {
      extractedData.phone = phoneMatch?.[0];
      extractedData.email = emailMatch?.[0];
      
      // Lưu vào database (nếu cần)
      // await saveInstagramUserData(extractedData);
    }

    return extractedData;
  } catch (error) {
    console.error('Error extracting Instagram user data:', error);
    return null;
  }
}

// Lấy tất cả dữ liệu Instagram
async function getAllInstagramData() {
  const accounts = await getInstagramBusinessAccounts();
  const accountsData = await accounts.json();
  
  const allData = [];
  
  if (accountsData.success && accountsData.data.instagramAccounts) {
    for (const account of accountsData.data.instagramAccounts) {
      try {
        const mediaResponse = await getInstagramUserMedia(account.id);
        const mediaData = await mediaResponse.json();
        
        allData.push({
          account,
          media: mediaData.success ? mediaData.data.media : [],
          summary: mediaData.success ? mediaData.data.summary : {}
        });
      } catch (error) {
        console.error(`Error getting media for account ${account.id}:`, error);
        allData.push({ account, media: [], summary: {} });
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      accounts: allData,
      totalAccounts: allData.length,
      totalMedia: allData.reduce((sum, item) => sum + (item.media?.length || 0), 0),
      totalComments: allData.reduce((sum, item) => 
        sum + (item.media?.reduce((mediaSum: number, media: any) => 
          mediaSum + (media.comments?.length || 0), 0) || 0), 0)
    }
  });
}

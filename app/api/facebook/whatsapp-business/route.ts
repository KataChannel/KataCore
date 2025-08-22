import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// WhatsApp Business API Integration
class WhatsAppBusinessService {
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
      throw new Error(`WhatsApp API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  }
}

const whatsappService = new WhatsAppBusinessService();

// GET - Lấy thông tin WhatsApp Business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const phoneNumberId = searchParams.get('phoneNumberId');

    if (phoneNumberId) {
      return await getWhatsAppPhoneNumberInfo(phoneNumberId);
    } else if (businessId) {
      return await getWhatsAppBusinessInfo(businessId);
    } else {
      return await getAllWhatsAppBusinessData();
    }
  } catch (error) {
    console.error('WhatsApp Business API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch WhatsApp Business data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy tất cả thông tin WhatsApp Business
async function getAllWhatsAppBusinessData() {
  // Lấy access token từ Facebook pages có WhatsApp connected
  const pages = await prisma.facebook_pages.findMany({
    where: {
      accessToken: { not: null }
    }
  });

  const whatsappData = [];

  for (const page of pages) {
    try {
      // Kiểm tra WhatsApp Business Account
      const businessAccounts = await whatsappService.makeApiRequest(
        `/me/businesses`,
        {
          fields: 'id,name,verification_status,primary_phone,website',
          access_token: page.accessToken
        }
      );

      if (businessAccounts.data) {
        for (const business of businessAccounts.data) {
          try {
            // Lấy WhatsApp Business Profile
            const whatsappProfile = await whatsappService.makeApiRequest(
              `/${business.id}`,
              {
                fields: 'id,name,category,description,email,websites,phone_number,profile_picture_url',
                access_token: page.accessToken
              }
            );

            // Lấy Phone Numbers
            const phoneNumbers = await whatsappService.makeApiRequest(
              `/${business.id}/phone_numbers`,
              {
                fields: 'id,display_phone_number,verified_name,quality_rating',
                access_token: page.accessToken
              }
            );

            whatsappData.push({
              business: whatsappProfile,
              phoneNumbers: phoneNumbers.data || [],
              connectedPage: {
                id: page.facebookPageId,
                name: page.name
              }
            });
          } catch (error) {
            console.error(`Error fetching WhatsApp data for business ${business.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching WhatsApp business for page ${page.facebookPageId}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      whatsappBusinesses: whatsappData,
      summary: {
        totalBusinesses: whatsappData.length,
        pagesProcessed: pages.length
      }
    }
  });
}

// Lấy thông tin WhatsApp Business cụ thể
async function getWhatsAppBusinessInfo(businessId: string) {
  try {
    // Tìm page có access token
    const page = await prisma.facebook_pages.findFirst({
      where: { accessToken: { not: null } }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'No Facebook page with access token found'
      }, { status: 404 });
    }

    const businessInfo = await whatsappService.makeApiRequest(
      `/${businessId}`,
      {
        fields: 'id,name,category,description,email,websites,phone_number,profile_picture_url,about,address,hours',
        access_token: page.accessToken
      }
    );

    // Lấy conversations (chỉ available với advanced permissions)
    let conversations = [];
    try {
      const conversationsResponse = await whatsappService.makeApiRequest(
        `/${businessId}/conversations`,
        {
          fields: 'id,participants,created_time,updated_time',
          access_token: page.accessToken
        }
      );
      conversations = conversationsResponse.data || [];
    } catch (error) {
      console.log('Conversations not available - requires advanced permissions');
    }

    return NextResponse.json({
      success: true,
      data: {
        businessInfo,
        conversations,
        summary: {
          totalConversations: conversations.length
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching WhatsApp business info for ${businessId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch WhatsApp business info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Lấy thông tin Phone Number cụ thể
async function getWhatsAppPhoneNumberInfo(phoneNumberId: string) {
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

    const phoneInfo = await whatsappService.makeApiRequest(
      `/${phoneNumberId}`,
      {
        fields: 'id,display_phone_number,verified_name,code_verification_status,quality_rating,messaging_limit_tier',
        access_token: page.accessToken
      }
    );

    return NextResponse.json({
      success: true,
      data: phoneInfo
    });
  } catch (error) {
    console.error(`Error fetching WhatsApp phone info for ${phoneNumberId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch WhatsApp phone info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Gửi template message để thu thập thông tin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumberId, recipientPhone, templateName, parameters } = body;

    if (!phoneNumberId || !recipientPhone || !templateName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: phoneNumberId, recipientPhone, templateName'
      }, { status: 400 });
    }

    const page = await prisma.facebook_pages.findFirst({
      where: { accessToken: { not: null } }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'No Facebook page with access token found'
      }, { status: 404 });
    }

    // Gửi template message
    const messageResult = await whatsappService.makeApiRequest(
      `/${phoneNumberId}/messages`,
      {
        method: 'POST',
        access_token: page.accessToken,
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'vi'
          },
          components: parameters ? [
            {
              type: 'body',
              parameters: parameters
            }
          ] : undefined
        }
      }
    );

    // Lưu log
    await prisma.whatsapp_messages.create({
      data: {
        whatsappMessageId: messageResult.messages?.[0]?.id || '',
        phoneNumberId,
        recipientPhone,
        messageType: 'TEMPLATE',
        templateName,
        status: 'SENT',
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }).catch(() => {
      // Ignore if table doesn't exist yet
    });

    return NextResponse.json({
      success: true,
      data: messageResult
    });
  } catch (error) {
    console.error('Error sending WhatsApp template message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send WhatsApp message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { comprehensiveUserDataExtractor } from '../services/ComprehensiveUserDataExtractor';

// API Endpoint chính để lấy toàn bộ dữ liệu người dùng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const method = searchParams.get('method') || 'all';
    const format = searchParams.get('format') || 'json';

    let result;

    switch (method) {
      case 'lead-ads':
        const leadAdsUsers = await comprehensiveUserDataExtractor.extractFromLeadAds(pageId || undefined);
        result = {
          success: true,
          method: 'lead-ads',
          totalUsers: leadAdsUsers.length,
          users: leadAdsUsers
        };
        break;

      case 'facebook':
        const facebookUsers = await comprehensiveUserDataExtractor.extractFromFacebookInteractions(pageId || undefined);
        result = {
          success: true,
          method: 'facebook',
          totalUsers: facebookUsers.length,
          users: facebookUsers
        };
        break;

      case 'instagram':
        const instagramUsers = await comprehensiveUserDataExtractor.extractFromInstagram(pageId || undefined);
        result = {
          success: true,
          method: 'instagram',
          totalUsers: instagramUsers.length,
          users: instagramUsers
        };
        break;

      case 'all':
      default:
        result = await comprehensiveUserDataExtractor.extractAllUserData(pageId || undefined);
        break;
    }

    // Export CSV nếu được yêu cầu
    if (format === 'csv') {
      const csv = generateCSV(result.users || []);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-data-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Comprehensive User Data Extraction error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to extract user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Trigger extraction cho specific pages/sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      pageIds, 
      methods = ['all'], 
      saveToDatabase = true,
      sendNotification = false 
    } = body;

    const results = [];

    if (pageIds && Array.isArray(pageIds)) {
      // Extract cho từng page
      for (const pageId of pageIds) {
        for (const method of methods) {
          try {
            let result;
            
            switch (method) {
              case 'lead-ads':
                result = await comprehensiveUserDataExtractor.extractFromLeadAds(pageId);
                break;
              case 'facebook':
                result = await comprehensiveUserDataExtractor.extractFromFacebookInteractions(pageId);
                break;
              case 'instagram':
                result = await comprehensiveUserDataExtractor.extractFromInstagram(pageId);
                break;
              case 'all':
                result = await comprehensiveUserDataExtractor.extractAllUserData(pageId);
                break;
              default:
                throw new Error(`Unknown method: ${method}`);
            }

            results.push({
              pageId,
              method,
              success: true,
              result
            });
          } catch (error) {
            results.push({
              pageId,
              method,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    } else {
      // Extract cho tất cả pages
      const result = await comprehensiveUserDataExtractor.extractAllUserData();
      results.push({
        pageId: 'all',
        method: 'all',
        success: true,
        result
      });
    }

    // Gửi notification nếu được yêu cầu
    if (sendNotification) {
      await sendExtractionNotification(results);
    }

    return NextResponse.json({
      success: true,
      totalJobs: results.length,
      results,
      summary: {
        successfulJobs: results.filter(r => r.success).length,
        failedJobs: results.filter(r => !r.success).length,
        totalUsersExtracted: results.reduce((sum, r) => {
          if (r.result) {
            if (Array.isArray(r.result)) {
              return sum + r.result.length;
            } else if (typeof r.result === 'object' && 'totalUsersFound' in r.result) {
              return sum + (r.result.totalUsersFound || 0);
            }
          }
          return sum;
        }, 0)
      }
    });
  } catch (error) {
    console.error('Batch extraction error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run batch extraction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function để generate CSV
function generateCSV(users: any[]): string {
  if (users.length === 0) {
    return 'No data available';
  }

  const headers = [
    'Source',
    'Page Name',
    'User Name',
    'Facebook User ID',
    'Email',
    'Phone',
    'Company',
    'Location',
    'Age',
    'Interests',
    'Lead Score',
    'Segment',
    'Confidence',
    'Extracted At',
    'Additional Data'
  ];

  const csvRows = [
    headers.join(','),
    ...users.map(user => [
      user.source || '',
      user.pageName || '',
      user.userName || '',
      user.facebookUserId || '',
      user.email || '',
      user.phone || '',
      user.company || '',
      user.location || '',
      user.age || '',
      (user.interests || []).join('; '),
      user.leadScore || '',
      user.segment || '',
      user.confidence || '',
      user.extractedAt ? new Date(user.extractedAt).toISOString() : '',
      user.additionalData ? JSON.stringify(user.additionalData).replace(/"/g, '""') : ''
    ].map(field => `"${field}"`).join(','))
  ];

  return csvRows.join('\n');
}

// Helper function để gửi notification
async function sendExtractionNotification(results: any[]): Promise<void> {
  try {
    // TODO: Implement notification logic
    // - Gửi email tới admin
    // - Slack notification
    // - Discord webhook
    // - In-app notification
    
    console.log('📧 Sending extraction notification...');
    console.log(`✅ Extracted data from ${results.length} jobs`);
    
    const totalUsers = results.reduce((sum, r) => {
      if (r.result) {
        if (Array.isArray(r.result)) {
          return sum + r.result.length;
        } else if (typeof r.result === 'object' && 'totalUsersFound' in r.result) {
          return sum + (r.result.totalUsersFound || 0);
        }
      }
      return sum;
    }, 0);
    
    console.log(`👥 Total users found: ${totalUsers}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// DELETE - Xóa extracted data (GDPR compliance)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!sourceId && !userId && !email && !phone) {
      return NextResponse.json({
        success: false,
        error: 'Must provide sourceId, userId, email, or phone to delete'
      }, { status: 400 });
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    let deleteQuery: any = {};

    if (sourceId) {
      deleteQuery.facebookLeadId = sourceId;
    } else if (email) {
      deleteQuery.email = email;
    } else if (phone) {
      deleteQuery.phone = phone;
    }

    const deletedRecords = await prisma.facebook_leads.deleteMany({
      where: deleteQuery
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      deletedCount: deletedRecords.count,
      message: 'User data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

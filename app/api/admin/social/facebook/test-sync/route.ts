import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Facebook Sync with Real Data...');
    
    // Get a real page with access token from database
    const testPage = await prisma.facebook_pages.findFirst({
      where: {
        accessToken: {
          not: null
        }
      },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });
    
    if (!testPage || !testPage.accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No valid Facebook page with access token found'
      });
    }
    
    console.log(`🎯 Testing with page: ${testPage.name} (${testPage.facebookPageId})`);
    
    // Test fetch posts
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${testPage.facebookPageId}/posts?access_token=${testPage.accessToken}&fields=id,message,created_time,likes.summary(true)&limit=3`
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: 'Facebook API error',
        details: error,
        status: response.status
      });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      page: {
        id: testPage.facebookPageId,
        name: testPage.name
      },
      postsFound: data.data?.length || 0,
      samplePosts: data.data?.slice(0, 2).map((post: any) => ({
        id: post.id,
        message: post.message?.substring(0, 100) + '...',
        created_time: post.created_time,
        likes: post.likes?.summary?.total_count || 0
      }))
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

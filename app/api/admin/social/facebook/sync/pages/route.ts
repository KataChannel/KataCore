import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    console.log('🔄 Starting Facebook pages sync...');
    console.log('🔄 Starting Facebook pages sync...',accessToken);
    console.log('🔄 Starting Facebook pages sync...');

    // Get Facebook pages using the access token
    const response = await fetch(
      `https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}&fields=id,name,category,fan_count,followers_count,link,about,phone,website,access_token`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch Facebook pages');
    }

    const data = await response.json();
    const pages = data.data || [];

    console.log(`📊 Found ${pages.length} Facebook pages`);

    // Store/update pages in database
    const savedPages = [];
    for (const page of pages) {
      try {
        const savedPage = await prisma.facebook_pages.upsert({
          where: { facebookPageId: page.id },
          update: {
            name: page.name,
            category: page.category || null,
            fanCount: page.fan_count || 0,
            followersCount: page.followers_count || 0,
            link: page.link || null,
            about: page.about || null,
            phone: page.phone || null,
            website: page.website || null,
            accessToken: page.access_token || null,
            updatedAt: new Date()
          },
          create: {
            facebookPageId: page.id,
            name: page.name,
            category: page.category || null,
            fanCount: page.fan_count || 0,
            followersCount: page.followers_count || 0,
            link: page.link || null,
            about: page.about || null,
            phone: page.phone || null,
            website: page.website || null,
            accessToken: page.access_token || null
          }
        });

        savedPages.push(savedPage);
      } catch (error) {
        console.error(`Failed to save page ${page.id}:`, error);
      }
    }

    console.log(`✅ Successfully synced ${savedPages.length} pages`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${savedPages.length} Facebook pages`,
      pages: savedPages,
      total: savedPages.length
    });

  } catch (error: any) {
    console.error('Facebook pages sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync Facebook pages'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

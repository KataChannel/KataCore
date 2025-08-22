import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Starting Facebook sync debug...');
    
    const { pageId } = await request.json();
    
    if (!pageId) {
      return NextResponse.json({ error: 'pageId required' }, { status: 400 });
    }
    
    console.log(`🎯 DEBUG: Testing page ${pageId}`);
    
    // Get page from database
    const page = await prisma.facebook_pages.findFirst({
      where: { facebookPageId: pageId },
      select: {
        facebookPageId: true,
        name: true,
        accessToken: true
      }
    });
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found in database' });
    }
    
    console.log(`✅ DEBUG: Page found: ${page.name}`);
    
    if (!page.accessToken) {
      return NextResponse.json({ error: 'No access token for page' });
    }
    
    console.log(`🔑 DEBUG: Has access token: ${page.accessToken.substring(0, 20)}...`);
    
    // Test Facebook API
    const apiUrl = `https://graph.facebook.com/v23.0/${pageId}/posts?access_token=${page.accessToken}&fields=id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,attachments{media,target,type,url,title,description},permalink_url,is_published&limit=10`;
    console.log(`🌐 DEBUG: API URL: ${apiUrl.replace(page.accessToken, 'TOKEN_HIDDEN')}`);
    
    const response = await fetch(apiUrl);
    
    console.log(`📡 DEBUG: Facebook API response status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ DEBUG: Facebook API error:`, error);
      return NextResponse.json({ 
        error: 'Facebook API error', 
        details: error,
        status: response.status 
      });
    }
    
    const data = await response.json();
    console.log(`📊 DEBUG: Posts found: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log(`📄 DEBUG: First post:`, {
        id: data.data[0].id,
        hasMessage: !!data.data[0].message,
        hasStory: !!data.data[0].story,
        created_time: data.data[0].created_time
      });
      
      // Try to save one post
      try {
        const testPost = data.data[0];
        console.log(`💾 DEBUG: Attempting to save post ${testPost.id}`);
        
        const savedPost = await prisma.facebook_posts.upsert({
          where: { facebookPostId: testPost.id },
          update: {
            message: testPost.message || null,
            story: testPost.story || null,
            createdTime: testPost.created_time ? new Date(testPost.created_time) : null,
            updatedTime: new Date()
          },
          create: {
            facebookPostId: testPost.id,
            facebookPageId: page.facebookPageId,
            message: testPost.message || null,
            story: testPost.story || null,
            createdTime: testPost.created_time ? new Date(testPost.created_time) : null
          }
        });
        
        console.log(`✅ DEBUG: Post saved successfully: ${savedPost.id}`);
        
        return NextResponse.json({
          success: true,
          page: page,
          postsFound: data.data.length,
          testPostSaved: {
            id: savedPost.id,
            facebookPostId: savedPost.facebookPostId,
            message: savedPost.message?.substring(0, 100)
          }
        });
        
      } catch (saveError) {
        console.log(`❌ DEBUG: Failed to save post:`, saveError);
        return NextResponse.json({
          error: 'Failed to save post to database',
          details: saveError
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      page: page,
      postsFound: data.data?.length || 0,
      message: 'No posts to save'
    });
    
  } catch (error: any) {
    console.error('❌ DEBUG: Error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

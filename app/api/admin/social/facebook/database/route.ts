import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'pages';

    switch (action) {
      case 'pages':
        // Get pages from database with sync status
        const pages = await prisma.facebook_pages.findMany({
          include: {
            facebook_interactions: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        // Transform to match frontend interface
        const transformedPages = pages.map(page => ({
          id: page.facebookPageId,
          name: page.name,
          category: page.category,
          fan_count: page.fanCount,
          followers_count: page.followersCount,
          link: page.link,
          about: page.about,
          phone: page.phone,
          website: page.website,
          // Add sync status
          lastSyncAt: page.updatedAt,
          interactionCount: page.facebook_interactions.length,
          isSynced: true, // Data from database is considered synced
          dbId: page.id
        }));

        return NextResponse.json({ data: transformedPages });

      case 'interactions':
        const page = searchParams.get('page') || '1';
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const pageId = searchParams.get('pageId') || '';

        const offset = (parseInt(page) - 1) * limit;

        // Build where clause
        const where: any = {};
        if (search) {
          where.OR = [
            { userName: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } }
          ];
        }
        if (pageId) {
          where.facebookPageId = pageId;
        }

        const [interactions, total] = await Promise.all([
          prisma.facebook_interactions.findMany({
            where,
            include: {
              facebook_pages: true
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit
          }),
          prisma.facebook_interactions.count({ where })
        ]);

        // Transform to match frontend interface
        const transformedInteractions = interactions.map(interaction => ({
          fanpage: interaction.facebook_pages.name,
          fullName: interaction.userName,
          phoneNumber: '', // Not stored in current schema
          facebookLink: `https://facebook.com/${interaction.userId}`,
          firstInteractionDate: interaction.createdAt.toISOString(),
          lastInteractionDate: interaction.updatedAt.toISOString(),
          totalInteractions: 1, // Individual interaction record
          latestMessage: interaction.message || '',
          interactionType: interaction.type
        }));

        return NextResponse.json({
          data: transformedInteractions,
          pagination: {
            current: parseInt(page),
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'sync_pages':
        // Sync pages from Facebook API to database
        const facebookApiUrl = '/api/social/facebook?type=pages';
        const facebookResponse = await fetch(
          new URL(facebookApiUrl, request.url).toString(),
          {
            headers: {
              'X-Facebook-Page-Id': request.headers.get('X-Facebook-Page-Id') || '',
              'X-Facebook-Access-Token': request.headers.get('X-Facebook-Access-Token') || ''
            }
          }
        );

        if (!facebookResponse.ok) {
          throw new Error('Failed to fetch from Facebook API');
        }

        const facebookData = await facebookResponse.json();
        const facebookPages = facebookData.data || [];

        // Update or create pages in database
        const syncResults = [];
        for (const fbPage of facebookPages) {
          try {
            const existingPage = await prisma.facebook_pages.findUnique({
              where: { facebookPageId: fbPage.id }
            });

            if (existingPage) {
              // Update existing page
              const updatedPage = await prisma.facebook_pages.update({
                where: { facebookPageId: fbPage.id },
                data: {
                  name: fbPage.name,
                  category: fbPage.category,
                  fanCount: fbPage.fan_count || 0,
                  followersCount: fbPage.followers_count || 0,
                  link: fbPage.link,
                  about: fbPage.about,
                  phone: fbPage.phone,
                  website: fbPage.website,
                  updatedAt: new Date()
                }
              });
              syncResults.push({ status: 'updated', page: updatedPage });
            } else {
              // Create new page
              const newPage = await prisma.facebook_pages.create({
                data: {
                  facebookPageId: fbPage.id,
                  name: fbPage.name,
                  category: fbPage.category,
                  fanCount: fbPage.fan_count || 0,
                  followersCount: fbPage.followers_count || 0,
                  link: fbPage.link,
                  about: fbPage.about,
                  phone: fbPage.phone,
                  website: fbPage.website
                }
              });
              syncResults.push({ status: 'created', page: newPage });
            }
          } catch (pageError) {
            console.error(`Error syncing page ${fbPage.id}:`, pageError);
            syncResults.push({ 
              status: 'error', 
              pageId: fbPage.id, 
              error: pageError instanceof Error ? pageError.message : 'Unknown error' 
            });
          }
        }

        return NextResponse.json({
          message: 'Sync completed',
          results: syncResults,
          synced: syncResults.filter(r => r.status !== 'error').length,
          errors: syncResults.filter(r => r.status === 'error').length
        });

      case 'sync_interactions':
        const { pageId } = data;
        if (!pageId) {
          return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
        }

        // Fetch interactions from Facebook API
        const interactionsUrl = `/api/social/facebook?type=messages&pageId=${pageId}`;
        const interactionsResponse = await fetch(
          new URL(interactionsUrl, request.url).toString(),
          {
            headers: {
              'X-Facebook-Page-Id': request.headers.get('X-Facebook-Page-Id') || '',
              'X-Facebook-Access-Token': request.headers.get('X-Facebook-Access-Token') || ''
            }
          }
        );

        if (!interactionsResponse.ok) {
          throw new Error('Failed to fetch interactions from Facebook API');
        }

        const interactionsData = await interactionsResponse.json();
        const conversations = interactionsData.data || [];

        // Process and store interactions
        const interactionResults = [];
        for (const conversation of conversations) {
          if (conversation.messages?.data) {
            for (const message of conversation.messages.data) {
              try {
                const existingInteraction = await prisma.facebook_interactions.findUnique({
                  where: { facebookInteractionId: message.id }
                });

                if (!existingInteraction) {
                  const newInteraction = await prisma.facebook_interactions.create({
                    data: {
                      facebookInteractionId: message.id,
                      facebookPageId: pageId,
                      type: 'MESSAGE',
                      userName: message.from?.name || 'Unknown',
                      userId: message.from?.id || 'unknown',
                      message: message.message,
                      createdAt: message.created_time ? new Date(message.created_time) : new Date()
                    }
                  });
                  interactionResults.push({ status: 'created', interaction: newInteraction });
                }
              } catch (interactionError) {
                console.error(`Error syncing interaction ${message.id}:`, interactionError);
                interactionResults.push({ 
                  status: 'error', 
                  messageId: message.id, 
                  error: interactionError instanceof Error ? interactionError.message : 'Unknown error' 
                });
              }
            }
          }
        }

        return NextResponse.json({
          message: 'Interactions sync completed',
          results: interactionResults,
          synced: interactionResults.filter(r => r.status !== 'error').length,
          errors: interactionResults.filter(r => r.status === 'error').length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}

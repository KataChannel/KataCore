// Temporary test endpoint for roles API debugging
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [TEST ROLES] Testing roles API without authentication...');
    
    // Try to get roles from database without auth check
    const dbRoles = await prisma.roles.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      take: 5, // Limit to avoid performance issues
      orderBy: { name: 'asc' },
    });

    console.log('🔍 [TEST ROLES] Found roles:', dbRoles.length);

    return NextResponse.json({
      success: true,
      message: 'Test successful',
      rolesCount: dbRoles.length,
      roles: dbRoles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        userCount: role._count.users,
      }))
    });
  } catch (error: any) {
    console.error('🔍 [TEST ROLES] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

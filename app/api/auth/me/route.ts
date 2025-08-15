import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 401 });
    }

    // Direct token verification without external service
    let decoded;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (tokenError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Direct database query without external service
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId as string },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        displayName: true,
        avatar: true,
        roleId: true,
        isActive: true,
        isVerified: true,
        roles: {
          select: {
            id: true,
            name: true,
            level: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Single response with all data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.roles,
      roleId: user.roleId,
      modules: [],
      permissions: [],
      isActive: user.isActive,
      isVerified: user.isVerified,
      provider: 'email',
      _meta: {
        source: 'api/auth/me',
        tokenOptimized: true,
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

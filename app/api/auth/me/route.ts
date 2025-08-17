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
      return new Response(JSON.stringify({ error: 'Token not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct token verification without external service
    let decoded: any;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      decoded = payload;
    } catch (tokenError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Single response with all data
    const responseBody = {
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
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Auth /me error:', error);
    const body = {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 401 });
    }

    const decoded = authService.verifyToken(token);
    await authService.logout(decoded.userId);

    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    // Clear refresh token cookie
    response.cookies.delete('refreshToken');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 400 });
  }
}

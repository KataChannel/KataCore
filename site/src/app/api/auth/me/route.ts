import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    console.log('Decoded token:', decoded);
    
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get user' }, { status: 401 });
  }
}

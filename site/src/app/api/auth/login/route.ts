import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, username, password, provider = 'email' } = body;

    // Validate required fields
    if (!password && provider !== 'phone') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!email && !phone && !username) {
      return NextResponse.json(
        { error: 'Email, phone, or username is required' },
        { status: 400 }
      );
    }

    const result = await authService.login({
      email,
      phone,
      username,
      password,
      provider,
    });

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        username: result.user.username,
        displayName: result.user.displayName,
        avatar: result.user.avatar,
        role: result.user.role,
        isVerified: result.user.isVerified,
      },
      accessToken: result.tokens.accessToken,
    });

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

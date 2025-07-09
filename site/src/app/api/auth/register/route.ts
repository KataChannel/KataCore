import { NextRequest, NextResponse } from 'next/server';
import authService from '../../../../lib/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      phone, 
      username, 
      password, 
      displayName, 
      provider = 'email',
      googleId,
      facebookId,
      appleId 
    } = body;

    // Validate required fields
    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (!email && !phone && !username) {
      return NextResponse.json(
        { error: 'Email, phone, or username is required' },
        { status: 400 }
      );
    }

    if (provider === 'email' && !password) {
      return NextResponse.json(
        { error: 'Password is required for email registration' },
        { status: 400 }
      );
    }

    const user = await authService.register({
      email,
      phone,
      username,
      password,
      displayName,
      provider,
      googleId,
      facebookId,
      appleId,
    });

    // Generate tokens
    const tokens = authService.generateTokens(user);

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken: tokens.accessToken,
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}

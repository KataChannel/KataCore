import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action = 'login' } = body; // action can be 'login' or 'register'

    if (!token) {
      return NextResponse.json({ error: 'Google token is required' }, { status: 400 });
    }

    // Verify Google token and get user info
    const googleUser = await verifyGoogleToken(token);
    
    if (!googleUser) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, name, picture, sub: googleId } = googleUser;

    if (action === 'register') {
      // Register new user with Google
      try {
        const result = await authService.register({
          email,
          displayName: name,
          provider: 'google',
          googleId,
        });

        const response = NextResponse.json({
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
            avatar: result.user.avatar,
            role: result.user.role,
            isVerified: result.user.isVerified,
          },
          accessToken: result.tokens.accessToken,
        });

        // Set refresh token cookie
        response.cookies.set('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
      } catch (error: any) {
        if (error.message === 'User already exists') {
          return NextResponse.json({ 
            error: 'User already exists with this email. Please try logging in instead.',
            userExists: true 
          }, { status: 409 });
        }
        throw error;
      }
    } else {
      // Login with Google
      const result = await authService.login({
        email,
        provider: 'google',
      });

      const response = NextResponse.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          avatar: result.user.avatar,
          role: result.user.role,
          isVerified: result.user.isVerified,
        },
        accessToken: result.tokens.accessToken,
      });

      // Set refresh token cookie
      response.cookies.set('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json({ 
      error: error.message || 'Google authentication failed' 
    }, { status: 401 });
  }
}

/**
 * Verify Google token and get user information
 */
async function verifyGoogleToken(token: string) {
  try {
    // Use Google's token verification endpoint
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    
    if (!response.ok) {
      throw new Error('Invalid Google token');
    }

    const tokenInfo = await response.json();
    
    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get Google user profile');
    }

    const profile = await profileResponse.json();
    
    return {
      sub: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      email_verified: profile.verified_email,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

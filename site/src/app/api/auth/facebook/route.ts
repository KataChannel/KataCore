import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action = 'login' } = body; // action can be 'login' or 'register'

    if (!token) {
      return NextResponse.json({ error: 'Facebook token is required' }, { status: 400 });
    }

    // Verify Facebook token and get user info
    const facebookUser = await verifyFacebookToken(token);
    
    if (!facebookUser) {
      return NextResponse.json({ error: 'Invalid Facebook token' }, { status: 401 });
    }

    const { email, name, picture, id: facebookId } = facebookUser;

    if (action === 'register') {
      // Register new user with Facebook
      try {
        const result = await authService.register({
          email,
          displayName: name,
          provider: 'facebook',
          facebookId,
          avatar: picture?.data?.url,
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
        if (error.message.includes('already exists')) {
          return NextResponse.json({ error: 'User with this email already exists. Try logging in instead.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
      }
    } else {
      // Login with Facebook
      try {
        // Try to find existing user and login
        const result = await authService.socialLogin('facebook', facebookId, email, name, picture?.data?.url);

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
        return NextResponse.json({ error: error.message || 'Facebook login failed' }, { status: 401 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

// Function to verify Facebook token
async function verifyFacebookToken(token: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
    
    if (!response.ok) {
      throw new Error('Failed to verify Facebook token');
    }

    return await response.json();
  } catch (error) {
    console.error('Facebook token verification failed:', error);
    return null;
  }
}

// Function to get long-lived Facebook token
async function getLongLivedToken(shortToken: string) {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    if (!appId || !appSecret) {
      throw new Error('Facebook app credentials not configured');
    }

    const response = await fetch(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get long-lived token');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get long-lived Facebook token:', error);
    return null;
  }
}

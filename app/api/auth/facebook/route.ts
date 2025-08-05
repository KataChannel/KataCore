import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userID } = body;

    if (!token) {
      return NextResponse.json({ error: 'Facebook token is required' }, { status: 400 });
    }

    // Verify Facebook token and get user info with extended fields
    const facebookUser = await verifyFacebookToken(token);
    
    if (!facebookUser) {
      return NextResponse.json({ error: 'Invalid Facebook token' }, { status: 401 });
    }

    const { email, name, picture, id: facebookId, first_name, last_name } = facebookUser;

    // Check if user exists by Facebook ID or email and handle login/update
    try {
      const result = await authService.socialLoginOrUpdate('facebook', {
        facebookId,
        email,
        displayName: name,
        firstName: first_name,
        lastName: last_name,
        avatar: picture?.data?.url,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          avatar: result.user.avatar,
          role: result.user.role,
          isVerified: result.user.isVerified,
          provider: result.user.provider,
          loginCount: result.user.loginCount || 0
        },
        accessToken: result.tokens.accessToken,
        message: result.isNewUser ? 'Tài khoản đã được tạo và đăng nhập thành công' : 'Đăng nhập thành công'
      });

      // Set refresh token cookie
      response.cookies.set('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    } catch (error: any) {
      console.error('Facebook authentication error:', error);
      
      if (error.message.includes('email already exists')) {
        return NextResponse.json({ 
          error: 'Email đã được sử dụng bởi tài khoản khác. Vui lòng đăng nhập bằng phương thức ban đầu.' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: error.message || 'Facebook login failed' 
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Facebook authentication request error:', error);
    return NextResponse.json({ 
      error: error.message || 'Authentication failed' 
    }, { status: 500 });
  }
}

// Function to verify Facebook token with extended fields
async function verifyFacebookToken(token: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture,first_name,last_name&access_token=${token}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      throw new Error('Failed to verify Facebook token');
    }

    const userData = await response.json();
    
    // Validate required fields
    if (!userData.id) {
      throw new Error('Invalid Facebook user data - missing ID');
    }

    return userData;
  } catch (error) {
    console.error('Facebook token verification failed:', error);
    return null;
  }
}

// Function to get long-lived Facebook token
async function getLongLivedToken(shortToken: string) {
  try {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
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

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Failed to get long-lived Facebook token:', error);
    return null;
  }
}

// GET method to check Facebook login status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token with Facebook
    const userData = await verifyFacebookToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: userData
    });

  } catch (error: any) {
    console.error('Facebook token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}

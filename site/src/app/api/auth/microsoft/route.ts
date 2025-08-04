import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action = 'login' } = body; // action can be 'login' or 'register'

    if (!token) {
      return NextResponse.json({ error: 'Microsoft token is required' }, { status: 400 });
    }

    // Verify Microsoft token and get user info
    const microsoftUser = await verifyMicrosoftToken(token);
    
    if (!microsoftUser) {
      return NextResponse.json({ error: 'Invalid Microsoft token' }, { status: 401 });
    }

    const { mail, displayName, id: microsoftId, userPrincipalName } = microsoftUser;
    const email = mail || userPrincipalName;

    if (action === 'register') {
      // Register new user with Microsoft
      try {
        const result = await authService.register({
          email,
          displayName,
          provider: 'microsoft',
          microsoftId,
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
      // Login with Microsoft
      try {
        // Try to find existing user and login
        const result = await authService.socialLogin('microsoft', microsoftId, email, displayName);

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
        return NextResponse.json({ error: error.message || 'Microsoft login failed' }, { status: 401 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

// Function to verify Microsoft token
async function verifyMicrosoftToken(token: string) {
  try {
    // For Microsoft Graph API, we can use the token to get user info
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify Microsoft token');
    }

    return await response.json();
  } catch (error) {
    console.error('Microsoft token verification failed:', error);
    return null;
  }
}

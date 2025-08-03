import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface AppleTokenPayload extends jwt.JwtPayload {
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
  sub: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action = 'login' } = body; // action can be 'login' or 'register'

    if (!token) {
      return NextResponse.json({ error: 'Apple ID token is required' }, { status: 400 });
    }

    // Verify Apple ID token and get user info
    const appleUser = await verifyAppleToken(token);
    
    if (!appleUser) {
      return NextResponse.json({ error: 'Invalid Apple ID token' }, { status: 401 });
    }

    const { email, name, sub: appleId } = appleUser as AppleTokenPayload;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required for Apple authentication' }, { status: 400 });
    }
    
    const displayName = name ? `${name.firstName} ${name.lastName}`.trim() : email;

    if (action === 'register') {
      // Register new user with Apple ID
      try {
        const result = await authService.register({
          email,
          displayName,
          provider: 'apple',
          appleId,
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
      // Login with Apple ID
      try {
        // Try to find existing user and login
        const result = await authService.socialLogin('apple', appleId, email, displayName);

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
        return NextResponse.json({ error: error.message || 'Apple ID login failed' }, { status: 401 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

// Function to verify Apple ID token
async function verifyAppleToken(token: string) {
  try {
    // Create JWKS client for Apple's public keys
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
    });

    // Get the key ID from the token header
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new Error('Invalid token header');
    }

    // Get the signing key
    const key = await client.getSigningKey(decodedHeader.header.kid);
    const signingKey = key.getPublicKey();

    // Verify the token
    const decoded = jwt.verify(token, signingKey, {
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID, // Your Apple app's client ID
    });

    return decoded;
  } catch (error) {
    console.error('Apple ID token verification failed:', error);
    return null;
  }
}

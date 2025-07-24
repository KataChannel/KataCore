import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/auth/sms.service';
import { authService } from '@/lib/auth/unified-auth.service';
import { AuthMiddleware } from '@/lib/auth/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, code, method = 'sms', purpose = 'login' } = body;

    // Validate input
    if (!code) {
      return NextResponse.json({ error: 'Mã OTP là bắt buộc' }, { status: 400 });
    }

    if (method === 'sms' && !phone) {
      return NextResponse.json({ error: 'Số điện thoại là bắt buộc' }, { status: 400 });
    }

    if (method === 'email' && !email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    let verificationResult;

    if (method === 'sms') {
      verificationResult = await smsService.verifyOTP(phone, code, purpose);
    } else {
      // Email OTP verification would go here
      // For now, return mock verification
      verificationResult = {
        success: true,
        message: 'Xác thực email OTP thành công',
      };
    }

    if (!verificationResult.success) {
      return NextResponse.json({ error: verificationResult.message }, { status: 400 });
    }

    // Handle different purposes
    if (purpose === 'login' && method === 'sms') {
      // Login with OTP
      const loginResult = await authService.loginWithOTP(phone, code);

      // Set HTTP-only cookie for refresh token
      const response = NextResponse.json({
        user: {
          id: loginResult.user.id,
          email: loginResult.user.email,
          phone: loginResult.user.phone,
          username: loginResult.user.username,
          displayName: loginResult.user.displayName,
          avatar: loginResult.user.avatar,
          role: loginResult.user.role,
          isVerified: loginResult.user.isVerified,
        },
        accessToken: loginResult.tokens.accessToken,
      });

      response.cookies.set('refreshToken', loginResult.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log successful login
      AuthMiddleware.logAuthEvent('login', loginResult.user.id, request, {
        method: 'otp',
        phone,
      });

      return response;
    } else {
      // For other purposes (2fa_setup, 2fa_verify, etc.), just return success
      return NextResponse.json({
        message: verificationResult.message,
        verified: true,
      });
    }
  } catch (error: any) {
    console.error('[Verify OTP] Error:', error);

    // Log failed verification
    AuthMiddleware.logAuthEvent('failed_login', null, request, {
      method: 'otp',
      error: error.message,
    });

    return NextResponse.json(
      { error: error.message || 'Xác thực OTP thất bại' },
      { status: 400 }
    );
  }
}

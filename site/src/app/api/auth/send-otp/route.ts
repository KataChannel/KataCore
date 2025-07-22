import { NextRequest, NextResponse } from 'next/server';
import { smsService } from '@/lib/auth/sms.service';
import { AuthMiddleware } from '@/lib/auth/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    AuthMiddleware.validateRequest(request, 'otp');

    const body = await request.json();
    const { phone, email, method = 'sms', purpose = 'login' } = body;

    // Validate input
    if (method === 'sms' && !phone) {
      return NextResponse.json({ error: 'Số điện thoại là bắt buộc' }, { status: 400 });
    }

    if (method === 'email' && !email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    let result;

    if (method === 'sms') {
      result = await smsService.sendOTP(phone, purpose);
    } else {
      // Email OTP implementation would go here
      // For now, return mock success
      result = {
        success: true,
        message: 'OTP đã được gửi qua email',
        expiresIn: 300, // 5 minutes
      };
    }

    if (result.success) {
      // Log the event
      AuthMiddleware.logAuthEvent('otp_sent', null, request, {
        method,
        phone: method === 'sms' ? phone : undefined,
        email: method === 'email' ? email : undefined,
        purpose,
      });

      return NextResponse.json({
        message: result.message,
        expiresIn: result.expiresIn,
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Send OTP] Error:', error);
    
    if (error.message.includes('Too many attempts')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: error.message || 'Gửi OTP thất bại' },
      { status: 500 }
    );
  }
}

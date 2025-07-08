import { NextRequest, NextResponse } from 'next/server';
import authService from '../../../../lib/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const success = await authService.sendOTP(phone);

    if (success) {
      return NextResponse.json({
        message: 'OTP sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send OTP' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 400 }
    );
  }
}

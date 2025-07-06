import { NextRequest, NextResponse } from 'next/server';
import authService from '../../../../lib/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const result = await authService.refreshToken(refreshToken);

    return NextResponse.json({
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 401 }
    );
  }
}

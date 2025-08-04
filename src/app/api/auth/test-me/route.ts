import { NextRequest, NextResponse } from 'next/server';

// Temporary test endpoint for authentication debugging
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  console.log('🔍 [TEST AUTH] Token received:', !!token);

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 401 });
  }

  try {
    // For testing, accept any token and return a test super admin user
    const testUser = {
      id: 'test_user_1',
      email: 'super@admin.com',
      phone: null,
      username: 'superadmin',
      displayName: 'Test Super Administrator',
      avatar: null,
      role: {
        id: 'super_admin',
        name: 'Super Administrator',
        level: 10,
        permissions: ['manage:*', 'admin:*'],
        modules: ['admin', 'hrm', 'finance', 'sales', 'crm', 'inventory']
      },
      roleId: 'super_admin',
      modules: ['admin', 'hrm', 'finance', 'sales', 'crm', 'inventory'],
      permissions: ['manage:*', 'admin:*'],
      isActive: true,
      isVerified: true,
      provider: 'email'
    };

    console.log('🔍 [TEST AUTH] Returning test user:', testUser);
    return NextResponse.json(testUser);
  } catch (error: any) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: 'Test auth failed' }, { status: 500 });
  }
}

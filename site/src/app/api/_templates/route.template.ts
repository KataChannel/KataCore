// ============================================================================
// TAZA CORE UNIFIED API ROUTE TEMPLATE
// ============================================================================
// Copy this template for new API routes
// Follow TazaCore standards for consistency

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/auth/unified-auth.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const CreateSchema = z.object({
  // Define your schema here
  name: z.string().min(1),
});

const UpdateSchema = CreateSchema.partial();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================
async function withAuth(handler: Function, requiredPermission?: string) {
  return async (request: NextRequest) => {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const user = await authService.verifyToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Check permission if required
      if (requiredPermission && !authService.hasPermission(user, requiredPermission, 'resource')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      return handler(request, user);
    } catch (error) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================
async function handleGET(request: NextRequest, user?: any) {
  try {
    // Implementation here
    return NextResponse.json({ data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handlePOST(request: NextRequest, user?: any) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);

    // Implementation here
    return NextResponse.json({ data: validated }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
export const GET = withAuth(handleGET, 'read');
export const POST = withAuth(handlePOST, 'create');

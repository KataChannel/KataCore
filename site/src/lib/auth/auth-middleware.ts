import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/unified-auth.service';
import { AUTH_CONFIG } from '@/lib/auth/auth-config';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Authentication middleware for API routes
 */
export class AuthMiddleware {
  /**
   * Authenticate user from request headers
   */
  static async authenticate(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const decoded = await authService.verifyToken(token);
      const user = await authService.getUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return user;
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Check if user has required permission
   */
  static async authorize(user: any, permission: string) {
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    // Check for exact permission or wildcard permissions
    const hasPermission = user.permissions.some((p: string) => {
      if (p === permission) return true;
      if (p === '*:*') return true;
      
      const [action, resource] = permission.split(':');
      const [userAction, userResource] = p.split(':');
      
      if (userAction === '*' && userResource === resource) return true;
      if (userAction === action && userResource === '*') return true;
      
      return false;
    });

    return hasPermission;
  }

  /**
   * Check if user has minimum role level
   */
  static hasMinimumRoleLevel(user: any, minLevel: number): boolean {
    return user.role?.level >= minLevel;
  }

  /**
   * Rate limiting middleware
   */
  static rateLimit(
    identifier: string,
    type: keyof typeof AUTH_CONFIG.rateLimit | 'general' = 'login'
  ): { allowed: boolean; remaining: number; resetTime: number } {
    // Use 'login' config for 'general' type as fallback
    const configType = type === 'general' ? 'login' : type;
    const config = AUTH_CONFIG.rateLimit[configType];
    const now = Date.now();
    const key = `${type}:${identifier}`;
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    const allowed = entry.count <= config.maxAttempts;
    const remaining = Math.max(0, config.maxAttempts - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get client IP address
   */
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || real || 'unknown';
    return clientIP;
  }

  /**
   * Create authentication response with proper error handling
   */
  static createAuthResponse(error: Error, status: number = 401) {
    return NextResponse.json(
      { 
        error: error.message || 'Authentication failed',
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  /**
   * Middleware for protecting admin routes
   */
  static async requireAdmin(request: NextRequest) {
    try {
      const user = await this.authenticate(request);
      
      if (!this.hasMinimumRoleLevel(user, 7)) {
        throw new Error('Admin access required');
      }

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Middleware for protecting super admin routes
   */
  static async requireSuperAdmin(request: NextRequest) {
    try {
      const user = await this.authenticate(request);
      
      if (!this.hasMinimumRoleLevel(user, 10)) {
        throw new Error('Super admin access required');
      }

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Middleware for protecting manager routes
   */
  static async requireManager(request: NextRequest) {
    try {
      const user = await this.authenticate(request);
      
      if (!this.hasMinimumRoleLevel(user, 5)) {
        throw new Error('Manager access required');
      }

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Validate request with rate limiting
   */
  static validateRequest(
    request: NextRequest,
    type: keyof typeof AUTH_CONFIG.rateLimit | 'general' = 'login'
  ) {
    const clientIP = this.getClientIP(request);
    const rateLimit = this.rateLimit(clientIP, type);

    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toISOString();
      throw new Error(`Too many attempts. Try again after ${resetTime}`);
    }

    return rateLimit;
  }

  /**
   * Extract user device info from request
   */
  static getDeviceInfo(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const clientIP = this.getClientIP(request);
    
    return {
      userAgent,
      ip: clientIP,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log authentication event
   */
  static logAuthEvent(
    type: 'login' | 'logout' | 'register' | 'failed_login' | 'employee_created' | 'department_created' | 'user_created' | 'role_updated' | 'permission_changed' | 'otp_sent' | 'otp_verified',
    userId: string | null,
    request: NextRequest,
    additionalData?: any
  ) {
    const deviceInfo = this.getDeviceInfo(request);
    
    const logEntry = {
      type,
      userId,
      ...deviceInfo,
      ...additionalData,
    };

    // In production, send to your logging service
    console.log('[AUTH EVENT]', logEntry);
  }
}

/**
 * Helper function to create protected API routes
 */
export function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: {
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
    requireManager?: boolean;
    requiredPermission?: string;
    rateLimit?: keyof typeof AUTH_CONFIG.rateLimit | 'general';
  } = {}
) {
  return async (request: NextRequest) => {
    try {
      // Apply rate limiting if specified
      if (options.rateLimit) {
        AuthMiddleware.validateRequest(request, options.rateLimit);
      }

      // Authenticate user
      let user;
      if (options.requireSuperAdmin) {
        user = await AuthMiddleware.requireSuperAdmin(request);
      } else if (options.requireAdmin) {
        user = await AuthMiddleware.requireAdmin(request);
      } else if (options.requireManager) {
        user = await AuthMiddleware.requireManager(request);
      } else {
        user = await AuthMiddleware.authenticate(request);
      }

      // Check specific permission if required
      if (options.requiredPermission) {
        const hasPermission = await AuthMiddleware.authorize(user, options.requiredPermission);
        if (!hasPermission) {
          throw new Error(`Permission required: ${options.requiredPermission}`);
        }
      }

      // Call the actual handler
      return await handler(request, user);
    } catch (error: any) {
      AuthMiddleware.logAuthEvent('failed_login', null, request, { error: error.message });
      return AuthMiddleware.createAuthResponse(error, 401);
    }
  };
}

export default AuthMiddleware;

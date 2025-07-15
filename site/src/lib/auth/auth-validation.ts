// ============================================================================
// AUTH SYSTEM VALIDATION UTILITY
// ============================================================================
// Senior-level validation script to ensure auth system consistency

import type { 
  User, 
  LoginCredentials, 
  AuthContextType 
} from '@/types/auth';

/**
 * Validates auth system integrity
 */
export class AuthSystemValidator {
  static validateUserInterface(user: any): user is User {
    if (!user || typeof user !== 'object') return false;
    
    const requiredFields = ['id', 'displayName', 'roleId', 'isActive', 'isVerified', 'provider'];
    const optionalFields = ['email', 'phone', 'username', 'avatar', 'role', 'modules', 'permissions'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in user)) {
        console.error(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate role structure if present
    if (user.role && typeof user.role === 'object') {
      const roleFields = ['id', 'name', 'permissions', 'level'];
      for (const field of roleFields) {
        if (!(field in user.role)) {
          console.error(`❌ Missing role field: ${field}`);
          return false;
        }
      }
    }
    
    return true;
  }
  
  static validateLoginCredentials(credentials: any): credentials is LoginCredentials {
    if (!credentials || typeof credentials !== 'object') return false;
    
    // Must have at least one identifier
    const hasIdentifier = credentials.email || credentials.phone || credentials.username;
    if (!hasIdentifier) {
      console.error('❌ Login credentials must have email, phone, or username');
      return false;
    }
    
    if (!credentials.password) {
      console.error('❌ Login credentials must have password');
      return false;
    }
    
    return true;
  }
  
  static validateAuthContext(context: any): context is AuthContextType {
    if (!context || typeof context !== 'object') return false;
    
    const requiredMethods = [
      'login', 'logout', 'refreshAuth',
      'hasPermission', 'hasModuleAccess', 'canAccessRoute',
      'isSuperAdmin', 'isSystemAdmin', 'isManager', 'hasRole', 'hasMinimumRoleLevel'
    ];
    
    for (const method of requiredMethods) {
      if (typeof context[method] !== 'function') {
        console.error(`❌ Missing or invalid auth method: ${method}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Comprehensive auth system health check
   */
  static performHealthCheck() {
    console.log('🔍 Running Auth System Health Check...');
    
    try {
      // Check exports availability
      const unifiedAuth = require('@/components/auth/UnifiedAuthProvider');
      const compatAuth = require('@/hooks/useAuth');
      
      console.log('✅ UnifiedAuthProvider exports:', Object.keys(unifiedAuth));
      console.log('✅ Compatibility layer exports:', Object.keys(compatAuth));
      
      // Validate export consistency
      const unifiedExports = Object.keys(unifiedAuth);
      const compatExports = Object.keys(compatAuth);
      
      const missingInCompat = unifiedExports.filter(exp => !compatExports.includes(exp));
      if (missingInCompat.length > 0) {
        console.warn('⚠️ Missing in compatibility layer:', missingInCompat);
      }
      
      console.log('✅ Auth system health check completed');
      return true;
    } catch (error) {
      console.error('❌ Auth system health check failed:', error);
      return false;
    }
  }
}

/**
 * Development utility to log auth system status
 */
export function logAuthSystemStatus() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔐 Auth System Status');
    AuthSystemValidator.performHealthCheck();
    console.groupEnd();
  }
}

/**
 * Performance monitoring for auth operations
 */
export class AuthPerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  
  static startTimer(operation: string) {
    this.timers.set(operation, performance.now());
  }
  
  static endTimer(operation: string) {
    const start = this.timers.get(operation);
    if (start) {
      const duration = performance.now() - start;
      console.log(`⏱️ Auth operation "${operation}" took ${duration.toFixed(2)}ms`);
      this.timers.delete(operation);
      return duration;
    }
    return 0;
  }
}

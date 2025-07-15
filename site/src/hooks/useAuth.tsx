'use client';

// ============================================================================
// DEPRECATED AUTH HOOK - USE UnifiedAuthProvider INSTEAD
// ============================================================================
// This file is kept for backward compatibility only
// All new code should use @/components/auth/UnifiedAuthProvider

// Re-export from UnifiedAuthProvider for backward compatibility
export { 
  useUnifiedAuth as useAuth,
  UnifiedAuthProvider as AuthProvider,
  withAuth,
  PermissionGate,
  AccessBadge,
  LoginModal,
} from '@/components/auth/UnifiedAuthProvider';

// Re-export types from unified types
export type {
  User,
  UserRole,
  LoginCredentials,
  AuthContextType,
  WithAuthOptions,
  PermissionGateProps,
  AccessBadgeProps,
  LoginModalProps,
  // Legacy compatibility
  User as StandardUser,
  AuthUser, // For legacy components
} from '@/types/auth';

// Add deprecation warning
if (typeof window !== 'undefined') {
  console.warn('🚨 [DEPRECATED] hooks/useAuth.tsx is deprecated. Please use @/components/auth/UnifiedAuthProvider instead.');
}

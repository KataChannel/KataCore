// ============================================================================
// AUTH SYSTEM INDEX - CENTRALIZED EXPORTS
// ============================================================================
// Single import point for all auth-related functionality

// ============================================================================
// MAIN AUTH PROVIDER & HOOKS
// ============================================================================
export {
  UnifiedAuthProvider,
  UnifiedAuthProvider as AuthProvider,
  useUnifiedAuth,
  useUnifiedAuth as useAuth,
  useUnifiedPermissions,
  useUnifiedRoles,
  withAuth,
  PermissionGate,
  AccessBadge,
  LoginModal,
} from '@/components/auth/UnifiedAuthProvider';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type {
  User,
  UserRole,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
  AuthProvider as AuthProviderType,
  Permission,
  AuthSession,
  AuthError,
  WithAuthOptions,
  PermissionGateProps,
  AccessBadgeProps,
  LoginModalProps,
  // Legacy compatibility
  StandardUser,
  AuthUser,
  AuthContext,
  RegisterData,
  AuthState,
} from '@/types/auth';

// ============================================================================
// TYPE GUARDS & VALIDATION
// ============================================================================
export {
  isValidUser,
  isValidLoginCredentials,
} from '@/types/auth';

// ============================================================================
// VALIDATION & MONITORING
// ============================================================================
export {
  AuthSystemValidator,
  AuthPerformanceMonitor,
  logAuthSystemStatus,
} from '@/lib/auth/auth-validation';

// ============================================================================
// LEGACY COMPATIBILITY (DEPRECATED)
// ============================================================================
export {
  useAuth as useAuthDeprecated,
  AuthProvider as AuthProviderDeprecated,
} from '@/hooks/useAuth';

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-run health check in development
  import('@/lib/auth/auth-validation').then(({ logAuthSystemStatus }) => {
    logAuthSystemStatus();
  });
}

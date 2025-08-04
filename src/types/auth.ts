// ============================================================================
// UNIFIED AUTH TYPES - SINGLE SOURCE OF TRUTH
// ============================================================================
// This file defines the canonical auth interfaces used across the entire app
// DO NOT create duplicate User interfaces in other files - import from here

// ============================================================================
// CORE AUTH INTERFACES
// ============================================================================

/**
 * Unified User interface - canonical definition
 * Used across all auth systems (UnifiedAuthProvider, compatibility layer, etc.)
 */
export interface User {
  // Core identity
  id: string;
  email?: string | undefined;
  phone?: string | undefined;
  username?: string | undefined;
  displayName: string;
  avatar?: string | undefined;
  firstName?: string | undefined; // Optional for backward compatibility
  lastName?: string | undefined; // Optional for additional user info
  
  // Role & permissions
  roleId: string;
  role?: UserRole | undefined;
  modules?: string[] | undefined;
  permissions?: string[] | undefined;
  
  // Status & metadata
  isActive: boolean;
  isVerified: boolean;
  provider: string;
  
  // Timestamps (optional for backward compatibility)
  createdAt?: Date | string | undefined;
  updatedAt?: Date | string | undefined;
  lastLoginAt?: Date | string | undefined;
}

/**
 * User interface with guaranteed role - for use when role is required
 */
export interface UserWithRole extends User {
  role: UserRole;
}

/**
 * Role structure with permissions and hierarchy
 */
export interface UserRole {
  id: string;
  name: string;
  permissions: (string | Permission)[];
  level: number;
  description?: string;
  modules?: string[];
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: AuthProvider;
  rememberMe?: boolean;
  otpCode?: string; // For OTP login
}

/**
 * Registration data structure
 */
export interface RegisterCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  displayName: string;
  provider?: AuthProvider;
  acceptTerms?: boolean;
}

/**
 * Supported authentication providers
 */
export type AuthProvider = 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'microsoft';

/**
 * Permission structure for fine-grained access control
 */
export interface Permission {
  action: string;
  resource: string;
  scope?: 'own' | 'team' | 'department' | 'all';
}

/**
 * Auth context interface - defines all auth-related methods and state
 */
export interface AuthContextType {
  // User state
  user: User | null;
  loading: boolean;
  
  // Permission service
  permissionService: any | null; // TODO: Type this properly when UnifiedPermissionService is stable
  
  // Core auth methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithOTP: (phone: string, otpCode: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  
  // Permission methods
  hasPermission: (action: string, resource: string, scope?: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  
  // Role methods
  isSuperAdmin: () => boolean;
  isSystemAdmin: () => boolean;
  isManager: () => boolean;
  hasRole: (roleId: string) => boolean;
  hasMinimumRoleLevel: (level: number) => boolean;
  
  // Social auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
}

/**
 * Auth session data structure
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  issuedAt: Date;
}

/**
 * Auth error types for better error handling
 */
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface WithAuthOptions {
  requireAuth?: boolean;
  requireModule?: string;
  requirePermission?: { action: string; resource: string };
  requireRole?: string;
  requireMinLevel?: number;
  redirectTo?: string;
  fallback?: React.ComponentType;
}

export interface PermissionGateProps {
  children: React.ReactNode;
  action?: string;
  resource?: string;
  module?: string;
  role?: string;
  minLevel?: number;
  fallback?: React.ReactNode;
}

export interface AccessBadgeProps {
  module?: string;
  permission?: { action: string; resource: string };
  className?: string;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfterLogin?: string;
}

// ============================================================================
// TYPE GUARDS & VALIDATION
// ============================================================================

/**
 * Type guard to check if object is a valid User
 */
export function isValidUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.roleId === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.isVerified === 'boolean' &&
    typeof obj.provider === 'string' &&
    // firstName is optional
    (obj.firstName === undefined || typeof obj.firstName === 'string')
  );
}

/**
 * Type guard to check if object is valid LoginCredentials
 */
export function isValidLoginCredentials(obj: any): obj is LoginCredentials {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.email || obj.phone || obj.username) &&
    (obj.password || obj.otpCode) // Allow OTP login without password
  );
}

/**
 * Type guard to check if object is valid RegisterCredentials
 */
export function isValidRegisterCredentials(obj: any): obj is RegisterCredentials {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.displayName === 'string' &&
    (obj.email || obj.phone) && // Either email or phone required
    (obj.password || obj.provider !== 'email') && // Password required for email, optional for phone/social
    typeof obj.acceptTerms === 'boolean'
  );
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES (for gradual migration)
// ============================================================================

/**
 * @deprecated Use User instead
 */
export type StandardUser = User;

/**
 * @deprecated Use AuthContextType instead  
 */
export type AuthContext = AuthContextType;

/**
 * @deprecated Use User instead
 */
export interface AuthUser {
  id: string;
  email?: string;
  name: string; // Added for backward compatibility
  displayName: string;
  role: 'admin' | 'manager' | 'user'; // Legacy role format
  isActive?: boolean;
  isVerified?: boolean;
}

/**
 * @deprecated Use RegisterCredentials instead
 */
export interface RegisterData {
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  displayName: string;
  username?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  acceptTerms?: boolean;
}

/**
 * @deprecated Use AuthContextType loading instead
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================
export type {
  User as UnifiedUser,
  UserRole as UnifiedRole,
  LoginCredentials as UnifiedCredentials,
  RegisterCredentials as UnifiedRegister,
  AuthProvider as UnifiedProvider,
  Permission as UnifiedPermission,
  AuthSession as UnifiedSession,
  AuthError as UnifiedError,
};

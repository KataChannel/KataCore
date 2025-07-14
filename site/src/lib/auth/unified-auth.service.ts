// ============================================================================
// TAZA CORE UNIFIED AUTHENTICATION SERVICE
// ============================================================================
// Centralized authentication and authorization service
// Follows TazaCore standards for consistency and maintainability

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================
interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  displayName: string;
  avatar?: string;
  password?: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
    level: number;
  };
  modules?: string[];
  permissions?: string[];
  isActive: boolean;
  isVerified: boolean;
  provider: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  createdAt: Date;
  updatedAt: Date;
}

interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
}

interface RegisterData extends LoginCredentials {
  displayName: string;
  googleId?: string;
  facebookId?: string;
  appleId?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const LoginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    provider: z.enum(['email', 'phone', 'google', 'facebook', 'apple']).default('email'),
  })
  .refine((data) => data.email || data.phone || data.username, {
    message: 'Either email, phone, or username is required',
  });

const RegisterSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    displayName: z.string().min(1),
    provider: z.enum(['email', 'phone', 'google', 'facebook', 'apple']).default('email'),
    googleId: z.string().optional(),
    facebookId: z.string().optional(),
    appleId: z.string().optional(),
  })
  .refine((data) => data.email || data.phone || data.username, {
    message: 'Either email, phone, or username is required',
  })
  .refine((data) => (data.provider === 'email' ? !!data.password : true), {
    message: 'Password is required for email registration',
  });

// ============================================================================
// CONSTANTS
// ============================================================================
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_ACCESS_EXPIRES_IN = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES_IN = '7d'; // 7 days
const SALT_ROUNDS = 12;

// ============================================================================
// UNIFIED AUTHENTICATION SERVICE
// ============================================================================
export class UnifiedAuthService {
  private secret: Uint8Array;

  constructor() {
    this.secret = new TextEncoder().encode(JWT_SECRET);
  }

  // ==========================================================================
  // TOKEN MANAGEMENT
  // ==========================================================================

  /**
   * Generates JWT access token
   */
  async generateAccessToken(user: User): Promise<string> {
    return await new SignJWT({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      roleId: user.roleId,
      roleName: user.role?.name,
      roleLevel: user.role?.level,
      modules: user.modules || [],
      permissions: user.permissions || [],
      isActive: user.isActive,
      isVerified: user.isVerified,
      provider: user.provider,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_ACCESS_EXPIRES_IN)
      .setSubject(user.id)
      .sign(this.secret);
  }

  /**
   * Generates JWT refresh token
   */
  async generateRefreshToken(user: User): Promise<string> {
    return await new SignJWT({
      userId: user.id,
      tokenType: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
      .setSubject(user.id)
      .sign(this.secret);
  }

  /**
   * Verifies JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generates complete token set
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // ==========================================================================
  // PASSWORD MANAGEMENT
  // ==========================================================================

  /**
   * Hashes password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verifies password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // ==========================================================================
  // USER AUTHENTICATION
  // ==========================================================================

  /**
   * Authenticates user login
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Validate input
    const validatedCredentials = LoginSchema.parse(credentials);

    // Find user in database
    const user = await this.findUser(validatedCredentials);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password for email/username login
    if (validatedCredentials.provider === 'email' && validatedCredentials.password) {
      if (!user.password) {
        throw new Error('Password not set for this account');
      }

      const isPasswordValid = await this.verifyPassword(
        validatedCredentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login timestamp (implement in your database layer)
    await this.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Registers new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    // Validate input
    const validatedData = RegisterSchema.parse(data);

    // Check if user already exists
    const existingUser = await this.findUser({
      email: validatedData.email,
      phone: validatedData.phone,
      username: validatedData.username,
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (validatedData.password) {
      hashedPassword = await this.hashPassword(validatedData.password);
    }

    // Create user
    const newUser = await this.createUser({
      ...validatedData,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens(newUser);

    return {
      user: this.sanitizeUser(newUser),
      tokens,
    };
  }

  /**
   * Refreshes access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = await this.verifyToken(refreshToken);

    if (payload.tokenType !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await this.getUserById(payload.userId as string);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    return await this.generateTokens(user);
  }

  /**
   * Logs out user (invalidate tokens)
   */
  async logout(userId: string): Promise<void> {
    // In a production environment, you would:
    // 1. Add refresh token to blacklist
    // 2. Update user's last logout timestamp
    // 3. Optionally invalidate all sessions for the user

    await this.invalidateUserTokens(userId);
  }

  // ==========================================================================
  // OTP FUNCTIONALITY
  // ==========================================================================

  /**
   * Sends OTP to phone number
   */
  async sendOTP(phone: string): Promise<boolean> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP with expiration (implement in your storage layer)
      await this.storeOTP(phone, otp);

      // Send OTP via SMS (implement your SMS provider)
      await this.sendSMS(phone, `Your TazaCore verification code is: ${otp}`);

      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  }

  /**
   * Verifies OTP for phone number
   */
  async verifyOTP(phone: string, otpCode: string): Promise<AuthResult> {
    // Verify OTP
    const isValid = await this.validateOTP(phone, otpCode);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.findUser({ phone });
    if (!user) {
      // Create new user with phone verification
      user = await this.createUser({
        phone,
        displayName: phone, // Use phone as display name initially
        provider: 'phone',
        isVerified: true,
      });
    } else {
      // Mark phone as verified
      await this.markPhoneVerified(user.id);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  /**
   * Gets user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    // Implement database query
    // This is a placeholder - replace with your actual database implementation
    console.log(`Getting user by ID: ${userId}`);
    return null;
  }

  /**
   * Finds user by credentials
   */
  private async findUser(credentials: Partial<LoginCredentials>): Promise<User | null> {
    // Implement database query
    // This is a placeholder - replace with your actual database implementation
    console.log('Finding user with credentials:', credentials);
    return null;
  }

  /**
   * Creates new user
   */
  private async createUser(
    data: Partial<RegisterData & { password?: string; isVerified?: boolean }>
  ): Promise<User> {
    // Implement database creation
    // This is a placeholder - replace with your actual database implementation
    console.log('Creating user:', data);

    // Return mock user for now
    return {
      id: 'mock-user-id',
      email: data.email,
      phone: data.phone,
      username: data.username,
      displayName: data.displayName || 'New User',
      roleId: 'employee', // Default role
      isActive: true,
      isVerified: data.isVerified ?? data.provider === 'phone', // Phone users are verified via OTP
      provider: data.provider || 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Updates user's last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    // Implement database update
    console.log(`Updating last login for user: ${userId}`);
  }

  /**
   * Invalidates all tokens for a user
   */
  private async invalidateUserTokens(userId: string): Promise<void> {
    // Implement token invalidation
    console.log(`Invalidating tokens for user: ${userId}`);
  }

  /**
   * Removes sensitive data from user object
   */
  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  // ==========================================================================
  // OTP HELPERS
  // ==========================================================================

  /**
   * Stores OTP with expiration
   */
  private async storeOTP(phone: string, otp: string): Promise<void> {
    // Implement OTP storage (Redis, database, etc.)
    console.log(`Storing OTP for ${phone}: ${otp}`);
  }

  /**
   * Validates stored OTP
   */
  private async validateOTP(phone: string, otpCode: string): Promise<boolean> {
    // Implement OTP validation
    console.log(`Validating OTP for ${phone}: ${otpCode}`);
    return true; // Mock validation
  }

  /**
   * Marks phone as verified
   */
  private async markPhoneVerified(userId: string): Promise<void> {
    // Implement phone verification update
    console.log(`Marking phone verified for user: ${userId}`);
  }

  /**
   * Sends SMS (implement with your SMS provider)
   */
  private async sendSMS(phone: string, message: string): Promise<void> {
    // Implement SMS sending
    console.log(`Sending SMS to ${phone}: ${message}`);
  }

  // ==========================================================================
  // PERMISSION HELPERS
  // ==========================================================================

  /**
   * Checks if user has specific permission
   */
  hasPermission(user: User, action: string, resource: string): boolean {
    if (!user.permissions) return false;

    const exactPermission = `${action}:${resource}`;
    const wildcardPermissions = [`${action}:*`, `*:${resource}`, '*:*'];

    return (
      user.permissions.includes(exactPermission) ||
      wildcardPermissions.some((p) => user.permissions!.includes(p))
    );
  }

  /**
   * Checks if user has module access
   */
  hasModuleAccess(user: User, module: string): boolean {
    if (!user.modules) return false;
    return user.modules.includes(module) || user.modules.includes('*');
  }

  /**
   * Checks if user is super admin
   */
  isSuperAdmin(user: User): boolean {
    const superAdminRoles = ['super_admin', 'Super Administrator'];
    return superAdminRoles.includes(user.roleId) || superAdminRoles.includes(user.role?.name || '');
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const authService = new UnifiedAuthService();
export default authService;

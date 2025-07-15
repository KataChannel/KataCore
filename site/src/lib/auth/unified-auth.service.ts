// ============================================================================
// TAZA CORE UNIFIED AUTHENTICATION SERVICE
// ============================================================================
// Centralized authentication and authorization service
// Follows TazaCore standards for consistency and maintainability

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../prisma';

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

    // Create filtered credentials object
    const filteredCredentials: Partial<LoginCredentials> = {};
    if (validatedCredentials.email) filteredCredentials.email = validatedCredentials.email;
    if (validatedCredentials.phone) filteredCredentials.phone = validatedCredentials.phone;
    if (validatedCredentials.username) filteredCredentials.username = validatedCredentials.username;
    if (validatedCredentials.password) filteredCredentials.password = validatedCredentials.password;
    if (validatedCredentials.provider) filteredCredentials.provider = validatedCredentials.provider;

    // Find user in database
    const user = await this.findUser(filteredCredentials);
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

    // Create filtered credentials for checking existing user
    const existingUserCheck: Partial<LoginCredentials> = {};
    if (validatedData.email) existingUserCheck.email = validatedData.email;
    if (validatedData.phone) existingUserCheck.phone = validatedData.phone;
    if (validatedData.username) existingUserCheck.username = validatedData.username;

    // Check if user already exists
    const existingUser = await this.findUser(existingUserCheck);

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (validatedData.password) {
      hashedPassword = await this.hashPassword(validatedData.password);
    }

    // Create filtered data for user creation
    const createUserData: any = {
      displayName: validatedData.displayName,
      provider: validatedData.provider,
      isVerified: validatedData.provider === 'phone',
    };

    if (hashedPassword) {
      createUserData.password = hashedPassword;
    }

    if (validatedData.email) createUserData.email = validatedData.email;
    if (validatedData.phone) createUserData.phone = validatedData.phone;
    if (validatedData.username) createUserData.username = validatedData.username;
    if (validatedData.googleId) createUserData.googleId = validatedData.googleId;
    if (validatedData.facebookId) createUserData.facebookId = validatedData.facebookId;
    if (validatedData.appleId) createUserData.appleId = validatedData.appleId;

    // Create user
    const newUser = await this.createUser(createUserData);

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
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
        },
      });

      if (!user) return null;

      return this.transformPrismaUser(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Finds user by credentials
   */
  private async findUser(credentials: Partial<LoginCredentials>): Promise<User | null> {
    try {
      console.log('Finding user with credentials:', credentials);
      
      const where: any = {};
      
      if (credentials.email) {
        where.email = credentials.email;
      } else if (credentials.phone) {
        where.phone = credentials.phone;
      } else if (credentials.username) {
        where.username = credentials.username;
      }

      if (Object.keys(where).length === 0) {
        return null;
      }

      const user = await prisma.user.findFirst({
        where,
        include: {
          role: true,
        },
      });

      if (!user) {
        console.log('User not found in database');
        return null;
      }

      console.log('User found:', { id: user.id, email: user.email, role: user.role?.name });
      return this.transformPrismaUser(user);
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  /**
   * Creates new user
   */
  private async createUser(
    data: Partial<RegisterData & { password?: string; isVerified?: boolean }>
  ): Promise<User> {
    try {
      console.log('Creating user:', data);

      // Get default role (employee)
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'Employee' },
      });

      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      const userData: any = {
        displayName: data.displayName!,
        isVerified: data.isVerified ?? (data.provider === 'phone'),
        isActive: true,
        roleId: defaultRole.id,
      };

      // Only set fields if they have values
      if (data.email) userData.email = data.email;
      if (data.phone) userData.phone = data.phone;
      if (data.username) userData.username = data.username;
      if (data.password) userData.password = data.password;
      if (data.googleId) userData.googleId = data.googleId;
      if (data.facebookId) userData.facebookId = data.facebookId;
      if (data.appleId) userData.appleId = data.appleId;

      const newUser = await prisma.user.create({
        data: userData,
        include: {
          role: true,
        },
      });

      return this.transformPrismaUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Updates user's last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      });
      console.log(`Updated last login for user: ${userId}`);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Invalidates all tokens for a user
   */
  private async invalidateUserTokens(userId: string): Promise<void> {
    try {
      // Delete all sessions for the user
      await prisma.session.deleteMany({
        where: { userId },
      });
      console.log(`Invalidated tokens for user: ${userId}`);
    } catch (error) {
      console.error('Error invalidating tokens:', error);
    }
  }

  /**
   * Removes sensitive data from user object
   */
  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  /**
   * Transform Prisma user to internal User interface
   */
  private transformPrismaUser(prismaUser: any): User {
    let permissions: string[] = [];
    let role;

    if (prismaUser.role) {
      try {
        // Parse permissions from JSON string
        permissions = typeof prismaUser.role.permissions === 'string' 
          ? JSON.parse(prismaUser.role.permissions) 
          : (prismaUser.role.permissions || []);
      } catch (error) {
        console.error('Error parsing role permissions:', error);
        permissions = [];
      }

      // Determine role level based on role name
      let roleLevel = 1; // Default level
      switch (prismaUser.role.name) {
        case 'Super Administrator':
          roleLevel = 10;
          break;
        case 'System Administrator':
          roleLevel = 9;
          break;
        case 'Sales Manager':
        case 'HR Manager':
        case 'Finance Manager':
          roleLevel = 7;
          break;
        case 'Inventory Manager':
        case 'Department Manager':
          roleLevel = 6;
          break;
        case 'Team Lead':
          roleLevel = 4;
          break;
        case 'Employee':
          roleLevel = 2;
          break;
      }

      role = {
        id: prismaUser.role.id,
        name: prismaUser.role.name,
        permissions,
        level: roleLevel,
      };
    }

    return {
      id: prismaUser.id,
      email: prismaUser.email,
      phone: prismaUser.phone,
      username: prismaUser.username,
      displayName: prismaUser.displayName,
      avatar: prismaUser.avatar,
      password: prismaUser.password,
      roleId: prismaUser.roleId,
      role: role || undefined,
      modules: [], // TODO: Implement modules based on role
      permissions,
      isActive: prismaUser.isActive,
      isVerified: prismaUser.isVerified,
      provider: 'email', // Default provider, TODO: add to database schema
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
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

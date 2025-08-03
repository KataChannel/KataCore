import { prisma } from '../../shared/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use shared Prisma client

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  displayName: string;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  roleId: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  otpCode?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'microsoft';
  // Social login fields
  socialToken?: string;
  socialId?: string;
  // Additional metadata
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
  };
}

export interface RegisterData {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'microsoft';
  // Social login IDs
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  microsoftId?: string;
  // Additional fields
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  termsAccepted?: boolean;
  marketingOptIn?: boolean;
}

class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

  // Generate JWT tokens
  generateTokens(user: AuthUser) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        displayName: user.displayName,
        roleId: user.roleId,
        roleName: user.role?.name,
        roleLevel: user.role?.level,
        isActive: user.isActive,
        isVerified: user.isVerified,
        provider: user.provider,
        // Note: Removed permissions array to reduce token size
        // Permissions will be fetched server-side when needed
      },
      this.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign({ userId: user.id }, this.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register user with enhanced provider support
  async register(data: RegisterData): Promise<AuthUser> {
    const { 
      email, phone, username, password, displayName, 
      provider = 'email', googleId, facebookId, appleId, microsoftId,
      avatar, bio, firstName, lastName, termsAccepted = false
    } = data;

    // Validate required fields
    if (!displayName) {
      throw new Error('Display name is required');
    }

    if (!termsAccepted) {
      throw new Error('Terms and conditions must be accepted');
    }

    // Check if user exists with any of the provided identifiers
    const existingUserConditions = [];
    if (email) existingUserConditions.push({ email });
    if (phone) existingUserConditions.push({ phone });
    if (username) existingUserConditions.push({ username });
    if (googleId) existingUserConditions.push({ googleId });
    if (facebookId) existingUserConditions.push({ facebookId });
    if (appleId) existingUserConditions.push({ appleId });
    if (microsoftId) existingUserConditions.push({ microsoftId });

    if (existingUserConditions.length > 0) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: existingUserConditions,
        },
      });

      if (existingUser) {
        throw new Error('User already exists with provided credentials');
      }
    }

    // Get default role
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Prepare user data
    const userData: any = {
      displayName,
      roleId: defaultRole.id,
      isVerified: provider !== 'phone' && provider !== 'email', // Social logins are pre-verified
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optional fields
    if (email) userData.email = email;
    if (phone) userData.phone = phone;
    if (username) userData.username = username;
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (avatar) userData.avatar = avatar;
    if (bio) userData.bio = bio;
    if (googleId) userData.googleId = googleId;
    if (facebookId) userData.facebookId = facebookId;
    if (appleId) userData.appleId = appleId;
    if (microsoftId) userData.microsoftId = microsoftId;

    // Hash password if provided
    if (password) {
      userData.password = await this.hashPassword(password);
    }

    // Validate provider-specific requirements
    if (provider === 'email' && !email) {
      throw new Error('Email is required for email registration');
    }
    if (provider === 'phone' && !phone) {
      throw new Error('Phone is required for phone registration');
    }
    if (provider === 'email' && !password) {
      throw new Error('Password is required for email registration');
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      include: {
        role: true,
      },
    });

    return this.transformUserData(user);
  }

  // Login with email/username/phone with enhanced provider support
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: any }> {
    const { email, phone, username, password, provider = 'email', otpCode, socialToken, socialId } = credentials;

    // Handle social login
    if (provider !== 'email' && provider !== 'phone' && socialToken) {
      return this.socialLogin(provider, socialToken, socialId);
    }

    // Find user based on provider
    let whereCondition: any = {};
    
    if (provider === 'email' && email) {
      whereCondition = { email };
    } else if (provider === 'phone' && phone) {
      whereCondition = { phone };
    } else if (username) {
      whereCondition = { username };
    } else {
      // Fallback to OR condition for backward compatibility
      whereCondition = {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          username ? { username } : {}
        ].filter(obj => Object.keys(obj).length > 0),
      };
    }

    const user = await prisma.user.findFirst({
      where: whereCondition,
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Handle OTP verification for phone login
    if (provider === 'phone' && otpCode) {
      return this.verifyOTPLogin(user, otpCode);
    }

    // Verify password for email/username login
    if ((provider === 'email' || username) && password) {
      if (!user.password) {
        throw new Error('Password not set for this account');
      }

      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
    }

    // Generate tokens
    const transformedUser = this.transformUserData(user);
    const tokens = this.generateTokens(transformedUser);

    // Update last seen and login metadata
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastSeen: new Date(),
        // Could store device info here if needed
      },
    });

    return { user: transformedUser, tokens };
  }

  // Login with OTP (for phone)
  async loginWithOTP(phone: string, otpCode: string): Promise<{ user: AuthUser; tokens: any }> {
    const user = await prisma.user.findFirst({
      where: { phone },
      include: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new Error('OTP not generated');
    }

    if (user.otpCode !== otpCode) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > user.otpExpiry) {
      throw new Error('OTP expired');
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        isVerified: true,
        lastSeen: new Date(),
      },
    });

    const transformedUser = this.transformUserData(user);
    const tokens = this.generateTokens(transformedUser);
    return { user: transformedUser, tokens };
  }

  // Send OTP to phone with enhanced features
  async sendOTP(phone: string, purpose: 'login' | 'register' | 'verify' = 'login'): Promise<boolean> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check rate limiting (simple implementation)
    const recentOtpCount = await prisma.user.count({
      where: {
        phone,
        otpExpiry: {
          gt: new Date(Date.now() - 60000), // Last minute
        },
      },
    });

    if (recentOtpCount >= 3) {
      throw new Error('Too many OTP requests. Please wait before requesting another.');
    }

    let user;
    if (purpose === 'register') {
      // For registration, we might not have a user yet
      // Check if phone already exists
      const existingUser = await prisma.user.findFirst({
        where: { phone },
      });
      
      if (existingUser) {
        throw new Error('Phone number already registered');
      }
      
      // For registration flow, we'll handle user creation later
      user = null;
    } else {
      // For login/verify, user must exist
      user = await prisma.user.findFirst({
        where: { phone },
      });

      if (!user) {
        throw new Error('Phone number not registered');
      }
    }

    const otpCode = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode,
          otpExpiry,
        },
      });
    } else {
      // Store OTP temporarily for registration (could use Redis or temp table)
      // For now, we'll store in a simple way
      console.log(`📱 OTP for registration ${phone}: ${otpCode} (expires: ${otpExpiry})`);
    }

    // TODO: Implement actual SMS service (Twilio, AWS SNS, etc.)
    console.log(`📱 OTP sent to ${phone}: ${otpCode} (Purpose: ${purpose})`);
    
    // In production, you would integrate with:
    // - Twilio SMS API
    // - AWS SNS
    // - Firebase Cloud Messaging
    // - Or your preferred SMS provider

    return true;
  }

  // Validate phone number format
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation - you might want to use a library like libphonenumber-js
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  // Google OAuth login
  async googleLogin(
    googleId: string,
    email: string,
    displayName: string,
    avatar?: string
  ): Promise<{ user: AuthUser; tokens: any }> {
    return this.socialLogin('google', null, googleId, { email, displayName, avatar });
  }

  // Facebook OAuth login
  async facebookLogin(
    facebookId: string,
    email: string,
    displayName: string,
    avatar?: string
  ): Promise<{ user: AuthUser; tokens: any }> {
    return this.socialLogin('facebook', null, facebookId, { email, displayName, avatar });
  }

  // Apple OAuth login
  async appleLogin(
    appleId: string,
    email: string,
    displayName: string
  ): Promise<{ user: AuthUser; tokens: any }> {
    return this.socialLogin('apple', null, appleId, { email, displayName });
  }

  // Microsoft OAuth login
  async microsoftLogin(
    microsoftId: string,
    email: string,
    displayName: string,
    avatar?: string
  ): Promise<{ user: AuthUser; tokens: any }> {
    return this.socialLogin('microsoft', null, microsoftId, { email, displayName, avatar });
  }

  // Generic social login handler
  private async socialLogin(
    provider: 'google' | 'facebook' | 'apple' | 'microsoft',
    socialToken?: string | null,
    socialId?: string,
    userData?: { email?: string; displayName?: string; avatar?: string }
  ): Promise<{ user: AuthUser; tokens: any }> {
    const socialIdField = `${provider}Id`;
    
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          socialId ? { [socialIdField]: socialId } : {},
          userData?.email ? { email: userData.email } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
      include: { role: true },
    });

    if (!user) {
      // Create new user for social login
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'USER' },
      });

      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      const createData: any = {
        displayName: userData?.displayName || `${provider} User`,
        roleId: defaultRole.id,
        isVerified: true, // Social accounts are pre-verified
        [socialIdField]: socialId,
      };

      if (userData?.email) createData.email = userData.email;
      if (userData?.avatar) createData.avatar = userData.avatar;

      user = await prisma.user.create({
        data: createData,
        include: { role: true },
      });
    } else if (!user[socialIdField as keyof typeof user]) {
      // Link social account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { [socialIdField]: socialId },
        include: { role: true },
      });
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    const transformedUser = this.transformUserData(user);
    const tokens = this.generateTokens(transformedUser);
    return { user: transformedUser, tokens };
  }

  // Verify OTP for login
  private async verifyOTPLogin(user: any, otpCode: string): Promise<{ user: AuthUser; tokens: any }> {
    if (!user.otpCode || !user.otpExpiry) {
      throw new Error('OTP not generated or expired');
    }

    if (user.otpCode !== otpCode) {
      throw new Error('Invalid OTP code');
    }

    if (new Date() > user.otpExpiry) {
      throw new Error('OTP has expired');
    }

    // Clear OTP and mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
        isVerified: true,
        lastSeen: new Date(),
      },
    });

    const transformedUser = this.transformUserData(user);
    const tokens = this.generateTokens(transformedUser);
    return { user: transformedUser, tokens };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    return user ? this.transformUserData(user) : null;
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = this.generateTokens(user);
      return { accessToken: tokens.accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout
  async logout(userId: string): Promise<boolean> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });

    return true;
  }

  // Helper function to transform user data with permissions
  private transformUserData(user: any): AuthUser {
    return {
      ...user,
      role: {
        ...user.role,
        permissions: JSON.parse(user.role.permissions || '[]'),
      },
    };
  }
}

export const authService = new AuthService();
export default authService;

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Prisma client for server-side usage
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const globalWithPrisma = globalThis as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

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
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
}

export interface RegisterData {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  googleId?: string;
  facebookId?: string;
  appleId?: string;
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
        roleId: user.roleId,
        permissions: user.role.permissions 
      },
      this.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

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

  // Register user
  async register(data: RegisterData): Promise<AuthUser> {
    const { email, phone, username, password, displayName, provider = 'email' } = data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          username ? { username } : {},
        ],
      },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Get default role
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'USER' },
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    // Create user
    const hashedPassword = password ? await this.hashPassword(password) : null;
    
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        username,
        password: hashedPassword,
        displayName,
        roleId: defaultRole.id,
        isVerified: provider !== 'phone' && provider !== 'email',
        googleId: data.googleId,
        facebookId: data.facebookId,
        appleId: data.appleId,
      },
      include: {
        role: true,
      },
    });

    return this.transformUserData(user);
  }

  // Login with email/username/phone
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: any }> {
    const { email, phone, username, password, provider = 'email' } = credentials;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
          username ? { username } : {},
        ],
      },
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

    // Verify password for email/username login
    if (provider === 'email' && password) {
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

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
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

  // Send OTP to phone
  async sendOTP(phone: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const otpCode = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiry,
      },
    });

    // TODO: Implement SMS service (Twilio, AWS SNS, etc.)
    console.log(`OTP for ${phone}: ${otpCode}`);
    
    return true;
  }

  // Google OAuth login
  async googleLogin(googleId: string, email: string, displayName: string): Promise<{ user: AuthUser; tokens: any }> {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
      include: { role: true },
    });

    if (!user) {
      // Create new user
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'USER' },
      });

      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      user = await prisma.user.create({
        data: {
          email,
          googleId,
          displayName,
          roleId: defaultRole.id,
          isVerified: true,
        },
        include: { role: true },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: { role: true },
      });
    }

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
        permissions: JSON.parse(user.role.permissions || '[]')
      }
    };
  }
}

export const authService = new AuthService();
export default authService;

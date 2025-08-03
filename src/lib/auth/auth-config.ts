// Authentication Configuration for TazaCore
// Centralized configuration for all authentication providers and settings

export const AUTH_CONFIG = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'tazacore.com',
    audience: 'tazacore-users',
  },

  // Password Requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    allowedSpecialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  },

  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 5,
    maxAttempts: 3,
    cooldownMinutes: 1,
  },

  // Social Login Providers
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scopes: ['email', 'profile'],
    },
    facebook: {
      enabled: true,
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      version: 'v18.0',
      scopes: ['email'],
    },
    apple: {
      enabled: true,
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
      redirectUri: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI,
      scopes: ['email', 'name'],
    },
    microsoft: {
      enabled: true,
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
      authority: 'https://login.microsoftonline.com/common',
      scopes: ['user.read'],
    },
  },

  // Session Configuration
  session: {
    cookieName: 'taza-session',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },

  // Rate Limiting
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
    },
    otp: {
      windowMs: 60 * 1000, // 1 minute
      maxAttempts: 3,
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 10,
    },
  },

  // Security Settings
  security: {
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxConcurrentSessions: 5,
    enableTwoFactor: false,
    enableDeviceTracking: true,
  },

  // Default User Settings
  defaults: {
    role: 'Employee',
    isActive: true,
    isVerified: false,
    avatar: null,
    modules: ['dashboard'],
    permissions: ['read:profile'],
  },

  // Validation Patterns
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
  },

  // Error Messages
  errors: {
    invalidCredentials: 'Email/Phone và mật khẩu không chính xác',
    userNotFound: 'Không tìm thấy tài khoản',
    userExists: 'Tài khoản đã tồn tại',
    accountDeactivated: 'Tài khoản đã bị vô hiệu hóa',
    passwordTooWeak: 'Mật khẩu không đủ mạnh',
    invalidOTP: 'Mã OTP không chính xác hoặc đã hết hạn',
    otpExpired: 'Mã OTP đã hết hạn',
    tooManyAttempts: 'Quá nhiều lần thử. Vui lòng đợi và thử lại.',
    socialLoginFailed: 'Đăng nhập bằng mạng xã hội thất bại',
    tokenExpired: 'Phiên đăng nhập đã hết hạn',
    insufficientPermissions: 'Không có quyền truy cập',
  },

  // Success Messages
  messages: {
    loginSuccess: 'Đăng nhập thành công',
    registerSuccess: 'Đăng ký thành công',
    otpSent: 'Mã OTP đã được gửi',
    passwordChanged: 'Mật khẩu đã được thay đổi',
    profileUpdated: 'Thông tin cá nhân đã được cập nhật',
    logoutSuccess: 'Đăng xuất thành công',
  },
};

// Utility functions for validation
export const authValidators = {
  isValidEmail: (email: string): boolean => {
    return AUTH_CONFIG.validation.email.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    return AUTH_CONFIG.validation.phone.test(phone);
  },

  isValidUsername: (username: string): boolean => {
    return AUTH_CONFIG.validation.username.test(username);
  },

  isValidPassword: (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    const config = AUTH_CONFIG.password;

    if (password.length < config.minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${config.minLength} ký tự`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    if (config.requireSpecialChars) {
      const specialChars = config.allowedSpecialChars;
      const hasSpecialChar = specialChars.split('').some(char => password.includes(char));
      if (!hasSpecialChar) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  isValidOTP: (otp: string): boolean => {
    return otp.length === AUTH_CONFIG.otp.length && /^\d+$/.test(otp);
  },
};

// Provider-specific configurations
export const getProviderConfig = (provider: keyof typeof AUTH_CONFIG.socialProviders) => {
  return AUTH_CONFIG.socialProviders[provider];
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isDevelopment,
    isProduction,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    enableDebugLogs: isDevelopment,
    enableAnalytics: isProduction,
  };
};

export default AUTH_CONFIG;

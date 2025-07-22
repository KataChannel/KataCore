import { AUTH_CONFIG } from './auth-config';

interface SMSProvider {
  name: string;
  sendSMS: (phone: string, message: string) => Promise<boolean>;
}

interface OTPData {
  phone?: string;
  email?: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  purpose: 'login' | 'register' | '2fa_setup' | '2fa_verify' | 'password_reset';
}

// In-memory storage for development (use Redis in production)
const otpStore = new Map<string, OTPData>();

/**
 * SMS Service for OTP delivery
 */
export class SMSService {
  private static instance: SMSService;
  private providers: SMSProvider[] = [];

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  private initializeProviders() {
    // Mock SMS provider for development
    this.providers.push({
      name: 'mock',
      sendSMS: async (phone: string, message: string) => {
        console.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
        return true;
      },
    });

    // Add real SMS providers here
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.providers.push({
        name: 'twilio',
        sendSMS: this.sendTwilioSMS.bind(this),
      });
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.push({
        name: 'aws-sns',
        sendSMS: this.sendAWSSMS.bind(this),
      });
    }
  }

  /**
   * Generate and send OTP via SMS
   */
  async sendOTP(
    phone: string,
    purpose: OTPData['purpose'] = 'login'
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      // Validate phone number
      const phoneValidation = this.validatePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          message: phoneValidation.message,
        };
      }

      // Rate limiting check
      const rateLimitKey = `otp_rate_${phone}`;
      if (this.isRateLimited(rateLimitKey)) {
        return {
          success: false,
          message: 'Đã gửi quá nhiều OTP. Vui lòng thử lại sau.',
        };
      }

      // Generate OTP
      const code = this.generateOTP();
      const expiresAt = new Date(Date.now() + AUTH_CONFIG.otp.expirationTime);

      // Store OTP
      const otpKey = `${phone}_${purpose}`;
      otpStore.set(otpKey, {
        phone,
        code,
        expiresAt,
        attempts: 0,
        purpose,
      });

      // Prepare message
      const message = this.formatOTPMessage(code, purpose);

      // Send SMS
      const sent = await this.sendSMSWithFallback(phone, message);

      if (sent) {
        // Update rate limiting
        this.updateRateLimit(rateLimitKey);

        return {
          success: true,
          message: 'OTP đã được gửi thành công',
          expiresIn: AUTH_CONFIG.otp.expirationTime / 1000,
        };
      } else {
        return {
          success: false,
          message: 'Không thể gửi OTP. Vui lòng thử lại.',
        };
      }
    } catch (error: any) {
      console.error('[SMS Service] Send OTP error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống. Vui lòng thử lại sau.',
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(
    phone: string,
    code: string,
    purpose: OTPData['purpose'] = 'login'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otpKey = `${phone}_${purpose}`;
      const otpData = otpStore.get(otpKey);

      if (!otpData) {
        return {
          success: false,
          message: 'OTP không tồn tại hoặc đã hết hạn',
        };
      }

      // Check expiration
      if (new Date() > otpData.expiresAt) {
        otpStore.delete(otpKey);
        return {
          success: false,
          message: 'OTP đã hết hạn',
        };
      }

      // Check attempts
      if (otpData.attempts >= AUTH_CONFIG.otp.maxAttempts) {
        otpStore.delete(otpKey);
        return {
          success: false,
          message: 'Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới.',
        };
      }

      // Verify code
      if (otpData.code !== code) {
        otpData.attempts++;
        otpStore.set(otpKey, otpData);
        return {
          success: false,
          message: `Mã OTP không đúng. Còn ${AUTH_CONFIG.otp.maxAttempts - otpData.attempts} lần thử.`,
        };
      }

      // Success - remove OTP
      otpStore.delete(otpKey);
      return {
        success: true,
        message: 'Xác thực OTP thành công',
      };
    } catch (error: any) {
      console.error('[SMS Service] Verify OTP error:', error);
      return {
        success: false,
        message: 'Lỗi hệ thống. Vui lòng thử lại sau.',
      };
    }
  }

  /**
   * Send SMS with provider fallback
   */
  private async sendSMSWithFallback(phone: string, message: string): Promise<boolean> {
    for (const provider of this.providers) {
      try {
        console.log(`[SMS Service] Trying provider: ${provider.name}`);
        const success = await provider.sendSMS(phone, message);
        if (success) {
          console.log(`[SMS Service] Success with provider: ${provider.name}`);
          return true;
        }
      } catch (error) {
        console.error(`[SMS Service] Provider ${provider.name} failed:`, error);
      }
    }
    return false;
  }

  /**
   * Twilio SMS implementation
   */
  private async sendTwilioSMS(phone: string, message: string): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: phone,
            Body: message,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('[SMS Service] Twilio error:', error);
      return false;
    }
  }

  /**
   * AWS SNS SMS implementation
   */
  private async sendAWSSMS(phone: string, message: string): Promise<boolean> {
    try {
      // Implementation would use AWS SDK
      // This is a placeholder for AWS SNS integration
      console.log('[SMS Service] AWS SNS not implemented yet');
      return false;
    } catch (error) {
      console.error('[SMS Service] AWS SNS error:', error);
      return false;
    }
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Format OTP message based on purpose
   */
  private formatOTPMessage(code: string, purpose: OTPData['purpose']): string {
    const purposeTexts = {
      login: 'đăng nhập',
      register: 'đăng ký tài khoản',
      '2fa_setup': 'thiết lập xác thực 2 bước',
      '2fa_verify': 'xác thực 2 bước',
      'password_reset': 'đặt lại mật khẩu',
    };

    const purposeText = purposeTexts[purpose] || 'xác thực';
    const expireMinutes = AUTH_CONFIG.otp.expirationTime / (1000 * 60);

    return `Mã OTP ${purposeText} TazaCore: ${code}. Mã có hiệu lực ${expireMinutes} phút. Không chia sẻ mã này với ai.`;
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phone: string): { isValid: boolean; message: string } {
    // Vietnamese phone number validation
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        message: 'Số điện thoại không hợp lệ',
      };
    }

    return {
      isValid: true,
      message: 'Valid',
    };
  }

  /**
   * Rate limiting helpers
   */
  private isRateLimited(key: string): boolean {
    const rateData = this.getRateLimit(key);
    return rateData.count >= AUTH_CONFIG.rateLimit.otp.maxAttempts;
  }

  private getRateLimit(key: string): { count: number; resetTime: number } {
    const stored = localStorage.getItem(`rate_${key}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (Date.now() < data.resetTime) {
        return data;
      }
    }
    return { count: 0, resetTime: Date.now() + AUTH_CONFIG.rateLimit.otp.windowMs };
  }

  private updateRateLimit(key: string): void {
    const rateData = this.getRateLimit(key);
    rateData.count++;
    localStorage.setItem(`rate_${key}`, JSON.stringify(rateData));
  }

  /**
   * Clean up expired OTPs (run periodically)
   */
  static cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [key, otpData] of otpStore.entries()) {
      if (now > otpData.expiresAt) {
        otpStore.delete(key);
      }
    }
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance();

// Clean up expired OTPs every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    SMSService.cleanupExpiredOTPs();
  }, 5 * 60 * 1000);
}

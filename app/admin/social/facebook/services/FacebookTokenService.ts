import { FacebookApiConfig } from '../types';

export class FacebookTokenService {
  private static readonly TOKEN_EXPIRY_WARNING_DAYS = 7;
  private static readonly LONG_LIVE_TOKEN_DURATION = 60; // 60 days

  static async exchangeForLongLiveToken(shortLiveToken: string, appId: string, appSecret: string): Promise<{
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${shortLiveToken}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type || 'bearer'
      };
    } catch (error) {
      console.error('Error exchanging for long live token:', error);
      throw error;
    }
  }

  static async validateToken(accessToken: string): Promise<{
    isValid: boolean;
    expiresAt?: Date;
    scopes?: string[];
    appId?: string;
    userId?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/debug_token?` +
        `input_token=${accessToken}&` +
        `access_token=${accessToken}`
      );

      if (!response.ok) {
        return { isValid: false, error: `HTTP error! status: ${response.status}` };
      }

      const result = await response.json();
      
      if (result.error) {
        return { isValid: false, error: result.error.message };
      }

      const data = result.data;
      
      return {
        isValid: data.is_valid,
        expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
        scopes: data.scopes,
        appId: data.app_id,
        userId: data.user_id
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static getTokenExpiryStatus(expiresAt: Date): {
    status: 'valid' | 'warning' | 'expired';
    daysRemaining: number;
    message: string;
  } {
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining <= 0) {
      return {
        status: 'expired',
        daysRemaining: 0,
        message: 'Token has expired'
      };
    }

    if (daysRemaining <= this.TOKEN_EXPIRY_WARNING_DAYS) {
      return {
        status: 'warning',
        daysRemaining,
        message: `Token expires in ${daysRemaining} day(s)`
      };
    }

    return {
      status: 'valid',
      daysRemaining,
      message: `Token valid for ${daysRemaining} days`
    };
  }

  static saveTokenData(tokenData: {
    accessToken: string;
    expiresAt?: Date;
    tokenType?: string;
    scopes?: string[];
  }): void {
    if (typeof window === 'undefined') return;

    const data = {
      ...tokenData,
      savedAt: new Date().toISOString(),
      expiresAt: tokenData.expiresAt?.toISOString()
    };

    localStorage.setItem('facebook_token_data', JSON.stringify(data));
  }

  static getTokenData(): {
    accessToken?: string;
    expiresAt?: Date;
    tokenType?: string;
    scopes?: string[];
    savedAt?: Date;
  } | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem('facebook_token_data');
      if (!stored) return null;

      const data = JSON.parse(stored);
      return {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        savedAt: data.savedAt ? new Date(data.savedAt) : undefined
      };
    } catch (error) {
      console.error('Error loading token data:', error);
      return null;
    }
  }

  static clearTokenData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('facebook_token_data');
  }
}

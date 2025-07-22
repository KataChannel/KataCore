'use client';

import React, { useState } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon,
  PhoneIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { SocialLoginPanel } from './SocialLoginButton';
import { authValidators } from '@/lib/auth/auth-config';

interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  otpCode?: string;
}

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function LoginForm({ onLogin, onBack, loading = false }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'username'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    otpCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);

  // OTP Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsValidating(true);

    // Enhanced validation based on login method
    if (loginMethod === 'phone' && isOtpSent) {
      if (!formData.phone || !formData.otpCode) {
        setError('Số điện thoại và mã OTP là bắt buộc');
        setIsValidating(false);
        return;
      }
      if (!authValidators.isValidPhone(formData.phone)) {
        setError('Số điện thoại không hợp lệ');
        setIsValidating(false);
        return;
      }
      if (!authValidators.isValidOTP(formData.otpCode)) {
        setError('Mã OTP phải có 6 chữ số');
        setIsValidating(false);
        return;
      }
    } else {
      if (loginMethod === 'email') {
        if (!formData.email || !formData.password) {
          setError('Email và mật khẩu là bắt buộc');
          setIsValidating(false);
          return;
        }
        if (!authValidators.isValidEmail(formData.email)) {
          setError('Email không hợp lệ');
          setIsValidating(false);
          return;
        }
      } else if (loginMethod === 'phone' && !formData.phone) {
        setError('Số điện thoại là bắt buộc');
        setIsValidating(false);
        return;
      } else if (loginMethod === 'username') {
        if (!formData.username || !formData.password) {
          setError('Tên đăng nhập và mật khẩu là bắt buộc');
          setIsValidating(false);
          return;
        }
        if (!authValidators.isValidUsername(formData.username)) {
          setError('Tên đăng nhập không hợp lệ (3-20 ký tự, chỉ chữ, số và _)');
          setIsValidating(false);
          return;
        }
      }
    }

    try {
      const credentials: LoginCredentials = {
        provider: loginMethod === 'phone' ? 'phone' : 'email',
      };

      if (loginMethod === 'email') {
        credentials.email = formData.email;
        credentials.password = formData.password;
      } else if (loginMethod === 'phone') {
        credentials.phone = formData.phone;
        if (isOtpSent) {
          credentials.otpCode = formData.otpCode;
        } else {
          credentials.password = formData.password;
        }
      } else if (loginMethod === 'username') {
        credentials.username = formData.username;
        credentials.password = formData.password;
      }

      await onLogin(credentials);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    try {
      // Call API to send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      if (response.ok) {
        setIsOtpSent(true);
        setOtpTimer(60); // 60 seconds countdown
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError('Failed to send OTP');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for password strength
    if (name === 'password' && value) {
      const strength = authValidators.isValidPassword(value);
      setPasswordStrength(strength);
    } else if (name === 'password') {
      setPasswordStrength({ isValid: true, errors: [] });
    }

    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSocialLoginSuccess = async (data: any) => {
    try {
      setError(null);
      const credentials: LoginCredentials = {
        provider: data.provider || 'google',
        email: data.user.email,
      };
      await onLogin(credentials);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập bằng mạng xã hội thất bại');
    }
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple' | 'microsoft') => {
    try {
      setError(null);
      
      switch (provider) {
        case 'google':
          await handleGoogleLogin();
          break;
        case 'facebook':
          await handleFacebookLogin();
          break;
        case 'apple':
          await handleAppleLogin();
          break;
        case 'microsoft':
          await handleMicrosoftLogin();
          break;
        default:
          setError(`${provider} login is not yet implemented`);
      }
    } catch (err: any) {
      setError(err.message || `${provider} login failed`);
    }
  };

  const handleGoogleLogin = async () => {
    if (typeof window === 'undefined') return;
    
    // Check if Google API is loaded
    if (!window.google) {
      setError('Google login service is not available');
      return;
    }

    try {
      const { google } = window;
      
      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const result = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential }),
            });

            const data = await result.json();

            if (result.ok) {
              const credentials: LoginCredentials = {
                provider: 'google',
                email: data.user.email,
              };
              await onLogin(credentials);
            } else {
              setError(data.error || 'Google login failed');
            }
          } catch (error) {
            setError('Google login failed');
          }
        },
      });

      // Prompt for login
      google.accounts.id.prompt();
    } catch (error) {
      setError('Failed to initialize Google login');
    }
  };

  const handleFacebookLogin = async () => {
    if (typeof window === 'undefined') return;

    // Check if Facebook SDK is loaded
    if (!window.FB) {
      setError('Facebook login service is not available');
      return;
    }

    try {
      window.FB.login(async (response: any) => {
        if (response.authResponse) {
          try {
            const result = await fetch('/api/auth/facebook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.authResponse.accessToken }),
            });

            const data = await result.json();

            if (result.ok) {
              const credentials: LoginCredentials = {
                provider: 'facebook',
                email: data.user.email,
              };
              await onLogin(credentials);
            } else {
              setError(data.error || 'Facebook login failed');
            }
          } catch (error) {
            setError('Facebook login failed');
          }
        } else {
          setError('Facebook login was cancelled');
        }
      }, { scope: 'email' });
    } catch (error) {
      setError('Failed to initialize Facebook login');
    }
  };

  const handleAppleLogin = async () => {
    try {
      // Apple Sign-In would typically be handled by Apple's JS SDK
      setError('Apple login is not yet implemented. Please use email or phone login.');
    } catch (error) {
      setError('Apple login failed');
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      // Microsoft login would typically use MSAL.js
      setError('Microsoft login is not yet implemented. Please use email or phone login.');
    } catch (error) {
      setError('Microsoft login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
            <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setIsOtpSent(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setIsOtpSent(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Số điện thoại
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('username');
                setIsOtpSent(false);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'username'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Tên đăng nhập
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Login */}
            {loginMethod === 'email' && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập địa chỉ email của bạn"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu của bạn"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Phone Login */}
            {loginMethod === 'phone' && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại của bạn"
                    disabled={loading || isOtpSent}
                  />
                </div>

                {!isOtpSent ? (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu
                        <span className="text-sm text-gray-500 ml-2">(hoặc sử dụng OTP)</span>
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập mật khẩu hoặc nhấn 'Gửi OTP'"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || !formData.phone}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50"
                      >
                        Gửi mã OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Mã OTP
                    </label>
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      required
                      value={formData.otpCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mã OTP 6 số"
                      disabled={loading}
                      maxLength={6}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {otpTimer > 0 ? `Gửi lại sau ${otpTimer}s` : 'Có thể gửi lại'}
                      </span>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || otpTimer > 0}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50"
                      >
                        Gửi lại OTP
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Username Login */}
            {loginMethod === 'username' && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên đăng nhập của bạn"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu của bạn"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {(loginMethod !== 'phone' || !isOtpSent) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={(e) => e.preventDefault()}
                >
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>
            </div>
          </form>

          {/* Social Login */}
          <SocialLoginPanel
            onSuccess={handleSocialLoginSuccess}
            onError={handleSocialLoginError}
            disabled={loading || isValidating}
            title="Hoặc đăng nhập bằng"
            variant="icons"
            size="medium"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Liên hệ quản trị viên
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

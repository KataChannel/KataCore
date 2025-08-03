'use client';

import React, { useState } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon,
  PhoneIcon,
  UserIcon,
  EnvelopeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface RegisterCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  displayName: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
  googleId?: string;
  facebookId?: string;
  appleId?: string;
}

interface RegisterFormProps {
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export default function RegisterForm({ onRegister, onBack, loading = false }: RegisterFormProps) {
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone' | 'username'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({
    score: 0,
    feedback: [],
  });

  const validatePassword = (password: string) => {
    const checks = [
      { test: password.length >= 8, message: 'Ít nhất 8 ký tự' },
      { test: /[A-Z]/.test(password), message: 'Có chữ hoa' },
      { test: /[a-z]/.test(password), message: 'Có chữ thường' },
      { test: /\d/.test(password), message: 'Có số' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'Có ký tự đặc biệt' },
    ];

    const score = checks.filter(check => check.test).length;
    const feedback = checks.filter(check => !check.test).map(check => check.message);

    setPasswordStrength({ score, feedback });
    return score >= 4; // Require at least 4 out of 5 criteria
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.displayName.trim()) {
      setError('Tên hiển thị là bắt buộc');
      return;
    }

    // Method-specific validation
    if (registerMethod === 'email') {
      if (!formData.email || !formData.password) {
        setError('Email và mật khẩu là bắt buộc');
        return;
      }
      if (!validatePassword(formData.password)) {
        setError('Mật khẩu không đủ mạnh');
        return;
      }
    } else if (registerMethod === 'phone') {
      if (!formData.phone) {
        setError('Số điện thoại là bắt buộc');
        return;
      }
      if (formData.password && !validatePassword(formData.password)) {
        setError('Mật khẩu không đủ mạnh');
        return;
      }
    } else if (registerMethod === 'username') {
      if (!formData.username || !formData.password) {
        setError('Tên đăng nhập và mật khẩu là bắt buộc');
        return;
      }
      if (!validatePassword(formData.password)) {
        setError('Mật khẩu không đủ mạnh');
        return;
      }
    }

    // Password confirmation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const credentials: RegisterCredentials = {
        displayName: formData.displayName,
        provider: registerMethod === 'phone' ? 'phone' : 'email',
      };

      if (registerMethod === 'email') {
        credentials.email = formData.email;
        credentials.password = formData.password;
      } else if (registerMethod === 'phone') {
        credentials.phone = formData.phone;
        if (formData.password) {
          credentials.password = formData.password;
        }
      } else if (registerMethod === 'username') {
        credentials.username = formData.username;
        credentials.password = formData.password;
      }

      await onRegister(credentials);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      // Implement social registration logic here
      setError('Đăng ký bằng mạng xã hội chưa được triển khai');
    } catch (err: any) {
      setError(err.message || 'Đăng ký bằng mạng xã hội thất bại');
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return 'Yếu';
    if (score < 4) return 'Trung bình';
    return 'Mạnh';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản mới</h2>
            <p className="text-gray-600 mt-2">Đăng ký để truy cập hệ thống</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Register Method Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('email');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                registerMethod === 'email'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('phone');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                registerMethod === 'phone'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              Số điện thoại
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('username');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                registerMethod === 'username'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Tên đăng nhập
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Tên hiển thị <span className="text-red-500">*</span>
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập tên hiển thị của bạn"
                disabled={loading}
              />
            </div>

            {/* Method-specific fields */}
            {registerMethod === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ email của bạn"
                  disabled={loading}
                />
              </div>
            )}

            {registerMethod === 'phone' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại của bạn"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bạn sẽ nhận mã xác thực qua SMS
                </p>
              </div>
            )}

            {registerMethod === 'username' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập tên đăng nhập của bạn"
                  disabled={loading}
                />
              </div>
            )}

            {/* Password field (optional for phone registration) */}
            {(registerMethod !== 'phone' || formData.password) && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu {registerMethod === 'phone' ? '(tùy chọn)' : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required={registerMethod !== 'phone'}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={registerMethod === 'phone' ? 'Mật khẩu (tùy chọn)' : 'Nhập mật khẩu của bạn'}
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Độ mạnh mật khẩu:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score < 2 ? 'text-red-500' :
                          passwordStrength.score < 4 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Yêu cầu:</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {passwordStrength.feedback.map((feedback, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {feedback}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu {registerMethod === 'phone' && !formData.password ? '(tùy chọn)' : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={registerMethod !== 'phone' || !!formData.password}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nhập lại mật khẩu của bạn"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="mt-1 flex items-center text-green-600">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Mật khẩu khớp</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {registerMethod === 'phone' && !formData.password && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Nếu bạn không đặt mật khẩu, bạn sẽ cần sử dụng mã OTP để đăng nhập.
                </p>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Đặt mật khẩu
                </button>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{' '}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  'Đăng ký'
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>
            </div>
          </form>

          {/* Social Registration */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc đăng ký bằng</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialRegister('google')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialRegister('facebook')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialRegister('apple')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

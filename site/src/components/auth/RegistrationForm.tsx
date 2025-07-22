'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/auth';
import { SocialLoginButton } from './SocialLoginButton';
import { validateEmail, validatePhone, validatePassword, validateUsername } from '@/lib/auth/auth-config';

interface RegistrationFormProps {
  onClose?: () => void;
  redirectTo?: string;
  className?: string;
}

interface RegistrationData {
  email?: string;
  phone?: string;
  username?: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  provider: 'email' | 'phone';
}

export function RegistrationForm({ onClose, redirectTo = '/', className = '' }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    phone: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    provider: 'email',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register } = useUnifiedAuth();
  const router = useRouter();

  // Real-time validation
  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'email':
        if (formData.provider === 'email' && value) {
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid) {
            error = emailValidation.message;
          }
        }
        break;

      case 'phone':
        if (formData.provider === 'phone' && value) {
          const phoneValidation = validatePhone(value);
          if (!phoneValidation.isValid) {
            error = phoneValidation.message;
          }
        }
        break;

      case 'username':
        if (value) {
          const usernameValidation = validateUsername(value);
          if (!usernameValidation.isValid) {
            error = usernameValidation.message;
          }
        }
        break;

      case 'displayName':
        if (!value.trim()) {
          error = 'Tên hiển thị là bắt buộc';
        } else if (value.trim().length < 2) {
          error = 'Tên hiển thị phải có ít nhất 2 ký tự';
        }
        break;

      case 'password':
        if (value) {
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.isValid) {
            error = passwordValidation.message;
          }
          setPasswordStrength(passwordValidation.score);
        }
        break;

      case 'confirmPassword':
        if (value && value !== formData.password) {
          error = 'Mật khẩu xác nhận không khớp';
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (type !== 'checkbox') {
      validateField(name, value);
    }
  };

  const handleProviderChange = (provider: 'email' | 'phone') => {
    setFormData(prev => ({
      ...prev,
      provider,
      email: provider === 'email' ? prev.email : '',
      phone: provider === 'phone' ? prev.phone : '',
    }));
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields
      const requiredFields = ['displayName', 'password', 'confirmPassword'];
      if (formData.provider === 'email') {
        requiredFields.push('email');
      } else {
        requiredFields.push('phone');
      }

      let hasErrors = false;
      requiredFields.forEach(field => {
        const value = formData[field as keyof RegistrationData] as string;
        if (!validateField(field, value)) {
          hasErrors = true;
        }
      });

      if (!formData.acceptTerms) {
        setErrors(prev => ({
          ...prev,
          acceptTerms: 'Bạn phải đồng ý với điều khoản sử dụng',
        }));
        hasErrors = true;
      }

      if (hasErrors) {
        setLoading(false);
        return;
      }

      // Prepare registration data
      const registrationData = {
        displayName: formData.displayName.trim(),
        password: formData.password,
        provider: formData.provider,
        acceptTerms: formData.acceptTerms,
        ...(formData.provider === 'email' ? { email: formData.email } : { phone: formData.phone }),
        ...(formData.username && { username: formData.username }),
      };

      await register(registrationData);
      
      if (onClose) {
        onClose();
      } else {
        router.push(redirectTo);
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'Đăng ký thất bại. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 3) return 'bg-yellow-500';
    if (strength < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Yếu';
    if (strength < 3) return 'Trung bình';
    if (strength < 4) return 'Mạnh';
    return 'Rất mạnh';
  };

  return (
    <div className={`unified-card max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Đăng ký tài khoản</h2>
        <p className="text-text-secondary">Tạo tài khoản mới để truy cập TazaCore</p>
      </div>

      {errors.general && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
          {errors.general}
        </div>
      )}

      {/* Social Login Options */}
      <div className="mb-6">
        <SocialLoginButton mode="register" />
      </div>

      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-border"></div>
        <span className="mx-4 text-text-secondary text-sm">Hoặc đăng ký bằng</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Phương thức đăng ký
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="provider"
                value="email"
                checked={formData.provider === 'email'}
                onChange={() => handleProviderChange('email')}
                className="mr-2"
              />
              Email
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="provider"
                value="phone"
                checked={formData.provider === 'phone'}
                onChange={() => handleProviderChange('phone')}
                className="mr-2"
              />
              Số điện thoại
            </label>
          </div>
        </div>

        {/* Email or Phone Input */}
        {formData.provider === 'email' ? (
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Địa chỉ email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`unified-input ${errors.email ? 'border-error' : ''}`}
              placeholder="your.email@example.com"
              required
            />
            {errors.email && (
              <p className="text-error text-sm">{errors.email}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
              Số điện thoại *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`unified-input ${errors.phone ? 'border-error' : ''}`}
              placeholder="0123456789"
              required
            />
            {errors.phone && (
              <p className="text-error text-sm">{errors.phone}</p>
            )}
          </div>
        )}

        {/* Username (Optional) */}
        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-text-primary">
            Tên đăng nhập (tùy chọn)
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`unified-input ${errors.username ? 'border-error' : ''}`}
            placeholder="username123"
          />
          {errors.username && (
            <p className="text-error text-sm">{errors.username}</p>
          )}
        </div>

        {/* Display Name */}
        <div className="space-y-1">
          <label htmlFor="displayName" className="block text-sm font-medium text-text-primary">
            Tên hiển thị *
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className={`unified-input ${errors.displayName ? 'border-error' : ''}`}
            placeholder="Nguyen Van A"
            required
          />
          {errors.displayName && (
            <p className="text-error text-sm">{errors.displayName}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
            Mật khẩu *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`unified-input pr-10 ${errors.password ? 'border-error' : ''}`}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {formData.password && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-text-secondary">
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-error text-sm">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
            Xác nhận mật khẩu *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`unified-input ${errors.confirmPassword ? 'border-error' : ''}`}
            placeholder="••••••••"
            required
          />
          {errors.confirmPassword && (
            <p className="text-error text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="space-y-1">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
            <span className="text-sm text-text-secondary">
              Tôi đồng ý với{' '}
              <a href="/terms" className="text-accent hover:underline">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="/privacy" className="text-accent hover:underline">
                Chính sách bảo mật
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-error text-sm">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="unified-button accent w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang đăng ký...
            </div>
          ) : (
            'Đăng ký'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-text-secondary text-sm">
          Đã có tài khoản?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-accent hover:underline font-medium"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

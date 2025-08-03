'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUnifiedAuth } from '@/auth';

interface TwoFactorAuthProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode: 'setup' | 'verify';
  phoneNumber?: string;
  email?: string;
  className?: string;
}

interface OTPState {
  code: string[];
  timeLeft: number;
  canResend: boolean;
  sendCount: number;
}

export function TwoFactorAuth({ 
  onSuccess, 
  onCancel, 
  mode, 
  phoneNumber, 
  email,
  className = '' 
}: TwoFactorAuthProps) {
  const [otpState, setOtpState] = useState<OTPState>({
    code: ['', '', '', '', '', ''],
    timeLeft: 60,
    canResend: false,
    sendCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [method, setMethod] = useState<'sms' | 'email'>('sms');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user } = useUnifiedAuth();

  // Countdown timer
  useEffect(() => {
    if (otpState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setOtpState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          canResend: prev.timeLeft === 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpState.timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...otpState.code];
    newCode[index] = value;

    setOtpState(prev => ({
      ...prev,
      code: newCode,
    }));

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      handleVerifyOTP(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpState.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newCode = digits.split('');
      setOtpState(prev => ({
        ...prev,
        code: newCode,
      }));
      handleVerifyOTP(digits);
    }
  };

  const sendOTP = async () => {
    if (otpState.sendCount >= 3) {
      setError('Đã vượt quá số lần gửi OTP. Vui lòng thử lại sau.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          phone: method === 'sms' ? (phoneNumber || user?.phone) : undefined,
          email: method === 'email' ? (email || user?.email) : undefined,
          purpose: mode === 'setup' ? '2fa_setup' : '2fa_verify',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gửi OTP thất bại');
      }

      setSuccess(`OTP đã được gửi đến ${method === 'sms' ? 'số điện thoại' : 'email'} của bạn`);
      setOtpState(prev => ({
        ...prev,
        timeLeft: 60,
        canResend: false,
        sendCount: prev.sendCount + 1,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          code,
          method,
          purpose: mode === 'setup' ? '2fa_setup' : '2fa_verify',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Xác thực OTP thất bại');
      }

      setSuccess('Xác thực thành công!');
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error: any) {
      setError(error.message || 'Xác thực OTP thất bại');
      // Clear OTP on error
      setOtpState(prev => ({
        ...prev,
        code: ['', '', '', '', '', ''],
      }));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpState.code.join('');
    if (code.length === 6) {
      handleVerifyOTP(code);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`unified-card max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {mode === 'setup' ? 'Thiết lập xác thực 2 bước' : 'Xác thực 2 bước'}
        </h2>
        <p className="text-text-secondary">
          {mode === 'setup' 
            ? 'Chúng tôi sẽ gửi mã xác thực để thiết lập bảo mật cho tài khoản'
            : 'Nhập mã xác thực để hoàn tất đăng nhập'
          }
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-3">
          Phương thức nhận OTP
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('sms')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              method === 'sms'
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border hover:border-accent/50'
            }`}
          >
            <div className="text-center">
              <span className="block text-lg mb-1">📱</span>
              <span className="text-sm font-medium">SMS</span>
              {(phoneNumber || user?.phone) && (
                <p className="text-xs text-text-secondary mt-1">
                  {(phoneNumber || user?.phone)?.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                </p>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              method === 'email'
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border hover:border-accent/50'
            }`}
          >
            <div className="text-center">
              <span className="block text-lg mb-1">📧</span>
              <span className="text-sm font-medium">Email</span>
              {(email || user?.email) && (
                <p className="text-xs text-text-secondary mt-1">
                  {(email || user?.email)?.replace(/(.{2}).*(@.*)/, '$1****$2')}
                </p>
              )}
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary text-center">
            Nhập mã xác thực 6 số
          </label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otpState.code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOTPChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border-2 border-border rounded-lg focus:border-accent focus:outline-none transition-colors"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Timer and Resend */}
        <div className="text-center space-y-3">
          {otpState.timeLeft > 0 ? (
            <p className="text-text-secondary text-sm">
              Mã sẽ hết hạn sau: <span className="font-mono font-semibold">{formatTime(otpState.timeLeft)}</span>
            </p>
          ) : (
            <p className="text-text-secondary text-sm">Mã OTP đã hết hạn</p>
          )}

          <button
            type="button"
            onClick={sendOTP}
            disabled={!otpState.canResend || loading || otpState.sendCount >= 3}
            className="text-accent hover:underline text-sm font-medium disabled:text-text-secondary disabled:no-underline"
          >
            {otpState.sendCount === 0 ? 'Gửi mã OTP' : 'Gửi lại mã OTP'}
            {otpState.sendCount > 0 && ` (${otpState.sendCount}/3)`}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otpState.code.join('').length !== 6}
          className="unified-button accent w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang xác thực...
            </div>
          ) : (
            'Xác thực'
          )}
        </button>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="unified-button secondary w-full"
          >
            Hủy
          </button>
        )}
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-background-secondary rounded-lg">
        <p className="text-text-secondary text-sm text-center">
          💡 <strong>Mẹo:</strong> Bạn có thể dán mã OTP 6 số trực tiếp vào ô nhập đầu tiên
        </p>
      </div>
    </div>
  );
}

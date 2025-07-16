'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  PhoneXMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  BackspaceIcon
} from '@heroicons/react/24/outline';
import { useSIP } from '../hooks/useSIP';
import { SIPConfig } from '../types/callcenter.types';

interface SIPPhoneProps {
  config: SIPConfig;
  className?: string;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
}

export default function SIPPhone({ config, className = '', onStatusChange }: SIPPhoneProps) {
  const {
    isRegistered,
    currentSession,
    callStatus,
    callDuration,
    isConnecting,
    error,
    formatDuration,
    makeCall,
    answerCall,
    hangupCall,
    holdCall,
    unholdCall,
    sendDTMF,
    mute,
    unmute,
    initializeSIP
  } = useSIP(config);

  const [isMinimized, setIsMinimized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showDialpad, setShowDialpad] = useState(false);

  // Call onStatusChange callback when registration status changes
  useEffect(() => {
    if (onStatusChange) {
      if (isRegistered) {
        onStatusChange('connected');
      } else if (isConnecting) {
        onStatusChange('connecting');
      } else if (error) {
        onStatusChange('error');
      } else {
        onStatusChange('disconnected');
      }
    }
  }, [isRegistered, isConnecting, error, onStatusChange]);

  // Initialize SIP when component mounts
  useEffect(() => {
    initializeSIP();
  }, [initializeSIP]);

  // Dialpad numbers
  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleDialpadClick = (digit: string) => {
    if (currentSession) {
      // Send DTMF if in call
      sendDTMF(digit);
    } else {
      // Add to phone number if not in call
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber.trim()) {
      const success = makeCall(phoneNumber.trim());
      if (success) {
        setShowDialpad(false);
      }
    }
  };

  const handleHangup = () => {
    hangupCall();
    setPhoneNumber('');
    setIsMuted(false);
    setIsOnHold(false);
  };

  const handleMute = () => {
    if (isMuted) {
      unmute();
      setIsMuted(false);
    } else {
      mute();
      setIsMuted(true);
    }
  };

  const handleHold = () => {
    if (isOnHold) {
      unholdCall();
      setIsOnHold(false);
    } else {
      holdCall();
      setIsOnHold(true);
    }
  };

  const getCallStatusDisplay = () => {
    if (currentSession) {
      if (isOnHold) return 'Đang giữ máy';
      if (callDuration > 0) return `Đang gọi - ${formatDuration(callDuration)}`;
      return 'Đang kết nối...';
    }
    return callStatus || (isRegistered ? 'Sẵn sàng gọi' : 'Chưa kết nối');
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            currentSession 
              ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
              : isRegistered
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
        {currentSession && callDuration > 0 && (
          <div className="absolute -top-2 -left-2 bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow">
            {formatDuration(callDuration)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SIP Phone</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isRegistered
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : isConnecting
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {isRegistered ? 'Đã kết nối' : isConnecting ? 'Đang kết nối...' : 'Chưa kết nối'}
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Lỗi kết nối
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={initializeSIP}
                  className="bg-red-100 dark:bg-red-900 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Interface */}
      <div className="p-6">
        {/* Status Display */}
        <div className="text-center mb-6">
          <div className={`text-lg font-medium ${
            currentSession ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {getCallStatusDisplay()}
          </div>
          {currentSession && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {phoneNumber || 'Cuộc gọi đang diễn ra'}
            </div>
          )}
        </div>

        {/* Phone Number Input (when not in call) */}
        {!currentSession && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 text-lg text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={!isRegistered}
              />
              {phoneNumber && (
                <button
                  onClick={handleBackspace}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <BackspaceIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="space-y-4">
          {!currentSession ? (
            // Call Button
            <button
              onClick={handleCall}
              disabled={!isRegistered || !phoneNumber.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Gọi</span>
            </button>
          ) : (
            // In-Call Controls
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleMute}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  isMuted
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isMuted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                <span>{isMuted ? 'Bỏ tắt' : 'Tắt tiếng'}</span>
              </button>

              <button
                onClick={handleHold}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  isOnHold
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isOnHold ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
                <span>{isOnHold ? 'Tiếp tục' : 'Giữ máy'}</span>
              </button>

              <button
                onClick={() => setShowDialpad(!showDialpad)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Bàn số
              </button>

              <button
                onClick={handleHangup}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <PhoneXMarkIcon className="h-5 w-5" />
                <span>Kết thúc</span>
              </button>
            </div>
          )}
        </div>

        {/* Dialpad */}
        {(showDialpad || !currentSession) && (
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {dialpadNumbers.flat().map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDialpadClick(digit)}
                  className="aspect-square flex items-center justify-center text-xl font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
                  disabled={!isRegistered}
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isRegistered && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              {isConnecting ? 'Đang khởi tạo kết nối SIP...' : 'SIP chưa được kết nối. Vui lòng kiểm tra cấu hình.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

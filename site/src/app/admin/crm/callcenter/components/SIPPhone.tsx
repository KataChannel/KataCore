'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon,
  PhoneXMarkIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useSIP } from '../hooks/useSIP';
import { SIPConfig } from '../types/callcenter.types';

interface DialPadProps {
  onDigitPress: (digit: string) => void;
  disabled?: boolean;
}

function DialPad({ onDigitPress, disabled = false }: DialPadProps) {
  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {digits.flat().map((digit) => (
        <button
          key={digit}
          onClick={() => onDigitPress(digit)}
          disabled={disabled}
          className="h-12 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {digit}
        </button>
      ))}
    </div>
  );
}

interface CallControlsProps {
  isRegistered: boolean;
  currentSession: any;
  callStatus: string;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  onMakeCall: (number: string) => void;
  onAnswerCall: () => void;
  onHangupCall: () => void;
  onHoldCall: () => void;
  onUnholdCall: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onSendDTMF: (digit: string) => void;
}

function CallControls({
  isRegistered,
  currentSession,
  callStatus,
  callDuration,
  formatDuration,
  onMakeCall,
  onAnswerCall,
  onHangupCall,
  onHoldCall,
  onUnholdCall,
  onMute,
  onUnmute,
  onSendDTMF
}: CallControlsProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOnHold, setIsOnHold] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDialPad, setShowDialPad] = useState(false);

  const handleMakeCall = () => {
    if (phoneNumber.trim()) {
      onMakeCall(phoneNumber.trim());
      setPhoneNumber('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMakeCall();
    }
  };

  const handleDialPadDigit = (digit: string) => {
    if (currentSession) {
      // Send DTMF during call
      onSendDTMF(digit);
    } else {
      // Add to phone number when not in call
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleHold = () => {
    if (isOnHold) {
      onUnholdCall();
    } else {
      onHoldCall();
    }
    setIsOnHold(!isOnHold);
  };

  const handleMute = () => {
    if (isMuted) {
      onUnmute();
    } else {
      onMute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isRegistered 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isRegistered ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isRegistered ? 'SIP Connected' : 'SIP Disconnected'}
        </div>
        
        {callStatus && (
          <div className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {callStatus}
          </div>
        )}
        
        {currentSession && callDuration > 0 && (
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {formatDuration(callDuration)}
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      {!currentSession && (
        <div className="space-y-3">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter phone number"
            className="w-full px-4 py-3 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleMakeCall}
              disabled={!isRegistered || !phoneNumber.trim()}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Call</span>
            </button>
            
            <button
              onClick={() => setShowDialPad(!showDialPad)}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              123
            </button>
          </div>
        </div>
      )}

      {/* Active Call Controls */}
      {currentSession && (
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleHold}
              className={`p-3 rounded-full ${
                isOnHold 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={isOnHold ? 'Unhold' : 'Hold'}
            >
              {isOnHold ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleMute}
              className={`p-3 rounded-full ${
                isMuted 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowDialPad(!showDialPad)}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Keypad"
            >
              <span className="text-sm font-bold">123</span>
            </button>
            
            <button
              onClick={onHangupCall}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
              title="Hang up"
            >
              <PhoneXMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {currentSession.direction === 'incoming' && callStatus.includes('incoming') && (
            <div className="flex space-x-2">
              <button
                onClick={onAnswerCall}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
              >
                <PhoneIcon className="h-5 w-5" />
                <span>Answer</span>
              </button>
              
              <button
                onClick={onHangupCall}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700"
              >
                <PhoneXMarkIcon className="h-5 w-5" />
                <span>Decline</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dial Pad */}
      {showDialPad && (
        <div className="space-y-3">
          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentSession ? 'Send DTMF Tones' : 'Dial Number'}
          </div>
          <DialPad onDigitPress={handleDialPadDigit} />
        </div>
      )}
    </div>
  );
}

interface SIPPhoneProps {
  config: SIPConfig;
  className?: string;
}

export default function SIPPhone({ config, className = '' }: SIPPhoneProps) {
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

  useEffect(() => {
    // Load JsSIP library if not already loaded
    if (typeof window !== 'undefined' && !window.JsSIP) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jssip@3.10.0/dist/jssip.min.js';
      script.onload = () => {
        console.log('JsSIP library loaded');
      };
      script.onerror = () => {
        console.error('Failed to load JsSIP library');
      };
      document.head.appendChild(script);
    }
  }, []);

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`p-3 rounded-full shadow-lg ${
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
          <PhoneIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SIP Phone</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnecting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
            <button
              onClick={initializeSIP}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <CallControls
          isRegistered={isRegistered}
          currentSession={currentSession}
          callStatus={callStatus}
          callDuration={callDuration}
          formatDuration={formatDuration}
          onMakeCall={makeCall}
          onAnswerCall={answerCall}
          onHangupCall={hangupCall}
          onHoldCall={holdCall}
          onUnholdCall={unholdCall}
          onMute={mute}
          onUnmute={unmute}
          onSendDTMF={sendDTMF}
        />
      </div>

      {/* Hidden audio element for remote audio */}
      <audio id="remoteAudio" autoPlay />
    </div>
  );
}

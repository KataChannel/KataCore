import { useState, useEffect, useCallback, useRef } from 'react';
import { SIPService } from '../services/sip.service';
import { SIPConfig } from '../types/callcenter.types';

export function useSIP(config: SIPConfig) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [callStatus, setCallStatus] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sipServiceRef = useRef<SIPService | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCallTimer = useCallback(() => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setCallDuration(0);
    }
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const initializeSIP = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      sipServiceRef.current = new SIPService(config);
      
      sipServiceRef.current.setEventHandlers({
        onStatusChange: (status: string) => {
          setCallStatus(status);
        },
        onCallStateChange: (state: any) => {
          setCurrentSession(state.session);
          
          switch (state.status) {
            case 'connected':
              startCallTimer();
              break;
            case 'ended':
            case 'failed':
              stopCallTimer();
              setCurrentSession(null);
              break;
          }
        },
        onRegistrationChange: (registered: boolean) => {
          setIsRegistered(registered);
          if (!registered) {
            setCallStatus('');
          }
        }
      });

      await sipServiceRef.current.initialize();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to initialize SIP');
      console.error('SIP initialization failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [config, startCallTimer, stopCallTimer]);

  const makeCall = useCallback((phoneNumber: string) => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.makeCall(phoneNumber);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to make call');
      return false;
    }
  }, []);

  const answerCall = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.answerCall();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to answer call');
      return false;
    }
  }, []);

  const hangupCall = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      const result = sipServiceRef.current.hangupCall();
      stopCallTimer();
      setCurrentSession(null);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to hangup call');
      return false;
    }
  }, [stopCallTimer]);

  const holdCall = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.holdCall();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to hold call');
      return false;
    }
  }, []);

  const unholdCall = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.unholdCall();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to unhold call');
      return false;
    }
  }, []);

  const sendDTMF = useCallback((digit: string) => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.sendDTMF(digit);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send DTMF');
      return false;
    }
  }, []);

  const mute = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.mute();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mute call');
      return false;
    }
  }, []);

  const unmute = useCallback(() => {
    if (!sipServiceRef.current) {
      setError('SIP service not initialized');
      return false;
    }

    try {
      setError(null);
      return sipServiceRef.current.unmute();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to unmute call');
      return false;
    }
  }, []);

  useEffect(() => {
    initializeSIP();

    return () => {
      if (sipServiceRef.current) {
        sipServiceRef.current.destroy();
      }
      stopCallTimer();
    };
  }, [initializeSIP, stopCallTimer]);

  return {
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
  };
}

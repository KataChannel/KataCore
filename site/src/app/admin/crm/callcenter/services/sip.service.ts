import { SIPConfig } from '../types/callcenter.types';

declare global {
  var JsSIP: any;
}

export class SIPService {
  private userAgent: any = null;
  private currentSession: any = null;
  private isRegistered: boolean = false;
  private config: SIPConfig;
  private onStatusChange: ((status: string) => void) | undefined = undefined;
  private onCallStateChange: ((state: any) => void) | undefined = undefined;
  private onRegistrationChange: ((registered: boolean) => void) | undefined = undefined;

  constructor(config: SIPConfig) {
    this.config = config;
  }

  setEventHandlers(handlers: {
    onStatusChange?: (status: string) => void;
    onCallStateChange?: (state: any) => void;
    onRegistrationChange?: (registered: boolean) => void;
  }) {
    this.onStatusChange = handlers.onStatusChange;
    this.onCallStateChange = handlers.onCallStateChange;
    this.onRegistrationChange = handlers.onRegistrationChange;
  }

  async initialize(): Promise<void> {
    try {
      // Check if JsSIP is available
      if (typeof window === 'undefined' || !window.JsSIP) {
        throw new Error('JsSIP library not loaded');
      }

      const socket = new window.JsSIP.WebSocketInterface(this.config.ws_servers);
      const configuration: any = {
        sockets: [socket],
        uri: this.config.uri,
        password: this.config.password,
        register: true,
        session_timers: false,
        use_preloaded_route: false,
      };

      if (this.config.display_name) {
        configuration.display_name = this.config.display_name;
      }

      this.userAgent = new window.JsSIP.UA(configuration);

      // Set up event handlers
      this.userAgent.on('registered', () => {
        console.log('SIP registered successfully');
        this.isRegistered = true;
        this.onRegistrationChange?.(true);
        this.onStatusChange?.('Registered');
      });

      this.userAgent.on('unregistered', () => {
        console.log('SIP unregistered');
        this.isRegistered = false;
        this.onRegistrationChange?.(false);
        this.onStatusChange?.('Unregistered');
      });

      this.userAgent.on('registrationFailed', (e: any) => {
        console.error('SIP registration failed:', e);
        this.isRegistered = false;
        this.onRegistrationChange?.(false);
        this.onStatusChange?.('Registration Failed');
      });

      this.userAgent.on('newRTCSession', (e: any) => {
        this.handleNewSession(e.session);
      });

      this.userAgent.on('newMessage', (e: any) => {
        console.log('New message received:', e);
      });

      // Start the user agent
      this.userAgent.start();
    } catch (error) {
      console.error('Failed to initialize SIP:', error);
      throw error;
    }
  }

  private handleNewSession(session: any): void {
    this.currentSession = session;

    session.on('progress', () => {
      this.onStatusChange?.('Call in progress');
      this.onCallStateChange?.({
        status: 'progress',
        session: session,
        direction: session.direction
      });
    });

    session.on('accepted', () => {
      this.onStatusChange?.('Call connected');
      this.onCallStateChange?.({
        status: 'connected',
        session: session,
        direction: session.direction
      });
    });

    session.on('ended', () => {
      this.onStatusChange?.('Call ended');
      this.onCallStateChange?.({
        status: 'ended',
        session: null,
        direction: session.direction
      });
      this.currentSession = null;
    });

    session.on('failed', () => {
      this.onStatusChange?.('Call failed');
      this.onCallStateChange?.({
        status: 'failed',
        session: null,
        direction: session.direction
      });
      this.currentSession = null;
    });

    session.on('addstream', (e: any) => {
      // Handle remote audio stream
      const remoteAudio = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (remoteAudio && e.stream) {
        remoteAudio.srcObject = e.stream;
        remoteAudio.play().catch(console.error);
      }
    });
  }

  makeCall(phoneNumber: string): boolean {
    if (!this.userAgent || !this.isRegistered) {
      this.onStatusChange?.('SIP not registered');
      return false;
    }

    try {
      const target = `sip:${phoneNumber}@${this.config.uri.split('@')[1]}`;
      const options = {
        mediaConstraints: { audio: true, video: false },
        pcConfig: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }
      };

      const session = this.userAgent.call(target, options);
      this.currentSession = session;
      this.onStatusChange?.('Calling...');
      
      return true;
    } catch (error) {
      console.error('Error making call:', error);
      this.onStatusChange?.('Call failed');
      return false;
    }
  }

  answerCall(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      const options = {
        mediaConstraints: { audio: true, video: false }
      };
      this.currentSession.answer(options);
      return true;
    } catch (error) {
      console.error('Error answering call:', error);
      return false;
    }
  }

  hangupCall(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.terminate();
      this.currentSession = null;
      this.onStatusChange?.('Call ended');
      return true;
    } catch (error) {
      console.error('Error hanging up call:', error);
      return false;
    }
  }

  holdCall(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.hold();
      this.onStatusChange?.('Call on hold');
      return true;
    } catch (error) {
      console.error('Error holding call:', error);
      return false;
    }
  }

  unholdCall(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.unhold();
      this.onStatusChange?.('Call resumed');
      return true;
    } catch (error) {
      console.error('Error unholding call:', error);
      return false;
    }
  }

  sendDTMF(digit: string): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.sendDTMF(digit);
      return true;
    } catch (error) {
      console.error('Error sending DTMF:', error);
      return false;
    }
  }

  mute(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.mute({ audio: true });
      return true;
    } catch (error) {
      console.error('Error muting call:', error);
      return false;
    }
  }

  unmute(): boolean {
    if (!this.currentSession) {
      return false;
    }

    try {
      this.currentSession.unmute({ audio: true });
      return true;
    } catch (error) {
      console.error('Error unmuting call:', error);
      return false;
    }
  }

  getStatus(): {
    isRegistered: boolean;
    hasActiveCall: boolean;
    currentSession: any;
  } {
    return {
      isRegistered: this.isRegistered,
      hasActiveCall: this.currentSession !== null,
      currentSession: this.currentSession
    };
  }

  destroy(): void {
    if (this.currentSession) {
      this.currentSession.terminate();
    }
    if (this.userAgent) {
      this.userAgent.stop();
    }
    this.currentSession = null;
    this.userAgent = null;
    this.isRegistered = false;
  }
}

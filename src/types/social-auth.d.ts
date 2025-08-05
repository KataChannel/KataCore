// Type declarations for social login SDKs

interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id?: string;
            callback: (response: any) => void;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        config?: { 
          scope: string;
          return_scopes?: boolean;
          auth_type?: string;
        }
      ) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
      api: (
        path: string,
        method: string,
        params: any,
        callback: (response: any) => void
      ) => void;
      logout: (callback?: (response: any) => void) => void;
    };
    fbAsyncInit?: () => void;
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

// Facebook Types
interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
  };
}

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

// Google Types
interface GoogleCredentialResponse {
  credential: string;
}

// Apple Types
interface AppleSignInResponse {
  authorization: {
    id_token: string;
    code: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

export {};

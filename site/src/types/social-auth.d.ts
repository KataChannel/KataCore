// Type declarations for social login SDKs

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
        callback: (response: any) => void,
        config?: { scope: string }
      ) => void;
      api: (
        path: string,
        method: string,
        params: any,
        callback: (response: any) => void
      ) => void;
    };
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

export {};

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  displayName: string;
  avatar: string | null;
  isVerified: boolean;
  isAuthenticated: boolean;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithOTP: (phone: string, otpCode: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  accessToken: string | null;
}

interface LoginCredentials {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
}

interface RegisterData {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  displayName: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setAccessToken(token);
          // Verify token and get user info
          await getCurrentUser(token);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Get current user
  const getCurrentUser = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...userData,
          isAuthenticated: true,
        });
      } else {
        throw new Error('Failed to get user');
      }
    } catch (error) {
      console.error('Get user error:', error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setUser({
          ...data.user,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with OTP
  const loginWithOTP = async (
    phone: string,
    otpCode: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otpCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setUser({
          ...data.user,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setAccessToken(result.accessToken);
        setUser({
          ...result.user,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', result.accessToken);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  // Auto refresh token
  useEffect(() => {
    if (!accessToken) return;

    const refreshToken = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        logout();
      }
    };

    // Refresh token every 14 minutes (tokens expire in 15 minutes)
    const interval = setInterval(refreshToken, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const value = {
    user,
    login,
    loginWithOTP,
    register,
    sendOTP,
    logout,
    loading,
    accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

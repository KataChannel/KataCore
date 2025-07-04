'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
    email: string;
    isAuthenticated: boolean;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    loading: boolean;
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

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập từ localStorage
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (email: string, password: string): boolean => {
        // Demo credentials - trong thực tế sẽ gọi API
        const validCredentials = [
            { email: 'admin@example.com', password: 'admin123', role: 'admin' },
            { email: 'user@example.com', password: 'user123', role: 'user' },
            { email: 'manager@example.com', password: 'manager123', role: 'manager' }
        ];

        const validUser = validCredentials.find(
            cred => cred.email === email && cred.password === password
        );

        if (validUser) {
            const userData: User = { 
                email: validUser.email, 
                isAuthenticated: true,
                role: validUser.role
            };
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

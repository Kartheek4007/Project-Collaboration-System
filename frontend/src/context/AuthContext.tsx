import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'company_admin' | 'employee' | 'client';
    company_id: number | null;
    company_name?: string; // enriched client-side
    employee_id?: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'dark' | 'light'>(
        (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    );
    const navigate = useNavigate();

    // Enrich a user object with their company name if they belong to one
    const enrichWithCompany = async (u: User): Promise<User> => {
        if (!u.company_id) return u;
        try {
            const res = await companyApi.get(u.company_id);
            return { ...u, company_name: res.data.name };
        } catch {
            return u;
        }
    };

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                const parsed: User = JSON.parse(storedUser);
                // If company_name missing (old session), re-fetch
                if (parsed.company_id && !parsed.company_name) {
                    const enriched = await enrichWithCompany(parsed);
                    localStorage.setItem('user', JSON.stringify(enriched));
                    setUser(enriched);
                } else {
                    setUser(parsed);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const login = async (token: string, userData: User) => {
        localStorage.setItem('token', token);
        // Enrich with company name before storing
        const enriched = await enrichWithCompany(userData);
        localStorage.setItem('user', JSON.stringify(enriched));
        setUser(enriched);
        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (persist simplistic session in localStorage for reload)
        const storedUser = localStorage.getItem('tc_session_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username: string, pass: string) => {
        // Simulate delay
        await new Promise(r => setTimeout(r, 200));

        const validUser = storage.login(username, pass);
        if (validUser) {
            setUser(validUser);
            localStorage.setItem('tc_session_user', JSON.stringify(validUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tc_session_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

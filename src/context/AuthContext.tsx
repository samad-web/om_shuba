import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { dataService } from '../services/DataService';

interface AuthContextType {
    user: User | null;
    login: (username: string, pass: string) => Promise<User | null>;
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
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse session user", e);
                localStorage.removeItem('tc_session_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, pass: string): Promise<User | null> => {
        try {
            const validUser = await dataService.login(username, pass);
            if (validUser) {
                setUser(validUser);
                localStorage.setItem('tc_session_user', JSON.stringify(validUser));
                return validUser;
            }
        } catch (error) {
            console.error("Login error", error);
        }
        return null;
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

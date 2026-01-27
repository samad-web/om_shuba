import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ta';

interface SettingsContextType {
    theme: Theme;
    language: Language;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType>(null!);

import { translations } from '../i18n/translations';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Load theme from localStorage on initialization
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as Theme) || 'light';
    });
    const [language, setLanguageState] = useState<Language>(
        (localStorage.getItem('language') as Language) || 'en'
    );

    // Apply theme to document and persist to localStorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };


    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key name if not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <SettingsContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

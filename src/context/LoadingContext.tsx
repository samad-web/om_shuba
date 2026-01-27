import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    loadingMessage?: string;
    setLoadingMessage: (message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) throw new Error('useLoading must be used within LoadingProvider');
    return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>();

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
        if (!loading) setLoadingMessage(undefined);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage, setLoadingMessage }}>
            {children}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        padding: '2rem 3rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}>
                        <div className="spinner" style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid var(--border)',
                            borderTop: '4px solid var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        {loadingMessage && (
                            <p style={{
                                color: 'var(--text-main)',
                                fontWeight: 600,
                                margin: 0
                            }}>
                                {loadingMessage}
                            </p>
                        )}
                    </div>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
    showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getToastColor = (type: Toast['type']) => {
        switch (type) {
            case 'success': return { bg: '#dcfce7', border: '#16a34a', text: '#15803d' };
            case 'error': return { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' };
            case 'warning': return { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' };
            default: return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxWidth: '400px'
            }}>
                {toasts.map(toast => {
                    const colors = getToastColor(toast.type);
                    return (
                        <div
                            key={toast.id}
                            style={{
                                background: colors.bg,
                                border: `2px solid ${colors.border}`,
                                borderRadius: '12px',
                                padding: '1rem 1.25rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                animation: 'slideIn 0.3s ease-out',
                                cursor: 'pointer'
                            }}
                            onClick={() => removeToast(toast.id)}
                        >
                            <span style={{ fontSize: '1.25rem' }}>
                                {toast.type === 'success' && '✅'}
                                {toast.type === 'error' && '❌'}
                                {toast.type === 'warning' && '⚠️'}
                                {toast.type === 'info' && 'ℹ️'}
                            </span>
                            <span style={{
                                flex: 1,
                                color: colors.text,
                                fontWeight: 600,
                                fontSize: '0.95rem'
                            }}>
                                {toast.message}
                            </span>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

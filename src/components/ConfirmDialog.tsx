import React, { createContext, useContext, useState, useCallback } from 'react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
    return context;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        resolver?.(true);
        setIsOpen(false);
        setResolver(null);
    };

    const handleCancel = () => {
        resolver?.(false);
        setIsOpen(false);
        setResolver(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && options && (
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
                    zIndex: 9998,
                    padding: '1rem'
                }}>
                    <div className="card" style={{
                        maxWidth: '450px',
                        width: '100%',
                        padding: '2rem',
                        animation: 'scaleIn 0.2s ease-out'
                    }}>
                        <h3 style={{
                            marginBottom: '1rem',
                            fontSize: '1.25rem',
                            color: options.danger ? 'var(--danger)' : 'var(--text-main)'
                        }}>
                            {options.title}
                        </h3>
                        <p style={{
                            marginBottom: '2rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6
                        }}>
                            {options.message}
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                className="btn"
                                onClick={handleCancel}
                                style={{ minWidth: '100px' }}
                            >
                                {options.cancelText || 'Cancel'}
                            </button>
                            <button
                                className={`btn ${options.danger ? '' : 'btn-primary'}`}
                                onClick={handleConfirm}
                                style={{
                                    minWidth: '100px',
                                    ...(options.danger ? {
                                        background: 'var(--danger)',
                                        color: 'white'
                                    } : {})
                                }}
                            >
                                {options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes scaleIn {
                            from {
                                transform: scale(0.9);
                                opacity: 0;
                            }
                            to {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

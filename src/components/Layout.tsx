import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
            <header className="glass" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderBottom: '1px solid var(--border)',
                height: '72px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px var(--primary-glow)'
                        }}>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>O</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                OM SHUBA
                            </span>
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                                AGENCIES
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</span>
                            <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {user?.role?.replace('_', ' ')}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                background: 'transparent',
                                border: '1.5px solid var(--border)',
                                fontSize: '0.8125rem',
                                padding: '0.5rem 1.25rem',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            <main style={{
                flex: 1,
                paddingTop: '96px',
                paddingBottom: '2rem',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="container" style={{ flex: 1 }}>
                    <Outlet />
                </div>
            </main>

            <style>
                {`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none; }
                }
                `}
            </style>
        </div>
    );
};

export default Layout;

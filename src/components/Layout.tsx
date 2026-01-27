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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="glass-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: '8px' }}></div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                            OM SHUBA
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                padding: '0.5rem 1rem',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>
            <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

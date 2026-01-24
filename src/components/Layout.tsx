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
            <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                        TeleConnect
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {user?.name} ({user?.role})
                        </span>
                        <button onClick={handleLogout} className="btn" style={{ border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="container" style={{ flex: 1, padding: '2rem 1rem', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import SettingsToggle from '../components/SettingsToggle';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useSettings();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(username, password);
            if (user) {
                if (user.role === 'admin') navigate('/owner');
                else if (user.role === 'branch_admin') navigate('/admin');
                else navigate('/telecaller');
            } else {
                setError(t('login.error') + " (Check console for details)");
            }
        } catch (err: any) {
            setError(err.message || t('login.error'));
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, var(--primary-light), transparent), radial-gradient(circle at bottom left, var(--primary-glow), transparent), var(--bg-app)',
            padding: 'var(--space-4)',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                <SettingsToggle />
            </div>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '400px',
                padding: 'var(--space-12) var(--space-8)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 20px var(--primary-glow)'
                    }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '2rem' }}>O</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                        OM SHUBA
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {t('login.subtitle')}
                    </p>
                </div>

                {error && (
                    <div className="animate-fade-in" style={{
                        color: 'var(--danger)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius)',
                        marginBottom: 'var(--space-6)',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                        <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.7 }}>
                            Check browser console (F12) for technical details
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('common.username')}
                        </label>
                        <input
                            className="input"
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('common.password')}
                        </label>
                        <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '1rem' }}>
                        {t('common.login')}
                    </button>
                </form>
            </div>

            <p style={{ marginTop: 'var(--space-8)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                &copy; {new Date().getFullYear()} Om Shuba Agencies. All rights reserved.
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '10px', opacity: 0.5, color: 'var(--text-muted)' }}>
                Connection: {import.meta.env.VITE_USE_SUPABASE === 'true' ? 'Supabase' : 'LocalStorage'}
            </div>
        </div>
    );
};

export default Login;

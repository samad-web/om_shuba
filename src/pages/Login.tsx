import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (success) {
            // Navigation is handled by keying off the user state or simple redirection here
            // But we generally let the ProtectedRoute logic or useEffect handle it, 
            // or just force push here for simplicity.
            // We'll rely on the caller to know where to go, but since we don't know the role yet easily here without decoding,
            // we can just check the storage or wait. 
            // Actually, useAuth updates state.
            // Let's simplified:
            const userStr = localStorage.getItem('tc_users');
            const users = userStr ? JSON.parse(userStr) : [];
            const u = users.find((u: any) => u.username === username);
            if (u.role === 'admin') navigate('/admin');
            else navigate('/telecaller');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e0e7ff' }}>
            <div className="card" style={{ width: '100%', maxWidth: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
                        <input
                            className="input"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Use <b>admin/password</b> or <b>caller1/password</b>
                </div>
            </div>
        </div>
    );
};

export default Login;

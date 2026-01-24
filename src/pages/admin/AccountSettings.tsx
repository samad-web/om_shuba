import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

const AccountSettings: React.FC = () => {
    const { user } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', text: 'Passwords do not match!' });
            return;
        }

        if (newPassword.length < 4) {
            setMsg({ type: 'error', text: 'Password must be at least 4 characters.' });
            return;
        }

        storage.changeUserPassword(user.id, newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setMsg({ type: 'success', text: 'Password updated successfully! ✨' });

        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    return (
        <div style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Account Settings</h3>

            <div className="card">
                <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Change Security Password</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Ensure your account is protected with a strong, unique password.
                </p>

                <form onSubmit={handlePasswordChange}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
                        <input
                            className="input"
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Min 4 characters"
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Confirm New Password</label>
                        <input
                            className="input"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                        UPDATE PASSWORD
                    </button>

                    {msg.text && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            background: msg.type === 'success' ? '#dcfce7' : '#fef2f2',
                            color: msg.type === 'success' ? '#166534' : '#dc2626',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}>
                            {msg.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;

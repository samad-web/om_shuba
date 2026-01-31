import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/DataService';
import { useSettings } from '../../context/SettingsContext';

const AccountSettings: React.FC = () => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', text: t('settings.passwordMatchError') });
            return;
        }

        if (newPassword.length < 4) {
            setMsg({ type: 'error', text: t('settings.passwordLengthError') });
            return;
        }

        try {
            await dataService.updateUser({ ...user, password: newPassword });
            setNewPassword('');
            setConfirmPassword('');
            setMsg({ type: 'success', text: t('settings.passwordSuccess') });
        } catch (error) {
            console.error("Failed to update password", error);
            setMsg({ type: 'error', text: t('settings.passwordFail') });
        }

        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    return (
        <div style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>{t('settings.title')}</h3>

            <div className="card">
                <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>{t('settings.changePassword')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {t('settings.protectAccount')}
                </p>

                <form onSubmit={handlePasswordChange}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('settings.newPassword')}</label>
                        <input
                            className="input"
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder={t('settings.minChars')}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('settings.confirmPassword')}</label>
                        <input
                            className="input"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                        {t('settings.updatePassword')}
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

import React from 'react';
import { useSettings } from '../context/SettingsContext';

const SettingsToggle: React.FC = () => {
    const { theme, language, toggleTheme, setLanguage, t } = useSettings();

    return (
        <div className="settings-toggle" style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            padding: '0.6rem 0.8rem',
            borderRadius: '24px',
            background: 'var(--header-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'transform 0.2s ease'
        }}>
            <div className="language-switches" style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                    onClick={() => setLanguage('en')}
                    className={`btn ${language === 'en' ? 'btn-primary' : ''}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('ta')}
                    className={`btn ${language === 'ta' ? 'btn-primary' : ''}`}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                    தமிழ்
                </button>
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

            <button
                onClick={toggleTheme}
                className="btn"
                style={{
                    padding: '0.25rem',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '1.2rem'
                }}
                title={theme === 'light' ? t('common.dark') : t('common.light')}
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
    );
};

export default SettingsToggle;

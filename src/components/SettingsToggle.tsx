import React from 'react';
import { useSettings } from '../context/SettingsContext';

const SettingsToggle: React.FC = () => {
    const { theme, language, toggleTheme, setLanguage, t } = useSettings();

    return (
        <div className="settings-toggle" style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            padding: '0.4rem 0.6rem',
            borderRadius: '24px',
            background: 'var(--header-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'transform 0.2s ease',
            maxWidth: '100%',
            overflow: 'hidden'
        }}>
            <div className="language-switches" style={{ display: 'flex', gap: '0.2rem' }}>
                <button
                    onClick={() => setLanguage('en')}
                    className={`btn ${language === 'en' ? 'btn-primary' : ''}`}
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', minWidth: 'auto', height: 'auto' }}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('ta')}
                    className={`btn ${language === 'ta' ? 'btn-primary' : ''}`}
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', minWidth: 'auto', height: 'auto' }}
                >
                    தமிழ்
                </button>
            </div>

            <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

            <button
                onClick={toggleTheme}
                className="btn"
                style={{
                    padding: '0.2rem',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    minWidth: 'auto'
                }}
                title={theme === 'light' ? t('common.dark') : t('common.light')}
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
    );
};

export default SettingsToggle;

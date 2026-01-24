import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

import { useSettings } from '../../context/SettingsContext';

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const { t } = useSettings();

    const getNavItems = () => {
        if (user?.role === 'admin') { // This is our "Owner" role in mock data
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'branches', label: t('nav.branches'), icon: '🏢' },
                { id: 'users', label: 'Staff Management', icon: '👥' },
                { id: 'settings', label: t('common.settings'), icon: '⚙️' },
            ];
        }
        if (user?.role === 'branch_admin') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '🏢' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'conversions', label: 'Closed Deals', icon: '💰' },
            ];
        }
        if (user?.role === 'telecaller') {
            return [
                { id: 'dashboard', label: 'Capture & Stats', icon: '🖊️' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '🤝' },
                { id: 'conversions', label: 'Closed Deals', icon: '💰' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <div style={{
            width: '260px',
            background: '#064e3b',
            height: '100vh',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            zIndex: 100,
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌿</div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Om Shuba Agencies</span>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', opacity: 0.8 }}>
                {user?.role?.replace('_', ' ')} PORTAL
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.875rem',
                            padding: '0.875rem 1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === item.id ? 600 : 500,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', marginBottom: '1rem' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, var(--primary), #15803d)',
                        borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem'
                    }}>{user?.name?.[0]}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>Branch Access</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    🚪 {t('common.logout')}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onCollapseChange?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onCollapseChange }) => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getNavItems = () => {
        if (user?.role === 'admin') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'conversions', label: t('nav.conversions'), icon: '💰' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'branches', label: t('nav.branches'), icon: '🏢' },
                { id: 'promotions', label: t('nav.promotions'), icon: '📢' },
                { id: 'users', label: t('nav.users'), icon: '👥' },
            ];
        }
        if (user?.role === 'branch_admin') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '🏢' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'promotions', label: t('nav.promotions'), icon: '📢' },
                { id: 'conversions', label: t('nav.conversions'), icon: '💰' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    const handleToggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        onCollapseChange?.(newCollapsedState);
    };

    return (
        <nav
            className="glass sidebar-nav"
            style={{
                width: isCollapsed ? '72px' : '240px',
                height: 'calc(100vh - 104px)',
                position: 'fixed',
                left: 'var(--space-6)',
                top: '88px',
                borderRadius: 'var(--radius-lg)',
                padding: isCollapsed ? 'var(--space-4) var(--space-2)' : 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                border: '1px solid var(--border)',
                zIndex: 10,
                transition: 'width 300ms ease, padding 300ms ease'
            }}
        >
            {!isCollapsed && (
                <div style={{ padding: 'var(--space-2) var(--space-4)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Menu
                    </span>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="btn"
                        title={isCollapsed ? item.label : undefined}
                        style={{
                            width: '100%',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? 'white' : 'var(--text-main)',
                            border: 'none',
                            padding: isCollapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                            fontSize: '0.875rem',
                            boxShadow: activeTab === item.id ? '0 4px 12px var(--primary-glow)' : 'none',
                            transition: 'all 200ms ease'
                        }}
                    >
                        <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* Toggle Button */}
            <button
                onClick={handleToggleCollapse}
                className="btn"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    padding: 'var(--space-3)',
                    fontSize: '1rem',
                    marginTop: 'var(--space-2)',
                    transition: 'all 200ms ease'
                }}
            >
                <span style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 300ms ease', display: 'inline-block' }}>
                    ▶
                </span>
                {!isCollapsed && <span style={{ fontSize: '0.75rem', marginLeft: 'var(--space-2)' }}>Collapse</span>}
            </button>

            <style>
                {`
                @media (max-width: 1024px) {
                    nav.sidebar-nav {
                        width: 72px !important;
                        padding: var(--space-4) var(--space-2) !important;
                    }
                    nav.sidebar-nav span:not(:first-child) { display: none !important; }
                    nav.sidebar-nav div:first-child { display: none !important; }
                    nav.sidebar-nav button { justify-content: center !important; padding: var(--space-3) !important; }
                }
                @media (max-width: 768px) {
                    nav.sidebar-nav {
                        position: fixed;
                        bottom: var(--space-4);
                        top: auto;
                        left: var(--space-4);
                        right: var(--space-4);
                        width: auto !important;
                        height: 64px;
                        flex-direction: row;
                        justify-content: space-around;
                        padding: var(--space-1) !important;
                        border-radius: var(--radius-full);
                        box-shadow: var(--shadow-lg);
                    }
                    nav.sidebar-nav > div:first-child { display: none !important; }
                    nav.sidebar-nav > div:nth-child(2) { flex-direction: row !important; flex: 1; }
                    nav.sidebar-nav > button:last-child { display: none !important; }
                    nav.sidebar-nav button { flex: 1; height: 100%; border-radius: var(--radius-full); }
                }
                `}
            </style>
        </nav>
    );
};

export default Sidebar;

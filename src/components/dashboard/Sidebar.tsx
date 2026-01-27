import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const { t } = useSettings();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (user?.role === 'admin') { // This is our "Owner" role in mock data
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'branches', label: t('nav.branches'), icon: '🏢' },
                { id: 'promotions', label: t('nav.promotions'), icon: '📢' },
                { id: 'users', label: t('nav.users'), icon: '👥' },
                { id: 'settings', label: t('common.settings'), icon: '⚙️' },
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
        if (user?.role === 'telecaller') {
            return [
                { id: 'dashboard', label: t('nav.captureStats'), icon: '🖊️' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '🤝' },
                { id: 'conversions', label: t('nav.conversions'), icon: '💰' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    const handleItemClick = (id: string) => {
        setActiveTab(id);
        setIsMobileMenuOpen(false); // Close mobile menu on selection
    };

    return (
        <>
            {/* Hamburger Menu Button (Mobile Only) */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 1001,
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    width: '48px',
                    height: '48px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        display: 'none'
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <div
                style={{
                    width: '260px',
                    background: '#064e3b',
                    height: '100vh',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    flexShrink: 0,
                    transition: 'transform 0.3s ease'
                }}
                className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}
            >
                {/* User Info */}
                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}>
                    <div style={{
                        width: '60px', height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'white',
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85, textTransform: 'capitalize' }}>
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                background: activeTab === item.id ? 'rgba(134, 239, 172, 0.15)' : 'transparent',
                                border: activeTab === item.id ? '1px solid rgba(134, 239, 172, 0.3)' : '1px solid transparent',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                marginBottom: '0.5rem',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === item.id ? 600 : 400,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sign Out Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        background: 'rgba(220, 38, 38, 0.15)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s',
                        marginTop: '1rem'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.25)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
                    }}
                >
                    <span style={{ fontSize: '1.25rem' }}>🚪</span>
                    <span>{t('common.logout')}</span>
                </button>
            </div>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .mobile-overlay {
                        display: block !important;
                    }
                    .sidebar {
                        transform: translateX(-100%);
                        position: fixed;
                        left: 0;
                        top: 0;
                    }
                    .sidebar-open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;

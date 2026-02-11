import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/DataService';
import SettingsToggle from '../SettingsToggle';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onCollapseChange?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onCollapseChange }) => {
    const { user, logout } = useAuth();
    const { t } = useSettings();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [branchName, setBranchName] = useState('');

    useEffect(() => {
        const fetchBranchName = async () => {
            if (user?.role === 'admin') {
                setBranchName('HEAD OFFICE');
            } else if (user?.role === 'branch_admin' && user.branchId) {
                try {
                    const branch = await dataService.getBranchById(user.branchId);
                    if (branch) {
                        setBranchName(branch.name);
                    } else {
                        setBranchName('BRANCH ADMIN');
                    }
                } catch (error) {
                    console.error("Failed to fetch branch name", error);
                    setBranchName('BRANCH ADMIN');
                }
            } else {
                // Fallback for other roles like telecaller
                setBranchName('OM SHUBA TEAM');
            }
        };
        fetchBranchName();
    }, [user]);

    const getNavItems = () => {
        if (user?.role === 'admin') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'conversions', label: t('nav.conversions'), icon: '💰' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'branches', label: t('nav.branches'), icon: '🏢' },
                { id: 'promotions', label: t('nav.promotions'), icon: '📢' },
                { id: 'offers', label: 'Offers', icon: '🏷️' },
                { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                { id: 'message-queue', label: 'Message Queue', icon: '📩' },
                { id: 'users', label: t('nav.users'), icon: '👥' },
            ];
        }
        if (user?.role === 'branch_admin') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '🏢' },
                { id: 'enquiries', label: t('nav.enquiries'), icon: '📑' },
                { id: 'conversions', label: t('nav.conversions'), icon: '💰' },
                { id: 'message-queue', label: 'Message Queue', icon: '📩' },
                { id: 'products', label: t('nav.products'), icon: '📦' },
                { id: 'promotions', label: t('nav.promotions'), icon: '📢' },
                { id: 'offers', label: 'Offers', icon: '🏷️' },
            ];
        }
        if (user?.role === 'telecaller') {
            return [
                { id: 'dashboard', label: t('nav.dashboard'), icon: '📈' },
                { id: 'products', label: t('products.title'), icon: '📦' },
                { id: 'recent', label: 'Recent Captures', icon: '🕒' },
                { id: 'enquiries', label: 'Enquiry Log', icon: '📑' },
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
            className="theme-sidebar sidebar-nav"
            style={{
                width: isCollapsed ? '80px' : '260px',
                height: '100vh',
                position: 'fixed',
                left: '0',
                top: '0',
                borderRadius: '0',
                padding: isCollapsed ? 'var(--space-4) var(--space-2)' : 'var(--space-6) var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                zIndex: 100,
                transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                borderRight: '1px solid var(--border)'
            }}
        >
            {!isCollapsed && (
                <div style={{ padding: 'var(--space-2) var(--space-4)', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        OM SHUBA
                    </h2>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {branchName}
                    </span>
                </div>
            )}

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                overflowY: isCollapsed ? 'visible' : 'auto',
                paddingRight: isCollapsed ? '0' : 'var(--space-1)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="sidebar-scroll-area">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            console.log('🔘 Sidebar clicked ID:', item.id);
                            if (item.id === 'message-queue') {
                                console.log('📨 MESSAGE QUEUE SELECTED');
                            }
                            setActiveTab(item.id);
                        }}
                        className={`sidebar-btn ${activeTab === item.id ? 'active' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                            width: '100%',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCollapsed ? '0' : 'var(--space-3)',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: isCollapsed ? 'var(--space-4)' : '0.875rem 1.25rem',
                            fontSize: '0.9rem',
                            fontWeight: activeTab === item.id ? 700 : 600,
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            flexShrink: 0
                        }}
                    >
                        <span style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </button>
                ))}

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                    {/* Settings Toggles for Desktop */}
                    {!isCollapsed && (
                        <div style={{ marginBottom: 'var(--space-2)' }}>
                            <SettingsToggle />
                        </div>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="sidebar-btn logout-btn"
                        title={isCollapsed ? t('common.logout') : undefined}
                        style={{
                            width: '100%',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isCollapsed ? '0' : 'var(--space-3)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: isCollapsed ? 'var(--space-4)' : '0.875rem 1.25rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            paddingLeft: '1.25rem',
                            paddingRight: '1.25rem'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>🚪</span>
                        {!isCollapsed && <span>{t('common.logout')}</span>}
                    </button>
                </div>
            </div>

            {/* Toggle Button for Desktop - Not in scroll area to stay fixed */}
            <button
                onClick={handleToggleCollapse}
                className="sidebar-toggle-btn"
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: 'var(--space-3)',
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    marginTop: 'var(--space-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 200ms ease',
                    flexShrink: 0
                }}
            >
                <span style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 300ms ease' }}>
                    ▶
                </span>
                {!isCollapsed && <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: 'var(--space-2)' }}>Collapse</span>}
            </button>

            <style>
                {`
                .theme-sidebar {
                    background: var(--bg-card);
                    box-shadow: 4px 0 24px rgba(0,0,0,0.02);
                    z-index: 1000;
                }

                .sidebar-btn {
                    position: relative;
                }

                .sidebar-btn:not(.active):hover {
                    background: var(--bg-hover) !important;
                    color: var(--primary) !important;
                    transform: translateX(4px);
                }

                .sidebar-btn.active {
                    box-shadow: 0 8px 16px var(--primary-glow);
                }

                .logout-btn:hover {
                    color: #ef4444 !important; /* Red for logout */
                    background: rgba(239, 68, 68, 0.05) !important;
                }

                .sidebar-toggle-btn:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                }

                .sidebar-scroll-area::-webkit-scrollbar {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .sidebar-nav { width: 80px !important; }
                    .sidebar-nav span:not(:first-child) { display: none !important; }
                    .sidebar-nav div:first-child { display: none !important; }
                }

                @media (max-width: 768px) {
                    .sidebar-nav {
                        position: fixed !important;
                        bottom: 0 !important;
                        top: auto !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        height: 70px !important;
                        flex-direction: row !important;
                        padding: 0 0.5rem !important;
                        border-radius: 0 !important;
                        border-top: 1px solid var(--border) !important;
                        border-right: none !important;
                        overflow: visible !important;
                    }
                    .sidebar-nav .sidebar-scroll-area { 
                        flex-direction: row !important; 
                        align-items: center !important;
                        margin: 0 !important; 
                        width: 100%;
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        gap: 0.25rem !important;
                        padding: 0 0.5rem;
                    }
                    .sidebar-nav .sidebar-scroll-area::-webkit-scrollbar {
                        display: none;
                    }
                    .sidebar-nav .sidebar-scroll-area > div:last-child {
                        display: flex !important;
                        flex-direction: row !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        align-items: center !important;
                        gap: 0.5rem !important;
                        height: 100%;
                    }
                    .sidebar-nav .sidebar-scroll-area .desktop-only-toggle {
                        display: flex !important;
                        margin: 0 !important;
                    }
                    .sidebar-nav .sidebar-scroll-area .sidebar-btn {
                        height: 50px !important;
                        margin: 0 !important;
                    }
                    .sidebar-toggle-btn { display: none !important; }
                    .sidebar-btn { 
                        flex: 0 0 auto !important;
                        width: 64px !important;
                        justify-content: center !important; 
                        padding: 0 !important;
                    }
                }
                `}
            </style>
        </nav>
    );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import ProductMaster from './ProductMaster';
import BranchMaster from './BranchMaster';
import EnquiryLog from './EnquiryLog';
import ConversionOverview from './ConversionOverview';
import PromotionManagement from '../../components/PromotionManagement';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/DataService';
import { useSettings } from '../../context/SettingsContext';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [metrics, setMetrics] = useState({ branchLeads: 0, demosDone: 0, activeProducts: 0 });
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        calculateMetrics();
    }, [user]);

    const calculateMetrics = async () => {
        setLoading(true);
        try {
            const [enquiries, products] = await Promise.all([
                dataService.getEnquiries(),
                dataService.getProducts()
            ]);

            const branchLeads = user?.role === 'branch_admin'
                ? enquiries.filter(e => e.branchId === user.branchId).length
                : enquiries.length;

            const demos = user?.role === 'branch_admin'
                ? enquiries.filter(e => e.branchId === user.branchId && e.pipelineStage === 'Demo/Visit Done').length
                : enquiries.filter(e => e.pipelineStage === 'Demo/Visit Done').length;

            setMetrics({
                branchLeads,
                demosDone: demos,
                activeProducts: products.filter(p => p.active).length
            });
        } catch (error) {
            console.error("Failed to load admin metrics", error);
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: 'var(--space-1)' }}>
                        {t('admin.dashboard_title')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
                        Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.name}</span>. Here's what's happening today.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={calculateMetrics} style={{ height: '44px' }}>
                    <span>🔄</span> {t('common.refresh')}
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-8)'
            }}>
                <StatCard
                    title={t('metrics.branchLeads')}
                    value={metrics.branchLeads.toString()}
                    trend="+12%"
                    trendType="up"
                    sparklineData={[30, 45, 40, 60, 55, 75, 80]}
                />
                <StatCard
                    title={t('metrics.demoConversions')}
                    value={metrics.demosDone.toString()}
                    trend="+5%"
                    trendType="up"
                    sparklineData={[10, 15, 12, 18, 20, 25, 30]}
                />
                <StatCard
                    title={t('metrics.activeInventory')}
                    value={metrics.activeProducts.toString()}
                    trend="Stable"
                    trendType="up"
                    sparklineData={[15, 15, 16, 16, 17, 18, 18]}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-8)' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Recent Regional Activity</h3>
                        <button
                            className="btn"
                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}
                            onClick={() => setActiveTab('enquiries')}
                        >
                            View All
                        </button>
                    </div>
                    <EnquiryLog />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                        color: 'white',
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ color: 'white', marginBottom: 'var(--space-3)', fontSize: '1.125rem' }}>
                                {t('quickActions.adminTip')}
                            </h3>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, opacity: 0.9, fontWeight: 500 }}>
                                {t('quickActions.tipText')}
                            </p>
                        </div>
                        <div style={{
                            position: 'absolute',
                            right: '-20px',
                            bottom: '-20px',
                            fontSize: '5rem',
                            opacity: 0.1,
                            transform: 'rotate(-15deg)'
                        }}>💡</div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.125rem' }}>{t('quickActions.title')}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', border: 'none', padding: 'var(--space-4)', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)' }}
                                onClick={() => setActiveTab('products')}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📦</span>
                                <span style={{ fontWeight: 700 }}>Products</span>
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', border: 'none', padding: 'var(--space-4)', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)' }}
                                onClick={() => setActiveTab('branches')}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                                <span style={{ fontWeight: 700 }}>Branches</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <div className="card animate-fade-in"><ProductMaster /></div>;
            case 'branches':
                if (user?.role === 'branch_admin') {
                    setActiveTab('dashboard');
                    return renderDashboard();
                }
                return <div className="card animate-fade-in"><BranchMaster /></div>;
            case 'enquiries': return <div className="card animate-fade-in"><EnquiryLog role={user?.role === 'branch_admin' ? 'branch_admin' : 'admin'} /></div>;
            case 'conversions': return <div className="animate-fade-in"><ConversionOverview /></div>;
            case 'promotions': return <div className="card animate-fade-in"><PromotionManagement /></div>;
            case 'dashboard':
            default: return renderDashboard();
        }
    };

    return (
        <div style={{ display: 'flex', gap: 'var(--space-8)', minHeight: 'calc(100vh - 120px)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onCollapseChange={setIsCollapsed} />
            <div style={{ flex: 1, marginLeft: isCollapsed ? '88px' : '260px', transition: 'margin-left 300ms ease' }} className="main-content-wrapper">
                {renderContent()}
            </div>

            <style>
                {`
                @media (max-width: 1024px) {
                    .main-content-wrapper { marginLeft: 88px !important; }
                }
                @media (max-width: 768px) {
                    .main-content-wrapper { marginLeft: 0 !important; paddingBottom: 80px; }
                }
                `}
            </style>
        </div>
    );
};

export default AdminDashboard;

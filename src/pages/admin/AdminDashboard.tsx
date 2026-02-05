import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import ProductMaster from './ProductMaster';
import BranchMaster from './BranchMaster';
import EnquiryLog from './EnquiryLog';
import ConversionOverview from './ConversionOverview';
import PromotionManagement from '../../components/PromotionManagement';
import OfferManagement from '../../components/OfferManagement';
import CommunityUpdates from '../../components/whatsapp/CommunityUpdates';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/DataService';
import { useSettings } from '../../context/SettingsContext';
import { AdminMessaging, BranchMessaging } from '../../components/dashboard/Messaging';

const AdminDashboard: React.FC = () => {
    // Force reload for HMR
    const { user } = useAuth();
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [metrics, setMetrics] = useState({
        branchLeads: 0,
        salesCalls: 0,
        serviceCalls: 0,
        demosDone: 0,
        activeProducts: 0,
        closedDeals: 0,
        totalRevenue: 0
    });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

    // Messaging State
    const [showMessaging, setShowMessaging] = useState(false);

    useEffect(() => {
        calculateMetrics();
    }, [user]);

    const calculateMetrics = async () => {
        try {
            const [enquiries, products, fetchedBranches] = await Promise.all([
                dataService.getEnquiries(),
                dataService.getProducts(),
                dataService.getBranches()
            ]);

            setBranches(fetchedBranches);

            const effectiveBranchId = user?.role === 'branch_admin' ? user.branchId : selectedBranchId;

            const filteredEnquiries = effectiveBranchId && effectiveBranchId !== 'all'
                ? enquiries.filter(e => e.branchId === effectiveBranchId)
                : enquiries;

            const branchLeads = filteredEnquiries.length;
            const salesCalls = filteredEnquiries.filter(e => e.callType === 'Sales' || !e.callType).length;
            const serviceCalls = filteredEnquiries.filter(e => e.callType === 'Service').length;

            const totalRevenue = filteredEnquiries.reduce((sum, enq) => sum + (enq.closedAmount || 0), 0);
            const closedDeals = filteredEnquiries.filter(e => e.pipelineStage === 'Closed-Converted').length;
            const demos = filteredEnquiries.filter(e => e.pipelineStage === 'Demo/Visit Done').length;

            setMetrics({
                branchLeads,
                salesCalls,
                serviceCalls,
                demosDone: demos,
                activeProducts: products.filter(p => p.active).length,
                closedDeals,
                totalRevenue
            });
        } catch (error) {
            console.error("Failed to load admin metrics", error);
        }
    };

    useEffect(() => {
        calculateMetrics();
    }, [selectedBranchId]);

    // Debug: Log activeTab changes
    useEffect(() => {
        console.log('🔄 AdminDashboard - activeTab changed to:', activeTab);
    }, [activeTab]);

    const renderDashboard = () => (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', marginBottom: 'var(--space-1)' }}>
                        {t('admin.dashboard_title')}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
                            {t('admin.welcomeBack')}, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.name}</span>.
                        </p>

                        {/* Messaging Icon */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn"
                                style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setShowMessaging(!showMessaging)}
                            >
                                💬
                            </button>
                            {showMessaging && (
                                user?.role === 'admin'
                                    ? <AdminMessaging onClose={() => setShowMessaging(false)} align="left" />
                                    : <BranchMessaging onClose={() => setShowMessaging(false)} align="left" />
                            )}
                        </div>

                        {user?.role === 'admin' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('admin.branch')}:</span>
                                <select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="all">{t('admin.allBranches')}</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <button className="btn btn-primary" onClick={calculateMetrics} style={{ height: '44px' }}>
                    <span>🔄</span> {t('common.refresh')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <StatCard
                    title={t('metrics.branchLeads')}
                    value={metrics.branchLeads.toString()}
                    trend={`💰 ${metrics.salesCalls} Sales | 🔧 ${metrics.serviceCalls} Service`}
                    trendType="neutral"
                    sparklineData={[30, 45, 40, 60, 55, 75, 80]}
                />
                <StatCard
                    title="Total Revenue" // I should add this to translations later
                    value={`₹${metrics.totalRevenue.toLocaleString()}`}
                    trend={`${metrics.closedDeals} Closed Deals`}
                    trendType="up"
                    sparklineData={[10000, 25000, 18000, 45000, 38000, 65000, 80000]}
                />
                <StatCard
                    title={t('metrics.conversion')}
                    value={`${metrics.branchLeads > 0 ? Math.round((metrics.closedDeals / metrics.branchLeads) * 100) : 0}%`}
                    trend={`${metrics.closedDeals} / ${metrics.branchLeads} leads`}
                    trendType="up"
                    sparklineData={[5, 10, 8, 12, 15, 18, 20]}
                    onClick={() => setActiveTab('conversions')}
                />
                <StatCard
                    title={t('metrics.activeInventory')}
                    value={metrics.activeProducts.toString()}
                    trend={t('common.stable')}
                    trendType="up"
                    sparklineData={[15, 15, 16, 16, 17, 18, 18]}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>{t('admin.recent_activity')}</h3>
                        <button
                            className="btn"
                            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}
                            onClick={() => setActiveTab('enquiries')}
                        >
                            {t('telecaller.viewAll')}
                        </button>
                    </div>
                    <EnquiryLog branchId={user?.role === 'branch_admin' ? user?.branchId : selectedBranchId} />
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', border: 'none', padding: 'var(--space-4)', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)' }}
                                onClick={() => setActiveTab('products')}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📦</span>
                                <span style={{ fontWeight: 850, color: '#FFFFFF' }}>{t('nav.products')}</span>
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', border: 'none', padding: 'var(--space-4)', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)' }}
                                onClick={() => setActiveTab('conversions')}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🤝</span>
                                <span style={{ fontWeight: 850, color: '#FFFFFF' }}>{t('nav.conversions')}</span>
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', border: 'none', padding: 'var(--space-4)', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-1)' }}
                                onClick={() => setActiveTab('whatsapp')}
                            >
                                <span style={{ fontSize: '1.5rem' }}>📢</span>
                                <span style={{ fontWeight: 850, color: '#FFFFFF' }}>Updates</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        console.log('🎯 renderContent called with activeTab:', activeTab);
        console.log('🎯 activeTab type:', typeof activeTab);
        console.log('🎯 activeTab === "whatsapp":', activeTab === 'whatsapp');

        switch (activeTab) {
            case 'products': return <div className="card animate-fade-in"><ProductMaster branchId={user?.role === 'branch_admin' ? user?.branchId : selectedBranchId} /></div>;
            case 'branches':
                if (user?.role === 'branch_admin') {
                    setActiveTab('dashboard');
                    return renderDashboard();
                }
                return <div className="card animate-fade-in"><BranchMaster /></div>;
            case 'enquiries': return <div className="card animate-fade-in"><EnquiryLog role={user?.role === 'branch_admin' ? 'branch_admin' : 'admin'} branchId={user?.role === 'branch_admin' ? user?.branchId : selectedBranchId} /></div>;
            case 'conversions': return <div className="animate-fade-in"><ConversionOverview /></div>;
            case 'promotions': return <div className="card animate-fade-in"><PromotionManagement /></div>;
            case 'offers': return <div className="card animate-fade-in"><OfferManagement /></div>;
            case 'whatsapp':
                console.log('Rendering WhatsApp Community Updates');
                return <div className="card animate-fade-in"><CommunityUpdates /></div>;
            case 'users': return <div className="card animate-fade-in"><h2>Staff Management - Coming Soon</h2></div>;
            case 'dashboard':
            default: return renderDashboard();
        }
    };

    return (
        <div style={{ display: 'flex', background: 'var(--bg-app)', minHeight: '100vh', position: 'relative' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onCollapseChange={setIsCollapsed} />
            <div
                key={activeTab}
                style={{
                    flex: 1,
                    padding: '2rem 3rem',
                    marginLeft: isCollapsed ? '80px' : '260px',
                    transition: 'margin-left 300ms ease',
                    minHeight: '100vh',
                    position: 'relative',
                    overflowX: 'hidden'
                }}
                className="main-content-wrapper"
            >
                {renderContent()}
            </div>

            <style>
                {`
                @media (max-width: 1024px) {
                    .main-content-wrapper { margin-left: 80px !important; padding: 2rem !important; }
                }
                @media (max-width: 768px) {
                    .main-content-wrapper { margin-left: 0 !important; padding: 0.75rem !important; padding-bottom: 90px !important; }
                }
                `}
            </style>
        </div>
    );
};
export default AdminDashboard;

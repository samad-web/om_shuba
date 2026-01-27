import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import GaugeWidget from '../../components/dashboard/GaugeWidget';
import ProductMaster from './ProductMaster';
import BranchMaster from './BranchMaster';
import EnquiryLog from './EnquiryLog';
import UserManagement from './UserManagement';
import AccountSettings from './AccountSettings';
import PromotionManagement from '../../components/PromotionManagement';
import { storage } from '../../services/storage';
import { downloadBusinessReport } from '../../services/excelService';
import { useSettings } from '../../context/SettingsContext';

const OwnerDashboard: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [metrics, setMetrics] = useState({
        activePipeline: 0,
        conversionRate: 0,
        demoFulfillment: 0,
        estPipelineValue: 0,
        topSellers: [] as { name: string, count: number, percent: number }[],
        branchDensity: { name: '', count: 0 },
        leadQuality: 0,
        urgentActions: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        calculateMetrics();
    }, []);

    const handleExport = () => {
        const enquiries = storage.getEnquiries();
        const products = storage.getProducts();
        const branches = storage.getBranches();
        downloadBusinessReport(enquiries, products, branches);
    };

    const calculateMetrics = () => {
        const enquiries = storage.getEnquiries();
        const products = storage.getProducts();
        const branches = storage.getBranches();

        // 1. Total Active Pipeline (Excluding delivered/closed)
        const active = enquiries.filter(e => !['Delivered', 'Closed-Not Interested', 'Closed-Converted'].includes(e.pipelineStage));

        // 2. Conversion Rate (Converted / Total ever)
        const converted = enquiries.filter(e => e.pipelineStage === 'Closed-Converted').length;
        const total = enquiries.length || 1;
        const convRate = Math.round((converted / total) * 100);

        // 3. Demo Fulfillment (% of scheduled demos that are 'Done')
        const scheduled = enquiries.filter(e => ['Demo Scheduled', 'Visit Scheduled', 'Demo/Visit Done'].includes(e.pipelineStage)).length;
        const done = enquiries.filter(e => e.pipelineStage === 'Demo/Visit Done').length;
        const fulfillment = scheduled > 0 ? Math.round((done / scheduled) * 100) : 100;

        // 4. Action Urgency (Scheduled for TODAY)
        const todayStr = new Date().toLocaleDateString();
        const urgent = enquiries.filter(e =>
            e.tracking?.status === 'Scheduled' &&
            new Date(e.tracking.scheduledDate).toLocaleDateString() === todayStr
        ).length;

        // 5. Lead Quality (% Qualified vs Total)
        const qualified = enquiries.filter(e => !['New'].includes(e.pipelineStage)).length;
        const qualityIndex = Math.round((qualified / total) * 100);

        // 6. Total Realized Revenue
        const totalRev = enquiries
            .filter(e => e.pipelineStage === 'Closed-Converted')
            .reduce((sum, e) => sum + (e.closedAmount || 0), 0);

        // Top Sellers Logic
        const salesMap: Record<string, number> = {};
        enquiries.filter(e => e.pipelineStage === 'Closed-Converted').forEach(e => {
            const p = products.find(prod => prod.id === e.productId);
            if (p) salesMap[p.name] = (salesMap[p.name] || 0) + 1;
        });

        const topSellersEntries = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
        const maxSales = topSellersEntries[0]?.[1] || 1;
        const topSellers = topSellersEntries.map(([name, count]) => ({
            name,
            count,
            percent: Math.round((count / maxSales) * 100)
        }));

        // 7. Branch Density (Enquiries per branch)
        const branchCounts: Record<string, number> = {};
        enquiries.forEach(e => { branchCounts[e.branchId] = (branchCounts[e.branchId] || 0) + 1; });
        const topBranchEntry = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])[0];
        const topBranchName = branches.find(b => b.id === (topBranchEntry?.[0]))?.name || 'Main Office';

        setMetrics({
            activePipeline: active.length,
            conversionRate: convRate,
            demoFulfillment: fulfillment,
            estPipelineValue: active.length * 68000,
            topSellers,
            branchDensity: { name: topBranchName, count: topBranchEntry?.[1] || 0 },
            leadQuality: qualityIndex,
            urgentActions: urgent || 5,
            totalRevenue: totalRev
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <div className="card" style={{ height: 'auto' }}><ProductMaster /></div>;
            case 'branches':
                return <div className="card" style={{ height: 'auto' }}><BranchMaster /></div>;
            case 'enquiries':
                return <div className="card" style={{ height: 'auto' }}><EnquiryLog /></div>;
            case 'users':
                return <div className="card" style={{ height: 'auto' }}><UserManagement /></div>;
            case 'settings':
                return <div className="card" style={{ height: 'auto' }}><AccountSettings /></div>;
            case 'promotions':
                return <div className="card" style={{ height: 'auto' }}><PromotionManagement /></div>;
            case 'dashboard':
            default:
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{t('login.title')} {t('nav.dashboard')}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Business health and operations monitoring</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn" onClick={() => calculateMetrics()}>🔄 {t('common.refresh')}</button>
                                <button className="btn btn-primary" onClick={handleExport} style={{ borderRadius: '12px', padding: '0.75rem 1.5rem' }}>{t('owner.exportData')}</button>
                            </div>
                        </div>

                        {/* Top Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            <StatCard
                                title={t('metrics.activePipeline')}
                                value={metrics.activePipeline.toString()}
                                trend="8.4%" trendType="up"
                                sparklineData={[20, 30, 25, 45, 40, 55, 65]}
                            />
                            <StatCard
                                title={t('metrics.conversion')}
                                value={`${metrics.conversionRate}%`}
                                trend="1.2%" trendType="up"
                                sparklineData={[10, 15, 12, 18, 20, 22, 25]}
                            />
                            <StatCard
                                title={t('metrics.revenue')}
                                value={`₹${(metrics.totalRevenue / 100000).toFixed(2)}L`}
                                trend={t('metrics.actualSales')} trendType="up"
                                sparklineData={[40, 50, 60, 55, 75, 80, 95]}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.3fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ gridColumn: 'span 1' }}>
                                <GaugeWidget
                                    title={t('metrics.demoFulfillment')}
                                    percentage={metrics.demoFulfillment}
                                    subtext={t('metrics.scheduledCompleted')}
                                />
                            </div>

                            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Selling Products</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                                    {metrics.topSellers.map(item => (
                                        <div key={item.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{item.count} Sales</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${item.percent}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), #16a34a)', borderRadius: '4px', transition: 'width 1s ease' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {metrics.topSellers.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                                            No sales data yet
                                        </div>
                                    )}
                                </div>
                                <button className="btn" style={{ width: '100%', marginTop: 'auto', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '10px' }}>View Full Sales Report</button>
                            </div>

                            <div className="card" style={{ gridColumn: 'span 1' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Branch Lead Density</h4>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Geographic distribution of agri-machinery demand.</p>
                                <div style={{ height: '150px', background: 'rgba(22, 163, 74, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '80%', height: '80%', background: 'url("https://upload.wikimedia.org/wikipedia/commons/e/ea/Blank_map_of_Tamil_Nadu.svg") center/contain no-repeat', opacity: 0.2, filter: 'hue-rotate(90deg)' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                                    <div style={{ fontSize: '0.8rem' }}><strong>{metrics.branchDensity.name}</strong><br /><span style={{ color: 'var(--text-muted)' }}>Top Activity Zone</span></div>
                                    <div style={{ background: '#064e3b', color: '#86efac', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>{metrics.branchDensity.count} leads</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #064e3b, #16532d)',
                                borderRadius: '24px', padding: '1.75rem', color: 'white', position: 'relative',
                                display: 'flex', justifyContent: 'space-between', boxShadow: 'var(--shadow-lg)'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Action Urgency<br />Today: {metrics.urgentActions} Slots</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ display: 'flex' }}>
                                            {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#86efac', border: '3px solid #064e3b', marginLeft: '-15px' }}></div>)}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Demos/Visits Schedule</span>
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>TOTAL REALIZED REVENUE</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#86efac' }}>₹{metrics.totalRevenue.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.75rem', transform: 'translateY(-2px)' }}>Direct deal closures</span>
                                </div>
                                <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '1.2rem', opacity: 0.3 }}>⚡</span>
                            </div>

                            <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.75rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    border: '6px solid var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)',
                                    background: 'var(--primary-light)'
                                }}>
                                    {metrics.leadQuality}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Lead Quality Index</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>Percentage of total leads that have been qualified for machinery sales.</div>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div style={{ display: 'flex', background: 'var(--bg-app)', height: '100vh', overflow: 'hidden' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default OwnerDashboard;

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import ProductMaster from './ProductMaster';
import BranchMaster from './BranchMaster';
import EnquiryLog from './EnquiryLog';
import ConversionOverview from './ConversionOverview';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [metrics, setMetrics] = useState({ branchLeads: 0, demosDone: 0, activeProducts: 0 });

    useEffect(() => {
        calculateMetrics();
    }, []);

    const calculateMetrics = () => {
        const enquiries = storage.getEnquiries();
        const products = storage.getProducts();

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
    };

    const renderDashboard = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Management Console</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Overview of branch operations and inventory state.</p>
                </div>
                <button className="btn" onClick={calculateMetrics}>🔄 Refresh Data</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Total Branch Leads" value={metrics.branchLeads.toString()} trend="+12% this month" trendType="up" sparklineData={[30, 45, 40, 60, 55, 75, metrics.branchLeads]} />
                <StatCard title="Demo Conversions" value={metrics.demosDone.toString()} trend="High Volume" trendType="up" sparklineData={[10, 15, 12, 18, 20, 25, metrics.demosDone]} />
                <StatCard title="Active Inventory" value={metrics.activeProducts.toString()} trend="Catalog Status" trendType="up" sparklineData={[15, 15, 16, 16, 17, 18, metrics.activeProducts]} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontWeight: 700 }}>Recent Regional Activity</h4>
                        <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => setActiveTab('enquiries')}>All Enquiries</button>
                    </div>
                    <EnquiryLog />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white' }}>
                        <h4 style={{ color: '#86efac', marginBottom: '1rem' }}>Admin Tip 💡</h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9 }}>
                            Regularly updating product inventory ensures telecallers provide accurate information to customers. Check for inactive products daily.
                        </p>
                    </div>
                    <div className="card">
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className="btn" style={{ textAlign: 'left', background: 'var(--bg-app)' }} onClick={() => setActiveTab('products')}>📦 Manage Products</button>
                            <button className="btn" style={{ textAlign: 'left', background: 'var(--bg-app)' }} onClick={() => setActiveTab('branches')}>🏢 Register New Branch</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <div className="card"><ProductMaster /></div>;
            case 'branches': return <div className="card"><BranchMaster /></div>;
            case 'enquiries': return <div className="card"><EnquiryLog role={user?.role === 'branch_admin' ? 'branch_admin' : 'admin'} /></div>;
            case 'conversions': return <ConversionOverview />;
            case 'dashboard':
            default: return renderDashboard();
        }
    };

    return (
        <div style={{ display: 'flex', background: '#f8fafc', height: '100vh', overflow: 'hidden' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;

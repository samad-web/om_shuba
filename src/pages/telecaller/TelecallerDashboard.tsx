import React, { useState, useEffect, useRef } from 'react';
import type { Product, Branch, Enquiry } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import ProductSearch from '../../components/ProductSearch';

import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import EnquiryLog from '../admin/EnquiryLog';
import ConversionOverview from '../admin/ConversionOverview';

const TelecallerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);
    const [metrics, setMetrics] = useState({ capturedToday: 0, qualifiedRate: 0, scheduledDemos: 0 });

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [branchId, setBranchId] = useState('');
    const [intent, setIntent] = useState('General Enquiry');
    const [successMsg, setSuccessMsg] = useState('');

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBranches(storage.getBranches().filter(b => b.active));
        loadMyEnquiries();
    }, []);

    const loadMyEnquiries = () => {
        if (!user) return;
        const all = storage.getEnquiries();
        const mine = all.filter(e => e.createdBy === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyEnquiries(mine);

        const today = new Date().toISOString().split('T')[0];
        const todayLeads = mine.filter(e => e.createdAt.startsWith(today)).length;
        const qualified = mine.filter(e => e.pipelineStage !== 'New').length;
        const demos = mine.filter(e => e.pipelineStage.includes('Demo')).length;

        setMetrics({
            capturedToday: todayLeads,
            qualifiedRate: Math.round((qualified / (mine.length || 1)) * 100),
            scheduledDemos: demos
        });
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setTimeout(() => nameInputRef.current?.focus(), 0);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !user) return;

        if (phone.length < 10) { alert("Invalid Phone Number"); return; }
        const existing = storage.getEnquiries().find(e => e.phoneNumber === phone && e.productId === selectedProduct.id && e.pipelineStage !== 'Closed-Not Interested');
        if (existing) { alert(`Duplicate Enquiry! Phone already has an active lead for ${selectedProduct.name}.`); return; }

        const newEnquiry: Enquiry = {
            id: 'e' + Date.now(),
            customerName, phoneNumber: phone, location,
            productId: selectedProduct.id,
            branchId: branchId || branches[0]?.id || '',
            purchaseIntent: intent as any,
            pipelineStage: 'New',
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            history: [{ stage: 'New', timestamp: new Date().toISOString(), userId: user.id }]
        };

        storage.addEnquiry(newEnquiry);
        setCustomerName(''); setPhone(''); setLocation(''); setBranchId(''); setSelectedProduct(null);
        setSuccessMsg('Lead Captured Successfully! ✨');
        loadMyEnquiries();
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const renderDashboard = () => (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Welcome, {user?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track your captures and lead performance today.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Leads Captured (Today)" value={metrics.capturedToday.toString()} trend="+2 vs yesterday" trendType="up" sparklineData={[5, 8, 4, 12, 10, 15, metrics.capturedToday]} />
                <StatCard title="Qualification Rate" value={`${metrics.qualifiedRate}%`} trend="Top Performers" trendType="up" sparklineData={[40, 45, 38, 52, 50, 60, metrics.qualifiedRate]} />
                <StatCard title="Demos Scheduled" value={metrics.scheduledDemos.toString()} trend="Active Pipeline" trendType="up" sparklineData={[2, 4, 3, 6, 5, 8, metrics.scheduledDemos]} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* Capture Section */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎯</span> Quick Lead Capture
                    </h3>

                    <div style={{ marginBottom: '2rem' }}>
                        <ProductSearch onSelect={handleProductSelect} />
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: selectedProduct ? 1 : 0.4, pointerEvents: selectedProduct ? 'auto' : 'none', transition: 'all 0.3s' }}>
                        {selectedProduct && (
                            <div style={{ padding: '1rem', background: 'rgba(22, 163, 74, 0.05)', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase' }}>Selected Equipment</div>
                                    <div style={{ fontWeight: 700 }}>{selectedProduct.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({selectedProduct.sku})</span></div>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedProduct.priceRange}</div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Customer Name *</label>
                                <input ref={nameInputRef} className="input" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full legal name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number *</label>
                                <input className="input" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Location *</label>
                                <input className="input" required value={location} onChange={e => setLocation(e.target.value)} placeholder="City / District" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preferred Branch</label>
                                <select className="input" value={branchId} onChange={e => setBranchId(e.target.value)} required>
                                    <option value="">Choose nearest branch</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Interested Stage</label>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                {['Ready to Buy', 'Needs Demo', 'General Enquiry'].map(i => (
                                    <label key={i} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input type="radio" name="intent" value={i} checked={intent === i} onChange={e => setIntent(e.target.value)} style={{ width: '18px', height: '18px' }} />
                                        {i}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                            CAPTURE LEAD ✨
                        </button>
                        {successMsg && <div style={{ color: 'var(--success)', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', animation: 'fadeIn 0.5s' }}>{successMsg}</div>}
                    </form>
                </div>

                {/* Recent List */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontWeight: 700 }}>Your Recent Captures</h4>
                        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => setActiveTab('enquiries')}>View All</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myEnquiries.slice(0, 5).map(e => (
                            <div key={e.id} style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{storage.getProducts().find(p => p.id === e.productId)?.name}</div>
                                </div>
                                <div style={{
                                    padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                    background: e.pipelineStage === 'New' ? '#dcfce7' : '#e0f2fe',
                                    color: e.pipelineStage === 'New' ? '#15803d' : '#0369a1'
                                }}>
                                    {e.pipelineStage}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'enquiries': return <div className="card" style={{ height: 'auto' }}><EnquiryLog role="telecaller" /></div>;
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

export default TelecallerDashboard;

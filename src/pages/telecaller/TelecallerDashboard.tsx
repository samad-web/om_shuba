import React, { useState, useEffect, useRef } from 'react';
import type { Product, Branch, Enquiry } from '../../types';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../components/Toast';
import ProductSearch from '../../components/ProductSearch';
import PromotionBanner from '../../components/PromotionBanner';

import Sidebar from '../../components/dashboard/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import EnquiryLog from '../admin/EnquiryLog';
import ConversionOverview from '../admin/ConversionOverview';

const TelecallerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useSettings();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [metrics, setMetrics] = useState({ capturedToday: 0, qualifiedRate: 0, scheduledDemos: 0 });
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [branchId, setBranchId] = useState('');
    const [intent, setIntent] = useState('General Enquiry');

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesData, productsData] = await Promise.all([
                dataService.getBranches(),
                dataService.getProducts()
            ]);
            setBranches(branchesData.filter(b => b.active));
            setProducts(productsData);
            await loadMyEnquiries();
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMyEnquiries = async () => {
        if (!user) return;
        try {
            const all = await dataService.getEnquiries();
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
        } catch (error) {
            console.error("Failed to load enquiries", error);
        }
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setTimeout(() => nameInputRef.current?.focus(), 0);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !user) return;

        if (phone.length < 10) {
            showToast("Invalid Phone Number", 'error');
            return;
        }

        try {
            const allEnquiries = await dataService.getEnquiries();
            const existing = allEnquiries.find(e => e.phoneNumber === phone && e.productId === selectedProduct.id && e.pipelineStage !== 'Closed-Not Interested');
            if (existing) {
                showToast(`Duplicate Enquiry! Phone already has an active lead for ${selectedProduct.name}.`, 'warning');
                return;
            }

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

            await dataService.addEnquiry(newEnquiry);
            setCustomerName(''); setPhone(''); setLocation(''); setBranchId(''); setSelectedProduct(null);
            showToast(t('enquiries.captureSuccess'), 'success');
            loadMyEnquiries();
        } catch (error) {
            console.error("Failed to save enquiry", error);
        }
    };

    const handleNavClick = (tabId: string) => {
        if (tabId === 'enquiries' || tabId === 'conversions') {
            setActiveTab(tabId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // If on another tab, go to dashboard first
            if (activeTab !== 'dashboard') {
                setActiveTab('dashboard');
                // Small delay to allow react to render the dashboard before scrolling
                setTimeout(() => {
                    const element = document.getElementById(`section-${tabId}`);
                    if (element) {
                        const offset = 100; // Account for fixed header
                        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                }, 100);
            } else {
                const element = document.getElementById(`section-${tabId}`);
                if (element) {
                    const offset = 100;
                    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        }
    };

    const renderDashboard = () => (
        <div id="section-dashboard" className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{t('nav.dashboard')}, {user?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('telecaller.trackPerformance')}</p>
                </div>
            </div>

            <PromotionBanner />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title={t('telecaller.leadsToday')} value={metrics.capturedToday.toString()} trend={t('metrics.yesterdayTrend')} trendType="up" sparklineData={[5, 8, 4, 12, 10, 15, metrics.capturedToday]} />
                <StatCard title={t('telecaller.qualificationRate')} value={`${metrics.qualifiedRate}% `} trend={t('metrics.topPerformers')} trendType="up" sparklineData={[40, 45, 38, 52, 50, 60, metrics.qualifiedRate]} />
                <StatCard title={t('telecaller.demosScheduled')} value={metrics.scheduledDemos.toString()} trend={t('metrics.activePipelineMetric')} trendType="up" sparklineData={[2, 4, 3, 6, 5, 8, metrics.scheduledDemos]} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Capture Section */}
                <div id="section-products" className="card" style={{ padding: '2rem', scrollMarginTop: '100px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎯</span> {t('telecaller.quickCapture')}
                    </h3>

                    <div style={{ marginBottom: '2rem' }}>
                        <ProductSearch onSelect={handleProductSelect} />
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: selectedProduct ? 1 : 0.4, pointerEvents: selectedProduct ? 'auto' : 'none', transition: 'all 0.3s' }}>
                        {selectedProduct && (
                            <div style={{ padding: '1rem', background: 'rgba(22, 163, 74, 0.05)', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase' }}>{t('products.selectedEquipment')}</div>
                                    <div style={{ fontWeight: 700 }}>
                                        {language === 'ta' && selectedProduct.nameTa ? selectedProduct.nameTa : selectedProduct.name}
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> ({selectedProduct.sku})</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedProduct.priceRange}</div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('enquiries.customerName')} *</label>
                                <input ref={nameInputRef} className="input" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t('enquiries.fullName')} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('enquiries.phoneNumber')} *</label>
                                <input className="input" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('enquiries.phoneDigits')} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('enquiries.location')} *</label>
                                <input className="input" required value={location} onChange={e => setLocation(e.target.value)} placeholder={t('enquiries.cityDistrict')} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('branches.preferredBranch')}</label>
                                <select className="input" value={branchId} onChange={e => setBranchId(e.target.value)} required>
                                    <option value="">{t('branches.chooseBranch')}</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>{t('enquiries.interestedStage')}</label>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {['Ready to Buy', 'Needs Demo', 'General Enquiry'].map(i => (
                                    <label key={i} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input type="radio" name="intent" value={i} checked={intent === i} onChange={e => setIntent(e.target.value)} style={{ width: '18px', height: '18px' }} />
                                        {i}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, marginTop: '1rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                            {t('enquiries.captureLead')} ✨
                        </button>
                    </form>
                </div>

                {/* Recent List */}
                <div id="section-recent" className="card" style={{ display: 'flex', flexDirection: 'column', scrollMarginTop: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontWeight: 700 }}>{t('telecaller.yourRecent')}</h4>
                        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => handleNavClick('enquiries')}>{t('telecaller.viewAll')}</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myEnquiries.slice(0, 5).map(e => (
                            <div key={e.id} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {(() => {
                                            const p = products.find(p => p.id === e.productId);
                                            if (!p) return e.productId;
                                            return language === 'ta' ? (p.nameTa || p.name) : p.name;
                                        })()}
                                    </div>

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
                        {myEnquiries.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No recent captures found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'enquiries': return <div className="card animate-fade-in" style={{ height: 'auto' }}><EnquiryLog role="telecaller" /></div>;
            case 'conversions': return <div className="animate-fade-in"><ConversionOverview /></div>;
            case 'dashboard':
            default: return renderDashboard();
        }
    };

    return (
        <div style={{ display: 'flex', background: 'var(--bg-app)', minHeight: '100vh', position: 'relative' }}>
            <Sidebar activeTab={activeTab} setActiveTab={handleNavClick} onCollapseChange={setIsCollapsed} />
            <main style={{
                flex: 1,
                padding: '2rem 3rem',
                marginLeft: isCollapsed ? '80px' : '260px', // Matches dynamic sidebar width
                transition: 'margin-left 300ms ease',
                position: 'relative',
                overflowX: 'hidden'
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                )}
                {renderContent()}
            </main>

            <style>{`
                @media (max-width: 1024px) {
                    main { margin-left: 80px !important; padding: 2rem !important; }
                }
                @media (max-width: 768px) {
                    main { margin-left: 0 !important; padding: 0.75rem !important; padding-bottom: 90px !important; }
                }
            `}</style>
        </div>
    );
};
export default TelecallerDashboard;

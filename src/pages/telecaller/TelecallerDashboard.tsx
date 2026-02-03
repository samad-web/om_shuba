import React, { useState, useEffect, useRef } from 'react';
import type { Product, Branch, Enquiry, Offer } from '../../types';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import ProductCatalog from '../../components/dashboard/ProductCatalog';
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
    const [offers, setOffers] = useState<Offer[]>([]);

    // Customer Lookup State
    const [searchPhone, setSearchPhone] = useState('');
    const [customerHistory, setCustomerHistory] = useState<Enquiry[]>([]);
    const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]);
    const [serviceReminders, setServiceReminders] = useState<Enquiry[]>([]);
    const [metrics, setMetrics] = useState({ capturedToday: 0, qualifiedRate: 0, scheduledDemos: 0 });
    const [loading, setLoading] = useState(true);
    const [showCatalog, setShowCatalog] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [branchId, setBranchId] = useState('');
    const [intent, setIntent] = useState('General Enquiry');
    const [callType, setCallType] = useState<'Sales' | 'Service'>('Sales');
    const [warrantyCheck, setWarrantyCheck] = useState(false);
    const [complaintNotes, setComplaintNotes] = useState('');
    const [offerId, setOfferId] = useState('');

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesData, productsData, offersData] = await Promise.all([
                dataService.getBranches(),
                dataService.getProducts(),
                dataService.getOffers()
            ]);
            setBranches(branchesData.filter(b => b.active));
            setProducts(productsData);
            setOffers(offersData.filter(o => o.active));
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
            setAllEnquiries(all);
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

            // Calculate Service Reminders (6 months and 12 months)
            const reminders = all.filter(e => {
                if (e.pipelineStage !== 'Closed-Converted' || !e.warrantyStartDate) return false;

                const start = new Date(e.warrantyStartDate);
                const now = new Date();
                const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

                // Show reminder if it's exactly 6 months or 12 months (or slightly past)
                // and hasn't been "serviced" recently? (For simplicity, just show based on date)
                return monthsDiff === 6 || monthsDiff === 12;
            });
            setServiceReminders(reminders);
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
                history: [{ stage: 'New', timestamp: new Date().toISOString(), userId: user.id }],
                // Phase 2
                callType,
                warrantyCheck: callType === 'Service' ? warrantyCheck : undefined,
                complaintNotes: callType === 'Service' ? complaintNotes : undefined,
                offerId: callType === 'Sales' ? offerId : undefined
            };

            await dataService.addEnquiry(newEnquiry);
            setCustomerName(''); setPhone(''); setLocation(''); setBranchId(''); setSelectedProduct(null);
            setCallType('Sales'); setWarrantyCheck(false); setComplaintNotes(''); setOfferId('');
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

            {/* Customer Lookup Search */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>🔍 Customer History Lookup</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input"
                                placeholder="Enter phone number (e.g. 9876543210)"
                                value={searchPhone}
                                onChange={e => {
                                    setSearchPhone(e.target.value);
                                    if (e.target.value.length >= 4) {
                                        const found = allEnquiries.filter(enq => enq.phoneNumber.includes(e.target.value));
                                        setCustomerHistory(found);
                                    } else {
                                        setCustomerHistory([]);
                                    }
                                }}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📱</span>
                        </div>
                    </div>
                </div>

                {customerHistory.length > 0 && (
                    <div className="animate-fade-in" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Found {customerHistory.length} Previous Record(s):</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {customerHistory.map(h => (
                                <div key={h.id} style={{
                                    padding: '1rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{h.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {products.find(p => p.id === h.productId)?.name || h.productId}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)' }}>{h.pipelineStage}</span>
                                            {h.warrantyEndDate && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: new Date(h.warrantyEndDate) > new Date() ? '#dcfce7' : '#fee2e2',
                                                    color: new Date(h.warrantyEndDate) > new Date() ? '#166534' : '#991b1b'
                                                }}>
                                                    {new Date(h.warrantyEndDate) > new Date() ? '🛡️ Warranty Active' : '⌛ Warranty Expired'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="btn"
                                        style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                                        onClick={() => {
                                            setCustomerName(h.customerName);
                                            setPhone(h.phoneNumber);
                                            setLocation(h.location);
                                            setBranchId(h.branchId);
                                            const prod = products.find(p => p.id === h.productId);
                                            if (prod) setSelectedProduct(prod);
                                            setCallType('Service'); // Usually lookups are for service
                                            setComplaintNotes(`Past Purchase: ${products.find(p => p.id === h.productId)?.name || h.productId}`);
                                            setSearchPhone('');
                                            setCustomerHistory([]);
                                            showToast('Customer details loaded!', 'success');
                                        }}
                                    >
                                        📋 Use Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Capture Section */}
                <div id="section-products" className="card" style={{ padding: '2rem', scrollMarginTop: '100px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎯</span> {t('telecaller.quickCapture')}
                    </h3>

                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <ProductSearch onSelect={handleProductSelect} />
                        </div>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setShowCatalog(true)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                height: '44px'
                            }}
                        >
                            📖 Catalog
                        </button>
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

                        {callType === 'Sales' && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Applied Special Offer</label>
                                <select className="input" value={offerId} onChange={e => setOfferId(e.target.value)}>
                                    <option value="">No Offer</option>
                                    {offers
                                        .filter(o => !o.productId || o.productId === selectedProduct?.id)
                                        .map(o => <option key={o.id} value={o.id}>{o.title}</option>)
                                    }
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>{t('enquiries.callType')}</label>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {[
                                    { id: 'Sales', label: t('enquiries.sales'), icon: '💰' },
                                    { id: 'Service', label: t('enquiries.service'), icon: '🔧' }
                                ].map(type => (
                                    <label key={type.id} style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        background: callType === type.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                                        border: `1px solid ${callType === type.id ? 'var(--primary)' : 'var(--border)'}`,
                                        transition: 'all 0.2s'
                                    }}>
                                        <input type="radio" name="callType" value={type.id} checked={callType === type.id} onChange={e => setCallType(e.target.value as any)} style={{ width: '18px', height: '18px' }} />
                                        <span>{type.icon} {type.label}</span>
                                    </label>
                                ))}
                            </div>

                            {callType === 'Service' && (
                                <div className="animate-fade-in" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <input type="checkbox" checked={warrantyCheck} onChange={e => setWarrantyCheck(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                                        {t('enquiries.warrantyCheck')}
                                    </label>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>{t('enquiries.complaintNotes')}</label>
                                        <textarea
                                            className="input"
                                            rows={2}
                                            value={complaintNotes}
                                            onChange={e => setComplaintNotes(e.target.value)}
                                            placeholder={t('enquiries.optionalNotes')}
                                            style={{ resize: 'vertical', minHeight: '60px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>{t('enquiries.interestedStage')}</label>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {['Ready to Buy', 'Needs Demo', 'General Enquiry'].map(i => (
                                    <label key={i} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input type="radio" name="intent" value={i} checked={intent === i} onChange={e => setIntent(e.target.value)} style={{ width: '18px', height: '18px' }} />
                                        {i === 'Ready to Buy' ? t('intent.readyToBuy') : i === 'Needs Demo' ? t('intent.needsDemo') : t('intent.generalEnquiry')}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.customerName}</span>
                                        <span title={e.callType === 'Service' ? t('enquiries.service') : t('enquiries.sales')}>
                                            {e.callType === 'Service' ? '🔧' : '💰'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {(() => {
                                            const p = products.find(p => p.id === e.productId);
                                            if (!p) return e.productId;
                                            return language === 'ta' ? (p.nameTa || p.name) : p.name;
                                        })()}
                                    </div>
                                    {e.warrantyEndDate && (
                                        <div style={{ fontSize: '0.65rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{
                                                padding: '1px 4px',
                                                borderRadius: '4px',
                                                background: new Date(e.warrantyEndDate) > new Date() ? '#dcfce7' : '#fee2e2',
                                                color: new Date(e.warrantyEndDate) > new Date() ? '#166534' : '#991b1b'
                                            }}>
                                                {new Date(e.warrantyEndDate) > new Date() ? '🛡️ Active' : '⌛ Expired'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                                    <div style={{
                                        padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                        background: e.pipelineStage === 'New' ? '#dcfce7' : '#e0f2fe',
                                        color: e.pipelineStage === 'New' ? '#15803d' : '#0369a1'
                                    }}>
                                        {e.pipelineStage}
                                    </div>
                                    {e.recordingUrl && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <audio controls style={{ height: '20px', width: '80px' }}>
                                                <source src={e.recordingUrl} type="audio/mpeg" />
                                            </audio>
                                            <a href={e.recordingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem' }}>🔗</a>
                                        </div>
                                    )}
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

                {/* Service Reminders List */}
                <div id="section-reminders" className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', scrollMarginTop: '100px', border: serviceReminders.length > 0 ? '1px solid #fed7aa' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: serviceReminders.length > 0 ? '#fff7ed' : 'transparent', padding: '0.5rem', borderRadius: '8px' }}>
                        <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔔 {t('telecaller.serviceReminders')}
                            {serviceReminders.length > 0 && <span style={{ background: '#ea580c', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>{serviceReminders.length}</span>}
                        </h4>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {serviceReminders.map(e => (
                            <div key={e.id} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {products.find(p => p.id === e.productId)?.name || e.productId}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#ea580c', fontWeight: 600 }}>
                                        📅 Purchased: {new Date(e.warrantyStartDate || '').toLocaleDateString()}
                                    </div>
                                </div>
                                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => {
                                    setCustomerName(e.customerName);
                                    setPhone(e.phoneNumber);
                                    setLocation(e.location);
                                    setBranchId(e.branchId);
                                    const prod = products.find(p => p.id === e.productId);
                                    if (prod) setSelectedProduct(prod);
                                    setCallType('Service');
                                    setComplaintNotes(`Routine Service Reminder (Purchased: ${new Date(e.warrantyStartDate || '').toLocaleDateString()})`);
                                    showToast('Ready to capture follow-up!', 'success');
                                    window.scrollTo({ top: document.getElementById('section-products')?.offsetTop || 0, behavior: 'smooth' });
                                }}>{t('common.action')}</button>
                            </div>
                        ))}
                        {serviceReminders.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No pending service reminders for today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
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

            {showCatalog && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px) brightness(0.9)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000,
                    padding: '2rem'
                }}>
                    <div className="animate-fade-in" style={{
                        width: 'min(1200px, 95vw)',
                        height: '85vh',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: 'var(--bg-card)'
                    }}>
                        <ProductCatalog
                            onClose={() => setShowCatalog(false)}
                            onSelect={(p) => {
                                handleProductSelect(p);
                                setShowCatalog(false);
                            }}
                        />
                    </div>
                </div>
            )}

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

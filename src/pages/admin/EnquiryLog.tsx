import React, { useState, useEffect } from 'react';
import type { Enquiry, PipelineStage, Branch } from '../../types';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { useSettings } from '../../context/SettingsContext';

interface EnquiryLogProps {
    role?: 'telecaller' | 'admin' | 'branch_admin';
    branchId?: string;
    onUpdate?: () => void;
}

const EnquiryLog: React.FC<EnquiryLogProps> = ({ role, branchId, onUpdate }) => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const { t, language } = useSettings();
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterStage, setFilterStage] = useState<string>('');
    const [filterBranch, setFilterBranch] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<any[]>([]); // To resolve product names

    // Sale Modal State
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
    const [saleData, setSaleData] = useState({
        amount: 0,
        notes: '',
        warrantyStart: new Date().toISOString().split('T')[0],
        warrantyEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [enquiriesData, branchesData, productsData] = await Promise.all([
                dataService.getEnquiries(),
                dataService.getBranches(),
                dataService.getProducts()
            ]);
            setEnquiries(enquiriesData);
            setBranches(branchesData);
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load data", error);
            showToast(t('common.loading') + ' ' + t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStageChange = async (id: string, newStage: PipelineStage) => {
        if (!user) return;

        if (newStage === 'Closed-Converted') {
            const enquiry = enquiries.find(e => e.id === id);
            setSelectedEnquiryId(id);
            setSaleData({
                amount: enquiry?.closedAmount || 0,
                notes: '', // Notes are usually new for the closure
                warrantyStart: enquiry?.warrantyStartDate || new Date().toISOString().split('T')[0],
                warrantyEnd: enquiry?.warrantyEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
            setIsSaleModalOpen(true);
            return;
        }

        try {
            await dataService.updateEnquiryStage(id, newStage, user.id);
            showToast(t('enquiries.stageUpdateSuccess'), 'success');
            loadData();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update stage", error);
            showToast('Failed to update stage', 'error');
        }
    };

    const handleSaleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedEnquiryId) return;

        try {
            console.log("Submitting sale for enquiry:", selectedEnquiryId, {
                stage: 'Closed-Converted',
                amount: saleData.amount,
                warrantyStart: saleData.warrantyStart,
                warrantyEnd: saleData.warrantyEnd
            });

            // Update stage with all sale details
            await dataService.updateEnquiryStage(
                selectedEnquiryId,
                'Closed-Converted',
                user.id,
                saleData.notes,
                saleData.amount,
                saleData.warrantyStart,
                saleData.warrantyEnd
            );

            setIsSaleModalOpen(false);
            showToast(t('enquiries.stageUpdateSuccess'), 'success');
            loadData();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to complete sale", error);
            showToast('Failed to complete sale', 'error');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: t('enquiries.deleteTitle'),
            message: t('enquiries.deleteConfirm').replace('{0}', name),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            danger: true
        });

        if (confirmed) {
            try {
                await dataService.deleteEnquiry(id);
                showToast(t('enquiries.deleteSuccess'), 'success');
                loadData();
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error("Failed to delete enquiry", error);
                showToast('Failed to delete lead', 'error');
            }
        }
    };

    const filteredEnquiries = enquiries.filter(e => {
        // Telecaller can only see their own enquiries in this view
        if (role === 'telecaller' && e.createdBy !== user?.id) return false;

        // Effective branch filter: prop takes priority, then user.branchId for branch_admin, then local filter
        const effectiveBranchId = branchId || (user?.role === 'branch_admin' ? user.branchId : filterBranch);

        if (effectiveBranchId && effectiveBranchId !== 'all' && e.branchId !== effectiveBranchId) {
            return false;
        }

        if (filterStage && e.pipelineStage !== filterStage) return false;
        return true;
    });

    const getStageLabel = (stage: string) => {
        switch (stage) {
            case 'New': return t('stages.new');
            case 'Qualified': return t('stages.qualified');
            case 'Forwarded': return t('stages.forwarded');
            case 'Contacted': return t('stages.contacted');
            case 'Demo Scheduled': return t('stages.demoScheduled');
            case 'Visit Scheduled': return t('stages.visitScheduled');
            case 'Demo/Visit Done': return t('stages.demoVisitDone');
            case 'Delivery Scheduled': return t('stages.deliveryScheduled');
            case 'Delivered': return t('stages.delivered');
            case 'Closed-Converted': return t('stages.closedConverted');
            case 'Closed-Not Interested': return t('stages.closedNotInterested');
            case 'Resolved': return 'Resolved'; // I'll add this to translations if needed
            default: return stage;
        }
    };

    const getIntentLabel = (intent: string) => {
        switch (intent) {
            case 'Ready to Buy': return t('intent.readyToBuy');
            case 'Needs Demo': return t('intent.needsDemo');
            case 'General Enquiry': return t('intent.generalEnquiry');
            default: return intent;
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    const getWarrantyStatus = (e: Enquiry) => {
        if (e.pipelineStage !== 'Closed-Converted' || !e.warrantyEndDate) return null;
        const expiry = new Date(e.warrantyEndDate);
        const now = new Date();
        return expiry > now ? 'Active' : 'Expired';
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <h3>{t('enquiries.title')} {user?.role === 'branch_admin' && user.branchId && <span style={{ color: '#059669', fontWeight: 'normal' }}>({branches.find(b => b.id === user.branchId)?.name})</span>}</h3>
                <select className="input" style={{ width: 'auto' }} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                    <option value="">{t('enquiries.allStages')}</option>
                    <option value="New">{t('stages.new')}</option>
                    <option value="Qualified">{t('stages.qualified')}</option>
                    <option value="Forwarded">{t('stages.forwarded')}</option>
                    <option value="Contacted">{t('stages.contacted')}</option>
                    <option value="Demo Scheduled">{t('stages.demoScheduled')}</option>
                    <option value="Visit Scheduled">{t('stages.visitScheduled')}</option>
                    <option value="Demo/Visit Done">{t('stages.demoVisitDone')}</option>
                    <option value="Delivery Scheduled">{t('stages.deliveryScheduled')}</option>
                    <option value="Delivered">{t('stages.delivered')}</option>
                    <option value="Closed-Converted">{t('stages.closedConverted')}</option>
                    <option value="Closed-Not Interested">{t('stages.closedNotInterested')}</option>
                    <option value="Resolved">Resolved</option>
                </select>
                {user?.role !== 'branch_admin' && (
                    <select className="input" style={{ width: 'auto' }} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                        <option value="">{t('enquiries.allBranches')}</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                )}
                <button className="btn" onClick={loadData}>{t('enquiries.refresh')}</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: 'var(--bg-table-header)' }}>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.date')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.customerName')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.product')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.callType')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.branch')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.recording')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.stage')}</th>
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.intent')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnquiries.map(e => (
                            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    <div>{new Date(e.createdAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(e.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ fontWeight: 600 }}>{e.customerName}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.phoneNumber}</div>
                                    {e.complaintNotes && (
                                        <div style={{ fontSize: '0.75rem', color: '#854d0e', fontStyle: 'italic', marginTop: '0.25rem', background: '#fefce8', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                            📝 {e.complaintNotes}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {(() => {
                                        const product = products.find(p => p.id === e.productId);
                                        if (!product) return e.productId;
                                        return language === 'ta' ? (product.nameTa || product.name) : product.name;
                                    })()}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '1rem' }}>{e.callType === 'Service' ? '🔧' : '💰'}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                {e.callType === 'Service' ? t('enquiries.service') : t('enquiries.sales')}
                                            </span>
                                        </div>
                                        {e.callType === 'Service' && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {e.warrantyCheck ? `✅ ${t('enquiries.warrantyCheck')}` : `❌ ${t('enquiries.warrantyCheck')}`}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {branches.find(b => b.id === e.branchId)?.name || 'N/A'}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {e.recordingUrl ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <audio controls style={{ height: '30px', width: '120px' }}>
                                                <source src={e.recordingUrl} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                            <a href={e.recordingUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '4px', borderRadius: '4px', background: 'var(--bg-secondary)', textDecoration: 'none', fontSize: '0.8rem' }} title={t('enquiries.playRecording')}>
                                                🔗
                                            </a>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No recording</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <select
                                        value={e.pipelineStage}
                                        onChange={(ev) => handleStageChange(e.id, ev.target.value as PipelineStage)}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            width: '100%',
                                            fontSize: '0.85rem',
                                            background: e.pipelineStage === 'Closed-Converted' ? '#dcfce7' : e.pipelineStage === 'Resolved' ? '#f0f9ff' : 'white',
                                            cursor: e.pipelineStage === 'Closed-Converted' ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={e.pipelineStage === 'Closed-Converted'}
                                    >
                                        {[
                                            'New', 'Qualified', 'Forwarded', 'Contacted',
                                            'Demo Scheduled', 'Visit Scheduled', 'Demo/Visit Done',
                                            'Delivery Scheduled', 'Delivered', 'Closed-Converted',
                                            'Closed-Not Interested', 'Resolved'
                                        ].map(stage => (
                                            <option key={stage} value={stage}>{getStageLabel(stage)}</option>
                                        ))}
                                    </select>
                                    {e.pipelineStage === 'Closed-Converted' && e.closedAmount !== undefined && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: '#059669', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span>💰 Sold: ₹{e.closedAmount.toLocaleString()}</span>
                                            {e.warrantyEndDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>🛡️ Until: {new Date(e.warrantyEndDate).toLocaleDateString()}</span>
                                                    <span style={{
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.65rem',
                                                        background: getWarrantyStatus(e) === 'Active' ? '#dcfce7' : '#fee2e2',
                                                        color: getWarrantyStatus(e) === 'Active' ? '#166534' : '#991b1b',
                                                        border: `1px solid ${getWarrantyStatus(e) === 'Active' ? '#bbf7d0' : '#fecaca'}`
                                                    }}>
                                                        {getWarrantyStatus(e)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {e.tracking && e.tracking.status === 'Scheduled' && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: '#ea580c', fontWeight: 500 }}>
                                            📅 {e.tracking.type}: {new Date(e.tracking.scheduledDate).toLocaleString()}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'var(--bg-secondary)' }}>{getIntentLabel(e.purchaseIntent)}</span>
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleDelete(e.id, e.customerName)}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '8px',
                                            border: '1px solid #fee2e2',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            transition: 'all 0.2s'
                                        }}
                                        title={t('enquiries.deleteTitle')}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredEnquiries.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('enquiries.noEnquiries')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isSaleModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px) brightness(0.9)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div className="card animate-fade-in" style={{ width: '450px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>🎊 Complete Sale</h3>
                        <form onSubmit={handleSaleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Sale Amount (₹)</label>
                                <input type="number" className="input" required value={saleData.amount} onChange={e => setSaleData({ ...saleData, amount: Number(e.target.value) })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Closure Notes</label>
                                <textarea className="input" value={saleData.notes} onChange={e => setSaleData({ ...saleData, notes: e.target.value })} placeholder="Any special requests or details..." style={{ height: '80px', paddingTop: '10px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Warranty Start</label>
                                    <input type="date" className="input" value={saleData.warrantyStart} onChange={e => setSaleData({ ...saleData, warrantyStart: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Warranty End</label>
                                    <input type="date" className="input" value={saleData.warrantyEnd} onChange={e => setSaleData({ ...saleData, warrantyEnd: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn" onClick={() => setIsSaleModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Mark as Sold</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnquiryLog;

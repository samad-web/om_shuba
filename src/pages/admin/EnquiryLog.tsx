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
}

const EnquiryLog: React.FC<EnquiryLogProps> = ({ role, branchId }) => {
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

        let amount: number | undefined = undefined;
        let notes: string | undefined = undefined;

        if (newStage === 'Closed-Converted') {
            const input = window.prompt(t('enquiries.enterSaleAmount'));
            if (input === null) return; // User cancelled
            amount = parseFloat(input) || 0;
            // Maybe ask for notes too?
            const notesInput = window.prompt(t('enquiries.optionalNotes'));
            if (notesInput) notes = notesInput;
        }

        try {
            await dataService.updateEnquiryStage(id, newStage, user.id, notes, amount);
            showToast(t('enquiries.stageUpdateSuccess'), 'success');
            loadData(); // Reload to see changes
        } catch (error) {
            console.error("Failed to update stage", error);
            showToast('Failed to update stage', 'error');
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
                            <th style={{ padding: '0.75rem' }}>{t('enquiries.branch')}</th>
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
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {(() => {
                                        const product = products.find(p => p.id === e.productId);
                                        if (!product) return e.productId;
                                        return language === 'ta' ? (product.nameTa || product.name) : product.name;
                                    })()}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {branches.find(b => b.id === e.branchId)?.name || 'N/A'}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <select
                                        value={e.pipelineStage}
                                        onChange={(ev) => handleStageChange(e.id, ev.target.value as PipelineStage)}
                                        style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', fontSize: '0.85rem' }}
                                    >
                                        {[
                                            'New', 'Qualified', 'Forwarded', 'Contacted',
                                            'Demo Scheduled', 'Visit Scheduled', 'Demo/Visit Done',
                                            'Delivery Scheduled', 'Delivered', 'Closed-Converted',
                                            'Closed-Not Interested'
                                        ].map(stage => (
                                            <option key={stage} value={stage}>{getStageLabel(stage)}</option>
                                        ))}
                                    </select>
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
        </div>
    );
};

export default EnquiryLog;

import React, { useState, useEffect } from 'react';
import type { Enquiry, PipelineStage, Branch } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface EnquiryLogProps {
    role?: 'telecaller' | 'admin' | 'branch_admin';
}

const EnquiryLog: React.FC<EnquiryLogProps> = ({ role }) => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const { user } = useAuth();

    // Filters
    const [filterStage, setFilterStage] = useState<string>('');
    const [filterBranch, setFilterBranch] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setEnquiries(storage.getEnquiries());
        setBranches(storage.getBranches());
    };

    const handleStageChange = (id: string, newStage: PipelineStage) => {
        if (!user) return;

        let amount: number | undefined = undefined;
        if (newStage === 'Closed-Converted') {
            const input = window.prompt("Enter Final Sale Amount (₹):");
            if (input === null) return; // User cancelled
            amount = parseFloat(input) || 0;
        }

        storage.updateEnquiryStage(id, newStage, user.id, undefined, amount);
        loadData(); // Reload to see changes
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the lead for "${name}"? This action cannot be undone.`)) {
            storage.deleteEnquiry(id);
            loadData();
        }
    };

    const filteredEnquiries = enquiries.filter(e => {
        // Telecaller can only see their own enquiries in this view
        if (role === 'telecaller' && e.createdBy !== user?.id) return false;

        // Branch admin can only see their branch's enquiries
        if (user?.role === 'branch_admin' && user.branchId && e.branchId !== user.branchId) {
            return false;
        }

        if (filterStage && e.pipelineStage !== filterStage) return false;
        if (filterBranch && e.branchId !== filterBranch) return false;
        return true;
    });

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <h3>Enquiry Log {user?.role === 'branch_admin' && user.branchId && <span style={{ color: '#059669', fontWeight: 'normal' }}>({branches.find(b => b.id === user.branchId)?.name})</span>}</h3>
                <select className="input" style={{ width: 'auto' }} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                    <option value="">All Stages</option>
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Forwarded">Forwarded</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Visit Scheduled">Visit Scheduled</option>
                    <option value="Demo/Visit Done">Demo/Visit Done</option>
                    <option value="Delivery Scheduled">Delivery Scheduled</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Closed-Converted">Closed-Converted</option>
                    <option value="Closed-Not Interested">Closed-Not Interested</option>
                </select>
                {user?.role !== 'branch_admin' && (
                    <select className="input" style={{ width: 'auto' }} value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                )}
                <button className="btn" onClick={loadData}>Refresh</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                            <th style={{ padding: '0.75rem' }}>Date</th>
                            <th style={{ padding: '0.75rem' }}>Customer</th>
                            <th style={{ padding: '0.75rem' }}>Product</th>
                            <th style={{ padding: '0.75rem' }}>Branch</th>
                            <th style={{ padding: '0.75rem' }}>Stage</th>
                            <th style={{ padding: '0.75rem' }}>Intent</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
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
                                    {storage.getProducts().find(p => p.id === e.productId)?.name || e.productId}
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
                                        <option value="New">New</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Forwarded">Forwarded</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Demo Scheduled">Demo Scheduled</option>
                                        <option value="Visit Scheduled">Visit Scheduled</option>
                                        <option value="Demo/Visit Done">Demo/Visit Done</option>
                                        <option value="Delivery Scheduled">Delivery Scheduled</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Closed-Converted">Closed-Converted</option>
                                        <option value="Closed-Not Interested">Closed-Not Interested</option>
                                    </select>
                                    {e.tracking && e.tracking.status === 'Scheduled' && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: '#ea580c', fontWeight: 500 }}>
                                            📅 {e.tracking.type}: {new Date(e.tracking.scheduledDate).toLocaleString()}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#f1f5f9' }}>{e.purchaseIntent}</span>
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
                                        title="Delete Lead"
                                        onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredEnquiries.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No enquiries found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnquiryLog;

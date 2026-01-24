import React, { useState, useEffect } from 'react';
import type { Enquiry, PipelineStage, Branch } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

const EnquiryLog: React.FC = () => {
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
        storage.updateEnquiryStage(id, newStage, user.id);
        loadData(); // Reload to see changes
    };

    const filteredEnquiries = enquiries.filter(e => {
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
                    <option value="Demo/Visit Done">Demo/Visit Done</option>
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

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                        <th style={{ padding: '0.5rem' }}>Date</th>
                        <th style={{ padding: '0.5rem' }}>Customer</th>
                        <th style={{ padding: '0.5rem' }}>Product</th>
                        <th style={{ padding: '0.5rem' }}>Branch</th>
                        <th style={{ padding: '0.5rem' }}>Stage</th>
                        <th style={{ padding: '0.5rem' }}>Intent</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEnquiries.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>{new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString()}</td>
                            <td style={{ padding: '0.5rem' }}>
                                <div>{e.customerName}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.phoneNumber}</div>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {storage.getProducts().find(p => p.id === e.productId)?.name || e.productId}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {branches.find(b => b.id === e.branchId)?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                <select
                                    value={e.pipelineStage}
                                    onChange={(ev) => handleStageChange(e.id, ev.target.value as PipelineStage)}
                                    style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                >
                                    <option value="New">New</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Forwarded">Forwarded</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Demo/Visit Done">Demo/Visit Done</option>
                                    <option value="Closed-Converted">Closed-Converted</option>
                                    <option value="Closed-Not Interested">Closed-Not Interested</option>
                                </select>
                            </td>
                            <td style={{ padding: '0.5rem' }}>{e.purchaseIntent}</td>
                        </tr>
                    ))}
                    {filteredEnquiries.length === 0 && (
                        <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No enquiries found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EnquiryLog;

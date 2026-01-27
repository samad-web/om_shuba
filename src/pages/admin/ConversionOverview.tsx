import React, { useState, useEffect } from 'react';
import type { Enquiry } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

const ConversionOverview: React.FC = () => {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Enquiry[]>([]);
    const [stats, setStats] = useState({ totalValue: 0, count: 0, avgValue: 0 });

    useEffect(() => {
        loadDeals();
    }, []);

    const loadDeals = () => {
        const all = storage.getEnquiries();
        const converted = all.filter(e => e.pipelineStage === 'Closed-Converted');

        // Filter by role access
        const filtered = converted.filter(e => {
            if (user?.role === 'telecaller') return e.createdBy === user.id;
            if (user?.role === 'branch_admin') return e.branchId === user.branchId;
            return true; // Admin/Owner sees all
        });

        const totalValue = filtered.reduce((sum, e) => sum + (e.closedAmount || 0), 0);

        setDeals(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setStats({
            totalValue,
            count: filtered.length,
            avgValue: filtered.length > 0 ? Math.round(totalValue / filtered.length) : 0
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b, #15803d)', color: 'white' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Total Closed Volume</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹{stats.totalValue.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Deals Closed</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.count}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Average Deal Value</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1' }}>₹{stats.avgValue.toLocaleString()}</div>
                </div>
            </div>

            {/* Deals List */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontWeight: 800 }}>Recent Converted Deals</h4>
                    <button className="btn" onClick={loadDeals} style={{ fontSize: '0.75rem' }}>🔄 Refresh</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--bg-table-header)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Customer</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Product</th>
                                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Final Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(deal => (
                                <tr key={deal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                                        {new Date(deal.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{deal.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deal.phoneNumber}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                                        {storage.getProducts().find(p => p.id === deal.productId)?.name || 'Product'}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                                        ₹{deal.closedAmount?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {deals.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No deals converted yet. Keep pushing! 🚜
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConversionOverview;

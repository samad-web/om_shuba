import React, { useState, useEffect } from 'react';
import type { Enquiry } from '../../types';
import { dataService } from '../../services/DataService';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const ConversionOverview: React.FC = () => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [deals, setDeals] = useState<Enquiry[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalValue: 0, count: 0, avgValue: 0 });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [allEnquiries, allProducts] = await Promise.all([
                dataService.getEnquiries(),
                dataService.getProducts()
            ]);

            setProducts(allProducts);

            const converted = allEnquiries.filter(e => e.pipelineStage === 'Closed-Converted');

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
        } catch (error) {
            console.error("Failed to load conversion data", error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b, #15803d)', color: 'white' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>{t('metrics.totalClosedVolume')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹{stats.totalValue.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('metrics.dealsClosed')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.count}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('metrics.avgDealValue')}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1' }}>₹{stats.avgValue.toLocaleString()}</div>
                </div>
            </div>

            {/* Deals List */}
            <div className="card card-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontWeight: 800 }}>{t('metrics.recentConvertedDeals')}</h4>
                    <button className="btn" onClick={loadData} style={{ fontSize: '0.75rem' }}>🔄 {t('common.refresh')}</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'var(--bg-table-header)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0.5rem' }}>{t('metrics.date')}</th>
                                <th style={{ padding: '1rem 0.5rem' }}>{t('metrics.customer')}</th>
                                <th style={{ padding: '1rem 0.5rem' }}>{t('metrics.product')}</th>
                                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>{t('metrics.finalAmount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(deal => (
                                <tr key={deal.id} className="deal-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                                        {new Date(deal.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{deal.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deal.phoneNumber}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem' }}>
                                        {products.find(p => p.id === deal.productId)?.name || 'Product'}
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                                        ₹{deal.closedAmount?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {deals.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {t('metrics.noDealsYet')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>
                {`
                .card-premium {
                    transition: all 0.3s ease;
                }
                .card-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.2);
                    border-color: var(--primary) !important;
                }
                .deal-row {
                    transition: all 0.2s ease;
                }
                .deal-row:hover {
                    background-color: rgba(var(--primary-rgb), 0.02) !important;
                    transform: scale(1.002);
                }
                `}
            </style>
        </div>
    );
};

export default ConversionOverview;

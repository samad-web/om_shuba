import React, { useState, useEffect } from 'react';
import type { Branch } from '../../types';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { useSettings } from '../../context/SettingsContext';

const BranchMaster: React.FC = () => {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const { t } = useSettings();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Branch>>({
        name: '', location: '', contactNumber: '', active: true
    });

    // Performance Metrics
    const [metrics, setMetrics] = useState<Record<string, { total: number, converted: number, active?: number, rate: number, rank: number }>>({});
    const [topBranchId, setTopBranchId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allBranches, allEnquiries] = await Promise.all([
                dataService.getBranches(),
                dataService.getEnquiries()
            ]);

            // Filter branches
            const visibleBranches = (user?.role === 'branch_admin' && user.branchId)
                ? allBranches.filter(b => b.id === user.branchId)
                : allBranches;
            setBranches(visibleBranches);

            // Calculate Metrics
            const metricsMap: Record<string, { total: number, converted: number, active: number, rate: number, rank: number, score: number }> = {};

            visibleBranches.forEach(b => {
                const branchEnquiries = allEnquiries.filter(e => e.branchId === b.id);
                const total = branchEnquiries.length;
                const converted = branchEnquiries.filter(e => e.pipelineStage === 'Closed-Converted').length;
                // Active: Not closed (any stage that isn't Converted or Not Interested)
                const active = branchEnquiries.filter(e => !['Closed-Converted', 'Closed-Not Interested'].includes(e.pipelineStage)).length;

                const rate = total > 0 ? Math.round((converted / total) * 100) : 0;
                // Weighted score: conversion rate (70%) + volume factor (30%)
                const score = (rate * 0.7) + (Math.min(total, 50) * 0.6);

                metricsMap[b.id] = { total, converted, active, rate, rank: 0, score };
            });

            // Calculate Ranks
            const sortedIds = Object.keys(metricsMap).sort((a, b) => metricsMap[b].score - metricsMap[a].score);
            sortedIds.forEach((id, index) => {
                metricsMap[id].rank = index + 1;
            });

            setMetrics(metricsMap);
            setTopBranchId(sortedIds[0] || null);

            if (!loading) showToast('Performance analysis updated', 'success');

        } catch (error) {
            console.error("Failed to load data", error);
            showToast(t('common.loading') + ' ' + t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // ... (keep openModal and others) ...

    const getPerformanceColor = (rate: number) => {
        if (rate >= 40) return '#16a34a'; // Green
        if (rate >= 20) return '#ea580c'; // Orange
        return '#dc2626'; // Red
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3>{t('branches.title')} {user?.role === 'branch_admin' && user.branchId && <span style={{ color: '#059669', fontWeight: 'normal' }}>({branches[0]?.name})</span>}</h3>
                    <button
                        onClick={() => loadData()}
                        className="btn"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                        title="Re-analyze branch performance"
                    >
                        🔄 Refresh Analysis
                    </button>
                </div>
                {user?.role !== 'branch_admin' && (
                    <button className="btn btn-primary" onClick={() => openModal()}>+ {t('branches.addBranch')}</button>
                )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: 'var(--bg-table-header)' }}>
                        <th style={{ padding: '0.5rem' }}>{t('branches.branchName')}</th>
                        <th style={{ padding: '0.5rem' }}>{t('branches.location')}</th>
                        <th style={{ padding: '0.5rem' }}>{t('branches.contactNumber')}</th>
                        <th style={{ padding: '0.5rem' }}>{t('common.status')}</th>
                        <th style={{ padding: '0.5rem', width: '200px' }}>Performance</th>
                        <th style={{ padding: '0.5rem' }}>{t('common.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>{b.name}</td>
                            <td style={{ padding: '0.5rem' }}>{b.location}</td>
                            <td style={{ padding: '0.5rem' }}>{b.contactNumber}</td>
                            <td style={{ padding: '0.5rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                    background: b.active ? '#dcfce7' : '#fee2e2',
                                    color: b.active ? '#15803d' : '#b91c1c'
                                }}>
                                    {b.active ? t('common.active') : t('common.inactive')}
                                </span>
                            </td>
                            <td style={{ padding: '0.5rem', width: '200px' }}>
                                {/* Performance Visual */}
                                {(() => {
                                    const m = metrics[b.id] || { total: 0, converted: 0, rate: 0, rank: 0 };
                                    const isTop = topBranchId === b.id && m.total > 0;
                                    const color = getPerformanceColor(m.rate);

                                    return (
                                        <div className="group" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'help' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '0.7rem' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.rate}%</span>
                                                    {isTop && <span className="animate-pulse" style={{ fontSize: '0.8rem' }}>👑</span>}
                                                </div>
                                                <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div className="performance-bar" style={{
                                                        width: `${m.rate}%`,
                                                        height: '100%',
                                                        background: isTop ? `linear-gradient(90deg, ${color}, #fbbf24)` : color,
                                                        borderRadius: '3px',
                                                        transition: 'width 1s ease-out',
                                                        boxShadow: isTop ? '0 0 8px rgba(251, 191, 36, 0.5)' : 'none'
                                                    }} />
                                                </div>
                                            </div>

                                            {/* Minimal Tooltip on Hover */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                borderRadius: '8px', padding: '0.75rem',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                zIndex: 100, width: '150px',
                                                opacity: 0, pointerEvents: 'none',
                                                marginBottom: '8px',
                                                fontSize: '0.75rem',
                                                transition: 'opacity 0.2s',
                                                textAlign: 'center'
                                            }} className="hover-tooltip">
                                                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{b.name}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Total Leads:</span> <strong>{m.total}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6' }}>
                                                    <span>In Pipeline:</span> <strong>{m.active || 0}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                                    <span>Converted:</span> <strong>{m.converted}</strong>
                                                </div>
                                                <div style={{ margin: '0.25rem 0', height: '1px', background: 'var(--border)' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: color }}>
                                                    <span>Win Rate:</span> <strong>{m.rate}%</strong>
                                                </div>
                                                {isTop && <div style={{ fontSize: '0.65rem', color: '#d97706', marginTop: '0.25rem', fontWeight: 700 }}>🏆 Top Performer</div>}
                                            </div>
                                            <style>{`
                                                .group:hover .hover-tooltip { opacity: 1; pointer-events: auto; }
                                                @keyframes loadBar { from { width: 0; } }
                                                .performance-bar { animation: loadBar 1s ease-out; }
                                            `}</style>
                                        </div>
                                    );
                                })()}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(b)}>{t('common.edit')}</button>
                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem', color: b.active ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(b)}>
                                    {b.active ? t('branches.disable') : t('branches.enable')}
                                </button>
                                {user?.role !== 'branch_admin' && (
                                    <button className="btn" style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fee2e2' }} onClick={() => deleteBranch(b)}>
                                        {t('common.delete')}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000, padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>{editingBranch ? t('branches.editBranch') : t('branches.addBranch')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>{t('branches.branchName')}</label>
                                <input className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>{t('branches.location')}</label>
                                <input className="input" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>{t('branches.contactNumber')}</label>
                                <input className="input" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchMaster;

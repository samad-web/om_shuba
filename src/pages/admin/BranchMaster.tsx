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

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        setLoading(true);
        try {
            const allBranches = await dataService.getBranches();
            // Branch admin can only see their own branch
            if (user?.role === 'branch_admin' && user.branchId) {
                setBranches(allBranches.filter(b => b.id === user.branchId));
            } else {
                setBranches(allBranches);
            }
        } catch (error) {
            console.error("Failed to load branches", error);
            showToast(t('common.loading') + ' ' + t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (branch?: Branch) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData(branch);
        } else {
            setEditingBranch(null);
            setFormData({ name: '', location: '', contactNumber: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                // Update existing branch
                await dataService.updateBranch({ ...editingBranch, ...formData } as Branch);
                showToast(t('branches.saveSuccess'), 'success');
            } else {
                // Add new branch
                const newBranchId = 'b' + Date.now();
                const newBranch = { ...formData, id: newBranchId } as Branch;
                await dataService.addBranch(newBranch);

                // Automatically create branch admin account
                const branchNameSlug = formData.name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'branch';
                const newBranchAdmin = {
                    id: 'u' + Date.now(),
                    username: `admin_${branchNameSlug}`,
                    password: 'password', // Default password
                    role: 'branch_admin' as const,
                    name: `${formData.name} Admin`,
                    branchId: newBranchId
                };
                await dataService.addUser(newBranchAdmin);

                showToast(t('branches.createSuccess').replace('{0}', newBranchAdmin.username).replace('{1}', 'password'), 'success');
            }
            setIsModalOpen(false);
            loadBranches();
        } catch (error) {
            console.error("Failed to save branch", error);
            showToast('Failed to save branch', 'error');
        }
    };

    const toggleStatus = async (branch: Branch) => {
        try {
            await dataService.updateBranch({ ...branch, active: !branch.active });
            loadBranches();
            showToast(t('branches.statusUpdate').replace('{0}', !branch.active ? t('common.active') : t('common.inactive')), 'success');
        } catch (error) {
            console.error("Failed to update status", error);
            showToast('Failed to update status', 'error');
        }
    };

    const deleteBranch = async (branch: Branch) => {
        const confirmed = await confirm({
            title: t('branches.deleteBranch'),
            message: t('branches.confirmDelete'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            danger: true
        });

        if (confirmed) {
            try {
                await dataService.deleteBranch(branch.id);
                loadBranches();
                showToast(t('branches.deleteSuccess'), 'success');
            } catch (error) {
                console.error("Failed to delete branch", error);
                showToast('Failed to delete branch', 'error');
            }
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>{t('branches.title')} {user?.role === 'branch_admin' && user.branchId && <span style={{ color: '#059669', fontWeight: 'normal' }}>({branches[0]?.name})</span>}</h3>
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
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ width: '400px' }}>
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

import React, { useState, useEffect } from 'react';
import type { Branch } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

const BranchMaster: React.FC = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [formData, setFormData] = useState<Partial<Branch>>({
        name: '', location: '', contactNumber: '', active: true
    });

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = () => {
        const allBranches = storage.getBranches();
        // Branch admin can only see their own branch
        if (user?.role === 'branch_admin' && user.branchId) {
            setBranches(allBranches.filter(b => b.id === user.branchId));
        } else {
            setBranches(allBranches);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBranch) {
            // Update existing branch
            const all = storage.getBranches();
            const updated = all.map(b => b.id === editingBranch.id ? { ...editingBranch, ...formData } as Branch : b);
            localStorage.setItem('tc_branches', JSON.stringify(updated));
        } else {
            // Add new branch
            const newBranchId = 'b' + Date.now();
            const newBranch = { ...formData, id: newBranchId } as Branch;
            storage.addBranch(newBranch);

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
            storage.addUser(newBranchAdmin);

            alert(`Branch created successfully!\n\nBranch Admin Account:\nUsername: ${newBranchAdmin.username}\nPassword: password\n\nPlease save these credentials.`);
        }
        setIsModalOpen(false);
        loadBranches();
    };

    const toggleStatus = (branch: Branch) => {
        const all = storage.getBranches();
        const updated = all.map(b => b.id === branch.id ? { ...b, active: !b.active } : b);
        localStorage.setItem('tc_branches', JSON.stringify(updated));
        loadBranches();
    };

    const deleteBranch = (branch: Branch) => {
        if (window.confirm(`Are you sure you want to delete "${branch.name}"? This action cannot be undone.`)) {
            storage.deleteBranch(branch.id);
            loadBranches();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Branch Management {user?.role === 'branch_admin' && user.branchId && <span style={{ color: '#059669', fontWeight: 'normal' }}>({branches[0]?.name})</span>}</h3>
                {user?.role !== 'branch_admin' && (
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Branch</button>
                )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                        <th style={{ padding: '0.5rem' }}>Name</th>
                        <th style={{ padding: '0.5rem' }}>Location</th>
                        <th style={{ padding: '0.5rem' }}>Contact</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem' }}>Actions</th>
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
                                    {b.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(b)}>Edit</button>
                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem', color: b.active ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(b)}>
                                    {b.active ? 'Disable' : 'Enable'}
                                </button>
                                {user?.role !== 'branch_admin' && (
                                    <button className="btn" style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fee2e2' }} onClick={() => deleteBranch(b)}>
                                        Delete
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
                        <h3>{editingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Name</label>
                                <input className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Location</label>
                                <input className="input" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Contact Number</label>
                                <input className="input" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchMaster;

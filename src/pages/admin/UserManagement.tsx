import React, { useState, useEffect } from 'react';
import type { User, UserRole, Branch } from '../../types';
import { storage } from '../../services/storage';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('telecaller');
    const [branchId, setBranchId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setUsers(storage.getUsers());
        setBranches(storage.getBranches());
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            const updated: User = { ...editingUser, username, name, role, branchId: role === 'admin' ? undefined : branchId };
            // If password is provided, update it
            if (password) updated.password = password;
            storage.updateUser(updated);
        } else {
            const newUser: User = {
                id: 'u' + Date.now(),
                username,
                password,
                name,
                role,
                branchId: role === 'admin' ? undefined : branchId
            };
            storage.addUser(newUser);
        }

        resetForm();
        loadData();
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setName('');
        setRole('telecaller');
        setBranchId('');
        setIsAdding(false);
        setEditingUser(null);
    };

    const startEdit = (u: User) => {
        setEditingUser(u);
        setUsername(u.username);
        setName(u.name);
        setRole(u.role);
        setBranchId(u.branchId || '');
        setPassword(''); // Don't show password for security
        setIsAdding(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete staff account for "${name}"? This cannot be undone.`)) {
            storage.deleteUser(id);
            loadData();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Staff Management</h3>
                {!isAdding && <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ New Account</button>}
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc', border: '2px solid var(--primary-light)' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Edit Account' : 'Create New Account'}</h4>
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Username *</label>
                            <input className="input" required value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{editingUser ? 'New Password (Optional)' : 'Password *'}</label>
                            <input className="input" required={!editingUser} type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Full Name *</label>
                            <input className="input" required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Role *</label>
                            <select className="input" required value={role} onChange={e => setRole(e.target.value as UserRole)}>
                                <option value="admin">Owner / Regional Head</option>
                                <option value="branch_admin">Branch Admin</option>
                                <option value="telecaller">Telecaller</option>
                            </select>
                        </div>
                        {role !== 'admin' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Branch Assignment *</label>
                                <select className="input" required value={branchId} onChange={e => setBranchId(e.target.value)}>
                                    <option value="">Select Branch</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" className="btn" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{editingUser ? 'Update Account' : 'Create Account'}</button>
                        </div>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Username</th>
                        <th style={{ padding: '1rem' }}>Role</th>
                        <th style={{ padding: '1rem' }}>Branch</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                            <td style={{ padding: '1rem' }}>{u.username}</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: u.role === 'admin' ? '#fef3c7' : u.role === 'branch_admin' ? '#e0f2fe' : '#dcfce7',
                                    color: u.role === 'admin' ? '#92400e' : u.role === 'branch_admin' ? '#075985' : '#166534'
                                }}>
                                    {u.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {branches.find(b => b.id === u.branchId)?.name || 'Central Command'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button className="btn" onClick={() => startEdit(u)} style={{ marginRight: '0.5rem' }}>Edit</button>
                                {u.username !== 'owner' && (
                                    <button className="btn" onClick={() => handleDelete(u.id, u.name)} style={{ color: '#dc2626' }}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;

import React, { useState, useEffect } from 'react';
import type { User, UserRole, Branch } from '../../types';
import { dataService } from '../../services/DataService';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { useSettings } from '../../context/SettingsContext';

const UserManagement: React.FC = () => {
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const { t } = useSettings();
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('telecaller');
    const [branchId, setBranchId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, branchesData] = await Promise.all([
                dataService.getUsers(),
                dataService.getBranches()
            ]);
            setUsers(usersData);
            setBranches(branchesData);
        } catch (error) {
            console.error("Failed to load data", error);
            showToast(t('common.loading') + ' ' + t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updated: User = { ...editingUser, username, name, role, branchId: role === 'admin' ? undefined : branchId };
                // If password is provided, update it
                if (password) updated.password = password;
                await dataService.updateUser(updated);
                showToast(t('users.updateSuccess'), 'success');
            } else {
                const newUser: User = {
                    id: 'u' + Date.now(),
                    username,
                    password,
                    name,
                    role,
                    branchId: role === 'admin' ? undefined : branchId
                };
                await dataService.addUser(newUser);
                showToast(t('users.createSuccess'), 'success');
            }

            resetForm();
            loadData();
        } catch (error) {
            console.error("Failed to save user", error);
            showToast('Failed to save user', 'error');
        }
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

    const handleDelete = async (id: string, name: string) => {
        const confirmed = await confirm({
            title: t('users.deleteTitle'),
            message: t('users.deleteConfirm').replace('{0}', name),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            danger: true
        });

        if (confirmed) {
            try {
                await dataService.deleteUser(id);
                loadData();
                showToast(t('users.deleteSuccess'), 'success');
            } catch (error) {
                console.error("Failed to delete user", error);
                showToast('Failed to delete user', 'error');
            }
        }
    };

    const getRoleLabel = (r: string) => {
        if (r === 'admin') return t('users.adminRole');
        if (r === 'branch_admin') return t('users.branchAdminRole');
        if (r === 'telecaller') return t('users.telecallerRole');
        return r;
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('users.title')}</h3>
                {!isAdding && <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ {t('users.newAccount')}</button>}
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-secondary)', border: '2px solid var(--primary-light)' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>{editingUser ? t('users.editAccount') : t('users.addUser')}</h4>
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('users.userName')} *</label>
                            <input className="input" required value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{editingUser ? t('users.newPassword') : t('users.password') + ' *'}</label>
                            <input className="input" required={!editingUser} type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('users.fullName')} *</label>
                            <input className="input" required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('users.role')} *</label>
                            <select className="input" required value={role} onChange={e => setRole(e.target.value as UserRole)}>
                                <option value="admin">{t('users.adminRole')}</option>
                                <option value="branch_admin">{t('users.branchAdminRole')}</option>
                                <option value="telecaller">{t('users.telecallerRole')}</option>
                            </select>
                        </div>
                        {role !== 'admin' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('users.branchAssignment')} *</label>
                                <select className="input" required value={branchId} onChange={e => setBranchId(e.target.value)}>
                                    <option value="">{t('users.selectBranch')}</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" className="btn" onClick={resetForm}>{t('common.cancel')}</button>
                            <button type="submit" className="btn btn-primary">{editingUser ? t('users.updateUser') : t('users.addUser')}</button>
                        </div>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: 'var(--bg-table-header)' }}>
                        <th style={{ padding: '1rem' }}>{t('users.fullName')}</th>
                        <th style={{ padding: '1rem' }}>{t('users.userName')}</th>
                        <th style={{ padding: '1rem' }}>{t('users.role')}</th>
                        <th style={{ padding: '1rem' }}>{t('enquiries.branch')}</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>{t('common.actions')}</th>
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
                                    {getRoleLabel(u.role)}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {branches.find(b => b.id === u.branchId)?.name || t('users.centralCommand')}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button className="btn" onClick={() => startEdit(u)} style={{ marginRight: '0.5rem' }}>{t('common.edit')}</button>
                                {u.username !== 'owner' && (
                                    <button className="btn" onClick={() => handleDelete(u.id, u.name)} style={{ color: '#dc2626' }}>{t('common.delete')}</button>
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../components/Toast';
import { dataService } from '../../services/DataService';
import type { WhatsAppContent } from '../../types';

const CommunityUpdates: React.FC = () => {
    const { user } = useAuth();
    const { t } = useSettings();
    const { showToast } = useToast();
    const [updates, setUpdates] = useState<WhatsAppContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<WhatsAppContent | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        mediaUrl: '',
        mediaType: 'image' as 'image' | 'video',
        scheduledAt: '',
        status: 'draft' as 'draft' | 'scheduled' | 'sent'
    });

    useEffect(() => {
        loadUpdates();
    }, []);

    const loadUpdates = async () => {
        setLoading(true);
        try {
            const data = await dataService.getWhatsAppContent();
            setUpdates(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to load WhatsApp updates", error);
            showToast('Failed to load updates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (update?: WhatsAppContent) => {
        if (update) {
            setEditingUpdate(update);
            setFormData({
                title: update.title,
                content: update.content,
                mediaUrl: update.mediaUrl || '',
                mediaType: update.mediaType || 'image',
                scheduledAt: update.scheduledAt || '',
                status: update.status
            });
        } else {
            setEditingUpdate(null);
            setFormData({
                title: '',
                content: '',
                mediaUrl: '',
                mediaType: 'image',
                scheduledAt: '',
                status: 'draft'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (editingUpdate) {
                await dataService.updateWhatsAppContent({
                    ...editingUpdate,
                    ...formData
                });
                showToast('Update updated successfully', 'success');
            } else {
                await dataService.addWhatsAppContent({
                    id: crypto.randomUUID(),
                    ...formData,
                    createdAt: new Date().toISOString(),
                    createdBy: user.id
                });
                showToast('Update created successfully', 'success');
            }
            setIsModalOpen(false);
            loadUpdates();
        } catch (error) {
            console.error("Failed to save WhatsApp update", error);
            showToast('Failed to save update', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this update?')) return;
        try {
            await dataService.deleteWhatsAppContent(id);
            showToast('Update deleted', 'success');
            loadUpdates();
        } catch (error) {
            console.error("Failed to delete update", error);
            showToast('Failed to delete update', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading updates...</div>;

    return (
        <div className="whatsapp-manager">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>📢 WhatsApp Community Updates</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Broadcast news and offers to your customers</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    ✨ {t('common.action')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {updates.map(update => (
                    <div key={update.id} className="card animate-fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: update.status === 'sent' ? '#dcfce7' : update.status === 'scheduled' ? '#e0f2fe' : '#f3f4f6',
                                color: update.status === 'sent' ? '#166534' : update.status === 'scheduled' ? '#0369a1' : '#374151'
                            }}>
                                {update.status}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(update)}>✏️</button>
                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#dc2626' }} onClick={() => handleDelete(update.id)}>🗑️</button>
                            </div>
                        </div>

                        {update.mediaUrl && (
                            <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', position: 'relative' }}>
                                {update.mediaType === 'image' ? (
                                    <img src={update.mediaUrl} alt={update.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📽️</div>
                                )}
                            </div>
                        )}

                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{update.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {update.content}
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>📅 {new Date(update.createdAt).toLocaleDateString()}</span>
                            {update.scheduledAt && <span>⏲️ {new Date(update.scheduledAt).toLocaleString()}</span>}
                        </div>
                    </div>
                ))}
                {updates.length === 0 && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                        No updates created yet. Start by creating your first broadcast!
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '1rem' }}>
                    <div className="card animate-fade-in" style={{ width: 'min(500px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingUpdate ? 'Edit Update' : 'New Broadcast'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Title</label>
                                <input className="input" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Pongal Special Offer 🌾" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Content</label>
                                <textarea className="input" required rows={5} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Write your message here..." style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Media Type</label>
                                    <select className="input" value={formData.mediaType} onChange={e => setFormData({ ...formData, mediaType: e.target.value as 'image' | 'video' })}>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                                    <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'draft' | 'scheduled' | 'sent' })}>
                                        <option value="draft">Draft</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="sent">Sent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Media URL (Optional)</label>
                                <input className="input" value={formData.mediaUrl} onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Schedule At (Optional)</label>
                                <input className="input" type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Broadcast</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityUpdates;

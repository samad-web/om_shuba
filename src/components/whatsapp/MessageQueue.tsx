import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { dataService } from '../../services/DataService';
import { SupabaseRepository } from '../../services/repositories/SupabaseRepository';
import type { WhatsAppQueueItem } from '../../types';

const MessageQueue: React.FC = () => {
    const { showToast } = useToast();
    const [queue, setQueue] = useState<WhatsAppQueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'primary' | 'supabase_fallback'>('primary');

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async (forceSupabase = false) => {
        setLoading(true);
        try {
            let data: WhatsAppQueueItem[] = [];

            if (forceSupabase) {
                const supabaseRepo = new SupabaseRepository();
                data = await supabaseRepo.getWhatsAppQueue();
                setSource('supabase_fallback');
            } else {
                data = await dataService.getWhatsAppQueue();
                setSource('primary');

                // If primary is empty (likely LocalStorage) but we suspect Supabase has data
                if (data.length === 0) {
                    try {
                        const supabaseRepo = new SupabaseRepository();
                        const supabaseData = await supabaseRepo.getWhatsAppQueue();
                        if (supabaseData.length > 0) {
                            data = supabaseData;
                            setSource('supabase_fallback');
                        }
                    } catch (e) {
                        console.log("Supabase fallback fetch failed or not configured", e);
                    }
                }
            }

            setQueue(data);
        } catch (error) {
            console.error("Failed to load message queue", error);
            showToast('Failed to load queue', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'queued' | 'draft') => {
        try {
            // Use Supabase directly if we are in fallback mode
            if (source === 'supabase_fallback') {
                const supabaseRepo = new SupabaseRepository();
                await supabaseRepo.updateWhatsAppQueueItem({ id, status });
            } else {
                await dataService.updateWhatsAppQueueItem({ id, status });
            }
            showToast(`Message ${status === 'queued' ? 'approved for sending' : 'moved to draft'}`, 'success');
            loadQueue(source === 'supabase_fallback');
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            if (source === 'supabase_fallback') {
                const supabaseRepo = new SupabaseRepository();
                await supabaseRepo.deleteWhatsAppQueueItem(id);
            } else {
                await dataService.deleteWhatsAppQueueItem(id);
            }
            showToast('Message deleted', 'success');
            loadQueue(source === 'supabase_fallback');
        } catch (error) {
            showToast('Failed to delete message', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading queue...</div>;

    return (
        <div className="message-queue">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>📩 Automated Message Queue</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review and approve messages prepared by n8n for new sales.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.65rem',
                        padding: '0.25rem 0.6rem',
                        background: source === 'supabase_fallback' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(0,0,0,0.05)',
                        color: source === 'supabase_fallback' ? '#16a34a' : 'var(--text-muted)',
                        borderRadius: '20px',
                        fontWeight: 700,
                        border: `1px solid ${source === 'supabase_fallback' ? '#16a34a' : 'var(--border)'}`
                    }}>
                        Mode: {source === 'supabase_fallback' ? '☁️ Supabase Cloud' : '💻 Local Storage'}
                    </span>
                    <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => loadQueue(true)}>🔄 Refresh Cloud</button>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>RECIPIENT</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MESSAGE</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{item.phoneNumber}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{item.messageText}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        background: item.status === 'sent' ? '#dcfce7' : item.status === 'queued' ? '#e0f2fe' : '#f3f4f6',
                                        color: item.status === 'sent' ? '#166534' : item.status === 'queued' ? '#0369a1' : '#374151'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        {item.status === 'draft' && (
                                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(item.id, 'queued')}>
                                                ✅ Approve
                                            </button>
                                        )}
                                        {item.status === 'queued' && (
                                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(item.id, 'draft')}>
                                                🔄 Draft
                                            </button>
                                        )}
                                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#dc2626' }} onClick={() => handleDelete(item.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {queue.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No messages in queue. New drafts will appear here when enquiries are converted.
                                    {source === 'primary' && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <button className="btn btn-primary" onClick={() => loadQueue(true)}>Check Supabase Cloud</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MessageQueue;

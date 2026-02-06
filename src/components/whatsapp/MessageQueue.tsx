import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { dataService } from '../../services/DataService';
import type { WhatsAppQueueItem } from '../../types';

const MessageQueue: React.FC = () => {
    const { showToast } = useToast();
    const [queue, setQueue] = useState<WhatsAppQueueItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        setLoading(true);
        try {
            const data = await dataService.getWhatsAppQueue();
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
            await dataService.updateWhatsAppQueueItem({ id, status });
            showToast(`Message ${status === 'queued' ? 'approved for sending' : 'moved to draft'}`, 'success');
            loadQueue();
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await dataService.deleteWhatsAppQueueItem(id);
            showToast('Message deleted', 'success');
            loadQueue();
        } catch (error) {
            showToast('Failed to delete message', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading queue...</div>;

    return (
        <div className="message-queue">
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>📩 Automated Message Queue</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review and approve messages prepared by n8n for new sales.</p>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
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

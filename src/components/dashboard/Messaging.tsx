import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import type { Message, Branch } from '../../types';

interface MessageCenterProps {
    onClose: () => void;
    align?: 'left' | 'right';
}

export const MessageCenter: React.FC<MessageCenterProps> = ({ onClose, align = 'right' }) => {
    const { user } = useAuth();
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'history'>('inbox');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sentMessages, setSentMessages] = useState<Message[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    // Grouping State for Admin
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null); // senderBranchId

    // Compose State
    const [selectedBranch, setSelectedBranch] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);

    // Helpers
    const getSenderName = (msg: Message) => {
        if (msg.senderRole === 'admin') return t('messaging.office');
        // If we have explicit sender name, use it, else fallback to role
        return (msg as any).senderName || t('messaging.branchAdmin');
    };

    const getBranchName = (id: string) => {
        if (id === 'all') return t('messaging.broadcast');
        if (id === 'admin') return t('messaging.office');
        return branches.find(b => b.id === id)?.name || id;
    };

    useEffect(() => {
        loadMessages();
        loadBranches();
    }, [user, activeTab]); // Reload when tab changes to refresh data

    const loadMessages = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const targetId = user.role === 'admin' ? 'admin' : user.branchId;
            if (targetId) {
                const data = await dataService.getMessages(targetId);
                setMessages(data);
            }
            if (activeTab === 'history') {
                const sentData = await dataService.getSentMessages(user.role, user.branchId);
                setSentMessages(sentData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const data = await dataService.getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches", error);
        }
    };

    const handleSend = async () => {
        if (!selectedBranch || !messageContent) return;
        setSending(true);
        try {
            await dataService.sendMessage({
                senderRole: (user?.role || 'branch_admin') as any,
                senderBranchId: user?.branchId,
                targetBranchId: selectedBranch,
                content: messageContent,
                senderName: user?.name || 'Unknown'
            });
            alert(t('messaging.sentSuccess'));
            setMessageContent('');
            if (user?.role !== 'admin') setSelectedBranch(''); // Reset for branch admin, maybe keep for admin mass messaging

            // If replying within a conversation, reload to show it
            if (activeTab === 'inbox' && selectedConversation) {
                loadMessages();
            } else {
                setActiveTab('history');
            }
        } catch (error: any) {
            console.error(error);
            alert(`${t('messaging.sendFail')}: ${error.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async (msg: Message) => {
        if (msg.isRead) return;
        try {
            await dataService.markMessageAsRead(msg.id);
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        } catch (error) { console.error(error); }
    };

    const handleReply = (msg: Message) => {
        // If admin is replying to a branch, we use the senderBranchId if available, else try to infer
        const replyTarget = msg.senderRole === 'admin' ? 'admin' : (msg as any).senderBranchId;

        if (replyTarget) {
            setSelectedBranch(replyTarget);
            setActiveTab('compose');
        } else {
            alert(t('messaging.selectRecipient'));
            setActiveTab('compose');
        }
    };

    // --- Render Logic ---

    // Grouping for Admin Inbox
    const renderAdminInbox = () => {
        // Group messages by senderBranchId
        const groups: Record<string, Message[]> = {};
        messages.forEach(msg => {
            const key = (msg as any).senderBranchId || 'unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(msg);
        });

        if (selectedConversation) {
            // Show Chat View
            const conversationMessages = groups[selectedConversation] || [];
            const branchName = getBranchName(selectedConversation);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                        <button onClick={() => setSelectedConversation(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '0.5rem' }}>←</button>
                        <h4 style={{ margin: 0 }}>{branchName}</h4>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {conversationMessages.map(msg => (
                            <div key={msg.id}
                                onClick={() => markAsRead(msg)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    background: msg.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                    border: '1px solid var(--border)',
                                    opacity: msg.isRead ? 0.8 : 1
                                }}>
                                <div style={{ fontSize: '0.75rem', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString()}</div>
                                <div>{msg.content}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                        <textarea
                            className="input"
                            rows={2}
                            value={messageContent}
                            onChange={e => {
                                setMessageContent(e.target.value);
                                setSelectedBranch(selectedConversation); // Auto-set target
                            }}
                            placeholder={t('messaging.reply')}
                            style={{ width: '100%', resize: 'none', fontSize: '0.9rem' }}
                        />
                        <button onClick={handleSend} disabled={sending || !messageContent} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', width: '100%' }}>
                            {sending ? t('messaging.sending') : t('messaging.send')}
                        </button>
                    </div>
                </div>
            );
        }

        // Show List of Conversations
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.keys(groups).length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('messaging.noMessages')}</div>}

                {Object.keys(groups).map(branchId => {
                    const groupMsgs = groups[branchId];
                    const unreadCount = groupMsgs.filter(m => !m.isRead).length;
                    const lastMsg = groupMsgs[0]; // Assuming sorted by date desc from backend
                    const branchName = getBranchName(branchId);

                    return (
                        <div key={branchId} onClick={() => setSelectedConversation(branchId)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                background: unreadCount > 0 ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{branchName}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '200px' }}>
                                    {lastMsg.content}
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="card animate-fade-in" style={{
            width: '400px',
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            ...(align === 'right' ? { right: '0' } : { left: '0' }),
            top: '85px',
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            padding: 0,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{t('messaging.title')}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {['inbox', 'compose', 'history'].map((tab) => (
                    <button
                        key={tab}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: activeTab === tab ? 'var(--bg-app)' : 'transparent',
                            fontWeight: activeTab === tab ? 700 : 500,
                            border: 'none',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                        onClick={() => { setActiveTab(tab as any); setSelectedConversation(null); }}
                    >
                        {t(`messaging.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>

                {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>{t('messaging.loading')}</div>}

                {!loading && activeTab === 'inbox' && (
                    user?.role === 'admin' ? renderAdminInbox() : (
                        // Standard Branch Inbox (Flat List)
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {messages.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('messaging.noMessages')}</div>}
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => markAsRead(msg)}
                                    style={{
                                        padding: '0.75rem',
                                        background: msg.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                                        border: '1px solid var(--border)',
                                        borderLeft: `3px solid ${msg.isRead ? 'transparent' : 'var(--primary)'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            {getSenderName(msg)}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>{msg.content}</p>
                                    <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReply(msg); }}
                                            className="btn btn-sm"
                                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                        >
                                            {t('messaging.reply')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {!loading && activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sentMessages.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{t('messaging.noHistory')}</div>}
                        {sentMessages.map(msg => (
                            <div key={msg.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        {t('messaging.to')}: {getBranchName(msg.targetBranchId)}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>{msg.content}</p>
                                <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.7rem', color: msg.isRead ? '#16a34a' : 'var(--text-muted)' }}>
                                    {msg.isRead ? `✅ ${t('messaging.read')}` : `✓ ${t('messaging.delivered')}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && activeTab === 'compose' && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('messaging.to')}</label>
                            <select
                                className="input"
                                value={selectedBranch}
                                onChange={e => setSelectedBranch(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">{t('messaging.selectRecipient')}</option>
                                {user?.role !== 'admin' && <option value="admin">{t('messaging.office')}</option>}
                                {user?.role === 'admin' && <option value="all">{t('messaging.broadcast')}</option>}
                                {branches.filter(b => b.id !== user?.branchId).map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('messaging.message')}</label>
                            <textarea
                                className="input"
                                rows={6}
                                value={messageContent}
                                onChange={e => setMessageContent(e.target.value)}
                                placeholder={t('messaging.typePlaceholder')}
                                style={{ width: '100%', resize: 'vertical' }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleSend}
                            disabled={sending}
                        >
                            {sending ? t('messaging.sending') : t('messaging.send')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AdminMessaging = (props: MessageCenterProps) => <MessageCenter {...props} />;
export const BranchMessaging = (props: MessageCenterProps) => <MessageCenter {...props} />;

import React, { useState, useEffect } from 'react';
import type { Promotion } from '../types';
import { dataService } from '../services/DataService';
import { Plus, Trash2, Edit2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './PromotionManagement.css';

const PromotionManagement: React.FC = () => {
    const { t } = useSettings();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPromotion, setCurrentPromotion] = useState<Partial<Promotion>>({
        title: '',
        description: '',
        active: true,
        validUntil: ''
    });

    const fetchPromotions = async () => {
        const data = await dataService.getPromotions();
        setPromotions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPromotion.title || !currentPromotion.description) return;

        if (currentPromotion.id) {
            await dataService.updatePromotion(currentPromotion as Promotion);
        } else {
            const newPromotion: Promotion = {
                ...(currentPromotion as Omit<Promotion, 'id' | 'createdAt'>),
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString()
            };
            await dataService.addPromotion(newPromotion);
        }

        setIsEditing(false);
        setCurrentPromotion({ title: '', description: '', active: true, validUntil: '' });
        fetchPromotions();
    };

    const handleEdit = (promotion: Promotion) => {
        setCurrentPromotion(promotion);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('promotions.deleteConfirm'))) {
            await dataService.deletePromotion(id);
            fetchPromotions();
        }
    };

    const toggleStatus = async (promotion: Promotion) => {
        await dataService.updatePromotion({ ...promotion, active: !promotion.active });
        fetchPromotions();
    };

    return (
        <div className="promotion-mgmt">
            <div className="mgmt-header">
                <h2 style={{
                    color: 'var(--primary)',
                    fontWeight: 850,
                    fontSize: '1.75rem',
                    letterSpacing: '-0.02em',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    marginBottom: 'var(--space-2)'
                }}>{t('promotions.title')}</h2>
                <button className="btn-add" onClick={() => {
                    setIsEditing(true);
                    setCurrentPromotion({ title: '', description: '', active: true, validUntil: '' });
                }}>
                    <Plus size={18} /> {t('promotions.addPromotion')}
                </button>
            </div>

            {isEditing && (
                <div className="promo-form-container">
                    <form onSubmit={handleSave} className="promo-form">
                        <h3>{currentPromotion.id ? t('promotions.editPromotion') : t('promotions.newPromotion')}</h3>
                        <div className="form-group">
                            <label>{t('promotions.promotionTitle')}</label>
                            <input
                                type="text"
                                value={currentPromotion.title}
                                onChange={e => setCurrentPromotion({ ...currentPromotion, title: e.target.value })}
                                placeholder={t('promotions.titlePlaceholder')}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('promotions.description')}</label>
                            <textarea
                                value={currentPromotion.description}
                                onChange={e => setCurrentPromotion({ ...currentPromotion, description: e.target.value })}
                                placeholder={t('promotions.descPlaceholder')}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('promotions.validUntil')} <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{t('promotions.optional')}</span></label>
                                <input
                                    type="date"
                                    value={currentPromotion.validUntil?.split('T')[0] || ''}
                                    onChange={e => setCurrentPromotion({ ...currentPromotion, validUntil: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={currentPromotion.active}
                                        onChange={e => setCurrentPromotion({ ...currentPromotion, active: e.target.checked })}
                                    />
                                    {t('promotions.active')}
                                </label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>{t('common.cancel')}</button>
                            <button type="submit" className="btn-save">{t('promotions.savePromotion')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="promo-list">
                {promotions.length === 0 ? (
                    <div className="empty-state">{t('promotions.noPromotions')}</div>
                ) : (
                    promotions.map(promo => {
                        const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date();
                        return (
                            <div key={promo.id} className={`promo-card ${!promo.active || isExpired ? 'inactive' : ''}`}>
                                <div className="promo-card-content">
                                    <div className="promo-card-header">
                                        <h4>{promo.title}</h4>
                                        <div className={`status-badge ${promo.active && !isExpired ? 'active' : 'inactive'}`}>
                                            {promo.active && !isExpired ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {isExpired ? t('promotions.expired') : (promo.active ? t('promotions.active') : t('promotions.inactive'))}
                                        </div>
                                    </div>
                                    <p>{promo.description}</p>
                                    <div className="promo-card-footer">
                                        <span className="date-added">{t('promotions.dateAdded')} {new Date(promo.createdAt).toLocaleDateString()}</span>
                                        {promo.validUntil && (
                                            <span className="valid-until">
                                                <Calendar size={14} /> {t('promotions.validUntilDate')} {new Date(promo.validUntil).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="promo-card-actions">
                                    <button className="btn-icon" title={t('common.status')} onClick={() => toggleStatus(promo)}>
                                        {promo.active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                    <button className="btn-icon" title={t('common.edit')} onClick={() => handleEdit(promo)}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="btn-icon delete" title={t('common.delete')} onClick={() => handleDelete(promo.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PromotionManagement;

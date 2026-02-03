import React, { useState, useEffect } from 'react';
import type { Offer, Product } from '../types';
import { dataService } from '../services/DataService';
import { useSettings } from '../context/SettingsContext';

const OfferManagement: React.FC = () => {
    const { t } = useSettings();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Offer>>({
        title: '',
        description: '',
        discountAmount: undefined,
        discountPercentage: undefined,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        productId: '',
        active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [offersData, productsData] = await Promise.all([
                dataService.getOffers(),
                dataService.getProducts()
            ]);
            setOffers(offersData);
            setProducts(productsData.filter(p => p.active));
        } catch (error) {
            console.error("Failed to load offers data", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (offer?: Offer) => {
        if (offer) {
            setEditingOffer(offer);
            setFormData({
                ...offer,
                validFrom: offer.validFrom.split('T')[0],
                validTo: offer.validTo ? offer.validTo.split('T')[0] : ''
            });
        } else {
            setEditingOffer(null);
            setFormData({
                title: '',
                description: '',
                discountAmount: undefined,
                discountPercentage: undefined,
                validFrom: new Date().toISOString().split('T')[0],
                validTo: '',
                productId: '',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const offerData: Offer = {
                ...(formData as Offer),
                id: editingOffer ? editingOffer.id : 'off_' + Date.now(),
                createdAt: editingOffer ? editingOffer.createdAt : new Date().toISOString()
            };

            if (editingOffer) {
                await dataService.updateOffer(offerData);
            } else {
                await dataService.addOffer(offerData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error("Failed to save offer", error);
            alert("Failed to save offer");
        }
    };

    const toggleStatus = async (offer: Offer) => {
        try {
            await dataService.updateOffer({ ...offer, active: !offer.active });
            loadData();
        } catch (error) {
            console.error("Failed to toggle offer status", error);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('common.loading')}...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Promotional Offers</h3>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Add Offer</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {offers.map(offer => {
                    const linkedProduct = products.find(p => p.id === offer.productId);
                    return (
                        <div key={offer.id} className="card" style={{
                            padding: '1.5rem',
                            borderLeft: `6px solid ${offer.active ? 'var(--primary)' : 'var(--text-muted)'}`,
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    background: offer.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.05)',
                                    color: offer.active ? '#16a34a' : 'var(--text-muted)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    {offer.active ? 'Active' : 'Inactive'}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--bg-app)' }} onClick={() => toggleStatus(offer)}>
                                        {offer.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openModal(offer)}>Edit</button>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>{offer.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                                {offer.description}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {offer.discountAmount && (
                                    <div style={{ background: 'var(--bg-app)', padding: '0.5rem', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Discount</div>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{offer.discountAmount.toLocaleString()}</div>
                                    </div>
                                )}
                                {offer.discountPercentage && (
                                    <div style={{ background: 'var(--bg-app)', padding: '0.5rem', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Off</div>
                                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{offer.discountPercentage}%</div>
                                    </div>
                                )}
                            </div>

                            {linkedProduct && (
                                <div style={{ fontSize: '0.75rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(3, 105, 161, 0.05)', borderRadius: '6px', border: '1px solid rgba(3, 105, 161, 0.1)' }}>
                                    <strong>Applies to:</strong> {linkedProduct.name}
                                </div>
                            )}

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Valid From: {new Date(offer.validFrom).toLocaleDateString()}</span>
                                {offer.validTo && <span>Until: {new Date(offer.validTo).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    );
                })}

                {offers.length === 0 && (
                    <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No offers created yet. Click "Add Offer" to start.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px) brightness(0.9)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div className="card animate-fade-in" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Title</label>
                                <input className="input" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Harvest Special Discount" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                                <textarea className="input" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Briefly describe the offer..." style={{ height: '80px', paddingTop: '10px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Flat Discount (₹)</label>
                                    <input type="number" className="input" value={formData.discountAmount || ''} onChange={e => setFormData({ ...formData, discountAmount: e.target.value ? Number(e.target.value) : undefined })} placeholder="optional" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Percentage (%)</label>
                                    <input type="number" className="input" value={formData.discountPercentage || ''} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value ? Number(e.target.value) : undefined })} placeholder="optional" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Applicable Product</label>
                                <select className="input" value={formData.productId || ''} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                    <option value="">All Products</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid From</label>
                                    <input type="date" className="input" required value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid Until</label>
                                    <input type="date" className="input" value={formData.validTo} onChange={e => setFormData({ ...formData, validTo: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;

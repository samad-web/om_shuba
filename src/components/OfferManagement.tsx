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
    const [isSaving, setIsSaving] = useState(false);

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
        console.log("Submitting offer data...", formData);
        try {
            // Clean up data
            const cleanedData = {
                ...formData,
                productId: formData.productId === '' ? null : formData.productId,
                discountAmount: formData.discountAmount || null,
                discountPercentage: formData.discountPercentage || null,
                validTo: formData.validTo === '' ? null : formData.validTo
            };

            // UUID Fallback generator
            const generateUUID = () => {
                try {
                    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                        return crypto.randomUUID();
                    }
                    throw new Error('crypto.randomUUID not available');
                } catch (e) {
                    console.warn('Using UUID fallback:', e);
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }
            };

            const offerData: Offer = {
                ...(cleanedData as Offer),
                id: editingOffer ? editingOffer.id : generateUUID(),
                createdAt: editingOffer ? editingOffer.createdAt : new Date().toISOString()
            };

            console.log("Final offer object to save:", offerData);

            setIsSaving(true);
            try {
                if (editingOffer) {
                    console.log("Calling dataService.updateOffer...");
                    await dataService.updateOffer(offerData);
                } else {
                    console.log("Calling dataService.addOffer...");
                    await dataService.addOffer(offerData);
                }
                console.log("dataService call completed successfully!");
                alert("Success: Offer saved!");
                setIsModalOpen(false);
                loadData();
            } catch (dbError: any) {
                console.error("Database operation failed:", dbError);
                alert("Database Error: " + (dbError.message || JSON.stringify(dbError)));
            }
        } catch (error: any) {
            console.error("Failed to save offer general error:", error);
            alert("Failed to save offer: " + (error.message || "Unknown error"));
        } finally {
            setIsSaving(false);
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
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px) brightness(0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    padding: '2rem'
                }}>
                    <div className="card animate-fade-in" style={{
                        width: '100%',
                        maxWidth: '550px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Title</label>
                                <input className="input" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Harvest Special Discount" />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                                <textarea className="input" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Briefly describe the offer..." style={{ height: '100px', paddingTop: '10px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Flat Discount (₹)</label>
                                    <input type="number" className="input" value={formData.discountAmount || ''} onChange={e => setFormData({ ...formData, discountAmount: e.target.value ? Number(e.target.value) : null })} placeholder="optional" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Percentage (%)</label>
                                    <input type="number" className="input" value={formData.discountPercentage || ''} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value ? Number(e.target.value) : null })} placeholder="optional" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Applicable Product</label>
                                <select className="input" value={formData.productId || ''} onChange={e => setFormData({ ...formData, productId: e.target.value })}>
                                    <option value="">All Products</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid From</label>
                                    <input type="date" className="input" required value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid Until</label>
                                    <input type="date" className="input" value={formData.validTo || ''} onChange={e => setFormData({ ...formData, validTo: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ minWidth: '120px' }}>
                                    {isSaving ? 'Saving...' : 'Save Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;

import React, { useState, useEffect } from 'react';
import type { Offer, Product } from '../types';
import { dataService } from '../services/DataService';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/Toast';

const OfferManagement: React.FC = () => {
    const { t } = useSettings();
    const { showToast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State - Individual variables to avoid stale state bugs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountAmount, setDiscountAmount] = useState<number | null>(null);
    const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
    const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [validTo, setValidTo] = useState('');
    const [productId, setProductId] = useState('');
    const [active, setActive] = useState(true);
    const renderCount = React.useRef(0);
    renderCount.current++;

    // Lifecycle tracking - check if component is resetting
    useEffect(() => {
        console.log("🏗️ OfferManagement MOUNTED");
        return () => console.log("⚰️ OfferManagement UNMOUNTED");
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        console.log("📡 loadData triggered (render #" + renderCount.current + ")");
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
            setTitle(offer.title);
            setDescription(offer.description);
            setDiscountAmount(offer.discountAmount ?? null);
            setDiscountPercentage(offer.discountPercentage ?? null);
            setValidFrom(offer.validFrom.split('T')[0]);
            setValidTo(offer.validTo ? offer.validTo.split('T')[0] : '');
            setProductId(offer.productId || '');
            setActive(offer.active);
        } else {
            setEditingOffer(null);
            setTitle('');
            setDescription('');
            setDiscountAmount(null);
            setDiscountPercentage(null);
            setValidFrom(new Date().toISOString().split('T')[0]);
            setValidTo('');
            setProductId('');
            setActive(true);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        if (e && 'preventDefault' in e) e.preventDefault();

        console.log("🚀 SUBMIT INITIATED!", {
            title,
            description,
            validFrom,
            render: renderCount.current,
            eventType: e?.type
        });

        // Manual check with clear feedback
        const missing = [];
        if (!title.trim()) missing.push("Title");
        if (!description.trim()) missing.push("Description");
        if (!validFrom) missing.push("Valid From Date");

        if (missing.length > 0) {
            showToast("Missing Fields: " + missing.join(", "), "warning");
            return;
        }

        try {
            setIsSaving(true);

            // Construct payload
            const offerData: Offer = {
                id: editingOffer ? editingOffer.id : (
                    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)
                ),
                title: title.trim(),
                description: description.trim(),
                discountAmount: discountAmount,
                discountPercentage: discountPercentage,
                validFrom: validFrom,
                validTo: validTo || null,
                productId: productId || null,
                active: active,
                createdAt: editingOffer ? editingOffer.createdAt : new Date().toISOString()
            };

            console.log("📦 Saving Offer Payload:", offerData);

            if (editingOffer) {
                await dataService.updateOffer(offerData);
            } else {
                await dataService.addOffer(offerData);
            }

            showToast("Success: Offer Saved!", "success");
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            console.error("❌ Save Failed:", error);
            showToast("Save Error: " + (error.message || "Unknown error"), "error");
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
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px) brightness(0.8)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000, padding: '2rem'
                }}>
                    <div className="card animate-fade-in" style={{
                        width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto',
                        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    className="input"
                                    required
                                    value={title}
                                    onChange={e => {
                                        console.log("⌨️ TITLE INPUT:", e.target.value);
                                        setTitle(e.target.value);
                                    }}
                                    placeholder="e.g. Harvest Special Discount"
                                />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea className="input" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Briefly describe the offer..." style={{ height: '100px', paddingTop: '10px' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Flat Discount (₹)</label>
                                    <input type="number" className="input" value={discountAmount === null ? '' : discountAmount} onChange={e => setDiscountAmount(e.target.value === '' ? null : Number(e.target.value))} placeholder="optional" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Percentage (%)</label>
                                    <input type="number" className="input" value={discountPercentage === null ? '' : discountPercentage} onChange={e => setDiscountPercentage(e.target.value === '' ? null : Number(e.target.value))} placeholder="optional" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Applicable Product</label>
                                <select className="input" value={productId} onChange={e => setProductId(e.target.value)}>
                                    <option value="">All Products</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid From</label>
                                    <input type="date" className="input" required value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Valid Until</label>
                                    <input type="date" className="input" value={validTo} onChange={e => setValidTo(e.target.value)} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSaving} style={{ minWidth: '120px' }}>
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

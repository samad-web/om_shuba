import React, { useState, useEffect, useRef } from 'react';
import type { Product, Branch, PipelineStage, Enquiry } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import ProductSearch from '../../components/ProductSearch';

const TelecallerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [branchId, setBranchId] = useState('');
    const [intent, setIntent] = useState('General Enquiry');
    const [successMsg, setSuccessMsg] = useState('');

    // Refs for focus management
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBranches(storage.getBranches().filter(b => b.active));
        loadMyEnquiries();
    }, []);

    const loadMyEnquiries = () => {
        if (!user) return;
        // Filter enquiries created by this user AND/OR assigned to them?
        // Requirement: "Log telecaller who created enquiry"
        // "Pipeline Action (Telecaller): Can only move New -> Qualified"
        // So show enquiries this user created that are still in early stages?
        // Let's show all created by user for now.
        const all = storage.getEnquiries();
        const mine = all.filter(e => e.createdBy === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyEnquiries(mine);
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        // Auto-focus next field
        setTimeout(() => nameInputRef.current?.focus(), 0);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !user) return;

        // Validate Phone (Basic)
        if (phone.length < 10) {
            alert("Invalid Phone Number");
            return;
        }

        // Check Duplicates? (Requirement: "validate & prevent duplicates")
        // Simple check: same phone + same product within last 30 days? Or just same phone?
        // "Phone Number (validate & prevent duplicates)" usually means unique customer per product or global?
        // Let's assume global unique phone check for now to keep it strict, or maybe warn.
        // Spec says: "Prevent duplicates".
        const existing = storage.getEnquiries().find(e => e.phoneNumber === phone && e.productId === selectedProduct.id && e.pipelineStage !== 'Closed-Not Interested');
        if (existing) {
            alert(`Duplicate Enquiry! This phone number already has an active enquiry for ${selectedProduct.name}.`);
            return;
        }

        const newEnquiry: Enquiry = {
            id: 'e' + Date.now(),
            customerName,
            phoneNumber: phone,
            location,
            productId: selectedProduct.id,
            branchId: branchId || branches[0]?.id || '', // Default to first branch if none selected
            purchaseIntent: intent as any,
            pipelineStage: 'New',
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            history: [{ stage: 'New', timestamp: new Date().toISOString(), userId: user.id }]
        };

        storage.addEnquiry(newEnquiry);

        // Reset
        setCustomerName('');
        setPhone('');
        setLocation('');
        setBranchId('');
        setIntent('General Enquiry');
        setSelectedProduct(null);
        setSuccessMsg('Enquiry Saved Successfully!');
        loadMyEnquiries();

        // Clear success msg after 3s
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const updateStage = (enquiryId: string, newStage: PipelineStage) => {
        if (!user) return;
        storage.updateEnquiryStage(enquiryId, newStage, user.id);
        loadMyEnquiries();
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            {/* Left Column: Capture */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>New Enquiry Capture</h2>

                <ProductSearch onSelect={handleProductSelect} />

                <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', opacity: selectedProduct ? 1 : 0.5, pointerEvents: selectedProduct ? 'auto' : 'none' }}>
                    <div style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        <strong>Selected Product:</strong> {selectedProduct?.name} <span style={{ color: '#059669', fontWeight: 600 }}>[{selectedProduct?.sku}]</span> <span style={{ color: 'var(--success)' }}>{selectedProduct?.priceRange}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Customer Name *</label>
                            <input
                                ref={nameInputRef}
                                className="input"
                                required
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Phone Number *</label>
                            <input
                                className="input"
                                required
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Location *</label>
                            <input className="input" required value={location} onChange={e => setLocation(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem' }}>Branch Assignment</label>
                            <select className="input" value={branchId} onChange={e => setBranchId(e.target.value)} required>
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem' }}>Purchase Intent</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            {['Ready to Buy', 'Needs Demo', 'General Enquiry'].map(i => (
                                <label key={i} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="radio"
                                        name="intent"
                                        value={i}
                                        checked={intent === i}
                                        onChange={e => setIntent(e.target.value)}
                                        style={{ marginRight: '0.25rem' }}
                                    />
                                    {i}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                            SAVE ENQUIRY
                        </button>
                    </div>

                    {successMsg && <div style={{ color: 'var(--success)', textAlign: 'center', fontWeight: 'bold' }}>{successMsg}</div>}
                </form>
            </div>

            {/* Right Column: My Active Enquiries */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '1rem' }}>My Recent Enquiries</h3>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Name/Phone</th>
                                <th style={{ padding: '0.5rem' }}>Product</th>
                                <th style={{ padding: '0.5rem' }}>Stage</th>
                                <th style={{ padding: '0.5rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myEnquiries.map(e => (
                                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                        <div style={{ fontWeight: 500 }}>{e.customerName}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{e.phoneNumber}</div>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {storage.getProducts().find(p => p.id === e.productId)?.name}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '4px',
                                            background: e.pipelineStage === 'New' ? '#dbeafe' : '#f1f5f9',
                                            color: e.pipelineStage === 'New' ? '#1e40af' : '#475569'
                                        }}>
                                            {e.pipelineStage}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {e.pipelineStage === 'New' && (
                                            <button
                                                className="btn"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                                                onClick={() => updateStage(e.id, 'Qualified')}
                                            >
                                                Mark Qualified
                                            </button>
                                        )}
                                        {e.pipelineStage === 'Qualified' && (
                                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto-Forwarded</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {myEnquiries.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>No enquiries yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TelecallerDashboard;

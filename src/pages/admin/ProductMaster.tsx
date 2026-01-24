import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../types';
import { storage } from '../../services/storage';
import { downloadProductTemplate, parseProductExcel, type BulkUploadResult } from '../../services/excelService';

const ProductMaster: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', sku: '', category: '', shortDescription: '', priceRange: '', demoUrl: '', active: true
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setProducts(storage.getProducts());
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', category: '', shortDescription: '', priceRange: '', demoUrl: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            storage.updateProduct({ ...editingProduct, ...formData } as Product);
        } else {
            storage.addProduct({ ...formData, id: 'p' + Date.now() } as Product);
        }
        setIsModalOpen(false);
        loadProducts();
    };

    const toggleStatus = (product: Product) => {
        storage.updateProduct({ ...product, active: !product.active });
        loadProducts();
    };

    const handleDownloadTemplate = () => {
        downloadProductTemplate(products);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await parseProductExcel(file);
        setUploadResult(result);

        if (result.success) {
            setShowConfirmDialog(true);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirmUpload = () => {
        if (!uploadResult) return;

        storage.bulkUpdateProducts(uploadResult.productsToCreate, uploadResult.productsToUpdate);
        loadProducts();
        setShowConfirmDialog(false);
        setUploadResult(null);
    };

    const handleCancelUpload = () => {
        setShowConfirmDialog(false);
        setUploadResult(null);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3>Product Master</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" onClick={handleDownloadTemplate}>📥 Download Excel Template</button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <button className="btn" onClick={() => fileInputRef.current?.click()}>📤 Upload Excel</button>
                    <button className="btn btn-primary" onClick={() => openModal()}>+ Add Product</button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                        <th style={{ padding: '0.5rem' }}>Name</th>
                        <th style={{ padding: '0.5rem' }}>Category</th>
                        <th style={{ padding: '0.5rem' }}>Price</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>{p.name}</td>
                            <td style={{ padding: '0.5rem' }}>{p.category}</td>
                            <td style={{ padding: '0.5rem' }}>{p.priceRange}</td>
                            <td style={{ padding: '0.5rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                    background: p.active ? '#dcfce7' : '#fee2e2',
                                    color: p.active ? '#15803d' : '#b91c1c'
                                }}>
                                    {p.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(p)}>Edit</button>
                                <button className="btn" style={{ fontSize: '0.8rem', color: p.active ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(p)}>
                                    {p.active ? 'Disable' : 'Enable'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Name</label>
                                <input className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>SKU</label>
                                <input className="input" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Category</label>
                                <input className="input" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Description (Short)</label>
                                <input className="input" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Price Range</label>
                                <input className="input" required value={formData.priceRange} onChange={e => setFormData({ ...formData, priceRange: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Demo URL</label>
                                <input className="input" value={formData.demoUrl || ''} onChange={e => setFormData({ ...formData, demoUrl: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Confirmation Dialog */}
            {showConfirmDialog && uploadResult && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>Confirm Excel Upload</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>New Products:</strong> {uploadResult.productsToCreate.length}
                            </p>
                            <p style={{ marginBottom: '0.5rem' }}>
                                <strong>Products to Update:</strong> {uploadResult.productsToUpdate.length}
                            </p>
                        </div>

                        {uploadResult.productsToCreate.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>New Products Preview:</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '4px' }}>
                                    {uploadResult.productsToCreate.slice(0, 5).map((p, i) => (
                                        <div key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            • {p.name} ({p.sku}) - {p.category}
                                        </div>
                                    ))}
                                    {uploadResult.productsToCreate.length > 5 && (
                                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            ... and {uploadResult.productsToCreate.length - 5} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {uploadResult.productsToUpdate.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Products to Update:</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '4px' }}>
                                    {uploadResult.productsToUpdate.slice(0, 5).map((p, i) => (
                                        <div key={i} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            • {p.name} ({p.sku}) - {p.category}
                                        </div>
                                    ))}
                                    {uploadResult.productsToUpdate.length > 5 && (
                                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            ... and {uploadResult.productsToUpdate.length - 5} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn" onClick={handleCancelUpload}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmUpload}>Confirm Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Error Dialog */}
            {uploadResult && !uploadResult.success && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ color: 'var(--danger)' }}>Upload Errors Found</h3>
                        <p style={{ marginBottom: '1rem' }}>
                            Please fix the following errors in your Excel file and try again:
                        </p>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--danger)', padding: '0.5rem', borderRadius: '4px', background: '#fee' }}>
                            {uploadResult.errors.map((error, i) => (
                                <div key={i} style={{ fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                                    <strong>Row {error.row}:</strong> {error.field} - {error.message}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button type="button" className="btn" onClick={handleCancelUpload}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMaster;

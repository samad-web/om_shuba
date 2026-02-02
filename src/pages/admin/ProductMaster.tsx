import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../types';
import { dataService } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { downloadProductTemplate, parseProductExcel, type BulkUploadResult } from '../../services/excelService';

interface ProductMasterProps {
    branchId?: string;
}

const ProductMaster: React.FC<ProductMasterProps> = ({ branchId }) => {
    const { user } = useAuth();
    const { t, language } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', sku: '', category: '', shortDescription: '', priceRange: '', demoUrl: '', active: true
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = branchId && branchId !== 'all'
                ? await dataService.getProductsByBranch(branchId)
                : await dataService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.active &&
        !['Verification Product', 'Persistent Test Product', 'Test Product RLS'].includes(p.name) &&
        (
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', sku: '', category: '', shortDescription: '', priceRange: '', demoUrl: '', active: true,
                nameTa: '', categoryTa: '', shortDescriptionTa: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await dataService.updateProduct({ ...editingProduct, ...formData } as Product);
            } else {
                await dataService.addProduct({ ...formData, id: 'p' + Date.now(), branchId: (branchId && branchId !== 'all') ? branchId : undefined } as Product);
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product");
        }
    };

    const toggleStatus = async (product: Product) => {
        try {
            await dataService.updateProduct({ ...product, active: !product.active });
            loadProducts();
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
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

        // Note: bulkUpdateProducts is not in IDataRepository yet.
        // For now, we'll iterate. Ideally, we should add a bulk method to the repo.
        // Assuming storage.bulkUpdateProducts logic:

        // Resolve correct branchId
        const effectiveBranchId = (branchId && branchId !== 'all') ? branchId : (user?.role === 'branch_admin' ? user.branchId : undefined);

        const promises = [
            ...uploadResult.productsToCreate.map(p => {
                return dataService.addProduct({
                    ...p,
                    id: 'p' + Date.now() + Math.random().toString(36).substr(2, 5),
                    branchId: effectiveBranchId
                } as Product);
            }),
            ...uploadResult.productsToUpdate.map(p => {
                return dataService.updateProduct(p);
            })
        ];

        Promise.all(promises).then(() => {
            loadProducts();
            setShowConfirmDialog(false);
            setUploadResult(null);
        }).catch(err => {
            console.error("Bulk update failed", err);
            alert("Some items failed to upload");
        });
    };

    const handleCancelUpload = () => {
        setShowConfirmDialog(false);
        setUploadResult(null);
    };

    const getLocalizedContent = (product: Product, field: 'name' | 'category' | 'shortDescription') => {
        if (language === 'ta') {
            return product[`${field}Ta` as keyof Product] || product[field];
        }
        return product[field];
    };

    // Group products by category
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const category = getLocalizedContent(product, 'category') as string || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const categories = Object.keys(groupedProducts).sort();

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('products.title')}</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder={t('products.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '250px', paddingLeft: '2.5rem' }}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>
                    <button className="btn" onClick={handleDownloadTemplate} title="Download Template">📁⬇️</button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <button className="btn" onClick={() => fileInputRef.current?.click()} title="Upload Excel">📄⬆️</button>
                    <button className="btn btn-primary" onClick={() => openModal()}>+ {t('products.addProduct')}</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {categories.map(category => (
                    <div key={category} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                        <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            marginBottom: '1.25rem',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            🏷️ {category}
                        </h4>
                        <div style={{ overflowX: 'auto' }} className="product-table-wrapper">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }} className="product-table">
                                <thead className="desktop-only-thead">
                                    <tr style={{ textAlign: 'left', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>{t('products.productName')} / {t('products.sku')}</th>
                                        <th style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>{t('products.description')}</th>
                                        <th style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>{t('products.priceRange')}</th>
                                        <th style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}>{t('products.status')}</th>
                                        <th style={{ padding: '1rem 0.75rem', fontSize: '0.8rem', fontWeight: 800, textAlign: 'right' }}>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedProducts[category].map(p => (
                                        <tr key={p.id} className="product-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td className="product-name-td" style={{ padding: '1.25rem 0.75rem' }}>
                                                <div style={{
                                                    fontWeight: 800,
                                                    color: '#FFFFFF',
                                                    fontSize: '1rem',
                                                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {getLocalizedContent(p, 'name')}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{p.sku}</div>
                                            </td>
                                            <td className="product-desc-td" style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '250px' }}>
                                                {getLocalizedContent(p, 'shortDescription')}
                                            </td>
                                            <td className="product-price-td" style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                                                {p.priceRange}
                                            </td>
                                            <td className="product-status-td" style={{ padding: '1rem 0.5rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem',
                                                    background: p.active ? '#dcfce7' : '#fee2e2',
                                                    color: p.active ? '#15803d' : '#b91c1c',
                                                    fontWeight: 700
                                                }}>
                                                    {p.active ? t('products.active').toUpperCase() : t('products.inactive').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="product-actions-td" style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <button className="btn" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(p)}>{t('common.edit')}</button>
                                                <button
                                                    className="btn"
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        background: p.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                        color: p.active ? '#dc2626' : '#16a34a',
                                                        border: 'none',
                                                        padding: '0.25rem 0.75rem'
                                                    }}
                                                    onClick={() => toggleStatus(p)}
                                                >
                                                    {p.active ? t('products.inactive') : t('products.active')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
                        <div>No products found matching "{searchQuery}"</div>
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
                    <div className="card animate-fade-in" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingProduct ? t('products.editProduct') : t('products.addProduct')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.productName')} (English)</label>
                                <input className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={t('products.namePlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.productName')} (Tamil)</label>
                                <input className="input" value={formData.nameTa || ''} onChange={e => setFormData({ ...formData, nameTa: e.target.value })} placeholder={t('products.nameTaPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.sku')}</label>
                                <input className="input" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder={t('products.skuPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.category')} (English)</label>
                                <input className="input" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder={t('products.categoryPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.category')} (Tamil)</label>
                                <input className="input" value={formData.categoryTa || ''} onChange={e => setFormData({ ...formData, categoryTa: e.target.value })} placeholder={t('products.categoryTaPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.description')} (Short - English)</label>
                                <input className="input" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} placeholder={t('products.shortDescPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.description')} (Short - Tamil)</label>
                                <input className="input" value={formData.shortDescriptionTa || ''} onChange={e => setFormData({ ...formData, shortDescriptionTa: e.target.value })} placeholder={t('products.shortDescTaPlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.priceRange')}</label>
                                <input className="input" required value={formData.priceRange} onChange={e => setFormData({ ...formData, priceRange: e.target.value })} placeholder={t('products.pricePlaceholder')} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{t('products.demoUrl')}</label>
                                <input className="input" value={formData.demoUrl || ''} onChange={e => setFormData({ ...formData, demoUrl: e.target.value })} placeholder={t('products.demoUrlPlaceholder')} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Confirmation Dialog */}
            {showConfirmDialog && uploadResult && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px) brightness(0.9)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div className="card animate-fade-in" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Confirm Excel Upload</h3>
                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>New Products:</strong></span>
                                <span style={{ color: 'var(--success)', fontWeight: 700 }}>{uploadResult.productsToCreate.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>Products to Update:</strong></span>
                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{uploadResult.productsToUpdate.length}</span>
                            </div>
                        </div>

                        {uploadResult.productsToCreate.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>MAPPING PREVIEW (NEW):</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px' }}>
                                    {uploadResult.productsToCreate.slice(0, 5).map((p, i) => (
                                        <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.5rem', borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{p.name}</span> <span style={{ color: 'var(--text-muted)' }}>({p.sku})</span>
                                        </div>
                                    ))}
                                    {uploadResult.productsToCreate.length > 5 && (
                                        <div style={{ fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                                            + {uploadResult.productsToCreate.length - 5} more entries
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" className="btn" onClick={handleCancelUpload}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmUpload}>Apply Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Error Dialog */}
            {uploadResult && !uploadResult.success && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px) brightness(0.9)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div className="card animate-fade-in" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Upload Errors Found</h3>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Please fix the following validation errors in your Excel file and try again:
                        </p>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #fee2e2', padding: '1rem', borderRadius: '12px', background: '#fffafb' }}>
                            {uploadResult.errors.map((error, i) => (
                                <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                    <strong style={{ color: '#dc2626' }}>Row {error.row}:</strong> {error.message}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button type="button" className="btn" onClick={handleCancelUpload}>Close & Fix File</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Table Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-only-thead { display: none; }
                    .product-table, .product-table tbody, .product-row, .product-row td {
                        display: block;
                        width: 100%;
                    }
                    .product-row {
                        padding: 1rem 0;
                        border-bottom: 2px solid var(--border) !important;
                    }
                    .product-row td {
                        padding: 0.5rem 0 !important;
                        text-align: left !important;
                        max-width: none !important;
                    }
                    .product-desc-td {
                        color: var(--text-muted) !important;
                        font-size: 0.8rem !important;
                        margin-bottom: 0.5rem;
                    }
                    .product-price-td::before {
                        content: 'Price Range: ';
                        font-weight: 700;
                        font-size: 0.75rem;
                        color: var(--text-muted);
                    }
                    .product-actions-td {
                        display: flex;
                        gap: 0.5rem;
                        padding-top: 1rem !important;
                    }
                    .product-actions-td .btn {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductMaster;

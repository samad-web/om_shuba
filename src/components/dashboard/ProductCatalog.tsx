import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { dataService } from '../../services/DataService';
import { useSettings } from '../../context/SettingsContext';

interface ProductCatalogProps {
    onSelect?: (product: Product) => void;
    onClose?: () => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelect, onClose }) => {
    const { t, language } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await dataService.getProducts();
            setProducts(data.filter(p => p.active));
        } catch (error) {
            console.error("Failed to load products for catalog", error);
        } finally {
            setLoading(false);
        }
    };

    const getLocalized = (product: Product, field: 'name' | 'shortDescription'): string => {
        if (language === 'ta') {
            return (product[`${field}Ta` as keyof Product] as string) || (product[field] as string);
        }
        return product[field] as string;
    };

    const toggleCompare = (product: Product) => {
        if (compareList.find(p => p.id === product.id)) {
            setCompareList(compareList.filter(p => p.id !== product.id));
        } else if (compareList.length < 2) {
            setCompareList([...compareList, product]);
        } else {
            // Replace the second one or show alert
            setCompareList([compareList[0], product]);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('common.loading')}...</div>;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--bg-app)',
            borderRadius: '16px',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>Product Catalog</h3>
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-app)',
                        padding: '0.25rem',
                        borderRadius: '8px',
                        gap: '0.25rem'
                    }}>
                        <button
                            className={`btn ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                            onClick={() => setViewMode('grid')}
                        >
                            Catalog
                        </button>
                        <button
                            className={`btn ${viewMode === 'compare' ? 'btn-primary' : ''}`}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                            onClick={() => setViewMode('compare')}
                            disabled={compareList.length < 2}
                        >
                            Compare ({compareList.length})
                        </button>
                    </div>
                </div>
                {onClose && <button className="btn" onClick={onClose} style={{ padding: '0.5rem' }}>✕</button>}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {viewMode === 'grid' ? (
                    <>
                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search machines, categories, or SKUs..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            {filtered.map(product => (
                                <div key={product.id} className="card" style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 200ms ease',
                                    cursor: 'default'
                                }}>
                                    <div style={{
                                        height: '160px',
                                        background: product.imageUrl ? `url(${product.imageUrl}) center/cover no-repeat` : 'var(--bg-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        position: 'relative'
                                    }}>
                                        {!product.imageUrl && '🚜'}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.75rem',
                                            right: '0.75rem',
                                            display: 'flex',
                                            gap: '0.5rem'
                                        }}>
                                            <button
                                                onClick={() => toggleCompare(product)}
                                                style={{
                                                    background: compareList.find(p => p.id === product.id) ? 'var(--primary)' : 'rgba(0,0,0,0.5)',
                                                    color: 'white',
                                                    border: 'none',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                                title="Add to Compare"
                                            >
                                                {compareList.find(p => p.id === product.id) ? '✓' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                            {product.category}
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>{getLocalized(product, 'name')}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1, lineHeight: 1.4 }}>
                                            {getLocalized(product, 'shortDescription')}
                                        </p>

                                        {/* Specs Preview */}
                                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                                            <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
                                                {Object.entries(product.specifications).slice(0, 3).map(([k, v]) => (
                                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '2px 0' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                                        <span style={{ fontWeight: 600 }}>{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{product.priceRange}</div>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                                onClick={() => onSelect?.(product)}
                                            >
                                                Select
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Comparison View */
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '180px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>Category</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>SKU</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>Price</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', padding: '0.5rem 0' }}>Specifications</div>
                        </div>

                        {compareList.map(product => (
                            <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{
                                    height: '180px',
                                    background: product.imageUrl ? `url(${product.imageUrl}) center/cover no-repeat` : 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>
                                    {!product.imageUrl && '🚜'}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>{getLocalized(product, 'name')}</h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>{product.category}</div>
                                        <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>{product.sku}</div>
                                        <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{product.priceRange}</div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {/* Collect all unique spec keys from both products if possible, but here just show this product's specs */}
                                            {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                                                <div key={k} style={{ fontSize: '0.85rem' }}>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{k}</div>
                                                    <div style={{ fontWeight: 600 }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '2rem' }}
                                        onClick={() => onSelect?.(product)}
                                    >
                                        Select this Machine
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCatalog;

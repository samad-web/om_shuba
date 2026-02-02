import React, { useState, useEffect, useRef } from 'react';
import type { Product, Promotion } from '../types';
import { useSettings } from '../context/SettingsContext';
// import { storage } from '../services/storage'; // Removed storage import
import { dataService } from '../services/DataService';

interface ProductSearchProps {
    onSelect: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSelect }) => {
    const { t, language } = useSettings();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            const products = await dataService.getProducts();
            setAllProducts(products.filter(p => p.active));
        };
        loadData();
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        const allPromotions = await dataService.getPromotions();
        const activePromotions = allPromotions.filter(p => {
            if (!p.active) return false;
            if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
            return true;
        });
        setPromotions(activePromotions);
    };

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        const lowerQ = query.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(lowerQ) ||
            p.category.toLowerCase().includes(lowerQ) ||
            p.sku.toLowerCase().includes(lowerQ) ||
            p.shortDescription.toLowerCase().includes(lowerQ) ||
            (p.nameTa && p.nameTa.toLowerCase().includes(lowerQ)) ||
            (p.categoryTa && p.categoryTa.toLowerCase().includes(lowerQ)) ||
            (p.shortDescriptionTa && p.shortDescriptionTa.toLowerCase().includes(lowerQ))
        );
        setResults(filtered.slice(0, 10)); // Limit to 10
        setSelectedIndex(0);
    }, [query, allProducts]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                selectProduct(results[selectedIndex]);
            }
        }
    };

    const selectProduct = (p: Product) => {
        onSelect(p);
        setQuery('');
        setResults([]);
        // Keep focus on input? Or move to next field?
        // Requirement: "Selecting a product auto-fills enquiry form"
        // Usually moving focus to the next relevant field (Customer Name) is better speed-wise.
        // I'll leave focus management to the parent or just let user Tab.
    };

    // Helper to get localized text
    const getLocalized = (item: Product, field: keyof Product, taField: keyof Product) => {
        if (language === 'ta' && item[taField]) {
            return item[taField] as string;
        }
        return item[field] as string;
    }

    return (
        <div style={{ position: 'relative' }}>
            {promotions.length > 0 && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24',
                    fontSize: '0.875rem'
                }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🎉</span> {t('promotions.activePromotions')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {promotions.map(promo => (
                            <div key={promo.id} style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                lineHeight: 1.4
                            }}>
                                <div style={{ fontWeight: 600, color: '#78350f' }}>{promo.title}</div>
                                <div style={{ fontSize: '0.8125rem', color: '#92400e' }}>{promo.description}</div>
                                {promo.validUntil && (
                                    <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.25rem' }}>
                                        {t('promotions.validUntilDate')} {new Date(promo.validUntil).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>1. {t('products.quickSearch')}</label>
            <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder={t('products.searchPlaceholder')}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ padding: '0.75rem', fontSize: '1.1rem', borderColor: 'var(--primary)' }}
            />

            {results.length > 0 && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '0 0 4px 4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 10, listStyle: 'none', padding: 0, margin: 0,
                    maxHeight: '300px', overflowY: 'auto'
                }}>
                    {results.map((p, index) => {
                        const displayName = getLocalized(p, 'name', 'nameTa');
                        const displayCategory = getLocalized(p, 'category', 'categoryTa');
                        const displayDesc = getLocalized(p, 'shortDescription', 'shortDescriptionTa');

                        return (
                            <li
                                key={p.id}
                                onClick={() => selectProduct(p)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    background: index === selectedIndex ? 'var(--bg-hover)' : 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{displayName} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>({displayCategory})</span></div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>SKU: {p.sku}</span> • {displayDesc} — <b>{p.priceRange}</b>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ProductSearch;

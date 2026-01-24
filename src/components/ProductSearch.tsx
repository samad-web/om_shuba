import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { storage } from '../services/storage';

interface ProductSearchProps {
    onSelect: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAllProducts(storage.getProducts().filter(p => p.active));
    }, []);

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
            p.shortDescription.toLowerCase().includes(lowerQ)
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

    return (
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>1. Product Quick Search</label>
            <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Type product name, SKU, category, or keyword..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ padding: '0.75rem', fontSize: '1.1rem', borderColor: 'var(--primary)' }}
            />

            {results.length > 0 && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1px solid var(--border)',
                    borderRadius: '0 0 4px 4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 10, listStyle: 'none', padding: 0, margin: 0,
                    maxHeight: '300px', overflowY: 'auto'
                }}>
                    {results.map((p, index) => (
                        <li
                            key={p.id}
                            onClick={() => selectProduct(p)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                background: index === selectedIndex ? '#e0f2fe' : 'white',
                                borderBottom: '1px solid #f1f5f9'
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>{p.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>({p.category})</span></div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontWeight: 600, color: '#059669' }}>SKU: {p.sku}</span> • {p.shortDescription} — <b>{p.priceRange}</b>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProductSearch;

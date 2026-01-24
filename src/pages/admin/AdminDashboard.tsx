import React, { useState } from 'react';
import ProductMaster from './ProductMaster';
import BranchMaster from './BranchMaster';
import EnquiryLog from './EnquiryLog';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'branches' | 'enquiries'>('products');

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <button
                    className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('products')}
                    style={{ borderRadius: '4px 4px 0 0', borderBottom: activeTab === 'products' ? 'none' : '1px solid transparent' }}
                >
                    Products
                </button>
                <button
                    className={`btn ${activeTab === 'branches' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('branches')}
                    style={{ borderRadius: '4px 4px 0 0', borderBottom: activeTab === 'branches' ? 'none' : '1px solid transparent' }}
                >
                    Branches
                </button>
                <button
                    className={`btn ${activeTab === 'enquiries' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('enquiries')}
                    style={{ borderRadius: '4px 4px 0 0', borderBottom: activeTab === 'enquiries' ? 'none' : '1px solid transparent' }}
                >
                    Enquiries
                </button>
            </div>

            <div>
                {activeTab === 'products' && <ProductMaster />}
                {activeTab === 'branches' && <BranchMaster />}
                {activeTab === 'enquiries' && <EnquiryLog />}
            </div>
        </div>
    );
};

export default AdminDashboard;

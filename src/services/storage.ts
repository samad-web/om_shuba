import type { User, Product, Branch, Enquiry, PipelineStage, TrackingDetails } from '../types';
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_BRANCHES } from './mockData';

const KEYS = {
    USERS: 'tc_users',
    PRODUCTS: 'tc_products',
    BRANCHES: 'tc_branches',
    ENQUIRIES: 'tc_enquiries',
};

// Initialize data - Always sync products and branches from mock data to ensure updates are reflected
const init = () => {
    // Merge MOCK_USERS with existing ones to ensure new branch admins are added automatically
    const existingUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const mergedUsers = [...MOCK_USERS];

    // Add any user-created accounts that aren't in mock data
    existingUsers.forEach((u: User) => {
        if (!mergedUsers.find(mu => mu.id === u.id)) {
            mergedUsers.push(u);
        }
    });

    localStorage.setItem(KEYS.USERS, JSON.stringify(mergedUsers));

    // Always sync products from mock data (for easy updates during development)
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));

    // Only initialize branches once - don't overwrite user-created branches
    if (!localStorage.getItem(KEYS.BRANCHES)) localStorage.setItem(KEYS.BRANCHES, JSON.stringify(MOCK_BRANCHES));

    if (!localStorage.getItem(KEYS.ENQUIRIES)) localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify([]));
};

init(); // Auto-init on load

export const storage = {
    getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
    getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
    getBranches: (): Branch[] => JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]'),
    getEnquiries: (): Enquiry[] => JSON.parse(localStorage.getItem(KEYS.ENQUIRIES) || '[]'),

    addProduct: (product: Product) => {
        const products = storage.getProducts();
        products.push(product);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    },
    updateProduct: (product: Product) => {
        const products = storage.getProducts().map(p => p.id === product.id ? product : p);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    },

    bulkUpdateProducts: (newProducts: Product[], updatedProducts: Product[]) => {
        let products = storage.getProducts();

        // Update existing products
        updatedProducts.forEach(updatedProduct => {
            const index = products.findIndex(p => p.id === updatedProduct.id);
            if (index !== -1) {
                products[index] = updatedProduct;
            }
        });

        // Add new products
        products = [...products, ...newProducts];

        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    },

    deleteBranch: (branchId: string) => {
        const branches = storage.getBranches().filter(b => b.id !== branchId);
        localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));

        // Also delete associated branch admin user if exists
        const users = storage.getUsers();
        const updatedUsers = users.filter(u => !(u.role === 'branch_admin' && u.branchId === branchId));
        localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
    },

    addBranch: (branch: Branch) => {
        const branches = storage.getBranches();
        branches.push(branch);
        localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
    },

    addUser: (user: User) => {
        const users = storage.getUsers();
        users.push(user);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    updateUser: (user: User) => {
        const users = storage.getUsers().map(u => u.id === user.id ? user : u);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    deleteUser: (id: string) => {
        const users = storage.getUsers().filter(u => u.id !== id);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    changeUserPassword: (userId: string, newPass: string) => {
        const users = storage.getUsers().map(u => {
            if (u.id === userId) {
                return { ...u, password: newPass };
            }
            return u;
        });
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    addEnquiry: (enquiry: Enquiry) => {
        const list = storage.getEnquiries();
        list.push(enquiry);
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(list));
    },
    updateEnquiryStage: (id: string, stage: PipelineStage, userId: string, notes?: string, amount?: number) => {
        const list = storage.getEnquiries().map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    pipelineStage: stage,
                    closedAmount: amount !== undefined ? amount : e.closedAmount,
                    history: [...e.history, { stage, timestamp: new Date().toISOString(), userId, notes }]
                };
            }
            return e;
        });
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(list));
    },

    updateEnquiryAmount: (id: string, amount: number) => {
        const list = storage.getEnquiries().map(e => {
            if (e.id === id) {
                return { ...e, closedAmount: amount };
            }
            return e;
        });
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(list));
    },


    updateEnquiryTracking: (id: string, tracking: TrackingDetails, userId: string) => {
        const list = storage.getEnquiries().map(e => {
            if (e.id === id) {
                const newStageMap: Record<string, PipelineStage> = {
                    'Demo': 'Demo Scheduled',
                    'Visit': 'Visit Scheduled',
                    'Delivery': 'Delivery Scheduled'
                };

                // Auto-update stage based on tracking type if it's a new scheduling
                const newStage = (tracking.status === 'Scheduled' && newStageMap[tracking.type])
                    ? newStageMap[tracking.type]
                    : (tracking.status === 'Completed' && tracking.type === 'Delivery')
                        ? 'Delivered'
                        : (tracking.status === 'Completed')
                            ? 'Demo/Visit Done'
                            : e.pipelineStage;

                return {
                    ...e,
                    pipelineStage: newStage,
                    tracking,
                    history: [...e.history, {
                        stage: newStage,
                        timestamp: new Date().toISOString(),
                        userId,
                        notes: `Tracking Update: ${tracking.type} - ${tracking.status} (${tracking.scheduledDate})`
                    }]
                };
            }
            return e;
        });
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(list));
    },

    deleteEnquiry: (id: string) => {
        const list = storage.getEnquiries().filter(e => e.id !== id);
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(list));
    },


    // Basic Auth Check
    login: (username: string, password: string): User | undefined => {
        const users = storage.getUsers();
        return users.find(u => u.username === username && u.password === password);
    }
};

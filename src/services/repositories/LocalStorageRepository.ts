import type { User, Product, Branch, Enquiry, PipelineStage, Promotion } from '../../types';
import type { IDataRepository } from '../interfaces/IDataRepository';
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_BRANCHES } from '../mockData';

const KEYS = {
    USERS: 'tc_users',
    PRODUCTS: 'tc_products',
    BRANCHES: 'tc_branches',
    ENQUIRIES: 'tc_enquiries',
    PROMOTIONS: 'tc_promotions',
};

/**
 * LocalStorage Implementation of IDataRepository
 * This class implements the repository interface using browser localStorage.
 * Can be easily replaced with a Supabase implementation later.
 */
export class LocalStorageRepository implements IDataRepository {
    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // Initialize data only once
        if (!localStorage.getItem(KEYS.USERS)) {
            localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
        }

        // Always sync products (for development)
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));

        // Initialize branches once
        if (!localStorage.getItem(KEYS.BRANCHES)) {
            localStorage.setItem(KEYS.BRANCHES, JSON.stringify(MOCK_BRANCHES));
        }

        // Initialize enquiries
        if (!localStorage.getItem(KEYS.ENQUIRIES)) {
            localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify([]));
        }

        // Initialize promotions
        if (!localStorage.getItem(KEYS.PROMOTIONS)) {
            const initialPromotions: Promotion[] = [
                {
                    id: '1',
                    title: 'Republic Day Special!',
                    description: 'Get 10% off on all Weeders and Rotavators this week.',
                    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'New Launch: Milking Machine X1',
                    description: 'Special introductory price of ₹45,000 only.',
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(initialPromotions));
        }
    }

    // User Operations
    async getUsers(): Promise<User[]> {
        return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    }

    async getUserById(id: string): Promise<User | null> {
        const users = await this.getUsers();
        return users.find(u => u.id === id) || null;
    }

    async addUser(user: User): Promise<void> {
        const users = await this.getUsers();
        users.push(user);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    async login(username: string, password: string): Promise<User | null> {
        const users = await this.getUsers();
        return users.find(u => u.username === username && u.password === password) || null;
    }

    // Product Operations
    async getProducts(): Promise<Product[]> {
        return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    }

    async getProductById(id: string): Promise<Product | null> {
        const products = await this.getProducts();
        return products.find(p => p.id === id) || null;
    }

    async addProduct(product: Product): Promise<void> {
        const products = await this.getProducts();
        products.push(product);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    }

    async updateProduct(product: Product): Promise<void> {
        const products = await this.getProducts();
        const updated = products.map(p => p.id === product.id ? product : p);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
    }

    // Branch Operations
    async getBranches(): Promise<Branch[]> {
        return JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]');
    }

    async getBranchById(id: string): Promise<Branch | null> {
        const branches = await this.getBranches();
        return branches.find(b => b.id === id) || null;
    }

    async addBranch(branch: Branch): Promise<void> {
        const branches = await this.getBranches();
        branches.push(branch);
        localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
    }

    async updateBranch(branch: Branch): Promise<void> {
        const branches = await this.getBranches();
        const updated = branches.map(b => b.id === branch.id ? branch : b);
        localStorage.setItem(KEYS.BRANCHES, JSON.stringify(updated));
    }

    async deleteBranch(branchId: string): Promise<void> {
        const branches = await this.getBranches();
        const filtered = branches.filter(b => b.id !== branchId);
        localStorage.setItem(KEYS.BRANCHES, JSON.stringify(filtered));

        // Also delete associated branch admin
        const users = await this.getUsers();
        const filteredUsers = users.filter(u => !(u.role === 'branch_admin' && u.branchId === branchId));
        localStorage.setItem(KEYS.USERS, JSON.stringify(filteredUsers));
    }

    // Enquiry Operations
    async getEnquiries(): Promise<Enquiry[]> {
        return JSON.parse(localStorage.getItem(KEYS.ENQUIRIES) || '[]');
    }

    async getEnquiryById(id: string): Promise<Enquiry | null> {
        const enquiries = await this.getEnquiries();
        return enquiries.find(e => e.id === id) || null;
    }

    async getEnquiriesByBranch(branchId: string): Promise<Enquiry[]> {
        const enquiries = await this.getEnquiries();
        return enquiries.filter(e => e.branchId === branchId);
    }

    async getEnquiriesByUser(userId: string): Promise<Enquiry[]> {
        const enquiries = await this.getEnquiries();
        return enquiries.filter(e => e.createdBy === userId);
    }

    async addEnquiry(enquiry: Enquiry): Promise<void> {
        const enquiries = await this.getEnquiries();
        enquiries.push(enquiry);
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(enquiries));
    }

    async updateEnquiryStage(id: string, stage: PipelineStage, userId: string): Promise<void> {
        const enquiries = await this.getEnquiries();
        const updated = enquiries.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    pipelineStage: stage,
                    history: [...e.history, { stage, timestamp: new Date().toISOString(), userId }]
                };
            }
            return e;
        });
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(updated));
    }

    // Promotion Operations
    async getPromotions(): Promise<Promotion[]> {
        return JSON.parse(localStorage.getItem(KEYS.PROMOTIONS) || '[]');
    }

    async addPromotion(promotion: Promotion): Promise<void> {
        const promotions = await this.getPromotions();
        promotions.push(promotion);
        localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(promotions));
    }

    async updatePromotion(promotion: Promotion): Promise<void> {
        const promotions = await this.getPromotions();
        const updated = promotions.map(p => p.id === promotion.id ? promotion : p);
        localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(updated));
    }

    async deletePromotion(id: string): Promise<void> {
        const promotions = await this.getPromotions();
        const filtered = promotions.filter(p => p.id !== id);
        localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(filtered));
    }
}

import type { User, Product, Branch, Enquiry, PipelineStage, Promotion, Message, Offer, WhatsAppContent, WhatsAppQueueItem } from '../../types';
import type { IDataRepository } from '../interfaces/IDataRepository';
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_BRANCHES } from '../mockData';

const KEYS = {
    USERS: 'tc_users',
    PRODUCTS: 'tc_products',
    BRANCHES: 'tc_branches',
    ENQUIRIES: 'tc_enquiries',
    PROMOTIONS: 'tc_promotions',
    OFFERS: 'tc_offers',
    WHATSAPP_CONTENT: 'tc_whatsapp_content',
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
        // ... (existing initialization)
        if (!localStorage.getItem(KEYS.USERS)) {
            localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
        }

        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));

        if (!localStorage.getItem(KEYS.BRANCHES)) {
            localStorage.setItem(KEYS.BRANCHES, JSON.stringify(MOCK_BRANCHES));
        } else {
            const currentBranches = JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]').filter(Boolean);
            if (!currentBranches.find((b: any) => b && b.id === 'b4')) {
                const hosurBranch = MOCK_BRANCHES.find(b => b.id === 'b4');
                if (hosurBranch) {
                    currentBranches.push(hosurBranch);
                }
                localStorage.setItem(KEYS.BRANCHES, JSON.stringify(currentBranches));
            }
        }

        if (!localStorage.getItem(KEYS.USERS)) {
            localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
        } else {
            const currentUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]').filter(Boolean);
            if (!currentUsers.find((u: any) => u && u.username === 'hosur-admin')) {
                const hosurAdmin = MOCK_USERS.find(u => u.username === 'hosur-admin');
                if (hosurAdmin) {
                    currentUsers.push(hosurAdmin);
                }
                localStorage.setItem(KEYS.USERS, JSON.stringify(currentUsers));
            }
        }
        if (!localStorage.getItem(KEYS.ENQUIRIES)) {
            localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify([]));
        }

        if (!localStorage.getItem(KEYS.PROMOTIONS)) {
            const initialPromotions: Promotion[] = [
                {
                    id: '1',
                    title: 'Republic Day Special!',
                    description: 'Get 10% off on all Weeders and Rotavators this week.',
                    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(initialPromotions));
        }

        if (!localStorage.getItem(KEYS.OFFERS)) {
            localStorage.setItem(KEYS.OFFERS, JSON.stringify([]));
        }

        if (!localStorage.getItem(KEYS.WHATSAPP_CONTENT)) {
            localStorage.setItem(KEYS.WHATSAPP_CONTENT, JSON.stringify([]));
        }
    }

    // ... (existing operations)

    // Offer Operations
    async getOffers(): Promise<Offer[]> {
        return (JSON.parse(localStorage.getItem(KEYS.OFFERS) || '[]') as (Offer | null)[]).filter((o): o is Offer => o !== null);
    }

    async addOffer(offer: Offer): Promise<void> {
        const offers = await this.getOffers();
        offers.push(offer);
        localStorage.setItem(KEYS.OFFERS, JSON.stringify(offers));
    }

    async updateOffer(offer: Offer): Promise<void> {
        const offers = await this.getOffers();
        const updated = offers.map(o => o.id === offer.id ? offer : o);
        localStorage.setItem(KEYS.OFFERS, JSON.stringify(updated));
    }

    async deleteOffer(id: string): Promise<void> {
        const offers = await this.getOffers();
        const filtered = offers.filter(o => o.id !== id);
        localStorage.setItem(KEYS.OFFERS, JSON.stringify(filtered));
    }

    // WhatsApp Content Operations
    async getWhatsAppContent(): Promise<WhatsAppContent[]> {
        return (JSON.parse(localStorage.getItem(KEYS.WHATSAPP_CONTENT) || '[]') as (WhatsAppContent | null)[]).filter((c): c is WhatsAppContent => c !== null);
    }

    async addWhatsAppContent(content: WhatsAppContent): Promise<void> {
        const contents = await this.getWhatsAppContent();
        contents.push(content);
        localStorage.setItem(KEYS.WHATSAPP_CONTENT, JSON.stringify(contents));
    }

    async updateWhatsAppContent(content: WhatsAppContent): Promise<void> {
        const contents = await this.getWhatsAppContent();
        const updated = contents.map(c => c.id === content.id ? content : c);
        localStorage.setItem(KEYS.WHATSAPP_CONTENT, JSON.stringify(updated));
    }

    async deleteWhatsAppContent(id: string): Promise<void> {
        const contents = await this.getWhatsAppContent();
        const filtered = contents.filter(c => c.id !== id);
        localStorage.setItem(KEYS.WHATSAPP_CONTENT, JSON.stringify(filtered));
    }

    // User Operations
    async getUsers(): Promise<User[]> {
        return (JSON.parse(localStorage.getItem(KEYS.USERS) || '[]') as (User | null)[]).filter((u): u is User => u !== null);
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

    async updateUser(user: User): Promise<void> {
        const users = await this.getUsers();
        const updated = users.map(u => u.id === user.id ? user : u);
        localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
    }

    async deleteUser(id: string): Promise<void> {
        const users = await this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
    }

    async login(username: string, password: string): Promise<User | null> {
        const users = await this.getUsers();
        return users.find(u => u.username === username && u.password === password) || null;
    }

    async logout(): Promise<void> {
        return Promise.resolve();
    }

    // Product Operations
    async getProducts(): Promise<Product[]> {
        return (JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]') as (Product | null)[]).filter((p): p is Product => p !== null);
    }

    async getProductsByBranch(branchId: string): Promise<Product[]> {
        const products = await this.getProducts();
        return products.filter(p => p.branchId === branchId);
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

    async deleteProduct(_id: string): Promise<void> {
        throw new Error("Delete not supported in local storage mode");
    }

    // Branch Operations
    async getBranches(): Promise<Branch[]> {
        return (JSON.parse(localStorage.getItem(KEYS.BRANCHES) || '[]') as (Branch | null)[]).filter((b): b is Branch => b !== null);
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

        const users = await this.getUsers();
        const filteredUsers = users.filter(u => !(u.role === 'branch_admin' && u.branchId === branchId));
        localStorage.setItem(KEYS.USERS, JSON.stringify(filteredUsers));
    }

    // Enquiry Operations
    async getEnquiries(): Promise<Enquiry[]> {
        return (JSON.parse(localStorage.getItem(KEYS.ENQUIRIES) || '[]') as (Enquiry | null)[]).filter((e): e is Enquiry => e !== null);
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

    async updateEnquiryStage(id: string, stage: PipelineStage, userId: string, notes?: string, amount?: number, warrantyStart?: string, warrantyEnd?: string): Promise<void> {
        const enquiries = await this.getEnquiries();
        const updated = enquiries.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    pipelineStage: stage,
                    closedAmount: amount !== undefined ? amount : e.closedAmount,
                    warrantyStartDate: warrantyStart !== undefined ? warrantyStart : e.warrantyStartDate,
                    warrantyEndDate: warrantyEnd !== undefined ? warrantyEnd : e.warrantyEndDate,
                    history: [...e.history, { stage, timestamp: new Date().toISOString(), userId, notes }]
                };
            }
            return e;
        });
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(updated));
    }

    async deleteEnquiry(id: string): Promise<void> {
        const enquiries = await this.getEnquiries();
        const filtered = enquiries.filter(e => e.id !== id);
        localStorage.setItem(KEYS.ENQUIRIES, JSON.stringify(filtered));
    }

    // Promotion Operations
    async getPromotions(): Promise<Promotion[]> {
        return (JSON.parse(localStorage.getItem(KEYS.PROMOTIONS) || '[]') as (Promotion | null)[]).filter((p): p is Promotion => p !== null);
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

    // Feedback Operations
    async addFeedback(feedback: { userId: string; message: string; rating: number }): Promise<void> {
        const feedbacks = JSON.parse(localStorage.getItem('tc_feedback') || '[]');
        feedbacks.push({ ...feedback, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('tc_feedback', JSON.stringify(feedbacks));
    }

    // Messaging Operations
    async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
        console.log('Mock sending message:', message);
    }

    async getMessages(_branchId: string): Promise<Message[]> {
        return [];
    }

    async getSentMessages(_senderRole: string, _senderBranchId?: string): Promise<Message[]> {
        return [];
    }

    async markMessageAsRead(_messageId: string): Promise<void> {
        console.log('Mock mark read');
    }

    // Telephony Operations
    async initiateCall(params: any): Promise<{ success: boolean; callLog: any; message: string }> {
        console.log('Mock initiating call:', params);
        return {
            success: true,
            callLog: { id: 'mock-call-' + Date.now(), ...params },
            message: 'Mock call initiated!'
        };
    }

    // WhatsApp Queue Operations
    async getWhatsAppQueue(): Promise<WhatsAppQueueItem[]> {
        return JSON.parse(localStorage.getItem('tc_whatsapp_queue') || '[]');
    }

    async updateWhatsAppQueueItem(item: Partial<WhatsAppQueueItem> & { id: string }): Promise<void> {
        const queue = await this.getWhatsAppQueue();
        const updated = queue.map(q => q.id === item.id ? { ...q, ...item, updatedAt: new Date().toISOString() } : q);
        localStorage.setItem('tc_whatsapp_queue', JSON.stringify(updated));
    }

    async deleteWhatsAppQueueItem(id: string): Promise<void> {
        const queue = await this.getWhatsAppQueue();
        const filtered = queue.filter(q => q.id !== id);
        localStorage.setItem('tc_whatsapp_queue', JSON.stringify(filtered));
    }
}

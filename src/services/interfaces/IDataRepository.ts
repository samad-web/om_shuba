import type { User, Product, Branch, Enquiry, PipelineStage, Promotion, Message, Offer, WhatsAppContent, WhatsAppQueueItem } from '../../types';

/**
 * Data Repository Interface
 * This interface defines the contract for all data operations.
 * Implementations can use localStorage, Supabase, or any other backend.
 */
export interface IDataRepository {
    // User Operations
    getUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    addUser(user: User): Promise<void>;
    updateUser(user: User): Promise<void>;
    deleteUser(id: string): Promise<void>;
    login(username: string, password: string): Promise<User | null>;
    logout(): Promise<void>;

    // Product Operations
    getProducts(): Promise<Product[]>;
    getProductsByBranch(branchId: string): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
    addProduct(product: Product): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    deleteProduct?(id: string): Promise<void>;

    // Branch Operations
    getBranches(): Promise<Branch[]>;
    getBranchById(id: string): Promise<Branch | null>;
    addBranch(branch: Branch): Promise<void>;
    updateBranch(branch: Branch): Promise<void>;
    deleteBranch(branchId: string): Promise<void>;

    // Enquiry Operations
    getEnquiries(): Promise<Enquiry[]>;
    getEnquiryById(id: string): Promise<Enquiry | null>;
    getEnquiriesByBranch(branchId: string): Promise<Enquiry[]>;
    getEnquiriesByUser(userId: string): Promise<Enquiry[]>;
    addEnquiry(enquiry: Enquiry): Promise<void>;
    updateEnquiryStage(id: string, stage: PipelineStage, userId: string, notes?: string, amount?: number, warrantyStart?: string, warrantyEnd?: string): Promise<void>;
    deleteEnquiry(id: string): Promise<void>;

    // Promotion Operations
    getPromotions(): Promise<Promotion[]>;
    addPromotion(promotion: Promotion): Promise<void>;
    updatePromotion(promotion: Promotion): Promise<void>;
    deletePromotion(id: string): Promise<void>;

    // Offer Operations
    getOffers(): Promise<Offer[]>;
    addOffer(offer: Offer): Promise<void>;
    updateOffer(offer: Offer): Promise<void>;
    deleteOffer(id: string): Promise<void>;

    // WhatsApp Content Operations
    getWhatsAppContent(): Promise<WhatsAppContent[]>;
    addWhatsAppContent(content: WhatsAppContent): Promise<void>;
    updateWhatsAppContent(content: WhatsAppContent): Promise<void>;
    deleteWhatsAppContent(id: string): Promise<void>;

    // Feedback Operations
    addFeedback(feedback: { userId: string; message: string; rating: number }): Promise<void>;

    // Messaging Operations
    sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<void>;
    getMessages(branchId: string): Promise<Message[]>;
    getSentMessages(senderRole: string, senderBranchId?: string): Promise<Message[]>;
    markMessageAsRead(messageId: string): Promise<void>;

    // Telephony Operations
    initiateCall(params: {
        enquiryId?: string;
        customerPhone: string;
        telecallerPhone: string;
        branchId: string;
        callerId: string;
    }): Promise<{ success: boolean; callLog: any; message: string }>;

    // WhatsApp Queue Operations
    getWhatsAppQueue(): Promise<WhatsAppQueueItem[]>;
    updateWhatsAppQueueItem(item: Partial<WhatsAppQueueItem> & { id: string }): Promise<void>;
    deleteWhatsAppQueueItem(id: string): Promise<void>;
}

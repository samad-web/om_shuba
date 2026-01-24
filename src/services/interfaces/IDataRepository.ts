import type { User, Product, Branch, Enquiry, PipelineStage } from '../../types';

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
    login(username: string, password: string): Promise<User | null>;

    // Product Operations
    getProducts(): Promise<Product[]>;
    getProductById(id: string): Promise<Product | null>;
    addProduct(product: Product): Promise<void>;
    updateProduct(product: Product): Promise<void>;

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
    updateEnquiryStage(id: string, stage: PipelineStage, userId: string): Promise<void>;
}

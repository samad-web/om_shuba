import type { IDataRepository } from './interfaces/IDataRepository';
import { LocalStorageRepository } from './repositories/LocalStorageRepository';

/**
 * Data Service - Central access point for all data operations
 * 
 * To migrate to Supabase:
 * 1. Create SupabaseRepository.ts implementing IDataRepository
 * 2. Change the repository assignment below
 * 3. No other code changes needed!
 * 
 * Example Supabase setup:
 * ```typescript
 * import { SupabaseRepository } from './repositories/SupabaseRepository';
 * const repository: IDataRepository = new SupabaseRepository();
 * ```
 */

// Current implementation using localStorage
const repository: IDataRepository = new LocalStorageRepository();

// Future Supabase implementation (commented out for now):
// import { SupabaseRepository } from './repositories/SupabaseRepository';
// const repository: IDataRepository = new SupabaseRepository(supabaseClient);

/**
 * Export the repository instance as the default data service
 * All components should import from this file, not directly from repositories
 */
export const dataService = repository;

/**
 * Synchronous wrapper for backwards compatibility
 * TODO: Remove these wrappers after updating all components to use async/await
 */
export const storage = {
    // User Operations
    getUsers: () => {
        const users: any[] = [];
        repository.getUsers().then(result => users.push(...result));
        return JSON.parse(localStorage.getItem('tc_users') || '[]');
    },

    // Product Operations
    getProducts: () => {
        return JSON.parse(localStorage.getItem('tc_products') || '[]');
    },

    // Branch Operations
    getBranches: () => {
        return JSON.parse(localStorage.getItem('tc_branches') || '[]');
    },

    // Enquiry Operations  
    getEnquiries: () => {
        return JSON.parse(localStorage.getItem('tc_enquiries') || '[]');
    },

    // Legacy methods - kept for backwards compatibility
    addProduct: (product: any) => repository.addProduct(product),
    updateProduct: (product: any) => repository.updateProduct(product),
    addBranch: (branch: any) => repository.addBranch(branch),
    deleteBranch: (branchId: string) => repository.deleteBranch(branchId),
    addUser: (user: any) => repository.addUser(user),
    addEnquiry: (enquiry: any) => repository.addEnquiry(enquiry),
    updateEnquiryStage: (id: string, stage: any, userId: string) => repository.updateEnquiryStage(id, stage, userId),
    getPromotions: () => {
        return JSON.parse(localStorage.getItem('tc_promotions') || '[]');
    },
    addPromotion: (promotion: any) => repository.addPromotion(promotion),
    updatePromotion: (promotion: any) => repository.updatePromotion(promotion),
    deletePromotion: (id: string) => repository.deletePromotion(id),
    login: (username: string, password: string) => {
        repository.login(username, password);
        return JSON.parse(localStorage.getItem('tc_users') || '[]').find((u: any) => u.username === username && u.password === password);
    }
};

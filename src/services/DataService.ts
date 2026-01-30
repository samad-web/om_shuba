import type { IDataRepository } from './interfaces/IDataRepository';
import { LocalStorageRepository } from './repositories/LocalStorageRepository';
import { SupabaseRepository } from './repositories/SupabaseRepository';

const isSupabaseEnabled =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_USE_SUPABASE === 'true';

// Current implementation - switches based on env
const repository: IDataRepository = isSupabaseEnabled
    ? new SupabaseRepository()
    : new LocalStorageRepository();

/**
 * Export the repository instance as the default data service
 * All components should import from this file, not directly from repositories
 */
export const dataService = repository;

/**
 * Synchronous wrapper for backwards compatibility
 * WARNING: These methods will ONLY work with LocalStorageRepository.
 * They are kept to prevent the app from breaking during migration.
 * TODO: Migrate all components to use dataService (async) instead of storage (sync)
 */
export const storage = {
    // User Operations
    getUsers: () => {
        if (isSupabaseEnabled) {
            console.warn('Sync storage.getUsers() called while Supabase is enabled. This will return stale LocalStorage data.');
        }
        return JSON.parse(localStorage.getItem('tc_users') || '[]');
    },

    // Product Operations
    getProducts: () => {
        if (isSupabaseEnabled) {
            console.warn('Sync storage.getProducts() called while Supabase is enabled.');
        }
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

    // Legacy methods
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
        // This is problematic as it's sync. For migration, we keep it reading from localStorage
        // but the actual login check should be async via dataService.login
        return JSON.parse(localStorage.getItem('tc_users') || '[]').find((u: any) => u.username === username && u.password === password);
    }
};

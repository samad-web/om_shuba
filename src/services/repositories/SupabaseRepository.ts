import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IDataRepository } from '../interfaces/IDataRepository';
import type { User, Product, Branch, Enquiry, PipelineStage, Promotion, EnquiryHistory } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export class SupabaseRepository implements IDataRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Helper to map snake_case to camelCase and vice versa
    private mapUser(data: any): User {
        return {
            id: data.id,
            username: data.username,
            password: data.password,
            role: data.role,
            name: data.name,
            branchId: data.branch_id
        };
    }

    private mapProduct(data: any): Product {
        return {
            id: data.id,
            sku: data.sku,
            name: data.name,
            category: data.category,
            shortDescription: data.short_description,
            priceRange: data.price_range,
            demoUrl: data.demo_url,
            active: data.active,
            branchId: data.branch_id
        };
    }

    private mapBranch(data: any): Branch {
        return {
            id: data.id,
            name: data.name,
            location: data.location,
            contactNumber: data.contact_number,
            active: data.active
        };
    }

    private mapEnquiry(data: any, history: EnquiryHistory[] = []): Enquiry {
        return {
            id: data.id,
            customerName: data.customer_name,
            phoneNumber: data.phone_number,
            location: data.location,
            productId: data.product_id,
            branchId: data.branch_id,
            purchaseIntent: data.purchase_intent,
            pipelineStage: data.pipeline_stage,
            createdBy: data.created_by,
            createdAt: data.created_at,
            closedAmount: data.closed_amount,
            history: history
        };
    }

    // ... (skipping mapPromotion)

    // ...

    async addEnquiry(enquiry: Enquiry): Promise<void> {
        const { error: enqError } = await this.supabase.from('enquiries').insert([{
            id: enquiry.id,
            customer_name: enquiry.customerName,
            phone_number: enquiry.phoneNumber,
            location: enquiry.location,
            product_id: enquiry.productId,
            branch_id: enquiry.branchId,
            purchase_intent: enquiry.purchaseIntent,
            pipeline_stage: enquiry.pipelineStage,
            created_by: enquiry.createdBy,
            created_at: enquiry.createdAt,
            closed_amount: enquiry.closedAmount
        }]);

        if (enqError) throw enqError;

        if (enquiry.history && enquiry.history.length > 0) {
            const historyData = enquiry.history.map(h => ({
                enquiry_id: enquiry.id,
                stage: h.stage,
                timestamp: h.timestamp,
                user_id: h.userId,
                notes: h.notes
            }));
            const { error: histError } = await this.supabase.from('enquiry_history').insert(historyData);
            if (histError) throw histError;
        }
    }

    async updateEnquiryStage(id: string, stage: PipelineStage, userId: string, notes?: string, amount?: number): Promise<void> {
        const updates: any = { pipeline_stage: stage };
        if (amount !== undefined) updates.closed_amount = amount;

        const { error: enqError } = await this.supabase
            .from('enquiries')
            .update(updates)
            .eq('id', id);

        if (enqError) throw enqError;

        const { error: histError } = await this.supabase.from('enquiry_history').insert([{
            enquiry_id: id,
            stage: stage,
            timestamp: new Date().toISOString(),
            user_id: userId,
            notes: notes
        }]);

        if (histError) throw histError;
    }

    async deleteEnquiry(id: string): Promise<void> {
        const { error } = await this.supabase.from('enquiries').delete().eq('id', id);
        if (error) throw error;
    }

    private mapPromotion(data: any): Promotion {
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            validUntil: data.valid_until,
            active: data.active,
            createdAt: data.created_at
        };
    }

    // User Operations
    async getUsers(): Promise<User[]> {
        const { data, error } = await this.supabase.from('users').select('*');
        if (error) throw error;
        return (data || []).map(this.mapUser);
    }

    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return this.mapUser(data);
    }

    async addUser(user: User): Promise<void> {
        const { error } = await this.supabase.from('users').insert([{
            id: user.id,
            username: user.username,
            password: user.password,
            role: user.role,
            name: user.name,
            branch_id: user.branchId
        }]);
        if (error) throw error;
    }

    async updateUser(user: User): Promise<void> {
        const { error } = await this.supabase
            .from('users')
            .update({
                username: user.username,
                password: user.password,
                role: user.role,
                name: user.name,
                branch_id: user.branchId
            })
            .eq('id', user.id);
        if (error) throw error;
    }

    async deleteUser(id: string): Promise<void> {
        const { error } = await this.supabase.from('users').delete().eq('id', id);
        if (error) throw error;
    }

    async login(username: string, password: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
        if (error) return null;
        return this.mapUser(data);
    }

    // Product Operations
    async getProducts(): Promise<Product[]> {
        const { data, error } = await this.supabase.from('products').select('*');
        if (error) throw error;
        return (data || []).map(this.mapProduct);
    }

    async getProductsByBranch(branchId: string): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('branch_id', branchId);
        if (error) throw error;
        return (data || []).map(this.mapProduct);
    }

    async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return this.mapProduct(data);
    }

    async addProduct(product: Product): Promise<void> {
        const { error } = await this.supabase.from('products').insert([{
            id: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            short_description: product.shortDescription,
            price_range: product.priceRange,
            demo_url: product.demoUrl,
            active: product.active,
            branch_id: product.branchId
        }]);
        if (error) throw error;
    }

    async updateProduct(product: Product): Promise<void> {
        const { error } = await this.supabase
            .from('products')
            .update({
                sku: product.sku,
                name: product.name,
                category: product.category,
                short_description: product.shortDescription,
                price_range: product.priceRange,
                demo_url: product.demoUrl,
                active: product.active,
                branch_id: product.branchId
            })
            .eq('id', product.id);
        if (error) throw error;
    }

    // Branch Operations
    async getBranches(): Promise<Branch[]> {
        const { data, error } = await this.supabase.from('branches').select('*');
        if (error) throw error;
        return (data || []).map(this.mapBranch);
    }

    async getBranchById(id: string): Promise<Branch | null> {
        const { data, error } = await this.supabase
            .from('branches')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return this.mapBranch(data);
    }

    async addBranch(branch: Branch): Promise<void> {
        const { error } = await this.supabase.from('branches').insert([{
            id: branch.id,
            name: branch.name,
            location: branch.location,
            contact_number: branch.contactNumber,
            active: branch.active
        }]);
        if (error) throw error;
    }

    async updateBranch(branch: Branch): Promise<void> {
        const { error } = await this.supabase
            .from('branches')
            .update({
                name: branch.name,
                location: branch.location,
                contact_number: branch.contactNumber,
                active: branch.active
            })
            .eq('id', branch.id);
        if (error) throw error;
    }

    async deleteBranch(branchId: string): Promise<void> {
        // RLS or Cascading deletes should handle this in production
        // But for completeness, we follow LocalStorageRepository logic
        const { error: userError } = await this.supabase
            .from('users')
            .delete()
            .eq('role', 'branch_admin')
            .eq('branch_id', branchId);

        if (userError) throw userError;

        const { error: branchError } = await this.supabase
            .from('branches')
            .delete()
            .eq('id', branchId);

        if (branchError) throw branchError;
    }

    // Enquiry Operations
    async getEnquiries(): Promise<Enquiry[]> {
        const { data: enquiries, error: enqError } = await this.supabase
            .from('enquiries')
            .select('*, enquiry_history(*)');

        if (enqError) throw enqError;

        return (enquiries || []).map(enq => {
            const history = (enq.enquiry_history || []).map((h: any) => ({
                stage: h.stage,
                timestamp: h.timestamp,
                userId: h.user_id,
                notes: h.notes
            }));
            return this.mapEnquiry(enq, history);
        });
    }

    async getEnquiryById(id: string): Promise<Enquiry | null> {
        const { data, error } = await this.supabase
            .from('enquiries')
            .select('*, enquiry_history(*)')
            .eq('id', id)
            .single();

        if (error) return null;

        const history = (data.enquiry_history || []).map((h: any) => ({
            stage: h.stage,
            timestamp: h.timestamp,
            userId: h.user_id,
            notes: h.notes
        }));
        return this.mapEnquiry(data, history);
    }

    async getEnquiriesByBranch(branchId: string): Promise<Enquiry[]> {
        const { data, error } = await this.supabase
            .from('enquiries')
            .select('*, enquiry_history(*)')
            .eq('branch_id', branchId);

        if (error) throw error;

        return (data || []).map(enq => {
            const history = (enq.enquiry_history || []).map((h: any) => ({
                stage: h.stage,
                timestamp: h.timestamp,
                userId: h.user_id,
                notes: h.notes
            }));
            return this.mapEnquiry(enq, history);
        });
    }

    async getEnquiriesByUser(userId: string): Promise<Enquiry[]> {
        const { data, error } = await this.supabase
            .from('enquiries')
            .select('*, enquiry_history(*)')
            .eq('created_by', userId);

        if (error) throw error;

        return (data || []).map(enq => {
            const history = (enq.enquiry_history || []).map((h: any) => ({
                stage: h.stage,
                timestamp: h.timestamp,
                userId: h.user_id,
                notes: h.notes
            }));
            return this.mapEnquiry(enq, history);
        });
    }



    // Promotion Operations
    async getPromotions(): Promise<Promotion[]> {
        const { data, error } = await this.supabase.from('promotions').select('*');
        if (error) throw error;
        return (data || []).map(this.mapPromotion);
    }

    async addPromotion(promotion: Promotion): Promise<void> {
        const { error } = await this.supabase.from('promotions').insert([{
            id: promotion.id,
            title: promotion.title,
            description: promotion.description,
            valid_until: promotion.validUntil,
            active: promotion.active,
            created_at: promotion.createdAt
        }]);
        if (error) throw error;
    }

    async updatePromotion(promotion: Promotion): Promise<void> {
        const { error } = await this.supabase
            .from('promotions')
            .update({
                title: promotion.title,
                description: promotion.description,
                valid_until: promotion.validUntil,
                active: promotion.active
            })
            .eq('id', promotion.id);
        if (error) throw error;
    }

    async deletePromotion(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('promotions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }

    // Feedback Operations
    async addFeedback(feedback: { userId: string; message: string; rating: number }): Promise<void> {
        const { error } = await this.supabase.from('user_feedback').insert([{
            user_id: feedback.userId,
            feedback: feedback.message,
            rating: feedback.rating
        }]);
        if (error) throw error;
    }
}

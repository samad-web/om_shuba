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

    // Helper to map username to synthetic email for Supabase Auth
    private usernameToEmail(username: string): string {
        return `${username.toLowerCase()}@omshuba.internal`;
    }

    // Helper to map snake_case to camelCase and vice versa
    private mapUser(data: any): User {
        return {
            id: data.id,
            username: data.username,
            // We no longer return the password from DB for security
            role: data.role,
            name: data.name,
            branchId: data.branch_id,
            passwordLastChanged: data.password_last_changed
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
            branchId: data.branch_id,
            nameTa: data.name_ta,
            categoryTa: data.category_ta,
            shortDescriptionTa: data.short_description_ta
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
        if (error) {
            console.error("Supabase error fetching users:", error.message, error.details);
            throw error;
        }
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
        // 1. Create record in public users table (excluding password)
        const { error } = await this.supabase.from('users').insert([{
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            branch_id: user.branchId,
            password_last_changed: new Date().toISOString()
        }]);

        if (error) throw error;

        // 2. Create/Sync user in Supabase Auth via Edge Function
        const { error: syncError } = await this.supabase.functions.invoke('update-staff-auth', {
            body: {
                userId: user.id,
                email: this.usernameToEmail(user.username),
                password: user.password
            }
        });

        if (syncError) {
            console.error("Auth creation failed:", syncError);
            throw new Error("User record created, but Auth credentials failed. Please use 'Edit' to set a password.");
        }
    }

    async updateUser(user: User): Promise<void> {
        // 1. Update profile in our custom users table (excluding password)
        const { error } = await this.supabase
            .from('users')
            .update({
                username: user.username,
                role: user.role,
                name: user.name,
                branch_id: user.branchId,
                password_last_changed: user.passwordLastChanged
            })
            .eq('id', user.id);

        if (error) {
            console.error("Supabase Profile Update Error:", error.message, error.details, error.hint);
            throw new Error(`Profile Update Failed: ${error.message}`);
        }

        // 2. If a password was provided, sync it to Supabase Auth via Edge Function
        if (user.password) {
            const { error: syncError } = await this.supabase.functions.invoke('update-staff-auth', {
                body: {
                    userId: user.id,
                    email: this.usernameToEmail(user.username),
                    password: user.password
                }
            });

            if (syncError) {
                console.error("Auth sync failed technical details:", syncError);
                let errorMessage = "Profile updated, but password sync failed.";

                // Try to extract the JSON error body from the response
                try {
                    if ((syncError as any).context && typeof (syncError as any).context.json === 'function') {
                        const errorBody = await (syncError as any).context.json();
                        if (errorBody && errorBody.error) {
                            errorMessage += ` Reason: ${errorBody.error}`;
                        }
                    } else if (syncError.message) {
                        errorMessage += ` Reason: ${syncError.message}`;
                    }
                } catch (e) {
                    if (syncError.message) errorMessage += ` Reason: ${syncError.message}`;
                }

                throw new Error(errorMessage);
            }
        }
    }

    async deleteUser(id: string): Promise<void> {
        const { error } = await this.supabase.from('users').delete().eq('id', id);
        if (error) throw error;
    }

    async login(username: string, password: string): Promise<User | null> {
        const cleanUsername = username.trim().toLowerCase();
        console.log(`Debug: Attempting login for ${cleanUsername}`);

        // 1. Sign in with Supabase Auth using synthetic email
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email: this.usernameToEmail(cleanUsername),
            password: password
        });

        if (authError || !authData.user) {
            console.error("Auth login failed:", authError?.message);
            throw new Error(authError?.message || "Authentication failed");
        }

        console.log("Debug: Auth successful, fetching profile...");

        // 2. Fetch profile data from our custom users table
        const { data: profile, error: profileError } = await this.supabase
            .from('users')
            .select('*')
            .eq('username', cleanUsername)
            .single();

        if (profileError || !profile) {
            console.error("Profile fetch failed:", profileError?.message);
            throw new Error(`Profile not found in database: ${profileError?.message || 'Check database records'}`);
        }

        console.log("Debug: Login complete!");
        return this.mapUser(profile);
    }

    async logout(): Promise<void> {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
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
            branch_id: product.branchId,
            name_ta: product.nameTa,
            category_ta: product.categoryTa,
            short_description_ta: product.shortDescriptionTa
        }]);

        if (error) {
            // Auto-fix for Duplicate SKU (Constraint 23505)
            // If SKU exists globaly, we append the branch ID to make it unique for this branch
            if (error.code === '23505' && product.branchId) {
                const localizedSku = `${product.sku}-${product.branchId}`;

                const { error: retryError } = await this.supabase.from('products').insert([{
                    id: product.id,
                    sku: localizedSku,
                    name: product.name,
                    category: product.category,
                    short_description: product.shortDescription,
                    price_range: product.priceRange,
                    demo_url: product.demoUrl,
                    active: product.active,
                    branch_id: product.branchId,
                    name_ta: product.nameTa,
                    category_ta: product.categoryTa,
                    short_description_ta: product.shortDescriptionTa
                }]);

                if (!retryError) {
                    return;
                }
                throw retryError;
            }

            throw error;
        }
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
                branch_id: product.branchId,
                name_ta: product.nameTa,
                category_ta: product.categoryTa,
                short_description_ta: product.shortDescriptionTa
            })
            .eq('id', product.id);
        if (error) throw error;
    }

    async deleteProduct(id: string): Promise<void> {
        const { error } = await this.supabase.from('products').delete().eq('id', id);
        if (error) throw error;
    }

    // Branch Operations
    async getBranches(): Promise<Branch[]> {
        const { data, error } = await this.supabase.from('branches').select('*');
        if (error) {
            console.error("Supabase error fetching branches:", error.message, error.details);
            throw error;
        }
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

    // Messaging Operations
    private mapMessage(data: any): import('../../types').Message {
        return {
            id: data.id,
            senderRole: data.sender_role,
            senderBranchId: data.sender_branch_id,
            targetBranchId: data.target_branch_id,
            content: data.content,
            createdAt: data.created_at,
            isRead: data.is_read,
            senderName: data.sender_name // Add mapping
        };
    }

    async sendMessage(message: Omit<import('../../types').Message, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
        const { error } = await this.supabase.from('branch_messages').insert([{
            sender_role: message.senderRole,
            sender_branch_id: message.senderBranchId || null,
            sender_name: (message as any).senderName || null, // Add to insert
            target_branch_id: message.targetBranchId,
            content: message.content
        }]);
        if (error) throw error;
    }

    async getMessages(branchId: string): Promise<import('../../types').Message[]> {
        let query = this.supabase
            .from('branch_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (branchId !== 'all') {
            query = query.or(`target_branch_id.eq.${branchId},target_branch_id.eq.all`);
        } else {
            // Admin view: fetch all messages where target is 'admin' OR just all messages?
            // Usually Inbox = messages sent TO me.
            // If I am admin, I want to see messages sent to 'admin'.
            query = query.eq('target_branch_id', 'admin');
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapMessage);
    }

    async getSentMessages(senderRole: string, senderBranchId?: string): Promise<import('../../types').Message[]> {
        let query = this.supabase
            .from('branch_messages')
            .select('*')
            .eq('sender_role', senderRole)
            .order('created_at', { ascending: false });

        if (senderRole === 'branch_admin' && senderBranchId) {
            query = query.eq('sender_branch_id', senderBranchId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(this.mapMessage);
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        const { error } = await this.supabase
            .from('branch_messages')
            .update({ is_read: true })
            .eq('id', messageId);
        if (error) throw error;
    }
}

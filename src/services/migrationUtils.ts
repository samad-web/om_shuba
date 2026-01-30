import { LocalStorageRepository } from './repositories/LocalStorageRepository';

/**
 * Migration Utility
 * Use this to export data from LocalStorage to a format suitable for Supabase import.
 */
export const migrationUtils = {
    /**
     * Exports all data currently in LocalStorage as a single object
     */
    exportLocalStorageData: async () => {
        const repo = new LocalStorageRepository();

        const data = {
            users: await repo.getUsers(),
            products: await repo.getProducts(),
            branches: await repo.getBranches(),
            enquiries: await repo.getEnquiries(),
            promotions: await repo.getPromotions(),
        };

        return data;
    },

    /**
     * Generates SQL insert statements for the exported data
     * (Basic implementation - can be expanded)
     */
    generateSqlInserts: (data: any) => {
        let sql = '-- Migration SQL Generated at ' + new Date().toISOString() + '\n\n';

        // Branches
        if (data.branches.length > 0) {
            sql += '-- Branches\n';
            data.branches.forEach((b: any) => {
                sql += `INSERT INTO branches (id, name, location, contact_number, active) VALUES ('${b.id}', '${b.name}', '${b.location}', '${b.contactNumber}', ${b.active});\n`;
            });
            sql += '\n';
        }

        // Users
        if (data.users.length > 0) {
            sql += '-- Users\n';
            data.users.forEach((u: any) => {
                const branchId = u.branchId ? `'${u.branchId}'` : 'NULL';
                sql += `INSERT INTO users (id, username, password, role, name, branch_id) VALUES ('${u.id}', '${u.username}', '${u.password}', '${u.role}', '${u.name}', ${branchId});\n`;
            });
            sql += '\n';
        }

        // Products
        if (data.products.length > 0) {
            sql += '-- Products\n';
            data.products.forEach((p: any) => {
                const demoUrl = p.demoUrl ? `'${p.demoUrl}'` : 'NULL';
                sql += `INSERT INTO products (id, sku, name, category, short_description, price_range, demo_url, active) VALUES ('${p.id}', '${p.sku}', '${p.name}', '${p.category}', '${p.shortDescription}', '${p.priceRange}', ${demoUrl}, ${p.active});\n`;
            });
            sql += '\n';
        }

        // Enquiries
        if (data.enquiries.length > 0) {
            sql += '-- Enquiries\n';
            data.enquiries.forEach((e: any) => {
                sql += `INSERT INTO enquiries (id, customer_name, phone_number, location, product_id, branch_id, purchase_intent, pipeline_stage, created_by, created_at) VALUES ('${e.id}', '${e.customerName}', '${e.phoneNumber}', '${e.location}', '${e.productId}', '${e.branchId}', '${e.purchaseIntent}', '${e.pipelineStage}', '${e.createdBy}', '${e.createdAt}');\n`;

                // History
                if (e.history && e.history.length > 0) {
                    e.history.forEach((h: any) => {
                        sql += `INSERT INTO enquiry_history (enquiry_id, stage, timestamp, user_id, notes) VALUES ('${e.id}', '${h.stage}', '${h.timestamp}', '${h.userId}', ${h.notes ? `'${h.notes}'` : 'NULL'});\n`;
                    });
                }
            });
            sql += '\n';
        }

        // Promotions
        if (data.promotions.length > 0) {
            sql += '-- Promotions\n';
            data.promotions.forEach((p: any) => {
                const validUntil = p.validUntil ? `'${p.validUntil}'` : 'NULL';
                sql += `INSERT INTO promotions (id, title, description, valid_until, active, created_at) VALUES ('${p.id}', '${p.title}', '${p.description}', ${validUntil}, ${p.active}, '${p.createdAt}');\n`;
            });
            sql += '\n';
        }

        return sql;
    }
};

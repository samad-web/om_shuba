import { dataService } from './DataService';

export const migrationService = {
    migrateAll: async () => {
        const results = {
            branches: 0,
            products: 0,
            users: 0,
            enquiries: 0,
            errors: [] as string[]
        };

        try {
            // 1. Branches
            const localBranches = JSON.parse(localStorage.getItem('tc_branches') || '[]');
            for (const b of localBranches) {
                try {
                    await dataService.addBranch(b);
                    results.branches++;
                } catch (e: any) {
                    // Ignore duplicate key errors (likely from seed script)
                    console.warn(`Branch migration info: ${b.name}`, e.message);
                }
            }

            // 2. Products
            const localProducts = JSON.parse(localStorage.getItem('tc_products') || '[]');
            for (const p of localProducts) {
                try {
                    await dataService.addProduct(p);
                    results.products++;
                } catch (e: any) {
                    console.warn(`Product migration info: ${p.name}`, e.message);
                }
            }

            // 3. Users
            const localUsers = JSON.parse(localStorage.getItem('tc_users') || '[]');
            for (const u of localUsers) {
                try {
                    await dataService.addUser(u);
                    results.users++;
                } catch (e: any) {
                    console.warn(`User migration info: ${u.username}`, e.message);
                }
            }

            // 4. Enquiries
            const localEnquiries = JSON.parse(localStorage.getItem('tc_enquiries') || '[]');
            for (const enq of localEnquiries) {
                try {
                    await dataService.addEnquiry(enq);
                    results.enquiries++;
                } catch (e: any) {
                    console.warn(`Enquiry migration info: ${enq.customerName}`, e.message);
                }
            }
        } catch (error: any) {
            results.errors.push(error.message);
        }

        return results;
    },

    hasLocalData: () => {
        const keys = ['tc_branches', 'tc_products', 'tc_users', 'tc_enquiries'];
        return keys.some(key => {
            const data = localStorage.getItem(key);
            return data && data !== '[]';
        });
    }
};

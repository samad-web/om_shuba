import type { User, Product, Branch } from '../types';

export const MOCK_USERS: User[] = [
    { id: 'u1', username: 'admin', password: 'password', role: 'admin', name: 'System Admin' },
    { id: 'u2', username: 'caller1', password: 'password', role: 'telecaller', name: 'Alice (Caller)' },
    { id: 'u3', username: 'caller2', password: 'password', role: 'telecaller', name: 'Bob (Caller)' },

    // Branch Admins
    { id: 'u4', username: 'admin_attrupalam', password: 'password', role: 'branch_admin', name: 'Attrupalam Admin', branchId: 'b1' },
    { id: 'u5', username: 'admin_periamuthu', password: 'password', role: 'branch_admin', name: 'Periamuthu Admin', branchId: 'b2' },
    { id: 'u6', username: 'admin_tirupathur', password: 'password', role: 'branch_admin', name: 'Tirupathur Admin', branchId: 'b3' },
    { id: 'u7', username: 'admin_hosur', password: 'password', role: 'branch_admin', name: 'Hosur Admin', branchId: 'b4' },
];

export const MOCK_BRANCHES: Branch[] = [
    { id: 'b1', name: 'Attrupalam Branch', location: 'Attrupalam, Tamil Nadu', contactNumber: '9876543210', active: true },
    { id: 'b2', name: 'Periamuthu Branch', location: 'Periamuthu, Tamil Nadu', contactNumber: '9876543211', active: true },
    { id: 'b3', name: 'Tirupathur Branch', location: 'Tirupathur, Tamil Nadu', contactNumber: '9876543212', active: true },
    { id: 'b4', name: 'Hosur Branch', location: 'Hosur, Tamil Nadu', contactNumber: '9876543213', active: true },
];

export const MOCK_PRODUCTS: Product[] = [
    // CATEGORY 1: WEEDERS - Power Weeders
    { id: 'p1', sku: 'PW-P-075', name: 'Power Weeder – 7.5 HP Petrol', category: 'Weeders', shortDescription: '7.5 HP Petrol powered weeder', priceRange: '₹45,000 - ₹55,000', active: true },
    { id: 'p2', sku: 'PW-D-075', name: 'Power Weeder – 7.5 HP Diesel', category: 'Weeders', shortDescription: '7.5 HP Diesel powered weeder', priceRange: '₹48,000 - ₹58,000', active: true },
    { id: 'p3', sku: 'PW-D-075S', name: 'Power Weeder – 7.5 HP Diesel (Self Start)', category: 'Weeders', shortDescription: '7.5 HP Diesel with self-start feature', priceRange: '₹52,000 - ₹62,000', active: true },
    { id: 'p4', sku: 'PW-D-090', name: 'Power Weeder – 9 HP Diesel', category: 'Weeders', shortDescription: '9 HP Diesel powered weeder', priceRange: '₹55,000 - ₹65,000', active: true },
    { id: 'p5', sku: 'PW-BR-065', name: 'Power Weeder – 6.5 HP Diesel with Back Rotavator', category: 'Weeders', shortDescription: '6.5 HP with back rotavator attachment', priceRange: '₹58,000 - ₹68,000', active: true },
    { id: 'p6', sku: 'PW-BR-090', name: 'Power Weeder – 9 HP with Back Rotavator', category: 'Weeders', shortDescription: '9 HP with back rotavator attachment', priceRange: '₹62,000 - ₹72,000', active: true },

    // CATEGORY 1: WEEDERS - Baby Weeder
    { id: 'p7', sku: 'BW-P-035', name: 'Baby Weeder – 3.5 HP Petrol', category: 'Weeders', shortDescription: 'Compact 3.5 HP petrol weeder', priceRange: '₹25,000 - ₹32,000', active: true },

    // CATEGORY 2: ROTAVATORS - Standard
    { id: 'p8', sku: 'RT-42-MG', name: 'Rotavator – 42 Blade Multi Gear', category: 'Rotavators', shortDescription: '42 blade multi-gear rotavator', priceRange: '₹35,000 - ₹45,000', active: true },
    { id: 'p9', sku: 'RT-42-SG', name: 'Rotavator – 42 Blade Single Gear', category: 'Rotavators', shortDescription: '42 blade single gear rotavator', priceRange: '₹32,000 - ₹42,000', active: true },

    // CATEGORY 2: ROTAVATORS - Capital/Captain Series
    { id: 'p10', sku: 'RT-CP-36-MG', name: 'Capital Plus Rotavator – 36 Blade Multi Gear', category: 'Rotavators', shortDescription: 'Capital Plus 36 blade multi-gear', priceRange: '₹38,000 - ₹48,000', active: true },
    { id: 'p11', sku: 'RT-CT-36-SG', name: 'Captain Rotavator – 36 Blade Single Gear', category: 'Rotavators', shortDescription: 'Captain series 36 blade single gear', priceRange: '₹36,000 - ₹45,000', active: true },

    // CATEGORY 2: ROTAVATORS - Capital Series (Same Backbone – 4 Models)
    { id: 'p12', sku: 'RT-CAP-42-A', name: 'Rotavator Capital – 42 Blade (Model A)', category: 'Rotavators', shortDescription: 'Capital 42 blade Model A', priceRange: '₹40,000 - ₹50,000', active: true },
    { id: 'p13', sku: 'RT-CAP-42-B', name: 'Rotavator Capital – 42 Blade (Model B)', category: 'Rotavators', shortDescription: 'Capital 42 blade Model B', priceRange: '₹42,000 - ₹52,000', active: true },
    { id: 'p14', sku: 'RT-CAP-36-A', name: 'Rotavator Capital – 36 Blade (Model A)', category: 'Rotavators', shortDescription: 'Capital 36 blade Model A', priceRange: '₹37,000 - ₹47,000', active: true },
    { id: 'p15', sku: 'RT-CAP-36-B', name: 'Rotavator Capital – 36 Blade (Model B)', category: 'Rotavators', shortDescription: 'Capital 36 blade Model B', priceRange: '₹39,000 - ₹49,000', active: true },

    // CATEGORY 3: CUTTERS - Chop Cutters
    { id: 'p16', sku: 'CC-01-NG', name: 'Chop Cutter – Model 1 (Without Gear)', category: 'Cutters', shortDescription: 'Model 1 without gear mechanism', priceRange: '₹8,000 - ₹12,000', active: true },
    { id: 'p17', sku: 'CC-02-WG', name: 'Chop Cutter – Model 2 (With Gear)', category: 'Cutters', shortDescription: 'Model 2 with gear mechanism', priceRange: '₹12,000 - ₹16,000', active: true },
    { id: 'p18', sku: 'CC-EL-05B', name: 'Chop Cutter – Elite Model (5 Blade)', category: 'Cutters', shortDescription: 'Elite model with 5 blade system', priceRange: '₹15,000 - ₹20,000', active: true },
    { id: 'p19', sku: 'CC-PR', name: 'Chop Cutter – Premium Model', category: 'Cutters', shortDescription: 'Premium chop cutter model', priceRange: '₹18,000 - ₹24,000', active: true },

    // CATEGORY 4: DAIRY / MILKING MACHINES
    { id: 'p20', sku: 'MM-NANO', name: 'Milking Machine – Nano Model', category: 'Dairy Equipment', shortDescription: 'Compact Nano milking machine', priceRange: '₹22,000 - ₹28,000', active: true },
    { id: 'p21', sku: 'MM-SNANO', name: 'Milking Machine – Super Nano Model', category: 'Dairy Equipment', shortDescription: 'Enhanced Super Nano model', priceRange: '₹28,000 - ₹35,000', active: true },
    { id: 'p22', sku: 'MM-SB', name: 'Milking Machine – Single Bucket Model', category: 'Dairy Equipment', shortDescription: 'Compressor-based single bucket', priceRange: '₹30,000 - ₹38,000', active: true },
    { id: 'p23', sku: 'MM-DM', name: 'Milking Machine – Diamond Model', category: 'Dairy Equipment', shortDescription: 'Premium Diamond model', priceRange: '₹35,000 - ₹45,000', active: true },
];

import * as XLSX from 'xlsx';
import type { Product } from '../types';

export interface ProductValidationError {
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface BulkUploadResult {
    success: boolean;
    productsToCreate: Product[];
    productsToUpdate: Product[];
    errors: ProductValidationError[];
    warnings: ProductValidationError[];
    skippedRows: number;
}

// Column name mappings for flexible matching (case-insensitive)
const COLUMN_MAPPINGS: Record<string, string[]> = {
    'ID': ['id', 'product id', 'productid', 'product_id'],
    'SKU': ['sku', 'product code', 'code', 'item code'],
    'Name': ['name', 'product name', 'productname', 'title', 'product'],
    'Category': ['category', 'type', 'product type', 'group'],
    'Short Description': ['short description', 'description', 'desc', 'shortdesc', 'short_description'],
    'Price Range': ['price range', 'price', 'pricerange', 'price_range', 'cost'],
    'Demo URL': ['demo url', 'demourl', 'demo_url', 'url', 'video', 'demo'],
    'Active': ['active', 'status', 'enabled', 'is active', 'isactive']
};

/**
 * Generate and download Excel template with current products
 */
export const downloadProductTemplate = (products: Product[]) => {
    const excelData = products.map(p => ({
        'ID': p.id,
        'SKU': p.sku,
        'Name': p.name,
        'Category': p.category,
        'Short Description': p.shortDescription,
        'Price Range': p.priceRange,
        'Demo URL': p.demoUrl || '',
        'Active': p.active ? 'TRUE' : 'FALSE'
    }));

    // Add 3 blank rows for easy addition
    for (let i = 0; i < 3; i++) {
        excelData.push({
            'ID': '', 'SKU': '', 'Name': '', 'Category': '',
            'Short Description': '', 'Price Range': '', 'Demo URL': '', 'Active': 'TRUE'
        });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
        { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
};

/**
 * Normalize column names for flexible matching
 */
const normalizeColumnNames = (row: any): any => {
    const normalized: any = {};

    Object.keys(row).forEach(key => {
        const lowerKey = key.trim().toLowerCase();
        let standardKey = key.trim();

        for (const [standard, variants] of Object.entries(COLUMN_MAPPINGS)) {
            if (variants.includes(lowerKey) || standard.toLowerCase() === lowerKey) {
                standardKey = standard;
                break;
            }
        }
        normalized[standardKey] = row[key];
    });

    return normalized;
};

/**
 * Parse uploaded Excel file with fault tolerance
 */
export const parseProductExcel = async (file: File): Promise<BulkUploadResult> => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) throw new Error('No data in file');

                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                if (!workbook.SheetNames?.length) throw new Error('No sheets found');

                const ws = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

                if (!jsonData?.length) {
                    return resolve({
                        success: false,
                        productsToCreate: [],
                        productsToUpdate: [],
                        errors: [{ row: 0, field: 'file', message: 'Excel file is empty', severity: 'error' }],
                        warnings: [],
                        skippedRows: 0
                    });
                }

                resolve(validateAndParseProducts(jsonData));
            } catch (error) {
                resolve({
                    success: false,
                    productsToCreate: [],
                    productsToUpdate: [],
                    errors: [{
                        row: 0,
                        field: 'file',
                        message: `Parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        severity: 'error'
                    }],
                    warnings: [],
                    skippedRows: 0
                });
            }
        };

        reader.onerror = () => resolve({
            success: false,
            productsToCreate: [],
            productsToUpdate: [],
            errors: [{ row: 0, field: 'file', message: 'Failed to read file', severity: 'error' }],
            warnings: [],
            skippedRows: 0
        });

        reader.readAsBinaryString(file);
    });
};

/**
 * Validate and parse products with maximum fault tolerance
 */
const validateAndParseProducts = (data: any[]): BulkUploadResult => {
    const errors: ProductValidationError[] = [];
    const warnings: ProductValidationError[] = [];
    const productsToCreate: Product[] = [];
    const productsToUpdate: Product[] = [];
    let skippedRows = 0;

    data.forEach((rawRow, index) => {
        const rowNumber = index + 2;
        const row = normalizeColumnNames(rawRow);

        if (isEmptyRow(row)) {
            skippedRows++;
            return;
        }

        const rowErrors = validateProductRow(row, rowNumber);

        // Only skip if there are CRITICAL errors
        if (rowErrors.some(e => e.severity === 'error')) {
            errors.push(...rowErrors);
            skippedRows++;
            return;
        }

        warnings.push(...rowErrors.filter(e => e.severity === 'warning'));

        try {
            const product = parseProductFromRow(row, index);
            const hasId = row['ID']?.toString().trim();

            if (hasId) {
                productsToUpdate.push(product);
            } else {
                productsToCreate.push(product);
            }
        } catch (error) {
            errors.push({
                row: rowNumber,
                field: 'general',
                message: `Parse error: ${error instanceof Error ? error.message : 'Unknown'}`,
                severity: 'error'
            });
            skippedRows++;
        }
    });

    return {
        success: errors.length === 0,
        productsToCreate,
        productsToUpdate,
        errors,
        warnings,
        skippedRows
    };
};

/**
 * Parse product with safe defaults
 */
const parseProductFromRow = (row: any, index: number): Product => {
    const id = row['ID']?.toString().trim() || `p${Date.now()}_${index}`;

    // Auto-generate SKU if missing
    let sku = row['SKU']?.toString().trim();
    if (!sku) {
        const name = row['Name']?.toString().trim() || '';
        sku = name.substring(0, 20).toUpperCase().replace(/[^A-Z0-9]/g, '-') || `SKU-${Date.now()}`;
    }

    return {
        id,
        sku,
        name: sanitize(row['Name']),
        category: sanitize(row['Category']),
        shortDescription: sanitize(row['Short Description']),
        priceRange: sanitize(row['Price Range']),
        demoUrl: sanitize(row['Demo URL']) || undefined,
        active: parseBoolean(row['Active'])
    };
};

const sanitize = (value: any): string => {
    if (!value) return '';
    return value.toString().trim().replace(/\s+/g, ' ');
};

const isEmptyRow = (row: any): boolean => {
    return Object.values(row).every(val => !val || val.toString().trim() === '');
};

/**
 * Validate with warnings instead of hard failures where possible
 */
const validateProductRow = (row: any, rowNumber: number): ProductValidationError[] => {
    const errors: ProductValidationError[] = [];

    const name = row['Name']?.toString().trim();
    if (!name) {
        errors.push({ row: rowNumber, field: 'Name', message: 'Name is required', severity: 'error' });
    }

    const sku = row['SKU']?.toString().trim();
    if (!sku) {
        errors.push({ row: rowNumber, field: 'SKU', message: 'SKU missing, will auto-generate', severity: 'warning' });
    }

    const category = row['Category']?.toString().trim();
    if (!category) {
        errors.push({ row: rowNumber, field: 'Category', message: 'Category is required', severity: 'error' });
    }

    const desc = row['Short Description']?.toString().trim();
    if (!desc) {
        errors.push({ row: rowNumber, field: 'Short Description', message: 'Description is required', severity: 'error' });
    }

    const price = row['Price Range']?.toString().trim();
    if (!price) {
        errors.push({ row: rowNumber, field: 'Price Range', message: 'Price Range is required', severity: 'error' });
    }

    const activeValue = row['Active']?.toString().trim().toUpperCase();
    const validActive = ['TRUE', 'FALSE', 'YES', 'NO', '1', '0', 'ACTIVE', 'INACTIVE', '', 'ENABLED', 'DISABLED'];
    if (activeValue && !validActive.includes(activeValue)) {
        errors.push({
            row: rowNumber,
            field: 'Active',
            message: `"${activeValue}" not recognized, defaulting to TRUE`,
            severity: 'warning'
        });
    }

    return errors;
};

/**
 * Parse boolean with maximum flexibility
 */
const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (!value) return true; // Default to active

    const str = value.toString().trim().toUpperCase();
    return !['FALSE', 'NO', '0', 'INACTIVE', 'DISABLED', 'N'].includes(str);
};

/**
 * Generate a comprehensive business report for the Owner
 */
export const downloadBusinessReport = (enquiries: any[], products: Product[], branches: any[]) => {
    const wb = XLSX.utils.book_new();

    // 1. Enquiry History Sheet
    const enquiryData = enquiries.map(e => {
        const product = products.find(p => p.id === e.productId);
        const branch = branches.find(b => b.id === e.branchId);
        return {
            'Date': new Date(e.createdAt).toLocaleDateString(),
            'Customer Name': e.customerName,
            'Phone Number': e.phoneNumber,
            'Product': product?.name || 'Unknown',
            'Category': product?.category || 'Unknown',
            'Branch': branch?.name || 'Unknown',
            'Status': e.pipelineStage,
            'Telecaller ID': e.telecallerId,
            'Next Action': e.tracking?.status || 'N/A',
            'Estimated Value': product?.priceRange || 'N/A'
        };
    });
    const wsEnquiries = XLSX.utils.json_to_sheet(enquiryData);
    XLSX.utils.book_append_sheet(wb, wsEnquiries, 'Enquiry History');

    // 2. Product Sales Summary
    const salesMap: Record<string, { count: number, revenue: string }> = {};
    enquiries.filter(e => e.pipelineStage === 'Delivered').forEach(e => {
        const p = products.find(prod => prod.id === e.productId);
        if (p) {
            if (!salesMap[p.name]) salesMap[p.name] = { count: 0, revenue: p.priceRange };
            salesMap[p.name].count++;
        }
    });
    const productSalesData = Object.entries(salesMap).map(([name, data]) => ({
        'Product Name': name,
        'Quantity Sold': data.count,
        'Price Point': data.revenue
    }));
    const wsProducts = XLSX.utils.json_to_sheet(productSalesData);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Product Performance');

    // 3. Branch Performance
    const branchMap: Record<string, { leads: number, conversions: number }> = {};
    enquiries.forEach(e => {
        const b = branches.find(branch => branch.id === e.branchId);
        const bName = b?.name || 'Unknown';
        if (!branchMap[bName]) branchMap[bName] = { leads: 0, conversions: 0 };
        branchMap[bName].leads++;
        if (e.pipelineStage === 'Delivered') branchMap[bName].conversions++;
    });
    const branchPerformanceData = Object.entries(branchMap).map(([name, data]) => ({
        'Branch Name': name,
        'Total Leads': data.leads,
        'Successful Sales': data.conversions,
        'Conversion %': `${Math.round((data.conversions / data.leads) * 100)}%`
    }));
    const wsBranches = XLSX.utils.json_to_sheet(branchPerformanceData);
    XLSX.utils.book_append_sheet(wb, wsBranches, 'Branch Performance');

    // Finalize
    const filename = `OM_SHUBA_Business_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
};


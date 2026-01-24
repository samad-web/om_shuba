export type UserRole = 'admin' | 'branch_admin' | 'telecaller';

export interface User {
  id: string;
  username: string;
  password?: string; // For mock auth only
  role: UserRole;
  name: string;
  branchId?: string; // For branch_admin role - restricts access to specific branch
}

export interface Product {
  id: string;
  sku: string; // Stock Keeping Unit for inventory tracking
  name: string;
  category: string;
  shortDescription: string;
  priceRange: string;
  demoUrl?: string; // Optional
  active: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  contactNumber: string;
  active: boolean;
}

export type PipelineStage =
  | 'New'
  | 'Qualified'
  | 'Forwarded'
  | 'Contacted'
  | 'Demo/Visit Done'
  | 'Closed-Converted'
  | 'Closed-Not Interested';

export type PurchaseIntent = 'Ready to Buy' | 'Needs Demo' | 'General Enquiry';

export interface EnquiryHistory {
  stage: PipelineStage;
  timestamp: string; // ISO date string
  userId: string; // Who made the change
}

export interface Enquiry {
  id: string;
  customerName: string;
  phoneNumber: string;
  location: string;
  productId: string;
  branchId: string; // Originally assigned branch
  purchaseIntent: PurchaseIntent;
  pipelineStage: PipelineStage;
  createdBy: string; // User ID
  createdAt: string; // ISO date string
  history: EnquiryHistory[];
}

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
  | 'Demo Scheduled'
  | 'Visit Scheduled'
  | 'Demo/Visit Done'
  | 'Delivery Scheduled'
  | 'Delivered'
  | 'Closed-Converted'
  | 'Closed-Not Interested';

export type PurchaseIntent = 'Ready to Buy' | 'Needs Demo' | 'General Enquiry';

export interface TrackingDetails {
  type: 'Demo' | 'Visit' | 'Delivery';
  scheduledDate: string; // ISO date string
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
  assignedTo?: string; // User ID of field agent/telecaller
}

export interface EnquiryHistory {
  stage: PipelineStage;
  timestamp: string; // ISO date string
  userId: string; // Who made the change
  notes?: string;
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
  tracking?: TrackingDetails;
  createdBy: string; // User ID
  createdAt: string; // ISO date string
  closedAmount?: number; // Final sale value for converted leads
  history: EnquiryHistory[];
}

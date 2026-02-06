export type UserRole = 'admin' | 'branch_admin' | 'telecaller';

export interface User {
  id: string;
  username: string;
  password?: string; // For mock auth only
  role: UserRole;
  name: string;
  branchId?: string; // For branch_admin role - restricts access to specific branch
  phone?: string; // Phone number for Exotel calls
  passwordLastChanged?: string; // ISO date string for session invalidation
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
  branchId?: string; // For branch-specific products
  // Localization
  nameTa?: string;
  categoryTa?: string;
  shortDescriptionTa?: string;
  imageUrl?: string;
  specifications?: Record<string, string>;
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
  | 'Closed-Not Interested'
  | 'Resolved';

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
  // Phase 2 additions
  callId?: string;
  recordingUrl?: string;
  callType?: 'Sales' | 'Service';
  warrantyCheck?: boolean;
  complaintNotes?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  offerId?: string; // Linked offer
  // Call statistics
  totalCalls?: number;
  lastCallDate?: string;
  lastCallDuration?: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  validUntil?: string; // ISO date string
  active: boolean;
  createdAt: string; // ISO date string
}

export interface Message {
  id: string;
  senderRole: 'admin' | 'branch_admin';
  senderBranchId?: string; // Added for History tracking
  targetBranchId: string; // 'all' or specific branch ID
  content: string;
  createdAt: string;
  isRead: boolean;
  senderName?: string; // Optional for UI display
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountAmount?: number | null;
  discountPercentage?: number | null;
  validFrom: string;
  validTo?: string | null;
  productId?: string | null;
  active: boolean;
  createdAt: string;
}

export interface WhatsAppContent {
  id: string;
  title: string;
  content: string; // Text content
  mediaUrl?: string; // Image or Video URL
  mediaType?: 'image' | 'video';
  scheduledAt?: string; // ISO date string
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  createdBy: string;
}

export type CallStatus = 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'missed' | 'busy' | 'failed' | 'no-answer';
export type CallDirection = 'outbound' | 'inbound';

export interface CallLog {
  id: string;
  exotelCallSid: string;
  enquiryId?: string;
  branchId: string;
  callerId: string;
  customerPhone: string;
  telecallerPhone: string;
  direction: CallDirection;
  status: CallStatus;
  duration: number; // in seconds
  recordingUrl?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppQueueItem {
  id: string;
  enquiryId?: string;
  phoneNumber: string;
  messageText: string;
  mediaUrl?: string;
  status: 'draft' | 'queued' | 'sent' | 'failed';
  scheduledAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

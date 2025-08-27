import { Models } from "node-appwrite";

// Invoice status types
export type InvoiceStatus = 
  | "draft" 
  | "sent" 
  | "paid" 
  | "overdue" 
  | "cancelled"
  | "partial";

// Invoice type categories
export type InvoiceType = 
  | "travel" 
  | "package" 
  | "trip" 
  | "service"
  | "custom";

// Currency types
export type Currency = 
  | "USD" 
  | "EUR" 
  | "GBP" 
  | "INR" 
  | "AUD" 
  | "CAD" 
  | "JPY"
  | "CNY"
  | "AED";

// Payment method types
export type PaymentMethod = 
  | "credit_card"
  | "debit_card" 
  | "bank_transfer"
  | "paypal"
  | "cash"
  | "check"
  | "cryptocurrency"
  | "other";

// Invoice line item interface
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  taxable?: boolean;
  notes?: string;
}

// Company information interface
export interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Customer information interface (for invoice)
export interface InvoiceCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  customerId?: string; // Link to customer collection
}

// Travel information interface
export interface InvoiceTravelInfo {
  travelDate?: string;
  returnDate?: string;
  destination?: string;
  numberOfTravelers?: number;
}

// Payment information interface
export interface InvoicePaymentInfo {
  method?: PaymentMethod;
  reference?: string;
  paidAmount?: number;
  balanceDue?: number;
  instructions?: string;
}

// Invoice financial summary interface
export interface InvoiceFinancials {
  subtotal: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  totalAmount: number;
  currency?: Currency;
}

// Communication tracking interface
export interface InvoiceCommunication {
  sentDate?: string;
  reminderCount?: number;
  lastReminderDate?: string;
}

// Main invoice interface
export interface Invoice extends Models.Document {
  // Basic information
  invoiceNumber: string;
  status: InvoiceStatus;
  type: InvoiceType;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCountry?: string;
  customerId?: string;
  
  // Booking reference
  bookingReference?: string;
  bookingId?: string;
  
  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  
  // Financial information
  subtotal: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  totalAmount: number;
  currency?: Currency;
  
  // Line items (stored as JSON string in database)
  lineItems: string;
  
  // Travel-specific information
  travelDate?: string;
  returnDate?: string;
  destination?: string;
  numberOfTravelers?: number;
  
  // Notes and terms
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  
  // Payment tracking
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAmount?: number;
  balancedue?: number;
  
  // Company information
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLogo?: string;
  
  // Metadata
  createdBy?: string;
  lastModifiedBy?: string;
  isTemplate?: boolean;
  templateName?: string;
  
  // Communication tracking
  sentDate?: string;
  reminderCount?: number;
  lastReminderDate?: string;
}

// Invoice creation data interface (for API requests)
export interface CreateInvoiceData {
  // Basic information
  invoiceNumber?: string; // Auto-generated if not provided
  status?: InvoiceStatus;
  type: InvoiceType;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCountry?: string;
  customerId?: string;
  
  // Booking reference
  bookingReference?: string;
  bookingId?: string;
  
  // Dates
  issueDate: string;
  dueDate: string;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Financial information (calculated if not provided)
  subtotal?: number;
  taxRate?: number;
  discountAmount?: number;
  currency?: Currency;
  
  // Travel-specific information
  travelDate?: string;
  returnDate?: string;
  destination?: string;
  numberOfTravelers?: number;
  
  // Notes and terms
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  
  // Company information (optional override)
  companyInfo?: Partial<CompanyInfo>;
  
  // Template information
  isTemplate?: boolean;
  templateName?: string;
}

// Invoice update data interface
export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCountry?: string;
  
  // Dates
  dueDate?: string;
  paidDate?: string;
  
  // Line items
  lineItems?: InvoiceLineItem[];
  
  // Financial information
  taxRate?: number;
  discountAmount?: number;
  
  // Travel information
  travelDate?: string;
  returnDate?: string;
  destination?: string;
  numberOfTravelers?: number;
  
  // Notes and terms
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  
  // Payment information
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAmount?: number;
  
  // Communication
  sentDate?: string;
  reminderCount?: number;
  lastReminderDate?: string;
}

// Invoice query filters interface
export interface InvoiceFilters {
  status?: InvoiceStatus[];
  type?: InvoiceType[];
  customerEmail?: string;
  customerId?: string;
  bookingReference?: string;
  bookingId?: string;
  currency?: Currency;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  destination?: string;
  isTemplate?: boolean;
  createdBy?: string;
}

// Invoice list response interface
export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Invoice statistics interface
export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  averageAmount: number;
  currency: Currency;
}

// Invoice template interface
export interface InvoiceTemplate {
  $id: string;
  templateName: string;
  type: InvoiceType;
  lineItems: InvoiceLineItem[];
  terms?: string;
  paymentInstructions?: string;
  taxRate?: number;
  currency?: Currency;
  companyInfo?: CompanyInfo;
  notes?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Invoice generation from booking interface
export interface GenerateInvoiceFromBooking {
  bookingId: string;
  bookingReference: string;
  dueDate: string;
  additionalLineItems?: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  taxRate?: number;
  discountAmount?: number;
}

// Invoice PDF generation options
export interface InvoicePDFOptions {
  includeCompanyLogo?: boolean;
  includeCustomerAddress?: boolean;
  includePaymentInstructions?: boolean;
  includeTermsAndConditions?: boolean;
  includeNotes?: boolean;
  theme?: "default" | "modern" | "classic";
  language?: "en" | "es" | "fr" | "de";
}

// Invoice email options
export interface InvoiceEmailOptions {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
  message?: string;
  includePDF?: boolean;
  pdfOptions?: InvoicePDFOptions;
}

// Invoice payment record interface
export interface InvoicePaymentRecord {
  $id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  processedBy?: string;
  $createdAt: string;
}

// Utility types
export type InvoiceStatusColor = {
  [K in InvoiceStatus]: string;
};

export type InvoiceTypeIcon = {
  [K in InvoiceType]: string;
};

// Form validation types
export type InvoiceFormErrors = {
  [K in keyof CreateInvoiceData]?: string;
};

export type InvoiceLineItemErrors = {
  [K in keyof InvoiceLineItem]?: string;
};

// Search and sorting types
export type InvoiceSortField = 
  | "invoiceNumber"
  | "customerName" 
  | "totalAmount"
  | "issueDate"
  | "dueDate"
  | "status"
  | "$createdAt";

export type InvoiceSortOrder = "asc" | "desc";

export interface InvoiceSortOptions {
  field: InvoiceSortField;
  order: InvoiceSortOrder;
}

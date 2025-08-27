import { 
  Invoice, 
  InvoiceLineItem, 
  InvoiceStatus, 
  InvoiceType,
  Currency,
  PaymentMethod,
  InvoiceStatusColor,
  InvoiceTypeIcon,
  CreateInvoiceData
} from "@/types/invoice.types";

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const prefix = "INV";
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${prefix}-${year}${month}-${timestamp}${random}`;
}

/**
 * Calculate invoice financials from line items
 */
export function calculateInvoiceFinancials(
  lineItems: InvoiceLineItem[],
  taxRate: number = 0,
  discountAmount: number = 0
) {
  // Calculate subtotal
  const subtotal = lineItems.reduce((total, item) => {
    return total + (item.quantity * item.unitPrice);
  }, 0);
  
  // Calculate tax amount (only on taxable items)
  const taxableAmount = lineItems.reduce((total, item) => {
    if (item.taxable !== false) { // Default to taxable unless explicitly false
      return total + (item.quantity * item.unitPrice);
    }
    return total;
  }, 0);
  
  const taxAmount = (taxableAmount * taxRate) / 100;
  
  // Calculate total
  const totalAmount = subtotal + taxAmount - discountAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    taxRate,
    discountAmount,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Validate invoice line items
 */
export function validateLineItems(lineItems: InvoiceLineItem[]): string[] {
  const errors: string[] = [];
  
  if (!lineItems || lineItems.length === 0) {
    errors.push("At least one line item is required");
    return errors;
  }
  
  lineItems.forEach((item, index) => {
    if (!item.description?.trim()) {
      errors.push(`Line item ${index + 1}: Description is required`);
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
    }
    
    if (!item.unitPrice || item.unitPrice < 0) {
      errors.push(`Line item ${index + 1}: Unit price must be 0 or greater`);
    }
    
    // Validate that totalPrice matches calculation
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.totalPrice - expectedTotal) > 0.01) {
      errors.push(`Line item ${index + 1}: Total price doesn't match quantity × unit price`);
    }
  });
  
  return errors;
}

/**
 * Validate invoice creation data
 */
export function validateInvoiceData(data: CreateInvoiceData): string[] {
  const errors: string[] = [];
  
  // Basic validation
  if (!data.type) {
    errors.push("Invoice type is required");
  }
  
  if (!data.customerName?.trim()) {
    errors.push("Customer name is required");
  }
  
  if (!data.customerEmail?.trim()) {
    errors.push("Customer email is required");
  } else if (!isValidEmail(data.customerEmail)) {
    errors.push("Invalid customer email format");
  }
  
  if (!data.issueDate) {
    errors.push("Issue date is required");
  }
  
  if (!data.dueDate) {
    errors.push("Due date is required");
  }
  
  // Validate date order
  if (data.issueDate && data.dueDate) {
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);
    
    if (dueDate <= issueDate) {
      errors.push("Due date must be after issue date");
    }
  }
  
  // Validate line items
  const lineItemErrors = validateLineItems(data.lineItems);
  errors.push(...lineItemErrors);
  
  // Validate financial amounts
  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.push("Tax rate must be between 0 and 100");
  }
  
  if (data.discountAmount !== undefined && data.discountAmount < 0) {
    errors.push("Discount amount cannot be negative");
  }
  
  return errors;
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number, 
  currency: Currency = "USD",
  showSymbol: boolean = true
): string {
  const currencySymbols: Record<Currency, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
    CNY: "¥",
    AED: "د.إ"
  };
  
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  if (showSymbol && currencySymbols[currency]) {
    return `${currencySymbols[currency]}${formattedAmount}`;
  }
  
  return `${formattedAmount} ${currency}`;
}

/**
 * Format date for display
 */
export function formatInvoiceDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  const statusColors: InvoiceStatusColor = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800", 
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-yellow-100 text-yellow-800",
    partial: "bg-orange-100 text-orange-800"
  };
  
  return statusColors[status] || statusColors.draft;
}

/**
 * Get invoice type icon
 */
export function getInvoiceTypeIcon(type: InvoiceType): string {
  const typeIcons: InvoiceTypeIcon = {
    travel: "✈️",
    package: "📦",
    trip: "🗺️", 
    service: "🛠️",
    custom: "📄"
  };
  
  return typeIcons[type] || typeIcons.custom;
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return false;
  }
  
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day
  
  return dueDate < today;
}

/**
 * Calculate days until due or overdue
 */
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: PaymentMethod): string {
  const methodNames: Record<PaymentMethod, string> = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    bank_transfer: "Bank Transfer",
    paypal: "PayPal",
    cash: "Cash",
    check: "Check",
    cryptocurrency: "Cryptocurrency",
    other: "Other"
  };
  
  return methodNames[method] || method;
}

/**
 * Generate invoice line item ID
 */
export function generateLineItemId(): string {
  return `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default line item
 */
export function createDefaultLineItem(): InvoiceLineItem {
  return {
    id: generateLineItemId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    taxable: true
  };
}

/**
 * Calculate line item total
 */
export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Parse line items from JSON string
 */
export function parseLineItems(lineItemsJson: string): InvoiceLineItem[] {
  try {
    const items = JSON.parse(lineItemsJson);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * Stringify line items to JSON
 */
export function stringifyLineItems(lineItems: InvoiceLineItem[]): string {
  return JSON.stringify(lineItems);
}

/**
 * Get default company information
 */
export function getDefaultCompanyInfo() {
  return {
    name: "Brothers Holidays",
    logo: "/travelLogo.svg",
    address: "",
    phone: "",
    email: "",
    website: ""
  };
}

/**
 * Get default payment terms
 */
export function getDefaultPaymentTerms(): string {
  return `Payment Terms:
• Payment is due within 30 days of invoice date
• Late payments may incur additional charges
• All disputes must be reported within 10 days
• Refunds subject to our cancellation policy

Thank you for choosing Brothers Holidays for your travel needs!`;
}

/**
 * Get default payment instructions
 */
export function getDefaultPaymentInstructions(): string {
  return `Payment Instructions:
• Bank Transfer: Contact us for banking details
• Credit Card: Call us to process payment securely
• Online Payment: Use the payment link provided
• For questions, contact our billing department

We appreciate your prompt payment!`;
}

/**
 * Generate PDF filename for invoice
 */
export function generateInvoicePDFFilename(invoice: Invoice): string {
  const customerName = invoice.customerName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  return `invoice_${invoice.invoiceNumber}_${customerName}.pdf`;
}

/**
 * Calculate invoice age in days
 */
export function getInvoiceAge(issueDate: string): number {
  const issued = new Date(issueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  issued.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - issued.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if invoice can be edited
 */
export function canEditInvoice(invoice: Invoice): boolean {
  return invoice.status === "draft" || invoice.status === "sent";
}

/**
 * Check if invoice can be cancelled
 */
export function canCancelInvoice(invoice: Invoice): boolean {
  return invoice.status !== "paid" && invoice.status !== "cancelled";
}

/**
 * Get next reminder date
 */
export function getNextReminderDate(dueDate: string, reminderCount: number): string {
  const due = new Date(dueDate);
  const reminderDate = new Date(due);
  
  // Reminder schedule: 3 days before, on due date, 7 days after, 14 days after, 30 days after
  const reminderOffsets = [-3, 0, 7, 14, 30];
  
  if (reminderCount < reminderOffsets.length) {
    reminderDate.setDate(due.getDate() + reminderOffsets[reminderCount]);
  } else {
    // Monthly reminders after that
    reminderDate.setDate(due.getDate() + (reminderCount - 2) * 30);
  }
  
  return reminderDate.toISOString().split('T')[0];
}

/**
 * Mask sensitive payment information
 */
export function maskPaymentReference(reference: string): string {
  if (!reference || reference.length <= 4) {
    return reference;
  }
  
  const visible = reference.slice(-4);
  const masked = '*'.repeat(Math.max(0, reference.length - 4));
  
  return `${masked}${visible}`;
}

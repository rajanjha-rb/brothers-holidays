// Booking System Types

export interface Booking {
  $id: string;
  bookingReference: string;
  status: BookingStatus;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;
  customerAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Booking details
  bookingType: 'package' | 'trip';
  itemId: string;
  itemName: string;
  numberOfTravelers: number;
  numberOfAdults: number;
  numberOfChildren?: number;
  preferredStartDate: string;
  preferredEndDate?: string;
  travelDuration?: string;
  
  // Special requirements and preferences
  dietaryRequirements?: string;
  specialRequests?: string;
  accommodationPreference?: string;
  budgetRange?: string;
  needsInsurance?: boolean;
  needsVisa?: boolean;
  needsFlights?: boolean;
  
  // Traveler details
  travelerDetails?: TravelerDetail[];
  
  // Payment information
  totalAmount?: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Additional information
  sourceOfInquiry?: string;
  notes?: string;
  assignedAgent?: string;
  confirmationSentAt?: string;
  lastContactDate?: string;
  
  // Booking lifecycle
  bookingConfirmedAt?: string;
  travelCompletedAt?: string;
  isActive?: boolean;
  
  // Priority and urgency
  priority?: Priority;
  requiresImmediateAttention?: boolean;
  
  // Timestamps
  $createdAt: string;
  $updatedAt: string;
}

export interface Customer {
  $id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  
  // Personal details
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Preferences
  dietaryRequirements?: string;
  accommodationPreference?: string;
  budgetRange?: string;
  travelInterests?: string[];
  preferredDestinations?: string[];
  
  // Marketing and communication
  subscribeToNewsletter?: boolean;
  allowMarketingEmails?: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp';
  languagePreference?: string;
  
  // Customer status and analytics
  totalBookings?: number;
  totalSpent?: number;
  customerStatus?: CustomerStatus;
  lastBookingDate?: string;
  lastContactDate?: string;
  sourceOfAcquisition?: string;
  
  // Additional notes and tags
  notes?: string;
  tags?: string[];
  assignedAgent?: string;
  
  // Account status
  isActive?: boolean;
  isBlacklisted?: boolean;
  blacklistReason?: string;
  
  // Timestamps
  $createdAt: string;
  $updatedAt: string;
}

export interface TravelerDetail {
  name: string;
  age?: number;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  dietaryRequirements?: string;
  specialNeeds?: string;
}

export interface BookingFormData {
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  customerAddress: string;
  
  // Emergency contact
  emergencyContact: string;
  emergencyPhone: string;
  
  // Booking details
  bookingType: 'package' | 'trip';
  itemId: string;
  itemName: string;
  numberOfTravelers: number;
  numberOfAdults: number;
  numberOfChildren: number;
  preferredStartDate: string;
  preferredEndDate: string;
  
  // Special requirements
  dietaryRequirements: string;
  specialRequests: string;
  accommodationPreference: string;
  budgetRange: string;
  needsInsurance: boolean;
  needsVisa: boolean;
  needsFlights: boolean;
  
  // Traveler details
  travelerDetails: TravelerDetail[];
  
  // Marketing preferences
  subscribeToNewsletter: boolean;
  allowMarketingEmails: boolean;
}

export interface BookingFilters {
  status?: BookingStatus[];
  bookingType?: ('package' | 'trip')[];
  dateRange?: {
    start: string;
    end: string;
  };
  paymentStatus?: PaymentStatus[];
  priority?: Priority[];
  assignedAgent?: string;
  searchQuery?: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  confirmedRevenue: number;
  averageBookingValue: number;
  bookingsByMonth: {
    month: string;
    count: number;
    revenue: number;
  }[];
  popularPackages: {
    itemId: string;
    itemName: string;
    bookingCount: number;
    revenue: number;
  }[];
  customerCountries: {
    country: string;
    count: number;
  }[];
}

// Enum Types
export type BookingStatus = 
  | 'pending'           // Initial inquiry
  | 'quote_sent'        // Quote/proposal sent
  | 'quote_approved'    // Customer approved quote
  | 'confirmed'         // Booking confirmed
  | 'payment_pending'   // Awaiting payment
  | 'payment_partial'   // Partial payment received
  | 'payment_complete'  // Full payment received
  | 'documents_sent'    // Travel documents sent
  | 'in_progress'       // Customer is traveling
  | 'completed'         // Travel completed
  | 'cancelled'         // Booking cancelled
  | 'refunded'          // Payment refunded
  | 'on_hold';          // Temporarily on hold

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'complete'
  | 'failed'
  | 'refunded';

export type Priority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type CustomerStatus = 
  | 'new'
  | 'returning'
  | 'vip'
  | 'inactive';

// API Response Types
export interface BookingResponse {
  success: boolean;
  message?: string;
  booking?: Booking;
  bookings?: Booking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  message?: string;
  customer?: Customer;
  customers?: Customer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingStatsResponse {
  success: boolean;
  message?: string;
  stats?: BookingStats;
}

// Utility Functions Type
export interface BookingUtils {
  generateBookingReference: () => string;
  calculateDuration: (startDate: string, endDate?: string) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  getStatusColor: (status: BookingStatus) => string;
  getPriorityColor: (priority: Priority) => string;
  validateBookingData: (data: BookingFormData) => { isValid: boolean; errors: string[] };
}

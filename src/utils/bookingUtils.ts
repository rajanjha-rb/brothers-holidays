import { BookingFormData, BookingStatus, Priority, BookingUtils } from "@/types/booking";

export const bookingUtils: BookingUtils = {
  generateBookingReference: (): string => {
    const prefix = "BH"; // Brothers Holidays
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
    return `${prefix}${timestamp}${random}`;
  },

  calculateDuration: (startDate: string, endDate?: string): string => {
    if (!endDate) return "TBD";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays > 1) {
      const nights = diffDays - 1;
      return `${diffDays} days ${nights} ${nights === 1 ? 'night' : 'nights'}`;
    }
    
    return `${diffDays} days`;
  },

  formatCurrency: (amount: number, currency: string = "USD"): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  },

  getStatusColor: (status: BookingStatus): string => {
    const statusColors: Record<BookingStatus, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'quote_sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'quote_approved': 'bg-purple-100 text-purple-800 border-purple-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'payment_pending': 'bg-orange-100 text-orange-800 border-orange-200',
      'payment_partial': 'bg-amber-100 text-amber-800 border-amber-200',
      'payment_complete': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'documents_sent': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'in_progress': 'bg-teal-100 text-teal-800 border-teal-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-pink-100 text-pink-800 border-pink-200',
      'on_hold': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  getPriorityColor: (priority: Priority): string => {
    const priorityColors: Record<Priority, string> = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'urgent': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  validateBookingData: (data: BookingFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Customer information validation
    if (!data.customerName?.trim()) {
      errors.push("Customer name is required");
    }
    
    if (!data.customerEmail?.trim()) {
      errors.push("Customer email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!data.customerPhone?.trim()) {
      errors.push("Customer phone number is required");
    }
    
    // Booking details validation
    if (!data.itemId?.trim()) {
      errors.push("Package or trip selection is required");
    }
    
    if (!data.itemName?.trim()) {
      errors.push("Package or trip name is required");
    }
    
    if (!data.numberOfTravelers || data.numberOfTravelers < 1) {
      errors.push("Number of travelers must be at least 1");
    }
    
    if (!data.numberOfAdults || data.numberOfAdults < 1) {
      errors.push("Number of adults must be at least 1");
    }
    
    if (data.numberOfChildren && data.numberOfChildren < 0) {
      errors.push("Number of children cannot be negative");
    }
    
    if (data.numberOfAdults + data.numberOfChildren !== data.numberOfTravelers) {
      errors.push("Total travelers must equal adults + children");
    }
    
    if (!data.preferredStartDate?.trim()) {
      errors.push("Preferred start date is required");
    } else {
      const startDate = new Date(data.preferredStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.push("Start date cannot be in the past");
      }
    }
    
    // Date validation if both dates provided
    if (data.preferredStartDate && data.preferredEndDate) {
      const startDate = new Date(data.preferredStartDate);
      const endDate = new Date(data.preferredEndDate);
      
      if (endDate <= startDate) {
        errors.push("End date must be after start date");
      }
    }
    
    // Traveler details validation
    if (data.travelerDetails && data.travelerDetails.length > 0) {
      data.travelerDetails.forEach((traveler, index) => {
        if (!traveler.name?.trim()) {
          errors.push(`Traveler ${index + 1} name is required`);
        }
        
        if (traveler.age && (traveler.age < 0 || traveler.age > 120)) {
          errors.push(`Traveler ${index + 1} age must be between 0 and 120`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Additional utility functions
export const getStatusText = (status: BookingStatus): string => {
  const statusText: Record<BookingStatus, string> = {
    'pending': 'Pending',
    'quote_sent': 'Quote Sent',
    'quote_approved': 'Quote Approved',
    'confirmed': 'Confirmed',
    'payment_pending': 'Payment Pending',
    'payment_partial': 'Partial Payment',
    'payment_complete': 'Payment Complete',
    'documents_sent': 'Documents Sent',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'on_hold': 'On Hold'
  };
  
  return statusText[status] || status;
};

export const getPriorityText = (priority: Priority): string => {
  const priorityText: Record<Priority, string> = {
    'low': 'Low',
    'medium': 'Medium', 
    'high': 'High',
    'urgent': 'Urgent'
  };
  
  return priorityText[priority] || priority;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const calculateBookingProgress = (status: BookingStatus): number => {
  const statusProgress: Record<BookingStatus, number> = {
    'pending': 10,
    'quote_sent': 20,
    'quote_approved': 30,
    'confirmed': 40,
    'payment_pending': 50,
    'payment_partial': 60,
    'payment_complete': 70,
    'documents_sent': 80,
    'in_progress': 90,
    'completed': 100,
    'cancelled': 0,
    'refunded': 0,
    'on_hold': 25
  };
  
  return statusProgress[status] || 0;
};

export const getNextStatus = (currentStatus: BookingStatus): BookingStatus[] => {
  const statusFlow: Record<BookingStatus, BookingStatus[]> = {
    'pending': ['quote_sent', 'cancelled', 'on_hold'],
    'quote_sent': ['quote_approved', 'cancelled', 'on_hold'],
    'quote_approved': ['confirmed', 'cancelled', 'on_hold'],
    'confirmed': ['payment_pending', 'cancelled'],
    'payment_pending': ['payment_partial', 'payment_complete', 'cancelled'],
    'payment_partial': ['payment_complete', 'cancelled'],
    'payment_complete': ['documents_sent', 'cancelled'],
    'documents_sent': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'cancelled'],
    'completed': [], // No further transitions
    'cancelled': ['refunded'],
    'refunded': [], // No further transitions
    'on_hold': ['pending', 'cancelled']
  };
  
  return statusFlow[currentStatus] || [];
};

export const isBookingEditable = (status: BookingStatus): boolean => {
  const nonEditableStatuses: BookingStatus[] = ['completed', 'cancelled', 'refunded'];
  return !nonEditableStatuses.includes(status);
};

export const isPaymentRequired = (status: BookingStatus): boolean => {
  const paymentStatuses: BookingStatus[] = ['payment_pending', 'payment_partial'];
  return paymentStatuses.includes(status);
};

export const canCancelBooking = (status: BookingStatus): boolean => {
  const cancellableStatuses: BookingStatus[] = [
    'pending', 'quote_sent', 'quote_approved', 'confirmed', 
    'payment_pending', 'payment_partial', 'on_hold'
  ];
  return cancellableStatuses.includes(status);
};

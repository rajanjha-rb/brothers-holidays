import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, invoiceCollection, bookingCollection, packageCollection } from "@/models/name";
import { GenerateInvoiceFromBooking, InvoiceLineItem, CreateInvoiceData } from "@/types/invoice.types";
import { 
  generateInvoiceNumber,
  calculateInvoiceFinancials,
  stringifyLineItems,
  getDefaultCompanyInfo,
  getDefaultPaymentTerms,
  getDefaultPaymentInstructions,
  generateLineItemId
} from "@/lib/utils/invoice.utils";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const data: GenerateInvoiceFromBooking = await request.json();
    
    // Validate required fields
    if (!data.bookingId || !data.bookingReference || !data.dueDate) {
      return NextResponse.json(
        { error: "Booking ID, booking reference, and due date are required" },
        { status: 400 }
      );
    }
    
    // Validate due date
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    if (dueDate <= today) {
      return NextResponse.json(
        { error: "Due date must be in the future" },
        { status: 400 }
      );
    }
    
    // Check if invoice already exists for this booking
    try {
      const existingInvoices = await databases.listDocuments(
        db,
        invoiceCollection,
        [`bookingId=${data.bookingId}`]
      );
      
      if (existingInvoices.total > 0) {
        return NextResponse.json(
          { 
            error: "Invoice already exists for this booking",
            existingInvoice: existingInvoices.documents[0]
          },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error checking existing invoices:", error);
      return NextResponse.json(
        { error: "Failed to validate booking" },
        { status: 500 }
      );
    }
    
    // Fetch booking details
    let booking;
    try {
      booking = await databases.getDocument(
        db,
        bookingCollection,
        data.bookingId
      );
    } catch (error) {
      console.error("Error fetching booking:", error);
      
      if (error instanceof Error && error.message.includes("Document with the requested ID could not be found")) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch booking details" },
        { status: 500 }
      );
    }
    
    // Validate booking reference matches
    if (booking.bookingReference !== data.bookingReference) {
      return NextResponse.json(
        { error: "Booking reference does not match" },
        { status: 400 }
      );
    }
    
    // Fetch package details if available
    let packageDetails = null;
    if (booking.packageId) {
      try {
        packageDetails = await databases.getDocument(
          db,
          packageCollection,
          booking.packageId
        );
      } catch (error) {
        console.error("Error fetching package details:", error);
        // Continue without package details if not found
      }
    }
    
    // Generate line items from booking
    const lineItems: InvoiceLineItem[] = [];
    
    // Main travel package line item
    if (packageDetails) {
      lineItems.push({
        id: generateLineItemId(),
        description: `Travel Package: ${packageDetails.name}`,
        quantity: booking.numberOfTravelers || 1,
        unitPrice: booking.totalAmount ? booking.totalAmount / (booking.numberOfTravelers || 1) : packageDetails.price,
        totalPrice: booking.totalAmount || (packageDetails.price * (booking.numberOfTravelers || 1)),
        category: "Travel Package",
        taxable: true,
        notes: `Destination: ${packageDetails.destinations || 'N/A'}, Duration: ${packageDetails.duration || 'N/A'}`
      });
    } else {
      // Generic travel service line item
      lineItems.push({
        id: generateLineItemId(),
        description: `Travel Services - Booking ${booking.bookingReference}`,
        quantity: booking.numberOfTravelers || 1,
        unitPrice: booking.totalAmount ? booking.totalAmount / (booking.numberOfTravelers || 1) : 0,
        totalPrice: booking.totalAmount || 0,
        category: "Travel Services",
        taxable: true,
        notes: `Travel services for ${booking.numberOfTravelers || 1} traveler(s)`
      });
    }
    
    // Add additional services if any
    if (booking.specialRequests) {
      lineItems.push({
        id: generateLineItemId(),
        description: "Special Requirements & Additional Services",
        quantity: 1,
        unitPrice: 0, // This would need to be calculated based on actual additional costs
        totalPrice: 0,
        category: "Additional Services",
        taxable: true,
        notes: booking.specialRequests
      });
    }
    
    // Add any additional line items provided in the request
    if (data.additionalLineItems && data.additionalLineItems.length > 0) {
      lineItems.push(...data.additionalLineItems);
    }
    
    // Prepare invoice creation data
    const invoiceData: CreateInvoiceData = {
      // Basic information
      invoiceNumber: generateInvoiceNumber(),
      status: "draft",
      type: packageDetails ? "travel" : "service",
      
      // Customer information from booking
      customerName: booking.customerName || `${booking.firstName} ${booking.lastName}`.trim(),
      customerEmail: booking.customerEmail || booking.email,
      customerPhone: booking.customerPhone || booking.phone,
      customerAddress: booking.customerAddress,
      customerCountry: booking.customerCountry || booking.country,
      customerId: booking.customerId,
      
      // Booking reference
      bookingReference: booking.bookingReference,
      bookingId: booking.$id,
      
      // Dates
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      
      // Line items
      lineItems,
      
      // Financial information
      taxRate: data.taxRate || 0,
      discountAmount: data.discountAmount || 0,
      currency: booking.currency || "USD",
      
      // Travel-specific information
      travelDate: booking.travelDate,
      returnDate: booking.returnDate,
      destination: packageDetails?.destinations || booking.destination,
      numberOfTravelers: booking.numberOfTravelers,
      
      // Notes and terms
      notes: data.notes || `Invoice generated for booking ${booking.bookingReference}. ${booking.notes || ''}`.trim(),
      terms: data.terms || getDefaultPaymentTerms(),
      paymentInstructions: data.paymentInstructions || getDefaultPaymentInstructions(),
      
      // Company information
      companyInfo: getDefaultCompanyInfo()
    };
    
    // Validate invoice data
    if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate line items from booking" },
        { status: 400 }
      );
    }
    
    // Calculate financials
    const financials = calculateInvoiceFinancials(
      invoiceData.lineItems,
      invoiceData.taxRate || 0,
      invoiceData.discountAmount || 0
    );
    
    // Get default company info
    const defaultCompany = getDefaultCompanyInfo();
    const companyInfo = {
      ...defaultCompany,
      ...invoiceData.companyInfo
    };
    
    // Prepare invoice document
    const invoiceDoc = {
      // Basic information
      invoiceNumber: invoiceData.invoiceNumber,
      status: invoiceData.status || "draft",
      type: invoiceData.type,
      
      // Customer information
      customerName: invoiceData.customerName.trim(),
      customerEmail: invoiceData.customerEmail.trim().toLowerCase(),
      customerPhone: invoiceData.customerPhone?.trim() || undefined,
      customerAddress: invoiceData.customerAddress?.trim() || undefined,
      customerCountry: invoiceData.customerCountry?.trim() || undefined,
      customerId: invoiceData.customerId?.trim() || undefined,
      
      // Booking reference
      bookingReference: invoiceData.bookingReference,
      bookingId: invoiceData.bookingId,
      
      // Dates
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      
      // Financial information
      subtotal: financials.subtotal,
      taxAmount: financials.taxAmount,
      taxRate: financials.taxRate,
      discountAmount: financials.discountAmount,
      totalAmount: financials.totalAmount,
      currency: invoiceData.currency || "USD",
      
      // Line items (stored as JSON string)
      lineItems: stringifyLineItems(invoiceData.lineItems),
      
      // Travel-specific information
      travelDate: invoiceData.travelDate || undefined,
      returnDate: invoiceData.returnDate || undefined,
      destination: invoiceData.destination?.trim() || undefined,
      numberOfTravelers: invoiceData.numberOfTravelers || 1,
      
      // Notes and terms
      notes: invoiceData.notes?.trim() || undefined,
      terms: invoiceData.terms?.trim() || undefined,
      paymentInstructions: invoiceData.paymentInstructions?.trim() || undefined,
      
      // Payment tracking (initial values)
      paidAmount: 0,
      balancedue: financials.totalAmount,
      
      // Company information
      companyName: companyInfo.name,
      companyAddress: companyInfo.address || undefined,
      companyPhone: companyInfo.phone || undefined,
      companyEmail: companyInfo.email || undefined,
      companyWebsite: companyInfo.website || undefined,
      companyLogo: companyInfo.logo,
      
      // Metadata
      createdBy: undefined, // TODO: Add user authentication
      lastModifiedBy: undefined,
      isTemplate: false,
      
      // Communication tracking (initial values)
      reminderCount: 0,
    };
    
    // Create the invoice document
    try {
      const invoice = await databases.createDocument(
        db,
        invoiceCollection,
        ID.unique(),
        invoiceDoc
      );
      
      return NextResponse.json({
        success: true,
        message: "Invoice generated from booking successfully",
        invoice,
        booking: {
          $id: booking.$id,
          bookingReference: booking.bookingReference,
          customerName: booking.customerName || `${booking.firstName} ${booking.lastName}`.trim(),
          totalAmount: booking.totalAmount
        }
      });
      
    } catch (error) {
      console.error("Error creating invoice from booking:", error);
      
      // Handle specific Appwrite errors
      if (error instanceof Error) {
        if (error.message.includes("Invalid document structure")) {
          return NextResponse.json(
            { error: "Invalid invoice data structure" },
            { status: 400 }
          );
        }
        
        if (error.message.includes("Unique constraint violated")) {
          return NextResponse.json(
            { error: "Invoice number already exists" },
            { status: 409 }
          );
        }
      }
      
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in generate invoice from booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

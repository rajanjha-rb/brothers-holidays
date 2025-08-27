import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, invoiceCollection } from "@/models/name";
import { CreateInvoiceData } from "@/types/invoice.types";
import { 
  generateInvoiceNumber,
  calculateInvoiceFinancials,
  validateInvoiceData,
  stringifyLineItems,
  getDefaultCompanyInfo
} from "@/lib/utils/invoice.utils";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const data: CreateInvoiceData = await request.json();
    
    // Validate input data
    const validationErrors = validateInvoiceData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Generate invoice number if not provided
    const invoiceNumber = data.invoiceNumber || generateInvoiceNumber();
    
    // Check if invoice number already exists
    try {
      const existingInvoices = await databases.listDocuments(
        db,
        invoiceCollection,
        [`invoiceNumber=${invoiceNumber}`]
      );
      
      if (existingInvoices.total > 0) {
        return NextResponse.json(
          { error: "Invoice number already exists" },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error checking existing invoice:", error);
      return NextResponse.json(
        { error: "Failed to validate invoice number" },
        { status: 500 }
      );
    }
    
    // Calculate financial totals
    const financials = calculateInvoiceFinancials(
      data.lineItems,
      data.taxRate || 0,
      data.discountAmount || 0
    );
    
    // Get default company info and merge with provided info
    const defaultCompany = getDefaultCompanyInfo();
    const companyInfo = {
      ...defaultCompany,
      ...data.companyInfo
    };
    
    // Prepare invoice document
    const invoiceDoc = {
      // Basic information
      invoiceNumber,
      status: data.status || "draft",
      type: data.type,
      
      // Customer information
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone?.trim() || undefined,
      customerAddress: data.customerAddress?.trim() || undefined,
      customerCountry: data.customerCountry?.trim() || undefined,
      customerId: data.customerId?.trim() || undefined,
      
      // Booking reference
      bookingReference: data.bookingReference?.trim() || undefined,
      bookingId: data.bookingId?.trim() || undefined,
      
      // Dates
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      
      // Financial information
      subtotal: financials.subtotal,
      taxAmount: financials.taxAmount,
      taxRate: financials.taxRate,
      discountAmount: financials.discountAmount,
      totalAmount: financials.totalAmount,
      currency: data.currency || "USD",
      
      // Line items (stored as JSON string)
      lineItems: stringifyLineItems(data.lineItems),
      
      // Travel-specific information
      travelDate: data.travelDate || undefined,
      returnDate: data.returnDate || undefined,
      destination: data.destination?.trim() || undefined,
      numberOfTravelers: data.numberOfTravelers || 1,
      
      // Notes and terms
      notes: data.notes?.trim() || undefined,
      terms: data.terms?.trim() || undefined,
      paymentInstructions: data.paymentInstructions?.trim() || undefined,
      
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
      lastModifiedBy: undefined, // TODO: Add user authentication
      isTemplate: data.isTemplate || false,
      templateName: data.templateName?.trim() || undefined,
      
      // Communication tracking (initial values)
      reminderCount: 0,
    };
    
    // Create the invoice document
    const invoice = await databases.createDocument(
      db,
      invoiceCollection,
      ID.unique(),
      invoiceDoc
    );
    
    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoice
    });
    
  } catch (error) {
    console.error("Error creating invoice:", error);
    
    // Handle specific Appwrite errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid document structure")) {
        return NextResponse.json(
          { error: "Invalid invoice data structure" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("Document with the requested ID could not be found")) {
        return NextResponse.json(
          { error: "Referenced booking or customer not found" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

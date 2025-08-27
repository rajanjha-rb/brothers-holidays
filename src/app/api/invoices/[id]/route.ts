import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, invoiceCollection } from "@/models/name";
import { UpdateInvoiceData } from "@/types/invoice.types";
import { 
  calculateInvoiceFinancials,
  stringifyLineItems,
  parseLineItems,
  validateLineItems
} from "@/lib/utils/invoice.utils";

// GET individual invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }
    
    try {
      const invoice = await databases.getDocument(
        db,
        invoiceCollection,
        id
      );
      
      return NextResponse.json({
        success: true,
        invoice
      });
      
    } catch (error) {
      console.error("Error fetching invoice:", error);
      
      if (error instanceof Error && error.message.includes("Document with the requested ID could not be found")) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch invoice" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice fetch API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE invoice by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData: UpdateInvoiceData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }
    
    // Get existing invoice first
    let existingInvoice;
    try {
      existingInvoice = await databases.getDocument(
        db,
        invoiceCollection,
        id
      );
    } catch (error) {
      console.error("Error fetching existing invoice:", error);
      
      if (error instanceof Error && error.message.includes("Document with the requested ID could not be found")) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch invoice" },
        { status: 500 }
      );
    }
    
    // Check if invoice can be updated (only draft and sent invoices can be updated)
    if (existingInvoice.status === "paid") {
      return NextResponse.json(
        { error: "Cannot update paid invoice" },
        { status: 400 }
      );
    }
    
    if (existingInvoice.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot update cancelled invoice" },
        { status: 400 }
      );
    }
    
    // Prepare update document
    const updateDoc: Record<string, unknown> = {};
    
    // Update basic information
    if (updateData.status !== undefined) {
      updateDoc.status = updateData.status;
      
      // If marking as paid, set paid date and amount
      if (updateData.status === "paid" && !updateData.paidDate) {
        updateDoc.paidDate = new Date().toISOString().split('T')[0];
        updateDoc.paidAmount = existingInvoice.totalAmount;
        updateDoc.balancedue = 0;
      }
    }
    
    // Update customer information
    if (updateData.customerName !== undefined) {
      updateDoc.customerName = updateData.customerName.trim();
    }
    
    if (updateData.customerEmail !== undefined) {
      updateDoc.customerEmail = updateData.customerEmail.trim().toLowerCase();
    }
    
    if (updateData.customerPhone !== undefined) {
      updateDoc.customerPhone = updateData.customerPhone?.trim() || undefined;
    }
    
    if (updateData.customerAddress !== undefined) {
      updateDoc.customerAddress = updateData.customerAddress?.trim() || undefined;
    }
    
    if (updateData.customerCountry !== undefined) {
      updateDoc.customerCountry = updateData.customerCountry?.trim() || undefined;
    }
    
    // Update dates
    if (updateData.dueDate !== undefined) {
      updateDoc.dueDate = updateData.dueDate;
    }
    
    if (updateData.paidDate !== undefined) {
      updateDoc.paidDate = updateData.paidDate;
    }
    
    // Update line items and recalculate financials
    if (updateData.lineItems !== undefined) {
      // Validate line items
      const lineItemErrors = validateLineItems(updateData.lineItems);
      if (lineItemErrors.length > 0) {
        return NextResponse.json(
          { 
            error: "Invalid line items",
            details: lineItemErrors 
          },
          { status: 400 }
        );
      }
      
      // Calculate new financials
      const financials = calculateInvoiceFinancials(
        updateData.lineItems,
        updateData.taxRate !== undefined ? updateData.taxRate : existingInvoice.taxRate || 0,
        updateData.discountAmount !== undefined ? updateData.discountAmount : existingInvoice.discountAmount || 0
      );
      
      // Update financial fields
      updateDoc.lineItems = stringifyLineItems(updateData.lineItems);
      updateDoc.subtotal = financials.subtotal;
      updateDoc.taxAmount = financials.taxAmount;
      updateDoc.taxRate = financials.taxRate;
      updateDoc.discountAmount = financials.discountAmount;
      updateDoc.totalAmount = financials.totalAmount;
      
      // Update balance due if not paid
      if (existingInvoice.status !== "paid") {
        updateDoc.balancedue = financials.totalAmount - (existingInvoice.paidAmount || 0);
      }
    }
    
    // Update financial information separately
    if (updateData.taxRate !== undefined && updateData.lineItems === undefined) {
      // Recalculate with existing line items
      const existingLineItems = parseLineItems(existingInvoice.lineItems);
      const financials = calculateInvoiceFinancials(
        existingLineItems,
        updateData.taxRate,
        updateData.discountAmount !== undefined ? updateData.discountAmount : existingInvoice.discountAmount || 0
      );
      
      updateDoc.taxRate = financials.taxRate;
      updateDoc.taxAmount = financials.taxAmount;
      updateDoc.totalAmount = financials.totalAmount;
      
      if (existingInvoice.status !== "paid") {
        updateDoc.balancedue = financials.totalAmount - (existingInvoice.paidAmount || 0);
      }
    }
    
    if (updateData.discountAmount !== undefined && updateData.lineItems === undefined) {
      // Recalculate with existing line items
      const existingLineItems = parseLineItems(existingInvoice.lineItems);
      const financials = calculateInvoiceFinancials(
        existingLineItems,
        updateData.taxRate !== undefined ? updateData.taxRate : existingInvoice.taxRate || 0,
        updateData.discountAmount
      );
      
      updateDoc.discountAmount = financials.discountAmount;
      updateDoc.totalAmount = financials.totalAmount;
      
      if (existingInvoice.status !== "paid") {
        updateDoc.balancedue = financials.totalAmount - (existingInvoice.paidAmount || 0);
      }
    }
    
    // Update travel information
    if (updateData.travelDate !== undefined) {
      updateDoc.travelDate = updateData.travelDate || undefined;
    }
    
    if (updateData.returnDate !== undefined) {
      updateDoc.returnDate = updateData.returnDate || undefined;
    }
    
    if (updateData.destination !== undefined) {
      updateDoc.destination = updateData.destination?.trim() || undefined;
    }
    
    if (updateData.numberOfTravelers !== undefined) {
      updateDoc.numberOfTravelers = updateData.numberOfTravelers;
    }
    
    // Update notes and terms
    if (updateData.notes !== undefined) {
      updateDoc.notes = updateData.notes?.trim() || undefined;
    }
    
    if (updateData.terms !== undefined) {
      updateDoc.terms = updateData.terms?.trim() || undefined;
    }
    
    if (updateData.paymentInstructions !== undefined) {
      updateDoc.paymentInstructions = updateData.paymentInstructions?.trim() || undefined;
    }
    
    // Update payment information
    if (updateData.paymentMethod !== undefined) {
      updateDoc.paymentMethod = updateData.paymentMethod;
    }
    
    if (updateData.paymentReference !== undefined) {
      updateDoc.paymentReference = updateData.paymentReference?.trim() || undefined;
    }
    
    if (updateData.paidAmount !== undefined) {
      updateDoc.paidAmount = updateData.paidAmount;
      updateDoc.balancedue = existingInvoice.totalAmount - updateData.paidAmount;
      
      // Update status based on payment amount
      if (updateData.paidAmount >= existingInvoice.totalAmount) {
        updateDoc.status = "paid";
        updateDoc.paidDate = updateDoc.paidDate || new Date().toISOString().split('T')[0];
      } else if (updateData.paidAmount > 0) {
        updateDoc.status = "partial";
      }
    }
    
    // Update communication tracking
    if (updateData.sentDate !== undefined) {
      updateDoc.sentDate = updateData.sentDate;
      
      // If marking as sent for the first time, update status
      if (!existingInvoice.sentDate && updateData.sentDate && existingInvoice.status === "draft") {
        updateDoc.status = "sent";
      }
    }
    
    if (updateData.reminderCount !== undefined) {
      updateDoc.reminderCount = updateData.reminderCount;
    }
    
    if (updateData.lastReminderDate !== undefined) {
      updateDoc.lastReminderDate = updateData.lastReminderDate;
    }
    
    // Add metadata
    updateDoc.lastModifiedBy = undefined; // TODO: Add user authentication
    
    // Perform the update
    try {
      const updatedInvoice = await databases.updateDocument(
        db,
        invoiceCollection,
        id,
        updateDoc
      );
      
      return NextResponse.json({
        success: true,
        message: "Invoice updated successfully",
        invoice: updatedInvoice
      });
      
    } catch (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json(
        { error: "Failed to update invoice" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE invoice by ID (mark as cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }
    
    // Get existing invoice first
    let existingInvoice;
    try {
      existingInvoice = await databases.getDocument(
        db,
        invoiceCollection,
        id
      );
    } catch (error) {
      console.error("Error fetching existing invoice:", error);
      
      if (error instanceof Error && error.message.includes("Document with the requested ID could not be found")) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch invoice" },
        { status: 500 }
      );
    }
    
    // Check if invoice can be cancelled
    if (existingInvoice.status === "paid") {
      return NextResponse.json(
        { error: "Cannot cancel paid invoice" },
        { status: 400 }
      );
    }
    
    if (existingInvoice.status === "cancelled") {
      return NextResponse.json(
        { error: "Invoice is already cancelled" },
        { status: 400 }
      );
    }
    
    // Mark invoice as cancelled
    try {
      const updatedInvoice = await databases.updateDocument(
        db,
        invoiceCollection,
        id,
        { 
          status: "cancelled",
          lastModifiedBy: undefined // TODO: Add user authentication
        }
      );
      
      return NextResponse.json({
        success: true,
        message: "Invoice cancelled successfully",
        invoice: updatedInvoice
      });
      
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      return NextResponse.json(
        { error: "Failed to cancel invoice" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice cancel API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, invoiceCollection } from "@/models/name";
import { InvoiceListResponse, InvoiceSortField, InvoiceSortOrder, Invoice } from "@/types/invoice.types";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Max 100 per page
    const offset = (page - 1) * limit;
    
    // Search parameters
    const search = searchParams.get("search")?.trim();
    
    // Filter parameters
    const status = searchParams.get("status")?.split(",").filter(Boolean);
    const type = searchParams.get("type")?.split(",").filter(Boolean);
    const customerEmail = searchParams.get("customerEmail")?.trim();
    const customerId = searchParams.get("customerId")?.trim();
    const bookingReference = searchParams.get("bookingReference")?.trim();
    const bookingId = searchParams.get("bookingId")?.trim();
    const currency = searchParams.get("currency")?.trim();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();
    const dueDateFrom = searchParams.get("dueDateFrom")?.trim();
    const dueDateTo = searchParams.get("dueDateTo")?.trim();
    const amountMin = searchParams.get("amountMin") ? parseFloat(searchParams.get("amountMin")!) : undefined;
    const amountMax = searchParams.get("amountMax") ? parseFloat(searchParams.get("amountMax")!) : undefined;
    const destination = searchParams.get("destination")?.trim();
    const isTemplate = searchParams.get("isTemplate");
    const createdBy = searchParams.get("createdBy")?.trim();
    
    // Sorting parameters
    const sortField = (searchParams.get("sortField") || "$createdAt") as InvoiceSortField;
    const sortOrder = (searchParams.get("sortOrder") || "desc") as InvoiceSortOrder;
    
    // Build queries array
    const queries: string[] = [
      Query.limit(limit),
      Query.offset(offset)
    ];
    
    // Add sorting
    if (sortOrder === "desc") {
      queries.push(Query.orderDesc(sortField));
    } else {
      queries.push(Query.orderAsc(sortField));
    }
    
    // Add filters
    if (status && status.length > 0) {
      status.forEach(s => {
        queries.push(Query.equal("status", s));
      });
    }
    
    if (type && type.length > 0) {
      type.forEach(t => {
        queries.push(Query.equal("type", t));
      });
    }
    
    if (customerEmail) {
      queries.push(Query.equal("customerEmail", customerEmail));
    }
    
    if (customerId) {
      queries.push(Query.equal("customerId", customerId));
    }
    
    if (bookingReference) {
      queries.push(Query.equal("bookingReference", bookingReference));
    }
    
    if (bookingId) {
      queries.push(Query.equal("bookingId", bookingId));
    }
    
    if (currency) {
      queries.push(Query.equal("currency", currency));
    }
    
    if (destination) {
      queries.push(Query.equal("destination", destination));
    }
    
    if (createdBy) {
      queries.push(Query.equal("createdBy", createdBy));
    }
    
    // Handle boolean filter for isTemplate
    if (isTemplate !== null) {
      const templateValue = isTemplate === "true";
      queries.push(Query.equal("isTemplate", templateValue));
    }
    
    // Date range filters
    if (dateFrom) {
      queries.push(Query.greaterThanEqual("issueDate", dateFrom));
    }
    
    if (dateTo) {
      queries.push(Query.lessThanEqual("issueDate", dateTo));
    }
    
    if (dueDateFrom) {
      queries.push(Query.greaterThanEqual("dueDate", dueDateFrom));
    }
    
    if (dueDateTo) {
      queries.push(Query.lessThanEqual("dueDate", dueDateTo));
    }
    
    // Amount range filters
    if (amountMin !== undefined) {
      queries.push(Query.greaterThanEqual("totalAmount", amountMin));
    }
    
    if (amountMax !== undefined) {
      queries.push(Query.lessThanEqual("totalAmount", amountMax));
    }
    
    // Search functionality (if provided, search across multiple fields)
    if (search) {
      // For search, we'll need to make multiple queries and combine results
      // This is a limitation of Appwrite - we can't do OR queries across different fields
      // So we'll search in the most common fields and combine results
      
      const searchQueries = [
        // Search by invoice number
        [...queries.filter(q => !q.includes("limit") && !q.includes("offset")), 
         Query.search("invoiceNumber", search), Query.limit(limit), Query.offset(offset)],
        
        // Search by customer name  
        [...queries.filter(q => !q.includes("limit") && !q.includes("offset")), 
         Query.search("customerName", search), Query.limit(limit), Query.offset(offset)]
      ];
      
      try {
        // Execute search queries in parallel
        const searchResults = await Promise.all(
          searchQueries.map(query => 
            databases.listDocuments(db, invoiceCollection, query).catch(() => ({ documents: [], total: 0 }))
          )
        );
        
        // Combine and deduplicate results
        const allDocuments = searchResults.flatMap(result => result.documents);
        const uniqueDocuments = allDocuments.filter((doc, index, self) => 
          self.findIndex(d => d.$id === doc.$id) === index
        );
        
        // Sort results according to sort parameters
        uniqueDocuments.sort((a, b) => {
          let aValue = a[sortField as keyof typeof a];
          let bValue = b[sortField as keyof typeof b];
          
          // Handle date strings
          if (sortField.includes("Date") || sortField === "$createdAt") {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }
          
          if (sortOrder === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
        
        // Apply pagination to combined results
        const paginatedDocuments = uniqueDocuments.slice(0, limit);
        const totalFound = uniqueDocuments.length;
        
        const response: InvoiceListResponse = {
          invoices: paginatedDocuments as Invoice[],
          total: totalFound,
          page,
          limit,
          hasMore: totalFound > page * limit
        };
        
        return NextResponse.json(response);
        
      } catch (error) {
        console.error("Error searching invoices:", error);
        return NextResponse.json(
          { error: "Failed to search invoices" },
          { status: 500 }
        );
      }
    }
    
    // Regular query without search
    try {
      const result = await databases.listDocuments(
        db,
        invoiceCollection,
        queries
      );
      
      const response: InvoiceListResponse = {
        invoices: result.documents as Invoice[],
        total: result.total,
        page,
        limit,
        hasMore: result.total > page * limit
      };
      
      return NextResponse.json(response);
      
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET individual invoice by ID
export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();
    
    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }
    
    try {
      const invoice = await databases.getDocument(
        db,
        invoiceCollection,
        invoiceId
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

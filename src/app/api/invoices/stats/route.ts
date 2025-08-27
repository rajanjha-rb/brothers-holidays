import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, invoiceCollection } from "@/models/name";
import { InvoiceStats, Currency } from "@/types/invoice.types";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters for stats
    const currency = (searchParams.get("currency")?.trim() || "USD") as Currency;
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();
    const createdBy = searchParams.get("createdBy")?.trim();
    
    // Build base queries for filtering
    const baseQueries: string[] = [];
    
    // Filter by currency
    baseQueries.push(Query.equal("currency", currency));
    
    // Filter by date range
    if (dateFrom) {
      baseQueries.push(Query.greaterThanEqual("issueDate", dateFrom));
    }
    
    if (dateTo) {
      baseQueries.push(Query.lessThanEqual("issueDate", dateTo));
    }
    
    // Filter by creator
    if (createdBy) {
      baseQueries.push(Query.equal("createdBy", createdBy));
    }
    
    // Exclude templates from stats
    baseQueries.push(Query.equal("isTemplate", false));
    
    try {
      // Get all invoices with the filters (we need to process them to calculate stats)
      const allInvoices = await databases.listDocuments(
        db,
        invoiceCollection,
        [
          ...baseQueries,
          Query.limit(1000) // Limit to prevent timeout, adjust as needed
        ]
      );
      
      // Initialize stats
      let totalInvoices = 0;
      let totalAmount = 0;
      let paidAmount = 0;
      let overdueAmount = 0;
      let draftCount = 0;
      let sentCount = 0;
      let paidCount = 0;
      let overdueCount = 0;
      let cancelledCount = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Process each invoice
      allInvoices.documents.forEach((invoice: Record<string, unknown>) => {
        totalInvoices++;
        totalAmount += (invoice.totalAmount as number) || 0;
        
        // Count by status
        switch (invoice.status) {
          case "draft":
            draftCount++;
            break;
          case "sent":
            sentCount++;
            break;
          case "paid":
            paidCount++;
            paidAmount += (invoice.paidAmount as number) || (invoice.totalAmount as number) || 0;
            break;
          case "cancelled":
            cancelledCount++;
            break;
          case "overdue":
            overdueCount++;
            overdueAmount += (invoice.totalAmount as number) || 0;
            break;
          case "partial":
            paidAmount += (invoice.paidAmount as number) || 0;
            // Check if it's overdue
            const dueDate = new Date(invoice.dueDate as string);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < today) {
              overdueCount++;
              overdueAmount += ((invoice.totalAmount as number) || 0) - ((invoice.paidAmount as number) || 0);
            } else {
              sentCount++; // Count as sent if not overdue
            }
            break;
          default:
            // For any other status, check if overdue
            const dueDateDefault = new Date(invoice.dueDate as string);
            dueDateDefault.setHours(0, 0, 0, 0);
            if (dueDateDefault < today && invoice.status !== "paid" && invoice.status !== "cancelled") {
              overdueCount++;
              overdueAmount += (invoice.totalAmount as number) || 0;
            } else if (invoice.status !== "draft") {
              sentCount++;
            }
            break;
        }
      });
      
      // Calculate average amount
      const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
      
      // Build stats object
      const stats: InvoiceStats = {
        totalInvoices,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        overdueAmount: Math.round(overdueAmount * 100) / 100,
        draftCount,
        sentCount,
        paidCount,
        overdueCount,
        cancelledCount,
        averageAmount: Math.round(averageAmount * 100) / 100,
        currency
      };
      
      return NextResponse.json({
        success: true,
        stats
      });
      
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch invoice statistics" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST method for more complex stats queries
export async function POST(request: NextRequest) {
  try {
    const { 
      currency = "USD",
      dateFrom,
      dateTo,
      groupBy,
      includeTemplates = false,
      statusFilter,
      typeFilter,
      createdBy
    } = await request.json();
    
    // Build base queries
    const baseQueries: string[] = [];
    
    // Filter by currency
    if (currency) {
      baseQueries.push(Query.equal("currency", currency));
    }
    
    // Filter by date range
    if (dateFrom) {
      baseQueries.push(Query.greaterThanEqual("issueDate", dateFrom));
    }
    
    if (dateTo) {
      baseQueries.push(Query.lessThanEqual("issueDate", dateTo));
    }
    
    // Filter by status
    if (statusFilter && statusFilter.length > 0) {
      statusFilter.forEach((status: string) => {
        baseQueries.push(Query.equal("status", status));
      });
    }
    
    // Filter by type
    if (typeFilter && typeFilter.length > 0) {
      typeFilter.forEach((type: string) => {
        baseQueries.push(Query.equal("type", type));
      });
    }
    
    // Filter by creator
    if (createdBy) {
      baseQueries.push(Query.equal("createdBy", createdBy));
    }
    
    // Filter templates
    if (!includeTemplates) {
      baseQueries.push(Query.equal("isTemplate", false));
    }
    
    try {
      // Get all invoices with the filters
      const allInvoices = await databases.listDocuments(
        db,
        invoiceCollection,
        [
          ...baseQueries,
          Query.limit(1000), // Adjust as needed
          Query.orderDesc("$createdAt")
        ]
      );
      
      // Group statistics based on groupBy parameter
      const groupedStats: Record<string, unknown> = {};
      
      if (groupBy === "month") {
        // Group by month
        allInvoices.documents.forEach((invoice: Record<string, unknown>) => {
          const month = (invoice.issueDate as string).substring(0, 7); // YYYY-MM
          
          if (!groupedStats[month]) {
            groupedStats[month] = {
              period: month,
              totalInvoices: 0,
              totalAmount: 0,
              paidAmount: 0,
              overdueAmount: 0,
              draftCount: 0,
              sentCount: 0,
              paidCount: 0,
              overdueCount: 0,
              cancelledCount: 0
            };
          }
          
          const monthStats = groupedStats[month] as Record<string, number>;
          monthStats.totalInvoices++;
          monthStats.totalAmount += (invoice.totalAmount as number) || 0;
          
          // Update status counts
          switch (invoice.status) {
            case "draft":
              monthStats.draftCount++;
              break;
            case "sent":
              monthStats.sentCount++;
              break;
            case "paid":
              monthStats.paidCount++;
              monthStats.paidAmount += (invoice.paidAmount as number) || (invoice.totalAmount as number) || 0;
              break;
            case "cancelled":
              monthStats.cancelledCount++;
              break;
            case "overdue":
              monthStats.overdueCount++;
              monthStats.overdueAmount += (invoice.totalAmount as number) || 0;
              break;
            case "partial":
              monthStats.paidAmount += (invoice.paidAmount as number) || 0;
              monthStats.sentCount++; // Count as sent
              break;
          }
        });
        
      } else if (groupBy === "status") {
        // Group by status
        allInvoices.documents.forEach((invoice: Record<string, unknown>) => {
          const status = (invoice.status as string) || "unknown";
          
          if (!groupedStats[status]) {
            groupedStats[status] = {
              status,
              count: 0,
              totalAmount: 0,
              averageAmount: 0
            };
          }
          
          (groupedStats[status] as Record<string, number>).count++;
          (groupedStats[status] as Record<string, number>).totalAmount += (invoice.totalAmount as number) || 0;
        });
        
        // Calculate averages
        Object.keys(groupedStats).forEach(status => {
          const stats = groupedStats[status] as Record<string, number>;
          stats.averageAmount = stats.count > 0 ? stats.totalAmount / stats.count : 0;
          stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
          stats.averageAmount = Math.round(stats.averageAmount * 100) / 100;
        });
        
      } else if (groupBy === "type") {
        // Group by invoice type
        allInvoices.documents.forEach((invoice: Record<string, unknown>) => {
          const type = (invoice.type as string) || "unknown";
          
          if (!groupedStats[type]) {
            groupedStats[type] = {
              type,
              count: 0,
              totalAmount: 0,
              averageAmount: 0,
              paidCount: 0,
              paidAmount: 0
            };
          }
          
          (groupedStats[type] as Record<string, number>).count++;
          (groupedStats[type] as Record<string, number>).totalAmount += (invoice.totalAmount as number) || 0;
          
          if (invoice.status === "paid") {
            (groupedStats[type] as Record<string, number>).paidCount++;
            (groupedStats[type] as Record<string, number>).paidAmount += (invoice.paidAmount as number) || (invoice.totalAmount as number) || 0;
          }
        });
        
        // Calculate averages
        Object.keys(groupedStats).forEach(type => {
          const stats = groupedStats[type] as Record<string, number>;
          stats.averageAmount = stats.count > 0 ? stats.totalAmount / stats.count : 0;
          stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
          stats.averageAmount = Math.round(stats.averageAmount * 100) / 100;
          stats.paidAmount = Math.round(stats.paidAmount * 100) / 100;
        });
      }
      
      // Round amounts in grouped stats
      Object.keys(groupedStats).forEach(key => {
        const stats = groupedStats[key] as Record<string, number>;
        if (stats.totalAmount !== undefined) {
          stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
        }
        if (stats.paidAmount !== undefined) {
          stats.paidAmount = Math.round(stats.paidAmount * 100) / 100;
        }
        if (stats.overdueAmount !== undefined) {
          stats.overdueAmount = Math.round(stats.overdueAmount * 100) / 100;
        }
      });
      
      return NextResponse.json({
        success: true,
        groupedStats,
        groupBy: groupBy || "none",
        totalRecords: allInvoices.total,
        currency
      });
      
    } catch (error) {
      console.error("Error fetching grouped invoice stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch grouped statistics" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in invoice grouped stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, bookingCollection } from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const bookingType = url.searchParams.get('bookingType');
    const paymentStatus = url.searchParams.get('paymentStatus');
    const priority = url.searchParams.get('priority');
    const assignedAgent = url.searchParams.get('assignedAgent');
    const searchQuery = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') || '$createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build queries array
    const queries: string[] = [];
    
    // Add filters
    if (status) {
      const statusArray = status.split(',');
      if (statusArray.length === 1) {
        queries.push(Query.equal('status', statusArray[0]));
      } else {
        queries.push(Query.contains('status', statusArray));
      }
    }
    
    if (bookingType) {
      queries.push(Query.equal('bookingType', bookingType));
    }
    
    if (paymentStatus) {
      queries.push(Query.equal('paymentStatus', paymentStatus));
    }
    
    if (priority) {
      queries.push(Query.equal('priority', priority));
    }
    
    if (assignedAgent) {
      queries.push(Query.equal('assignedAgent', assignedAgent));
    }
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('preferredStartDate', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('preferredStartDate', endDate));
    }
    
    // Add search functionality
    if (searchQuery) {
      // We can search by booking reference, customer name, or customer email
      // For now, we'll use a simple approach and search customer name
      queries.push(Query.search('customerName', searchQuery));
    }
    
    // Add sorting
    if (sortOrder === 'desc') {
      queries.push(Query.orderDesc(sortBy));
    } else {
      queries.push(Query.orderAsc(sortBy));
    }
    
    // Add pagination
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    
    // Fetch bookings
    const result = await databases.listDocuments(
      db,
      bookingCollection,
      queries
    );
    
    // Calculate total pages
    const totalPages = Math.ceil(result.total / limit);
    
    // Transform booking data
    const bookings = result.documents.map(booking => ({
      ...booking,
      travelerDetails: booking.travelerDetails 
        ? JSON.parse(booking.travelerDetails) 
        : []
    }));
    
    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages
      }
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch bookings",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page = 1,
      limit = 20,
      filters = {},
      sortBy = '$createdAt',
      sortOrder = 'desc'
    } = body;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build queries array
    const queries: string[] = [];
    
    // Add filters from request body
    if (filters.status && filters.status.length > 0) {
      if (filters.status.length === 1) {
        queries.push(Query.equal('status', filters.status[0]));
      } else {
        queries.push(Query.contains('status', filters.status));
      }
    }
    
    if (filters.bookingType && filters.bookingType.length > 0) {
      if (filters.bookingType.length === 1) {
        queries.push(Query.equal('bookingType', filters.bookingType[0]));
      } else {
        queries.push(Query.contains('bookingType', filters.bookingType));
      }
    }
    
    if (filters.paymentStatus && filters.paymentStatus.length > 0) {
      if (filters.paymentStatus.length === 1) {
        queries.push(Query.equal('paymentStatus', filters.paymentStatus[0]));
      } else {
        queries.push(Query.contains('paymentStatus', filters.paymentStatus));
      }
    }
    
    if (filters.priority && filters.priority.length > 0) {
      if (filters.priority.length === 1) {
        queries.push(Query.equal('priority', filters.priority[0]));
      } else {
        queries.push(Query.contains('priority', filters.priority));
      }
    }
    
    if (filters.assignedAgent) {
      queries.push(Query.equal('assignedAgent', filters.assignedAgent));
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        queries.push(Query.greaterThanEqual('preferredStartDate', filters.dateRange.start));
      }
      if (filters.dateRange.end) {
        queries.push(Query.lessThanEqual('preferredStartDate', filters.dateRange.end));
      }
    }
    
    if (filters.searchQuery) {
      queries.push(Query.search('customerName', filters.searchQuery));
    }
    
    // Add sorting
    if (sortOrder === 'desc') {
      queries.push(Query.orderDesc(sortBy));
    } else {
      queries.push(Query.orderAsc(sortBy));
    }
    
    // Add pagination
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    
    // Fetch bookings
    const result = await databases.listDocuments(
      db,
      bookingCollection,
      queries
    );
    
    // Calculate total pages
    const totalPages = Math.ceil(result.total / limit);
    
    // Transform booking data
    const bookings = result.documents.map(booking => ({
      ...booking,
      travelerDetails: booking.travelerDetails 
        ? JSON.parse(booking.travelerDetails) 
        : []
    }));
    
    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages
      }
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch bookings",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

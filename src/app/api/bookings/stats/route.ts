import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, bookingCollection } from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build base query
    const queries: string[] = [];
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('$createdAt', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('$createdAt', endDate));
    }
    
    // Fetch all bookings for statistics (we might need to paginate this for very large datasets)
    queries.push(Query.limit(5000)); // Limit to prevent memory issues
    
    const result = await databases.listDocuments(
      db,
      bookingCollection,
      queries
    );
    
    const bookings = result.documents;
    
    // Calculate basic statistics
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => 
      ['confirmed', 'payment_pending', 'payment_partial', 'payment_complete', 'documents_sent', 'in_progress'].includes(b.status)
    ).length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Calculate revenue statistics
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount || 0);
    }, 0);
    
    const pendingRevenue = bookings
      .filter(b => ['pending', 'quote_sent', 'quote_approved'].includes(b.status))
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    const confirmedRevenue = bookings
      .filter(b => ['confirmed', 'payment_pending', 'payment_partial', 'payment_complete', 'documents_sent', 'in_progress', 'completed'].includes(b.status))
      .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Calculate bookings by month (last 12 months)
    const bookingsByMonth: { month: string; count: number; revenue: number }[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.$createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const monthRevenue = monthBookings.reduce((sum, booking) => {
        return sum + (booking.totalAmount || 0);
      }, 0);
      
      bookingsByMonth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthBookings.length,
        revenue: monthRevenue
      });
    }
    
    // Calculate popular packages/trips
    const packageStats: { [key: string]: { itemName: string; bookingCount: number; revenue: number } } = {};
    
    bookings.forEach(booking => {
      if (booking.itemId) {
        if (!packageStats[booking.itemId]) {
          packageStats[booking.itemId] = {
            itemName: booking.itemName || 'Unknown',
            bookingCount: 0,
            revenue: 0
          };
        }
        packageStats[booking.itemId].bookingCount++;
        packageStats[booking.itemId].revenue += booking.totalAmount || 0;
      }
    });
    
    const popularPackages = Object.entries(packageStats)
      .map(([itemId, stats]) => ({
        itemId,
        ...stats
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);
    
    // Calculate customer countries
    const countryStats: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      if (booking.customerCountry) {
        countryStats[booking.customerCountry] = (countryStats[booking.customerCountry] || 0) + 1;
      }
    });
    
    const customerCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Recent bookings (last 5)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
      .slice(0, 5)
      .map(booking => ({
        $id: booking.$id,
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        itemName: booking.itemName,
        status: booking.status,
        totalAmount: booking.totalAmount,
        $createdAt: booking.$createdAt
      }));
    
    // Status distribution
    const statusDistribution = {
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings
    };
    
    const stats = {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      pendingRevenue,
      confirmedRevenue,
      averageBookingValue,
      bookingsByMonth,
      popularPackages,
      customerCountries,
      recentBookings,
      statusDistribution
    };
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      groupBy = 'month', // month, week, day
      includeDetails = false 
    } = body;
    
    // Build query
    const queries: string[] = [];
    
    if (startDate) {
      queries.push(Query.greaterThanEqual('$createdAt', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('$createdAt', endDate));
    }
    
    queries.push(Query.limit(5000));
    queries.push(Query.orderDesc('$createdAt'));
    
    const result = await databases.listDocuments(
      db,
      bookingCollection,
      queries
    );
    
    const bookings = result.documents;
    
    // Group bookings by specified period
    const grouped: { [key: string]: typeof bookings } = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.$createdAt);
      let key = '';
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(booking);
    });
    
    // Calculate statistics for each group
    const groupedStats = Object.entries(grouped).map(([period, periodBookings]) => {
      const totalCount = periodBookings.length;
      const totalRevenue = periodBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const averageValue = totalCount > 0 ? totalRevenue / totalCount : 0;
      
      const statusCounts = periodBookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      return {
        period,
        totalCount,
        totalRevenue,
        averageValue,
        statusCounts,
        ...(includeDetails && { bookings: periodBookings })
      };
    });
    
    return NextResponse.json({
      success: true,
      groupedStats: groupedStats.sort((a, b) => a.period.localeCompare(b.period))
    });

  } catch (error) {
    console.error("Error fetching detailed booking statistics:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch detailed booking statistics",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

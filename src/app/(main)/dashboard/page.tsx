"use client";

import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState, useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUser, FaCog, FaSearch, FaBell, FaCalendarCheck, FaFileInvoiceDollar, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  recentBookings: Array<{
    $id: string;
    bookingReference: string;
    customerName: string;
    itemName: string;
    status: string;
    totalAmount: number;
    $createdAt: string;
  }>;
}

interface InvoiceStats {
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidCount: number;
  overdueCount: number;
}

export default function AdminDashboard() {
  const { user } = useAuthState();
  const { logout } = useAuthStore();
  const router = useRouter();
  
  // Stats state
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    recentBookings: []
  });
  
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0,
    paidCount: 0,
    overdueCount: 0
  });
  
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch booking stats
        const bookingResponse = await fetch('/api/bookings/stats');
        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          if (bookingData.success) {
            setBookingStats({
              totalBookings: bookingData.stats.totalBookings || 0,
              pendingBookings: bookingData.stats.pendingBookings || 0,
              confirmedBookings: bookingData.stats.confirmedBookings || 0,
              completedBookings: bookingData.stats.completedBookings || 0,
              totalRevenue: bookingData.stats.totalRevenue || 0,
              averageBookingValue: bookingData.stats.averageBookingValue || 0,
              recentBookings: bookingData.stats.recentBookings || []
            });
          }
        }
        
        // Fetch invoice stats
        const invoiceResponse = await fetch('/api/invoices/stats');
        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          if (invoiceData.success) {
            setInvoiceStats({
              totalAmount: invoiceData.stats.totalAmount || 0,
              paidAmount: invoiceData.stats.paidAmount || 0,
              overdueAmount: invoiceData.stats.overdueAmount || 0,
              totalInvoices: invoiceData.stats.totalInvoices || 0,
              paidCount: invoiceData.stats.paidCount || 0,
              overdueCount: invoiceData.stats.overdueCount || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      // Logout failed silently
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Topbar */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Input 
              placeholder="Search anything..." 
              className="pl-10 pr-4 h-11 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-pink-300 focus:ring-pink-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-gray-50">
              <FaBell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                    <AvatarImage src="/manager.webp" alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-pink-500 text-white font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/manager.webp" alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-pink-500 text-white text-sm">
                      {user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem className="flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <FaCog className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="hidden lg:block">
              <span className="text-sm font-medium text-gray-700">Hello, {user?.name || "Admin"}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-lg">Welcome back! Here&apos;s what&apos;s happening with your travel business today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : bookingStats.totalBookings}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Bookings</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaCalendarCheck className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {bookingStats.pendingBookings} pending • {bookingStats.confirmedBookings} confirmed
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : bookingStats.completedBookings}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Completed Trips</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaChartLine className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="mt-3 text-sm text-green-600">
                Successfully completed bookings
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : invoiceStats.totalInvoices}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Invoices</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaFileInvoiceDollar className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {invoiceStats.paidCount} paid • {invoiceStats.overdueCount} overdue
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : formatCurrency(bookingStats.totalRevenue)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Avg: {formatCurrency(bookingStats.averageBookingValue)}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Bookings</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/80 backdrop-blur-sm border-gray-200/60"
              onClick={() => router.push('/dashboard/bookings')}
            >
              View All Bookings
            </Button>
          </div>
          
          {statsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-gray-200/60 animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : bookingStats.recentBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {bookingStats.recentBookings.slice(0, 3).map((booking) => (
                <Card key={booking.$id} className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {booking.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {formatDate(booking.$createdAt)} • {booking.bookingReference}
                        </div>
                        <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {booking.itemName}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7"
                            onClick={() => router.push('/dashboard/bookings')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60">
              <div className="p-12 text-center">
                <FaCalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent bookings</h3>
                <p className="text-gray-600 mb-4">When customers make bookings, they will appear here.</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/bookings')}
                >
                  View All Bookings
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
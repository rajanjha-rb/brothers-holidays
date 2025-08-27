"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FaSearch, FaEye, FaEdit, FaPlus, FaFileInvoiceDollar,
  FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaFilter, FaSync
} from 'react-icons/fa';
import { Booking, BookingStatus, BookingFilters } from '@/types/booking';
import { bookingUtils, getStatusText, formatDate } from '@/utils/bookingUtils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface BookingResponse {
  success: boolean;
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch bookings
  const fetchBookings = useCallback(async (page = 1, filters: Partial<BookingFilters> = {}) => {
    try {
      setLoading(true);
      
      const requestBody = {
        page,
        limit: pagination.limit,
        filters: {
          ...filters,
          searchQuery: searchQuery || undefined,
          status: statusFilter ? [statusFilter] : undefined
        },
        sortBy: '$createdAt',
        sortOrder: 'desc'
      };

      const response = await fetch('/api/bookings/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: BookingResponse = await response.json();

      if (data.success) {
        setBookings(data.bookings);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Search and filter handlers
  const handleSearch = () => {
    fetchBookings(1);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchBookings(1);
  };

  const handleRefresh = () => {
    fetchBookings(pagination.page);
  };

  // Create invoice from booking
  const createInvoice = async (booking: Booking) => {
    try {
      const response = await fetch('/api/invoices/from-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.$id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Invoice created successfully!');
        // Redirect to invoice page or show invoice details
      } else {
        toast.error(data.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const getStatusBadgeClass = (status: BookingStatus) => {
    return bookingUtils.getStatusColor(status);
  };

  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (!amount) return 'N/A';
    return bookingUtils.formatCurrency(amount, currency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <main className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
              <p className="text-gray-600">Manage customer bookings, track status, and create invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaSync className="w-4 h-4" />
                Refresh
              </Button>
              <Link href="/dashboard/invoices/create">
                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <FaPlus className="w-4 h-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Bookings
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search by reference, customer name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <Select value={statusFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quote_sent">Quote Sent</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <FaSearch className="w-4 h-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Bookings ({pagination.total})</span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaFilter className="w-4 h-4" />
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No bookings found</p>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">Booking</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Customer</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Package/Trip</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Travelers</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-center p-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr key={booking.$id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {booking.bookingReference}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.$createdAt)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <FaUser className="w-4 h-4 text-gray-400" />
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <FaEnvelope className="w-3 h-3" />
                              {booking.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <FaPhone className="w-3 h-3" />
                              {booking.customerPhone}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.itemName}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {booking.bookingType}
                            </Badge>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatDate(booking.preferredStartDate)}
                              </div>
                              {booking.preferredEndDate && (
                                <div className="text-sm text-gray-500">
                                  to {formatDate(booking.preferredEndDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              {booking.numberOfTravelers}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.numberOfAdults}A + {booking.numberOfChildren || 0}C
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <Badge className={`${getStatusBadgeClass(booking.status)} border`}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </td>
                        
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(booking.totalAmount, booking.currency)}
                          </div>
                          {booking.paymentStatus && booking.paymentStatus !== 'pending' && (
                            <div className="text-sm text-gray-500">
                              {booking.paymentStatus}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2 h-8 w-8"
                              title="View Details"
                            >
                              <FaEye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2 h-8 w-8"
                              title="Edit Booking"
                            >
                              <FaEdit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => createInvoice(booking)}
                              className="p-2 h-8 w-8 bg-green-600 hover:bg-green-700"
                              title="Create Invoice"
                            >
                              <FaFileInvoiceDollar className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

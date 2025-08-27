"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FaSearch, 
  FaFilter, 
  FaFileInvoiceDollar, 
  FaEye, 
  FaEdit, 
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaSpinner,
  FaDownload
} from "react-icons/fa";
import { Invoice, InvoiceStatus, InvoiceType, Currency } from "@/types/invoice.types";
import { 
  formatCurrency, 
  formatInvoiceDate, 
  getInvoiceStatusColor, 
  getInvoiceTypeIcon, 
  isInvoiceOverdue,
  getDaysUntilDue
} from "@/lib/utils/invoice.utils";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function InvoicesDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "all">("all");
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "all">("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const itemsPerPage = 20;

  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    overdueAmount: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    overdueCount: 0
  });

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(currencyFilter !== "all" && { currency: currencyFilter }),
        sortField: "$createdAt",
        sortOrder: "desc"
      });

      const response = await fetch(`/api/invoices/list?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.invoices) {
        throw new Error(data.error || "Failed to fetch invoices");
      }

      setInvoices(data.invoices);
      setTotalInvoices(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));

    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter, currencyFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/invoices/stats`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.stats) {
          setStats({
            totalAmount: data.stats.totalAmount || 0,
            paidAmount: data.stats.paidAmount || 0,
            overdueAmount: data.stats.overdueAmount || 0,
            draftCount: data.stats.draftCount || 0,
            sentCount: data.stats.sentCount || 0,
            paidCount: data.stats.paidCount || 0,
            overdueCount: data.stats.overdueCount || 0
          });
        }
      }
    } catch (err) {
      console.error("Error fetching invoice stats:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices, fetchStats]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, currencyFilter]);

  const getStatusDisplay = (invoice: Invoice) => {
    const overdue = isInvoiceOverdue(invoice);
    const displayStatus = overdue && invoice.status === 'sent' ? 'overdue' : invoice.status;
    return { status: displayStatus, overdue };
  };

  const formatDate = (dateString: string) => {
    try {
      return formatInvoiceDate(dateString);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaFileInvoiceDollar className="text-blue-600" />
                Invoice Management
              </h1>
              <p className="text-gray-600 mt-2">Create, manage and track invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/invoices/create">
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <FaPlus className="h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaFileInvoiceDollar className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {totalInvoices} total invoices
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.paidAmount)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Paid Amount</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaFileInvoiceDollar className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="text-xs text-green-600 mt-2">
                {stats.paidCount} paid invoices
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.overdueAmount)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Overdue Amount</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <FaExclamationTriangle className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="text-xs text-red-600 mt-2">
                {stats.overdueCount} overdue invoices
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.draftCount}</div>
                  <div className="text-sm font-medium text-gray-600">Draft Invoices</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                  <FaEdit className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.sentCount} sent invoices
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices by number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "all")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as InvoiceType | "all")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="trip">Trip</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currencyFilter} onValueChange={(value) => setCurrencyFilter(value as Currency | "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currency</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={fetchInvoices}
                  disabled={loading}
                >
                  <FaFilter className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">Error Loading Invoices</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={fetchInvoices}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && invoices.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center">
                <FaSpinner className="h-8 w-8 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">Loading invoices...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && invoices.length === 0 && !error && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FaFileInvoiceDollar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" || currencyFilter !== "all"
                    ? "Try adjusting your search criteria or filters."
                    : "Get started by creating your first invoice."}
                </p>
                <Link href="/dashboard/invoices/create">
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <FaPlus className="h-4 w-4" />
                    Create First Invoice
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoices Table */}
        {invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoices ({totalInvoices})</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
                  Page {currentPage} of {totalPages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Invoice</th>
                      <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Travel Info</th>
                      <th className="text-left p-4 font-medium text-gray-700">Created</th>
                      <th className="text-center p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((invoice) => {
                      const { status: displayStatus, overdue } = getStatusDisplay(invoice);
                      const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                      
                      return (
                        <tr key={invoice.$id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getInvoiceTypeIcon(invoice.type)}</span>
                              <div>
                                <div className="font-mono text-sm font-medium text-blue-600">
                                  #{invoice.invoiceNumber}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {invoice.type}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{invoice.customerName}</div>
                            <div className="text-sm text-gray-600">{invoice.customerEmail}</div>
                            {invoice.bookingReference && (
                              <div className="text-xs text-gray-500">
                                Booking: {invoice.bookingReference}
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(invoice.totalAmount, invoice.currency)}
                            </div>
                            {invoice.paidAmount && invoice.paidAmount > 0 && (
                              <div className="text-xs text-green-600">
                                Paid: {formatCurrency(invoice.paidAmount, invoice.currency)}
                              </div>
                            )}
                            {invoice.balancedue && invoice.balancedue > 0 && (
                              <div className="text-xs text-red-600">
                                Due: {formatCurrency(invoice.balancedue, invoice.currency)}
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <Badge 
                              className={cn(
                                "text-xs font-medium", 
                                getInvoiceStatusColor(displayStatus as InvoiceStatus)
                              )}
                            >
                              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                            </Badge>
                            {overdue && (
                              <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <FaExclamationTriangle className="h-3 w-3" />
                                Overdue
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <div className={cn(
                              "text-sm",
                              daysUntilDue < 0 ? "text-red-600 font-medium" : 
                              daysUntilDue <= 3 ? "text-yellow-600" : "text-gray-900"
                            )}>
                              {formatDate(invoice.dueDate)}
                            </div>
                            {daysUntilDue < 0 && (
                              <div className="text-xs text-red-600">
                                {Math.abs(daysUntilDue)} days overdue
                              </div>
                            )}
                            {daysUntilDue >= 0 && daysUntilDue <= 7 && (
                              <div className="text-xs text-yellow-600">
                                {daysUntilDue} days left
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            {invoice.destination && (
                              <div className="text-sm text-gray-900">{invoice.destination}</div>
                            )}
                            {invoice.travelDate && (
                              <div className="text-xs text-gray-500">
                                {formatDate(invoice.travelDate)}
                                {invoice.returnDate && ` - ${formatDate(invoice.returnDate)}`}
                              </div>
                            )}
                            {invoice.numberOfTravelers && (
                              <div className="text-xs text-gray-500">
                                {invoice.numberOfTravelers} traveler(s)
                              </div>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <div className="text-sm text-gray-600">
                              {formatDate(invoice.$createdAt.split("T")[0])}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Invoice"
                                asChild
                              >
                                <Link href={`/invoices/${invoice.$id}`}>
                                  <FaEye className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              {invoice.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit Invoice"
                                  asChild
                                >
                                  <Link href={`/dashboard/invoices/edit/${invoice.$id}`}>
                                    <FaEdit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Download PDF"
                                onClick={() => {
                                  // TODO: Implement PDF download
                                  toast.success("PDF download feature coming soon!");
                                }}
                              >
                                <FaDownload className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalInvoices)} of {totalInvoices} invoices
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-8"
                            onClick={() => setCurrentPage(page)}
                            disabled={loading}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Invoice } from "@/types/invoice.types";
import { 
  formatCurrency, 
  formatInvoiceDate, 
  getInvoiceStatusColor, 
  getInvoiceTypeIcon,
  parseLineItems 
} from "@/lib/utils/invoice.utils";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface InvoiceDisplayProps {
  invoice: Invoice;
  showPrintButton?: boolean;
  className?: string;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({ 
  invoice, 
  showPrintButton = true,
  className 
}) => {
  // Parse line items from JSON string
  const lineItems = parseLineItems(invoice.lineItems);
  
  const statusColor = getInvoiceStatusColor(invoice.status);
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className={cn("bg-white max-w-4xl mx-auto", className)}>
      {/* Print Button */}
      {showPrintButton && (
        <div className="mb-4 text-right no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
        </div>
      )}
      
      {/* Invoice Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {invoice.companyLogo && (
                <div className="mr-4 relative w-12 h-12 bg-white rounded-lg p-2">
                  <Image 
                    src={invoice.companyLogo} 
                    alt={invoice.companyName || "Company logo"} 
                    width={32}
                    height={32}
                    className="object-contain w-full h-full"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{invoice.companyName || "Brothers Holidays"}</h1>
                <p className="text-blue-100">Travel Agency</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-2">{getInvoiceTypeIcon(invoice.type)}</span>
                INVOICE
              </h2>
              <p className="text-blue-100 mt-1">#{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
        
        {/* Company and Customer Info */}
        <div className="px-8 py-6 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">From:</h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">{invoice.companyName || "Brothers Holidays"}</p>
                {invoice.companyAddress && <p>{invoice.companyAddress}</p>}
                {invoice.companyPhone && <p>Phone: {invoice.companyPhone}</p>}
                {invoice.companyEmail && <p>Email: {invoice.companyEmail}</p>}
                {invoice.companyWebsite && <p>Website: {invoice.companyWebsite}</p>}
              </div>
            </div>
            
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">{invoice.customerName}</p>
                <p>{invoice.customerEmail}</p>
                {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
                {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                {invoice.customerCountry && <p>{invoice.customerCountry}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Details */}
        <div className="px-8 py-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoice Date</h3>
              <p className="mt-1 text-lg font-semibold">{formatInvoiceDate(invoice.issueDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Due Date</h3>
              <p className="mt-1 text-lg font-semibold">{formatInvoiceDate(invoice.dueDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</h3>
              <span className={cn("mt-1 inline-block text-sm font-medium px-3 py-1 rounded-full", statusColor)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Travel Information */}
          {(invoice.destination || invoice.travelDate || invoice.numberOfTravelers) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Travel Details</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {invoice.destination && (
                  <div>
                    <span className="font-medium text-blue-700">Destination:</span>
                    <p className="text-gray-700">{invoice.destination}</p>
                  </div>
                )}
                {invoice.travelDate && (
                  <div>
                    <span className="font-medium text-blue-700">Travel Date:</span>
                    <p className="text-gray-700">
                      {formatInvoiceDate(invoice.travelDate)}
                      {invoice.returnDate && ` to ${formatInvoiceDate(invoice.returnDate)}`}
                    </p>
                  </div>
                )}
                {invoice.numberOfTravelers && (
                  <div>
                    <span className="font-medium text-blue-700">Travelers:</span>
                    <p className="text-gray-700">{invoice.numberOfTravelers} person(s)</p>
                  </div>
                )}
              </div>
              {invoice.bookingReference && (
                <div className="mt-3">
                  <span className="font-medium text-blue-700">Booking Reference:</span>
                  <p className="text-gray-700">{invoice.bookingReference}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Line Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                          {item.category && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-gray-900">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-gray-900">{formatCurrency(item.unitPrice, invoice.currency)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.totalPrice, invoice.currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Financial Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                {invoice.discountAmount && invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span className="text-green-600">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                  </div>
                )}
                {invoice.taxAmount && invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                  </div>
                </div>
                {invoice.status === "partial" && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Amount Paid:</span>
                      <span className="text-green-600">{formatCurrency(invoice.paidAmount || 0, invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-red-600">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(invoice.balancedue || 0, invoice.currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          {(invoice.paymentInstructions || invoice.terms) && (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {invoice.paymentInstructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Instructions</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line">
                    {invoice.paymentInstructions}
                  </div>
                </div>
              )}
              
              {invoice.terms && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Terms & Conditions</h3>
                  <div className="text-gray-600 text-sm whitespace-pre-line">
                    {invoice.terms}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
              <div className="text-gray-600 text-sm whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {invoice.notes}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for choosing {invoice.companyName || "Brothers Holidays"}!</p>
            <p className="mt-1">Generated on {formatInvoiceDate(new Date().toISOString().split("T")[0])}</p>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceDisplay;

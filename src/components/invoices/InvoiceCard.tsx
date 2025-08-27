"use client";

import React from "react";
import { Invoice, InvoiceStatus } from "@/types/invoice.types";
import { 
  formatCurrency, 
  formatInvoiceDate, 
  getInvoiceStatusColor, 
  getInvoiceTypeIcon, 
  isInvoiceOverdue,
  parseLineItems,
  getDaysUntilDue
} from "@/lib/utils/invoice.utils";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InvoiceCardProps {
  invoice: Invoice;
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  showDetails = false,
  className,
  onClick
}) => {
  // Parse line items from JSON string
  const lineItems = parseLineItems(invoice.lineItems);
  
  // Check if invoice is overdue
  const overdue = isInvoiceOverdue(invoice);
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
  
  // Determine status display (show overdue instead of sent if applicable)
  const displayStatus = overdue && invoice.status === 'sent' ? 'overdue' : invoice.status;
  const statusColor = getInvoiceStatusColor(displayStatus as InvoiceStatus);
  
  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-md p-4 border-l-4",
        {
          "border-l-gray-300": displayStatus === "draft",
          "border-l-blue-500": displayStatus === "sent",
          "border-l-green-500": displayStatus === "paid",
          "border-l-red-500": displayStatus === "overdue",
          "border-l-yellow-500": displayStatus === "cancelled",
          "border-l-orange-500": displayStatus === "partial",
          "cursor-pointer hover:shadow-lg transition-shadow": !!onClick
        },
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{getInvoiceTypeIcon(invoice.type)}</span>
            <span>Invoice #{invoice.invoiceNumber}</span>
          </h3>
          <p className="text-gray-600 text-sm">{invoice.customerName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn("text-sm font-medium px-2 py-1 rounded-full", statusColor)}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
          {invoice.bookingReference && (
            <span className="text-xs text-gray-500 mt-1">
              Booking: {invoice.bookingReference}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">Issue Date</p>
          <p className="font-medium">{formatInvoiceDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Due Date</p>
          <p className={cn("font-medium", {
            "text-red-600": daysUntilDue < 0,
            "text-yellow-600": daysUntilDue >= 0 && daysUntilDue <= 3,
          })}>
            {formatInvoiceDate(invoice.dueDate)}
            {daysUntilDue < 0 && (
              <span className="text-xs ml-1">({Math.abs(daysUntilDue)} days overdue)</span>
            )}
            {daysUntilDue >= 0 && daysUntilDue <= 3 && (
              <span className="text-xs ml-1">({daysUntilDue} days left)</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-lg font-bold">
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </p>
          {invoice.status === "partial" && (
            <p className="text-xs text-gray-500">
              Paid: {formatCurrency(invoice.paidAmount || 0, invoice.currency)}
            </p>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="font-medium mb-2">Line Items</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {lineItems.map((item, index) => (
              <div key={item.id || index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x {formatCurrency(item.unitPrice, invoice.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.totalPrice, invoice.currency)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.taxAmount && invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
          </div>
          
          {invoice.destination && (
            <div className="mt-3 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Destination:</span> {invoice.destination}
              </p>
              {invoice.travelDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Travel Date:</span> {formatInvoiceDate(invoice.travelDate)}
                  {invoice.returnDate && ` to ${formatInvoiceDate(invoice.returnDate)}`}
                </p>
              )}
              {invoice.numberOfTravelers && (
                <p className="text-gray-600">
                  <span className="font-medium">Travelers:</span> {invoice.numberOfTravelers}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          {invoice.companyLogo && (
            <div className="mr-2 relative w-6 h-6">
              <Image 
                src={invoice.companyLogo} 
                alt={invoice.companyName || "Company logo"} 
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          )}
          <span className="text-xs text-gray-500">
            {invoice.$createdAt && formatInvoiceDate(invoice.$createdAt.split("T")[0])}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href={`/invoices/${invoice.$id}`} 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            View
          </Link>
          {invoice.status === "draft" && (
            <Link 
              href={`/invoices/${invoice.$id}/edit`} 
              className="text-sm text-green-600 hover:text-green-800"
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;

"use client";

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FaPrint, 
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaViber,
  FaEnvelope,
  FaEdit
} from 'react-icons/fa';
import Image from 'next/image';

interface InvoiceData {
  invoiceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalTravelers: number;
  packageCostPerPerson: number;
  amountPaid: number;
  notes?: string;
}

interface InvoicePreviewProps {
  data: InvoiceData;
  onEdit: () => void;
  invoiceNumber?: string;
}

export default function InvoicePreview({ data, onEdit, invoiceNumber = `INV-${Date.now()}` }: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const totalAmount = data.totalTravelers * data.packageCostPerPerson;
  const amountLeft = totalAmount - data.amountPaid;

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current;
      const WinPrint = window.open('', '', 'width=800,height=600');
      if (WinPrint) {
        WinPrint.document.write(`
          <html>
            <head>
              <title>Invoice - ${invoiceNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6; 
                }
                .invoice-container { 
                  max-width: 800px; 
                  margin: 0 auto; 
                }
                .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  border-bottom: 2px solid #eee; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px; 
                }
                .logo { 
                  height: 80px; 
                }
                .company-info { 
                  text-align: right; 
                }
                .invoice-title { 
                  font-size: 2em; 
                  font-weight: bold; 
                  color: #333; 
                }
                .invoice-details { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 40px; 
                  margin-bottom: 30px; 
                }
                .customer-info, .invoice-info { 
                  padding: 20px; 
                  background-color: #f9f9f9; 
                  border-radius: 8px; 
                }
                .info-title { 
                  font-weight: bold; 
                  font-size: 1.2em; 
                  margin-bottom: 15px; 
                  color: #555; 
                }
                .info-item { 
                  margin-bottom: 8px; 
                }
                .package-details { 
                  background-color: #f0f8ff; 
                  padding: 20px; 
                  border-radius: 8px; 
                  margin-bottom: 30px; 
                }
                .package-title { 
                  font-size: 1.5em; 
                  font-weight: bold; 
                  color: #2563eb; 
                  margin-bottom: 20px; 
                  text-align: center; 
                }
                .financial-summary { 
                  background-color: #f8f9fa; 
                  padding: 20px; 
                  border-radius: 8px; 
                  border: 2px solid #e9ecef; 
                }
                .summary-row { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 8px 0; 
                }
                .summary-row.total { 
                  font-weight: bold; 
                  font-size: 1.2em; 
                  border-top: 2px solid #dee2e6; 
                  padding-top: 15px; 
                  margin-top: 15px; 
                }
                .amount-paid { 
                  color: #10b981; 
                }
                .amount-due { 
                  color: #ef4444; 
                }
                .notes { 
                  margin-top: 30px; 
                  padding: 20px; 
                  background-color: #fffbeb; 
                  border-left: 4px solid #f59e0b; 
                  border-radius: 4px; 
                }
                @media print {
                  body { margin: 0; }
                  .invoice-container { box-shadow: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
      }
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Check out this invoice: ${data.invoiceName}`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Invoice: ${data.invoiceName}\nTotal: $${totalAmount.toFixed(2)}\nAmount Due: $${amountLeft.toFixed(2)}\n\nView details: ${window.location.href}`)}`,
    viber: `viber://forward?text=${encodeURIComponent(`Invoice: ${data.invoiceName} - Total: $${totalAmount.toFixed(2)}`)}`,
    email: `mailto:${data.customerEmail}?subject=${encodeURIComponent(`Invoice - ${data.invoiceName}`)}&body=${encodeURIComponent(`Dear ${data.customerName},\n\nPlease find your invoice details below:\n\nInvoice: ${data.invoiceName}\nInvoice Number: ${invoiceNumber}\nTotal Amount: $${totalAmount.toFixed(2)}\nAmount Paid: $${data.amountPaid.toFixed(2)}\nAmount Due: $${amountLeft.toFixed(2)}\n\nThank you for choosing our services!\n\nBest regards,\nBrothers Holidays`)}`,
    instagram: '' // Placeholder for Instagram (handled separately)
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
      navigator.clipboard.writeText(`Invoice: ${data.invoiceName}\nTotal: $${totalAmount.toFixed(2)}\nAmount Due: $${amountLeft.toFixed(2)}`);
      alert('Invoice details copied to clipboard! You can now paste it on Instagram.');
      return;
    }
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
          <FaEdit /> Edit Invoice
        </Button>
        
        <Button onClick={handlePrint} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <FaPrint /> Print Invoice
        </Button>
      </div>

      {/* Social Media Sharing */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Share Invoice</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="sm"
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <FaFacebookF /> Facebook
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleShare('instagram')}
              className="bg-pink-500 hover:bg-pink-600 flex items-center gap-2"
            >
              <FaInstagram /> Instagram
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
            >
              <FaWhatsapp /> WhatsApp
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleShare('viber')}
              className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
            >
              <FaViber /> Viber
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleShare('email')}
              className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
            >
              <FaEnvelope /> Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div ref={printRef} className="invoice-container p-8">
            {/* Header */}
            <div className="header flex justify-between items-center border-b-2 border-gray-200 pb-6 mb-8">
              <div className="flex items-center">
                <Image
                  src="/travelLogo.svg"
                  alt="Brothers Holidays Logo"
                  width={100}
                  height={80}
                  className="logo"
                />
              </div>
              <div className="company-info text-right">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Brothers Holidays</h1>
                <p className="text-gray-600">Travel & Tourism Services</p>
                <p className="text-gray-600">Email: info@brothersholidays.com</p>
                <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-center mb-8">
              <h2 className="invoice-title text-4xl font-bold text-gray-800 mb-2">INVOICE</h2>
              <p className="text-gray-600">Invoice Number: {invoiceNumber}</p>
              <p className="text-gray-600">Date: {currentDate}</p>
            </div>

            {/* Invoice Details */}
            <div className="invoice-details grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Information */}
              <div className="customer-info bg-gray-50 p-6 rounded-lg">
                <h3 className="info-title text-xl font-bold text-gray-700 mb-4">Bill To:</h3>
                <div className="info-item"><strong>Name:</strong> {data.customerName}</div>
                <div className="info-item"><strong>Email:</strong> {data.customerEmail}</div>
                {data.customerPhone && (
                  <div className="info-item"><strong>Phone:</strong> {data.customerPhone}</div>
                )}
              </div>

              {/* Invoice Information */}
              <div className="invoice-info bg-gray-50 p-6 rounded-lg">
                <h3 className="info-title text-xl font-bold text-gray-700 mb-4">Invoice Details:</h3>
                <div className="info-item"><strong>Package:</strong> {data.invoiceName}</div>
                <div className="info-item"><strong>Travelers:</strong> {data.totalTravelers} person(s)</div>
                <div className="info-item"><strong>Cost per Person:</strong> ${data.packageCostPerPerson.toFixed(2)}</div>
              </div>
            </div>

            {/* Package Details */}
            <div className="package-details bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="package-title text-2xl font-bold text-blue-600 text-center mb-6">
                {data.invoiceName}
              </h3>
              <div className="text-center">
                <p className="text-lg text-gray-700">
                  <strong>{data.totalTravelers}</strong> traveler(s) × <strong>${data.packageCostPerPerson.toFixed(2)}</strong> per person
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="financial-summary bg-gray-50 p-6 rounded-lg border-2 border-gray-200 mb-8">
              <div className="summary-row flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="summary-row flex justify-between py-2 text-green-600 amount-paid">
                <span>Amount Paid:</span>
                <span>-${data.amountPaid.toFixed(2)}</span>
              </div>
              
              <div className="summary-row total flex justify-between py-4 font-bold text-xl border-t-2 border-gray-300 mt-4">
                <span>Amount Due:</span>
                <span className={amountLeft > 0 ? 'text-red-600 amount-due' : 'text-green-600'}>
                  ${amountLeft.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="notes bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                <h3 className="font-bold text-gray-700 mb-2">Additional Notes:</h3>
                <p className="text-gray-700">{data.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">Thank you for choosing Brothers Holidays!</p>
              <p className="text-gray-500 text-sm mt-2">
                For any questions regarding this invoice, please contact us at info@brothersholidays.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

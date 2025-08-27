"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import SimpleInvoiceForm from "@/components/SimpleInvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";

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

export default function CreateInvoicePage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handlePreview = (data: InvoiceData) => {
    setInvoiceData(data);
    setCurrentStep('preview');
  };

  const handleEdit = () => {
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline" size="sm">
                <FaArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentStep === 'form' ? 'Create Simple Invoice' : 'Invoice Preview'}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentStep === 'form' 
                  ? 'Quick and easy invoice creation for travel packages'
                  : 'Review your invoice and share or print it'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'form' ? (
          <SimpleInvoiceForm 
            onPreview={handlePreview} 
          />
        ) : (
          invoiceData && (
            <InvoicePreview 
              data={invoiceData} 
              onEdit={handleEdit} 
            />
          )
        )}
      </div>
    </div>
  );
}

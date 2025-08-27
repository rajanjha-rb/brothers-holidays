"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FaFileInvoiceDollar
} from 'react-icons/fa';

interface SimpleInvoiceData {
  invoiceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalTravelers: number;
  packageCostPerPerson: number;
  amountPaid: number;
  notes?: string;
}

interface SimpleInvoiceFormProps {
  onPreview: (data: SimpleInvoiceData) => void;
  loading?: boolean;
}

export default function SimpleInvoiceForm({ onPreview, loading = false }: SimpleInvoiceFormProps) {
  const [formData, setFormData] = useState<SimpleInvoiceData>({
    invoiceName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    totalTravelers: 1,
    packageCostPerPerson: 0,
    amountPaid: 0,
    notes: ''
  });

  const totalAmount = formData.totalTravelers * formData.packageCostPerPerson;
  const amountLeft = totalAmount - formData.amountPaid;

  const handleInputChange = (field: keyof SimpleInvoiceData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPreview(formData);
  };

  const isFormValid = formData.invoiceName.trim() && 
                     formData.customerName.trim() && 
                     formData.customerEmail.trim() && 
                     formData.totalTravelers > 0 && 
                     formData.packageCostPerPerson > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <FaFileInvoiceDollar className="text-blue-600" />
          Simple Invoice Creator
        </CardTitle>
        <p className="text-gray-600">Create travel invoices quickly and easily</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Name */}
          <div>
            <Label htmlFor="invoiceName">Invoice Name *</Label>
            <Input
              id="invoiceName"
              placeholder="e.g., Paris Tour Package, Thailand Adventure"
              value={formData.invoiceName}
              onChange={(e) => handleInputChange('invoiceName', e.target.value)}
              required
            />
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="John Doe"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="+1 (555) 123-4567"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerEmail">Customer Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="john@example.com"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              required
            />
          </div>

          {/* Travel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalTravelers">Total Travelers *</Label>
              <Input
                id="totalTravelers"
                type="number"
                min="1"
                value={formData.totalTravelers}
                onChange={(e) => handleInputChange('totalTravelers', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="packageCostPerPerson">Package Cost Per Person *</Label>
              <Input
                id="packageCostPerPerson"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.packageCostPerPerson}
                onChange={(e) => handleInputChange('packageCostPerPerson', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="amountPaid">Amount Paid</Label>
            <Input
              id="amountPaid"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.amountPaid}
              onChange={(e) => handleInputChange('amountPaid', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg mb-3">Invoice Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Total Travelers:</span>
                <span className="font-medium">{formData.totalTravelers}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost Per Person:</span>
                <span className="font-medium">${formData.packageCostPerPerson.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-medium text-green-600">${formData.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 col-span-2">
                <span className="font-semibold">Amount Due:</span>
                <span className={`font-semibold ${amountLeft > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${amountLeft.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Creating Invoice...
              </>
            ) : (
              <>
                <FaFileInvoiceDollar className="mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
